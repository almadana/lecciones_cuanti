'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import SmileyViridis from '@/app/components/SmileyViridis'
import jStat from 'jstat'
import LessonNavigation from '@/app/components/LessonNavigation';

interface DataPoint {
  value: number
  frequency: number
}

interface SmileyPoint {
  id: number
  value: number
  x: number
  y: number
  isSelected: boolean
}

interface SampleInterval {
  id: number
  mean: number
  lower: number
  upper: number
  containsTrue: boolean
}

// Función para generar un valor de la distribución normal
const generateNormalValue = (mean: number, std: number): number => {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return Math.max(5, Math.min(35, mean + z * std))
}

export default function ConfidenceIntervalPage() {
  // Estados para la población
  const [populationData, setPopulationData] = useState<DataPoint[]>([])
  const [populationSmileys, setPopulationSmileys] = useState<SmileyPoint[]>([])
  const [populationMean, setPopulationMean] = useState<number>(22.32)
  const [populationStd, setPopulationStd] = useState<number>(5.78)
  const populationSize = 200 // Cambiado de 50 a 200

  // Estados para las muestras e intervalos
  const [currentSampleData, setCurrentSampleData] = useState<DataPoint[]>([])
  const [sampleIntervals, setSampleIntervals] = useState<SampleInterval[]>([])
  const [sampleSize, setSampleSize] = useState<number>(10)
  const [numSamples, setNumSamples] = useState<number>(100)
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [animationSpeed, setAnimationSpeed] = useState<number>(800)
  const [sampleCount, setSampleCount] = useState<number>(0)
  const [coverage, setCoverage] = useState<number>(0)
  const [showPopulationPanel, setShowPopulationPanel] = useState<boolean>(true) // Estado para controlar visibilidad del panel de población

  // Referencias para los gráficos
  const populationHistogramRef = useRef<SVGSVGElement>(null)
  const currentSampleHistogramRef = useRef<SVGSVGElement>(null)
  const intervalsPlotRef = useRef<SVGSVGElement>(null)
  const populationSmileysRef = useRef<SVGSVGElement>(null)

  // Función para generar la población inicial
  const generatePopulation = useCallback(() => {
    const newData: { [key: number]: number } = {}
    const newPopulationSmileys: SmileyPoint[] = []
    const values: number[] = []

    // Generar n-1 valores aleatorios
    for (let i = 0; i < populationSize - 1; i++) {
      const value = generateNormalValue(populationMean, populationStd)
      values.push(value)
    }

    // Calcular el último valor necesario para obtener la media poblacional deseada
    const currentSum = values.reduce((a, b) => a + b, 0)
    const targetSum = populationMean * populationSize
    let lastValue = targetSum - currentSum

    // Si el último valor está fuera de rango, ajustar todos los valores
    if (lastValue < 5 || lastValue > 35) {
      const targetLast = lastValue < 5 ? 5 : 35
      const adjustment = (lastValue - targetLast) / (populationSize - 1)
      
      for (let i = 0; i < values.length; i++) {
        values[i] = Math.max(5, Math.min(35, values[i] + adjustment))
      }
      
      const newSum = values.reduce((a, b) => a + b, 0)
      lastValue = targetSum - newSum
    }

    values.push(lastValue)

    // Crear los datos para el histograma y los smileys
    values.forEach((value, i) => {
      const binIndex = Math.floor((value - 5) / 5)
      newData[binIndex] = (newData[binIndex] || 0) + 1

      newPopulationSmileys.push({
        id: i,
        value,
        x: (i % 20) * 30 + 15, // Cambiado de 10*60+30 a 20*30+15 para más columnas y smileys más pequeños
        y: Math.floor(i / 20) * 30 + 15, // Cambiado de 60 a 30 para smileys más pequeños
        isSelected: false
      })
    })

    const populationDataArray = Object.entries(newData).map(([bin, freq]) => ({
      value: 5 + Number(bin) * 5,
      frequency: freq
    }))

    setPopulationData(populationDataArray)
    setPopulationSmileys(newPopulationSmileys)
  }, [populationMean, populationStd])

  // Efecto para generar la población inicial
  useEffect(() => {
    generatePopulation()
  }, [generatePopulation])

  // Función para generar una nueva muestra e intervalo
  const generateSample = useCallback(() => {
    if (sampleCount >= numSamples) {
      setIsAnimating(false)
      setSampleCount(0)
      return
    }

    // Seleccionar índices aleatorios sin reemplazo
    const selectedIndices = new Set<number>()
    while (selectedIndices.size < sampleSize) {
      selectedIndices.add(Math.floor(Math.random() * populationSize))
    }

    // Actualizar las caritas seleccionadas
    const updatedSmileys = populationSmileys.map(smiley => ({
      ...smiley,
      isSelected: selectedIndices.has(smiley.id)
    }))
    setPopulationSmileys(updatedSmileys)

    // Calcular estadísticas de la muestra
    const sampleValues = Array.from(selectedIndices).map(i => populationSmileys[i].value)
    const sampleMean = d3.mean(sampleValues) || 0
    const sampleStd = d3.deviation(sampleValues) || 0 // Desvío estándar muestral (con n-1 en denominador)
    const standardError = sampleStd / Math.sqrt(sampleSize)
    const zValue = jStat.studentt.inv(1 - (1 - confidenceLevel) / 2, sampleSize - 1)
    
    // Calcular intervalo de confianza
    const lower = sampleMean - zValue * standardError
    const upper = sampleMean + zValue * standardError
    const containsTrue = lower <= populationMean && upper >= populationMean

    // Actualizar el histograma de la muestra actual
    const sampleData: { [key: number]: number } = {}
    sampleValues.forEach(value => {
      const binIndex = Math.floor((value - 5) / 5)
      sampleData[binIndex] = (sampleData[binIndex] || 0) + 1
    })

    const currentSampleDataArray = Object.entries(sampleData).map(([bin, freq]) => ({
      value: 5 + Number(bin) * 5,
      frequency: freq
    }))
    setCurrentSampleData(currentSampleDataArray)

    // Agregar el intervalo a la lista
    setSampleIntervals(prev => {
      const newIntervals = [...prev, { 
        id: sampleCount, 
        mean: sampleMean, 
        lower, 
        upper,
        containsTrue 
      }]
      
      // Actualizar la cobertura
      const coverage = newIntervals.filter(interval => interval.containsTrue).length / newIntervals.length
      setCoverage(coverage)
      
      return newIntervals
    })

    setSampleCount(prev => prev + 1)
  }, [sampleCount, numSamples, sampleSize, populationSmileys, confidenceLevel, populationMean])

  // Efecto para manejar la animación del muestreo
  useEffect(() => {
    if (!isAnimating) return

    const timeoutId = setTimeout(generateSample, animationSpeed)
    return () => clearTimeout(timeoutId)
  }, [isAnimating, generateSample, animationSpeed])

  // Función para actualizar histogramas
  const updateHistogram = useCallback((
    ref: React.RefObject<SVGSVGElement>,
    data: DataPoint[],
    maxFreq: number,
    showSampleMean: boolean = false,
    xDomain: [number, number] = [5, 35],
    width: number = 800,
    height: number = 200
  ) => {
    if (!ref.current) return

    const margin = { top: 40, right: 40, bottom: 60, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Limpiar SVG
    d3.select(ref.current).selectAll('*').remove()

    // Crear SVG
    const svg = d3.select(ref.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Escalas
    const x = d3.scaleLinear()
      .domain(xDomain)
      .range([0, innerWidth])

    const y = d3.scaleLinear()
      .domain([0, maxFreq])
      .range([innerHeight, 0])

    // Ejes con fuentes más grandes
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(8))
      .style('font-size', '12px')
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Nivel de Satisfacción')

    svg.append('g')
      .call(d3.axisLeft(y))
      .style('font-size', '12px')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Frecuencia')

    // Calcular el número de bins y el ancho de las barras
    const binWidth = 2
    const numBins = Math.floor((xDomain[1] - xDomain[0]) / binWidth)
    const barWidth = (innerWidth / numBins) - 1

    // Barras
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => Math.max(0, x(d.value - binWidth/2) + 0.5))
      .attr('y', d => y(d.frequency))
      .attr('width', barWidth)
      .attr('height', d => innerHeight - y(d.frequency))
      .attr('fill', '#4F46E5')
      .attr('opacity', 0.7)

    // Línea de la media poblacional
    svg.append('line')
      .attr('x1', x(populationMean))
      .attr('x2', x(populationMean))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', 'red')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')

    svg.append('text')
      .attr('x', x(populationMean))
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', 'red')
      .text(`Media poblacional: ${populationMean.toFixed(2)}`)

    // Línea de la media muestral y su intervalo
    if (showSampleMean && data.length > 0) {
      // Calcular la media directamente de los datos originales
      const expandedValues: number[] = []
      data.forEach(d => {
        for (let i = 0; i < d.frequency; i++) {
          expandedValues.push(d.value)
        }
      })

      // Obtener el intervalo más reciente
      const currentInterval = sampleIntervals[sampleIntervals.length - 1]
      if (currentInterval) {
        const { mean: currentMean, lower, upper } = currentInterval
        
        // Línea de la media muestral
        svg.append('line')
          .attr('x1', x(currentMean))
          .attr('x2', x(currentMean))
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', '#2563EB')
          .attr('stroke-width', 2)

        svg.append('text')
          .attr('x', x(currentMean))
          .attr('y', -25)
          .attr('text-anchor', 'middle')
          .attr('fill', '#2563EB')
          .text(`Media muestral: ${currentMean.toFixed(2)} [${lower.toFixed(2)}, ${upper.toFixed(2)}]`)
      }
    }
  }, [populationMean, sampleIntervals])

  // Función para actualizar el gráfico de intervalos
  const updateIntervalsPlot = useCallback(() => {
    if (!intervalsPlotRef.current || sampleIntervals.length === 0) return

    const margin = { top: 40, right: 40, bottom: 80, left: 30 }
    const width = 800
    const height = 600
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom
    const maxIntervals = 50 // Número máximo de intervalos a mostrar
    const newIntervalPosition = 3 // Posición donde aparecerá el nuevo intervalo
    const yAxisBuffer = 3 // Espacio extra en el eje Y para la línea azul

    // Limpiar SVG
    d3.select(intervalsPlotRef.current).selectAll('*').remove()

    // Crear SVG
    const svg = d3.select(intervalsPlotRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Escalas
    const x = d3.scaleLinear()
      .domain([5, 35])
      .range([0, innerWidth])

    const y = d3.scaleLinear()
      .domain([-yAxisBuffer, maxIntervals]) // Extendemos el dominio para dar espacio arriba
      .range([0, innerHeight])

    // Eje X con fuentes más grandes
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(8))
      .style('font-size', '12px')
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Nivel de Satisfacción')

    // Solo dibujamos la línea del eje Y, sin marcas ni etiqueta
    svg.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#888')
      .attr('stroke-width', 1)

    // Línea de la media poblacional
    svg.append('line')
      .attr('x1', x(populationMean))
      .attr('x2', x(populationMean))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', 'red')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')

    svg.append('text')
      .attr('x', x(populationMean))
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', 'red')
      .text(`Media poblacional: ${populationMean.toFixed(2)}`)

    // Intervalos de confianza
    // Tomar solo los últimos maxIntervals intervalos y revertir el orden
    const lastIntervals = sampleIntervals.slice(-maxIntervals).reverse()
    lastIntervals.forEach((interval, i) => {
      // Ajustamos la posición vertical para dejar espacio para la línea azul
      const yPos = y(i + newIntervalPosition)

      // Línea del intervalo
      svg.append('line')
        .attr('x1', x(interval.lower))
        .attr('x2', x(interval.upper))
        .attr('y1', yPos)
        .attr('y2', yPos)
        .attr('stroke', interval.containsTrue ? '#16A34A' : '#DC2626')
        .attr('stroke-width', 2)

      // Punto de la media
      svg.append('circle')
        .attr('cx', x(interval.mean))
        .attr('cy', yPos)
        .attr('r', 3)
        .attr('fill', interval.containsTrue ? '#16A34A' : '#DC2626')

      // Si es el intervalo más reciente (i === 0), dibujamos la línea que conecta
      // con la media de la muestra actual
      if (i === 0) {
        // Línea vertical que conecta con la media de la muestra actual
        svg.append('line')
          .attr('x1', x(interval.mean))
          .attr('x2', x(interval.mean))
          .attr('y1', y(-yAxisBuffer)) // Empezamos desde arriba del todo
          .attr('y2', yPos)
          .attr('stroke', '#2563EB')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3,3')
      }
    })

    // Mostrar la cobertura actual
    svg.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 65)
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .style('font-size', '14px')
      .text(`Cobertura actual: ${(coverage * 100).toFixed(1)}% (Nivel de confianza: ${(confidenceLevel * 100).toFixed(0)}%)`)

  }, [sampleIntervals, populationMean, coverage, confidenceLevel])

  // Efecto para actualizar los gráficos
  useEffect(() => {
    // Solo actualizar gráfico de población si el panel está visible
    if (showPopulationPanel && populationHistogramRef.current) {
      updateHistogram(populationHistogramRef as React.RefObject<SVGSVGElement>, populationData, Math.ceil(populationSize * 0.4), false, [5, 35], 800, 200)
    }
    
    // Siempre actualizar gráficos de muestreo
    if (currentSampleHistogramRef.current && intervalsPlotRef.current) {
      updateHistogram(currentSampleHistogramRef as React.RefObject<SVGSVGElement>, currentSampleData, Math.ceil(sampleSize * 0.4), true, [5, 35], 800, 200)
      updateIntervalsPlot()
    }
  }, [updateHistogram, populationData, currentSampleData, updateIntervalsPlot, populationSize, sampleSize, showPopulationPanel])

  const startAnimation = () => {
    setSampleIntervals([])
    setCurrentSampleData([])
    setSampleCount(0)
    setCoverage(0)
    setIsAnimating(true)
  }

  const stopAnimation = () => {
    setIsAnimating(false)
  }

  return (
    <div className="py-8">
      <LessonNavigation
        currentStep={1}
        totalSteps={1}
        showPrevious={false}
        showNext={false}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Intervalo de Confianza (1 de 1)
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Observa cómo se construyen los intervalos de confianza y su cobertura.
            La línea roja muestra la media poblacional.
          </p>
        </div>

        <div className="mt-12">
          {/* Panel de control */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Controles de Simulación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tamaño de muestra
                </label>
                <select
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  disabled={isAnimating}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Número de muestras
                </label>
                <select
                  value={numSamples}
                  onChange={(e) => setNumSamples(Number(e.target.value))}
                  disabled={isAnimating}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nivel de confianza
                </label>
                <select
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                  disabled={isAnimating}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value={0.90}>90%</option>
                  <option value={0.95}>95%</option>
                  <option value={0.99}>99%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Velocidad de animación
                </label>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value={2000}>Muy lenta</option>
                  <option value={1200}>Lenta</option>
                  <option value={800}>Normal</option>
                  <option value={400}>Rápida</option>
                  <option value={200}>Muy rápida</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={isAnimating ? stopAnimation : startAnimation}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isAnimating ? 'Detener' : 'Comenzar Simulación'}
              </button>
            </div>
          </div>

          {/* Población - Solo mostrar si showPopulationPanel es true */}
          {showPopulationPanel && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Población (N={populationSize})</h3>
                <button
                  onClick={() => setShowPopulationPanel(!showPopulationPanel)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Ocultar Panel de Población
                </button>
              </div>
              <div className="mt-4 flex justify-center">
                <svg ref={populationHistogramRef}></svg>
              </div>
              <div className="mt-4 flex justify-center">
                <svg 
                  ref={populationSmileysRef}
                  width="600"
                  height={Math.ceil(populationSize / 20) * 30 + 30} // Ajustado para 20 columnas y 30px de altura
                  className="border border-gray-200 rounded-lg"
                >
                  {populationSmileys.map(smiley => (
                    <g key={smiley.id}>
                      {smiley.isSelected && (
                        <circle
                          cx={smiley.x}
                          cy={smiley.y}
                          r="12" // Reducido de 25 a 12 para smileys más pequeños
                          fill="#DC2626"
                          opacity="0.3"
                        />
                      )}
                      <SmileyViridis
                        cx={smiley.x}
                        cy={smiley.y}
                        radius={8} // Reducido de 18 (por defecto) a 8
                        happiness={(smiley.value - 5) / 30}
                      />
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          )}

          {/* Botón para mostrar panel de población cuando está oculto */}
          {!showPopulationPanel && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex justify-center">
                <button
                  onClick={() => setShowPopulationPanel(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Mostrar Panel de Población
                </button>
              </div>
            </div>
          )}

          {/* Muestra Actual - Siempre mostrar */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Muestra Actual (n={sampleSize}, muestra #{sampleCount} de {numSamples})
            </h3>
            <div className="mt-4 flex justify-center">
              <svg ref={currentSampleHistogramRef}></svg>
            </div>
          </div>

          {/* Intervalos de Confianza - Siempre mostrar */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Intervalos de Confianza ({sampleIntervals.length} muestras)
            </h3>
            <div className="mt-4 flex justify-center">
              <svg ref={intervalsPlotRef}></svg>
            </div>
          </div>

          {/* Explicación */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Explicación</h3>
            <div className="prose max-w-none">
              <h4 className="text-base font-medium text-gray-900">Intervalos de Confianza</h4>
              <p className="text-gray-600 mb-4">
                Los intervalos de confianza son rangos que tienen una probabilidad específica de contener
                el verdadero parámetro poblacional. En esta simulación:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Las caritas resaltadas en rojo son los elementos seleccionados en la muestra actual</li>
                <li>La línea azul en el histograma de la muestra muestra la media muestral</li>
                <li>El área sombreada azul muestra el intervalo de confianza actual</li>
                <li>En el gráfico de intervalos:
                  <ul className="list-disc pl-5 mt-2">
                    <li>Los intervalos verdes contienen la media poblacional</li>
                    <li>Los intervalos rojos no contienen la media poblacional</li>
                    <li>La cobertura muestra el porcentaje de intervalos que contienen la media</li>
                  </ul>
                </li>
              </ul>

              <h4 className="text-base font-medium text-gray-900 mt-4">Interpretación</h4>
              <p className="text-gray-600 mb-4">
                El nivel de confianza (por ejemplo, 95%) indica:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Si repitiéramos el muestreo muchas veces, aproximadamente el 95% de los intervalos contendrían la media poblacional</li>
                <li>La cobertura empírica debería acercarse al nivel de confianza a medida que aumenta el número de muestras</li>
                <li>Intervalos más anchos (mayor nivel de confianza) tienen más probabilidad de contener la media poblacional</li>
              </ul>

              <h4 className="text-base font-medium text-gray-900 mt-4">Factores que Afectan la Precisión</h4>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>El tamaño de la muestra afecta el ancho del intervalo (muestras más grandes = intervalos más estrechos)</li>
                <li>El nivel de confianza afecta el ancho del intervalo (mayor confianza = intervalos más anchos)</li>
                <li>La variabilidad de la población afecta el ancho del intervalo (mayor variabilidad = intervalos más anchos)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <LessonNavigation
        currentStep={1}
        totalSteps={1}
        showPrevious={false}
        showNext={false}
      />
    </div>
  )
} 