'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import SmileyViridis from '@/app/components/SmileyViridis'
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

interface SampleMean {
  id: number
  mean: number
}

/** Detalle de la última muestra tomada (para lectura explícita antes de las abstracciones gráficas). */
interface LastSampleDetail {
  index: number
  /** Índices en la población (0..N-1) en el orden en que se extrajeron conceptualmente (Set iteration order). */
  populationIndices: number[]
  values: number[]
  mean: number
  /** Desviación típica muestral (n−1 en el denominador), como en d3.deviation. */
  std: number
}

// Función para generar un valor de la distribución normal
const generateNormalValue = (mean: number, std: number): number => {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return Math.max(5, Math.min(35, mean + z * std))
}

export default function SamplingPage() {
  // Estados para la población
  const [populationData, setPopulationData] = useState<DataPoint[]>([])
  const [populationSmileys, setPopulationSmileys] = useState<SmileyPoint[]>([])
  const [populationMean, setPopulationMean] = useState<number>(22.32)
  const [populationStd, setPopulationStd] = useState<number>(5.78)
  const populationSize = 50 // Tamaño fijo de la población más pequeño

  // Estados para las muestras
  const [currentSampleData, setCurrentSampleData] = useState<DataPoint[]>([])
  const [sampleMeans, setSampleMeans] = useState<SampleMean[]>([])
  const [lastSample, setLastSample] = useState<LastSampleDetail | null>(null)
  const [sampleSize, setSampleSize] = useState<number>(10)
  const [numSamples, setNumSamples] = useState<number>(100)
  const [showMean, setShowMean] = useState<boolean>(true)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [animationSpeed, setAnimationSpeed] = useState<number>(800)
  const [sampleCount, setSampleCount] = useState<number>(0)

  const latestPopulationSmileysRef = useRef<SmileyPoint[]>([])
  useEffect(() => {
    latestPopulationSmileysRef.current = populationSmileys
  }, [populationSmileys])

  // Referencias para los gráficos
  const populationHistogramRef = useRef<SVGSVGElement>(null)
  const currentSampleHistogramRef = useRef<SVGSVGElement>(null)
  const samplingDistributionRef = useRef<SVGSVGElement>(null)
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
      // Calcular cuánto necesitamos ajustar cada valor para que el último esté en rango
      const targetLast = lastValue < 5 ? 5 : 35
      const adjustment = (lastValue - targetLast) / (populationSize - 1)
      
      // Ajustar todos los valores anteriores
      for (let i = 0; i < values.length; i++) {
        values[i] = Math.max(5, Math.min(35, values[i] + adjustment))
      }
      
      // Recalcular el último valor
      const newSum = values.reduce((a, b) => a + b, 0)
      lastValue = targetSum - newSum
    }

    // Agregar el último valor
    values.push(lastValue)

    // Crear los datos para el histograma y los smileys
    values.forEach((value, i) => {
      const binIndex = Math.floor((value - 5) / 5)
      newData[binIndex] = (newData[binIndex] || 0) + 1

      newPopulationSmileys.push({
        id: i,
        value,
        x: (i % 10) * 60 + 30,
        y: Math.floor(i / 10) * 60 + 30,
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

  // Función para generar una nueva muestra (usa ref para no recrear el callback en cada resaltado de smileys).
  const generateSample = useCallback(() => {
    if (sampleCount >= numSamples) {
      setIsAnimating(false)
      return
    }

    const smileys = latestPopulationSmileysRef.current
    if (smileys.length !== populationSize) return

    // Seleccionar índices aleatorios sin reemplazo
    const selectedIndices = new Set<number>()
    while (selectedIndices.size < sampleSize) {
      selectedIndices.add(Math.floor(Math.random() * populationSize))
    }

    const populationIndices = Array.from(selectedIndices)
    const sampleValues = populationIndices.map((i) => smileys[i].value)
    const sampleMean = d3.mean(sampleValues) || 0
    const sampleStd = d3.deviation(sampleValues) ?? 0

    // Actualizar las caritas seleccionadas
    setPopulationSmileys(
      smileys.map((smiley) => ({
        ...smiley,
        isSelected: selectedIndices.has(smiley.id),
      }))
    )

    // Actualizar el histograma de la muestra actual (distribución de los valores en esta muestra)
    const sampleData: { [key: number]: number } = {}
    sampleValues.forEach((value) => {
      const binIndex = Math.floor((value - 5) / 5)
      sampleData[binIndex] = (sampleData[binIndex] || 0) + 1
    })

    const currentSampleDataArray = Object.entries(sampleData).map(([bin, freq]) => ({
      value: 5 + Number(bin) * 5,
      frequency: freq,
    }))
    setCurrentSampleData(currentSampleDataArray)

    const nextIndex = sampleCount + 1
    setLastSample({
      index: nextIndex,
      populationIndices,
      values: [...sampleValues],
      mean: sampleMean,
      std: sampleStd,
    })

    setSampleMeans((prev) => [...prev, { id: sampleCount, mean: sampleMean }])
    setSampleCount((prev) => prev + 1)
  }, [sampleCount, numSamples, sampleSize, populationSize])

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

    const margin = showSampleMean
      ? { top: 44, right: 40, bottom: 88, left: 60 }
      : { top: 40, right: 40, bottom: 60, left: 60 }
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
    const binWidth = 2 // Reducir el ancho de los bins
    const numBins = Math.floor((xDomain[1] - xDomain[0]) / binWidth)
    const barWidth = (innerWidth / numBins) - 1 // 1 píxel de separación

    // Barras
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.value - binWidth/2) + 0.5)
      .attr('y', d => y(d.frequency))
      .attr('width', barWidth)
      .attr('height', d => innerHeight - y(d.frequency))
      .attr('fill', '#4F46E5')
      .attr('opacity', 0.7)

    // Línea de la media poblacional (siempre mostrarla)
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

    // Línea de la media muestral (solo para muestras)
    if (showSampleMean && data.length > 0) {
      const expandedValues: number[] = []
      data.forEach(d => {
        for (let i = 0; i < d.frequency; i++) {
          expandedValues.push(d.value)
        }
      })
      const currentMean = d3.mean(expandedValues) || 0
      const currentStd = d3.deviation(expandedValues) ?? 0
      
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
        .text(`Media muestral x̄: ${currentMean.toFixed(2)}`)

      if (currentStd > 0 && expandedValues.length > 1) {
        const lo = Math.max(xDomain[0], currentMean - currentStd)
        const hi = Math.min(xDomain[1], currentMean + currentStd)
        svg.append('line')
          .attr('x1', x(lo))
          .attr('x2', x(hi))
          .attr('y1', innerHeight + 4)
          .attr('y2', innerHeight + 4)
          .attr('stroke', '#2563EB')
          .attr('stroke-width', 3)
          .attr('opacity', 0.85)
        svg.append('text')
          .attr('x', x(currentMean))
          .attr('y', innerHeight + 22)
          .attr('text-anchor', 'middle')
          .attr('fill', '#2563EB')
          .style('font-size', '11px')
          .text(`±1 desv. típica muestral (s=${currentStd.toFixed(2)})`)
      }
    }
  }, [populationMean])

  // Función para actualizar la distribución muestral
  const updateSamplingDistribution = useCallback(() => {
    if (!samplingDistributionRef.current) return

    if (sampleMeans.length === 0) {
      d3.select(samplingDistributionRef.current).selectAll('*').remove()
      return
    }

    const margin = { top: 40, right: 40, bottom: 80, left: 60 } // Aumentar el margen inferior
    const width = 800
    const height = 300
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Limpiar SVG
    d3.select(samplingDistributionRef.current).selectAll('*').remove()

    // Crear SVG
    const svg = d3.select(samplingDistributionRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Calcular el histograma de las medias
    const values = sampleMeans.map(d => d.mean)
    const bins = d3.histogram()
      .domain([5, 35])
      .thresholds(20)(values)

    // Escalas
    const x = d3.scaleLinear()
      .domain([5, 35])
      .range([0, innerWidth])

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 0])
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
      .text('Media Muestral')

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

    // Calcular el histograma de las medias con menos bins
    const samplingBinWidth = 1 // Ancho de bin para la distribución muestral
    const samplingNumBins = Math.floor((30) / samplingBinWidth) // 30 es aproximadamente el rango total
    const samplingBins = d3.histogram()
      .domain([5, 35])
      .thresholds(samplingNumBins)(values)

    // Ajustar el ancho de las barras
    const barWidth = (innerWidth / samplingNumBins) - 2 // 2 píxeles de separación

    // Barras con margen
    svg.selectAll('rect')
      .data(samplingBins)
      .enter()
      .append('rect')
      .attr('x', d => x(d.x0 || 0) + 1)
      .attr('y', d => y(d.length))
      .attr('width', barWidth)
      .attr('height', d => innerHeight - y(d.length))
      .attr('fill', '#4F46E5')
      .attr('opacity', 0.7)

    // Línea de la media poblacional
    if (showMean) {
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
    }

    // Calcular y mostrar estadísticas empíricas
    const empiricalMean = d3.mean(values) || 0
    const empiricalStd = d3.deviation(values) || 0

    // Línea de media empírica (ahora en verde)
    svg.append('line')
      .attr('x1', x(empiricalMean))
      .attr('x2', x(empiricalMean))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#16A34A')
      .attr('stroke-width', 2)

    svg.append('text')
      .attr('x', x(empiricalMean))
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#16A34A')
      .text(`Media empírica: ${empiricalMean.toFixed(3)}`)

    // Agregar línea de la media muestral actual si hay muestras
    if (sampleMeans.length > 0) {
      const currentSampleMean = sampleMeans[sampleMeans.length - 1].mean
      svg.append('line')
        .attr('x1', x(currentSampleMean))
        .attr('x2', x(currentSampleMean))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#2563EB')
        .attr('stroke-width', 2)

      svg.append('text')
        .attr('x', x(currentSampleMean))
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .attr('fill', '#2563EB')
        .text(`Media muestra actual: ${currentSampleMean.toFixed(3)}`)
    }

    // Error estándar teórico y empírico
    const theoreticalSE = populationStd / Math.sqrt(sampleSize)
    const empiricalSE = empiricalStd

    // Mover la información del error estándar debajo del eje X
    svg.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 65)
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .style('font-size', '14px')
      .text(`Error estándar teórico: ${theoreticalSE.toFixed(3)}  |  Error estándar empírico: ${empiricalSE.toFixed(3)}`)

  }, [sampleMeans, populationMean, showMean, sampleSize, populationStd])

  // Efecto para actualizar los gráficos
  useEffect(() => {
    if (populationHistogramRef.current && currentSampleHistogramRef.current) {
      updateHistogram(populationHistogramRef as React.RefObject<SVGSVGElement>, populationData, Math.ceil(populationSize * 0.4), false, [5, 35], 800, 200)
      updateHistogram(currentSampleHistogramRef as React.RefObject<SVGSVGElement>, currentSampleData, Math.ceil(sampleSize * 0.4), true, [5, 35], 800, 200)
      updateSamplingDistribution()
    }
  }, [updateHistogram, populationData, currentSampleData, updateSamplingDistribution, populationSize, sampleSize])

  const startAnimation = () => {
    setSampleMeans([])
    setCurrentSampleData([])
    setLastSample(null)
    setSampleCount(0)
    setIsAnimating(true)
  }

  const stopAnimation = () => {
    setIsAnimating(false)
  }

  return (
    <div className="py-8">
      <LessonNavigation
        currentStep={1}
        totalSteps={2}
        previousUrl="/lessons/regression-interactive"
        showPrevious={true}
        nextUrl="/lessons/sampling-editable"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Muestreo
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Primero lee cada muestra como lista de casos con su media (x̄) y su desviación típica muestral (s).
            Después mira el histograma de esa muestra (cómo se reparten los valores en el eje de satisfacción) y,
            al repetir, la distribución muestral de las medias.
          </p>
        </div>

        {/* Texto introductorio y instrucciones */}
        <div className="panel-contenido">
          <div className="prose text-gray-700 mb-6">
            <p className="text-lg">
              El muestreo es fundamental en estadística porque rara vez podemos estudiar toda una población.
              Aquí cada paso de la simulación toma <strong>n</strong> personas al azar (sin reemplazo dentro de la
              muestra), anota sus puntuaciones de satisfacción y calcula la media y la dispersión de ese grupo.
              Solo cuando ya viste varias muestras así tiene sentido mirar el histograma de todas las medias
              (la distribución muestral).
            </p>
          </div>
          
          <div className="bg-gris-claro p-4 rounded-lg">
            <h3 className="font-bold text-negro mb-3">💡 Cosas que puedes probar:</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Observa la población (N=50) y la línea roja de la media poblacional μ</li>
              <li>Lee los valores de la muestra actual y compara x̄ y s con μ y σ</li>
              <li>Cambia n y el número de muestras; usa velocidad lenta para seguir muestra a muestra</li>
              <li>El histograma de abajo en el bloque de muestra resume solo esa muestra; el de distribución muestral acumula x̄</li>
              <li>Compara el error estándar teórico σ/√n con el empírico entre medias</li>
            </ul>
          </div>
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
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showMean}
                  onChange={(e) => setShowMean(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">Mostrar Media Poblacional</span>
              </label>
            </div>
          </div>

          {/* Población */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Población (N={populationSize})</h3>
            <div className="mt-4 flex justify-center">
              <svg ref={populationHistogramRef}></svg>
            </div>
            <div className="mt-4 flex justify-center">
              <svg 
                ref={populationSmileysRef}
                width="600"
                height={Math.ceil(populationSize / 10) * 60 + 60}
                className="border border-gray-200 rounded-lg"
              >
                {populationSmileys.map(smiley => (
                  <g key={smiley.id}>
                    {smiley.isSelected && (
                      <circle
                        cx={smiley.x}
                        cy={smiley.y}
                        r="25"
                        fill="#DC2626"
                        opacity="0.3"
                      />
                    )}
                    <SmileyViridis
                      cx={smiley.x}
                      cy={smiley.y}
                      happiness={(smiley.value - 5) / 30}
                    />
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Paso 1: muestra explícita + histograma de esa muestra */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-indigo-500">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
              Paso 1 · Una muestra a la vez
            </p>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Casos incluidos en la muestra y sus estadísticos
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-3xl">
              Cada animación elige <strong>{sampleSize}</strong> personas distintas de la población. Los valores
              que ves son sus puntuaciones de satisfacción (escala aproximada 5–35). La media muestral se denota
              x̄; la desviación típica muestral <strong>s</strong> usa denominador <strong>n−1</strong> (como en la
              fórmula habitual de la muestra). La dispersión poblacional fija del modelo es σ ≈{' '}
              {populationStd.toFixed(2)} (referencia, no se recalcula de los 50 valores mostrados).
            </p>

            {lastSample ? (
              <div className="mb-8 rounded-xl border border-gray-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-200 pb-3 mb-4">
                  <span className="text-base font-semibold text-gray-900">
                    Muestra {lastSample.index} de {numSamples}
                  </span>
                  <span className="text-sm text-gray-500">
                    Progreso: {sampleMeans.length} / {numSamples}
                  </span>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500 mb-2">
                      Valores observados (n = {lastSample.values.length})
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      Ordenados de menor a mayor para leerlos; los índices # son posiciones en la grilla de población.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lastSample.populationIndices
                        .map((popIdx, j) => ({ popIdx, v: lastSample.values[j] }))
                        .sort((a, b) => a.v - b.v)
                        .map(({ popIdx, v }) => (
                          <span
                            key={`${lastSample.index}-${popIdx}`}
                            className="inline-flex min-w-[4.5rem] flex-col rounded-lg bg-white px-2 py-1 text-center shadow-sm ring-1 ring-gray-200"
                          >
                            <span className="text-[10px] text-gray-400">#{popIdx}</span>
                            <span className="font-mono text-sm font-medium text-gray-900">{v.toFixed(2)}</span>
                          </span>
                        ))}
                    </div>
                    <p className="mt-3 font-mono text-xs text-gray-600 break-all">
                      Índices en la población (orden de extracción): [
                      {lastSample.populationIndices.join(', ')}]
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
                      <p className="text-xs font-semibold uppercase text-gray-500">Media muestral</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-indigo-700">
                        x̄ = {lastSample.mean.toFixed(3)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Media poblacional (referencia del modelo) μ = {populationMean.toFixed(2)} — diferencia
                        x̄ − μ = {(lastSample.mean - populationMean).toFixed(3)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Desviación típica muestral (n−1)
                      </p>
                      <p className="mt-1 font-mono text-2xl font-bold text-indigo-700">
                        s ={' '}
                        {lastSample.values.length < 2
                          ? '—'
                          : lastSample.std.toFixed(3)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {lastSample.values.length < 2
                          ? 'Con un solo caso no tiene sentido hablar de dispersión dentro de la muestra.'
                          : 'Mide cuán dispersos están los n valores entre sí; no confundir con el error estándar de x̄ (eso viene después).'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-indigo-50/80 p-3 text-xs text-indigo-900">
                      <strong>Suma de valores:</strong>{' '}
                      <span className="font-mono">
                        Σx = {d3.sum(lastSample.values).toFixed(3)}
                      </span>
                      {' — '}
                      comprobación: x̄ = Σx / n ={' '}
                      <span className="font-mono">
                        {(d3.sum(lastSample.values) / lastSample.values.length).toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                <p className="font-medium text-gray-700">Aún no hay muestra en esta sesión</p>
                <p className="mt-2 text-sm">
                  Pulsa <strong>Comenzar simulación</strong> para ver aquí la primera muestra con todos los
                  detalles.
                </p>
              </div>
            )}

            <h4 className="text-base font-medium text-gray-900 mb-2">
              Distribución de los valores dentro de esta muestra
            </h4>
            <p className="text-sm text-gray-600 mb-4 max-w-3xl">
              Este histograma solo describe los <strong>n</strong> valores de la última muestra (frecuencias por
              tramo del eje). La línea azul es x̄; debajo, un segmento de ancho 2s ayuda a visualizar la dispersión
              interna. La línea roja punteada sigue siendo μ poblacional para orientarte.
            </p>
            <div className="mt-4 flex justify-center overflow-x-auto">
              <svg ref={currentSampleHistogramRef}></svg>
            </div>
          </div>

          {/* Paso 2: distribución muestral */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-violet-500">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 mb-1">
              Paso 2 · Abstracción: muchas medias
            </p>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Distribución muestral de la media ({sampleMeans.length} medias acumuladas)
            </h3>
            <p className="text-sm text-gray-600 mb-4 max-w-3xl">
              Cada barra cuenta cuántas veces obtuvimos una media x̄ en un intervalo del eje. Ya no miras los{' '}
              <strong>n</strong> valores crudos, sino la colección de resúmenes x̄ — de ahí la dispersión suele ser
              menor que la de la población (pero mide otra cosa: variación entre muestras, no dentro de una).
            </p>
            <div className="mt-4 flex justify-center overflow-x-auto">
              <svg ref={samplingDistributionRef}></svg>
            </div>
          </div>

          {/* Explicación */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Explicación</h3>
            <div className="prose max-w-none">
              <h4 className="text-base font-medium text-gray-900">Distribución Muestral</h4>
              <p className="text-gray-600 mb-4">
                La distribución muestral de la media es la distribución de las medias x̄ obtenidas al repetir el
                muestreo. Cada barra del gráfico del paso 2 cuenta cuántas veces cayó x̄ en un intervalo; no es el
                histograma de los valores individuales de una sola muestra.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>En el paso 1 ves los n valores, x̄ y s de la última muestra; en el paso 2 solo acumulas x̄</li>
                <li>Las caritas resaltadas en rojo son los elementos de la última muestra extraída</li>
                <li>La dispersión entre medias (paso 2) suele ser menor que la dispersión dentro de la población</li>
                <li>La distribución muestral tiende a centrarse en μ cuando el muestreo es aleatorio simple</li>
              </ul>

              <h4 className="text-base font-medium text-gray-900 mt-4">Teorema del Límite Central</h4>
              <p className="text-gray-600 mb-4">
                A medida que aumenta el tamaño de la muestra:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>La distribución muestral se aproxima a una normal</li>
                <li>La media de la distribución muestral se acerca a la media poblacional</li>
                <li>El error estándar (dispersión de las medias) disminuye</li>
              </ul>

              <h4 className="text-base font-medium text-gray-900 mt-4">Error Estándar</h4>
              <p className="text-gray-600 mb-4">
                El error estándar de la media es la desviación estándar de la distribución muestral:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Se calcula como σ/√n, donde σ es la desviación estándar poblacional</li>
                <li>Disminuye a medida que aumenta el tamaño de la muestra</li>
                <li>Mide la precisión de la estimación de la media poblacional</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Resumen de la Lección */}
        <div className="panel-contenido">
          <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
            Resumen de Conceptos Clave
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-negro mb-2">Conceptos de Muestreo:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Población:</strong> Conjunto completo de elementos de interés</li>
                <li><strong>Muestra:</strong> Subconjunto representativo de la población</li>
                <li><strong>Parámetro:</strong> Característica numérica de la población</li>
                <li><strong>Estadístico:</strong> Característica numérica de la muestra</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-negro mb-2">Tipos de Muestreo:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Aleatorio simple:</strong> Cada elemento tiene igual probabilidad</li>
                <li><strong>Sistemático:</strong> Selección a intervalos regulares</li>
                <li><strong>Estratificado:</strong> División en grupos homogéneos</li>
                <li><strong>Por conglomerados:</strong> Selección de grupos completos</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gris-claro rounded-lg">
            <h3 className="font-bold text-negro mb-2">Conceptos Importantes:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Error de muestreo:</strong><br/>
                <code>Error = |Estadístico - Parámetro|</code><br/>
                <strong>Precisión:</strong><br/>
                <code>Precisión ∝ 1/√n</code>
              </div>
              <div>
                <strong>Sesgo:</strong><br/>
                <code>Sesgo = E[Estadístico] - Parámetro</code><br/>
                <strong>Tamaño de muestra:</strong><br/>
                <code>n = (z²σ²) / E²</code>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LessonNavigation
        currentStep={1}
        totalSteps={2}
        previousUrl="/lessons/regression-interactive"
        showPrevious={true}
        nextUrl="/lessons/sampling-editable"
      />
    </div>
  )
} 