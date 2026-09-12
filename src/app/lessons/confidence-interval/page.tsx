'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import SmileyViridis from '@/app/components/SmileyViridis'
import jStat from 'jstat'
import LessonNavigation from '@/app/components/LessonNavigation';
import {
  DataAttribution,
  LessonStory,
  PredictionPrompt,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

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
  runId: number
  sampleSize: number
  confidenceLevel: number
  mean: number
  lower: number
  upper: number
  containsTrue: boolean
  sampleStd: number
  standardError: number
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
  const [populationMean] = useState<number>(22.32)
  const [populationStd] = useState<number>(5.78)
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
  const [runId, setRunId] = useState<number>(0)
  const activeIntervals = sampleIntervals.filter((interval) => interval.runId === runId)
  const coverage = activeIntervals.length > 0
    ? activeIntervals.filter((interval) => interval.containsTrue).length / activeIntervals.length
    : 0

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
    const criticalValue = jStat.studentt.inv(1 - (1 - confidenceLevel) / 2, sampleSize - 1)
    
    // Calcular intervalo de confianza
    const lower = sampleMean - criticalValue * standardError
    const upper = sampleMean + criticalValue * standardError
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
        id: runId * 10000 + sampleCount,
        runId,
        sampleSize,
        confidenceLevel,
        mean: sampleMean, 
        lower, 
        upper,
        containsTrue,
        sampleStd,
        standardError,
      }]
      
      return newIntervals
    })

    setSampleCount(prev => prev + 1)
  }, [sampleCount, numSamples, sampleSize, populationSmileys, confidenceLevel, populationMean, runId])

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
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
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
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', 'Intervalos de confianza repetidos y media poblacional')
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
      const belongsToCurrentRun = interval.runId === runId
      const intervalColor = belongsToCurrentRun
        ? (interval.containsTrue ? '#16A34A' : '#DC2626')
        : '#77727f'
      const intervalOpacity = belongsToCurrentRun ? 1 : 0.38

      // Línea del intervalo
      svg.append('line')
        .attr('x1', x(interval.lower))
        .attr('x2', x(interval.upper))
        .attr('y1', yPos)
        .attr('y2', yPos)
        .attr('stroke', intervalColor)
        .attr('stroke-width', 2)
        .attr('opacity', intervalOpacity)

      // Punto de la media
      svg.append('circle')
        .attr('cx', x(interval.mean))
        .attr('cy', yPos)
        .attr('r', 3)
        .attr('fill', intervalColor)
        .attr('opacity', intervalOpacity)

      // Si es el intervalo más reciente (i === 0), dibujamos la línea que conecta
      // con la media de la muestra actual
      if (i === 0 && belongsToCurrentRun) {
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

  }, [sampleIntervals, populationMean, coverage, confidenceLevel, runId])

  // Efecto para actualizar los gráficos
  useEffect(() => {
    if (populationHistogramRef.current) {
      updateHistogram(populationHistogramRef as React.RefObject<SVGSVGElement>, populationData, Math.ceil(populationSize * 0.4), false, [5, 35], 800, 200)
    }
    
    // Siempre actualizar gráficos de muestreo
    if (currentSampleHistogramRef.current && intervalsPlotRef.current) {
      updateHistogram(currentSampleHistogramRef as React.RefObject<SVGSVGElement>, currentSampleData, Math.ceil(sampleSize * 0.4), true, [5, 35], 800, 200)
      updateIntervalsPlot()
    }
  }, [updateHistogram, populationData, currentSampleData, updateIntervalsPlot, populationSize, sampleSize])

  const archiveCurrentRun = () => {
    setIsAnimating(false)
    setRunId((current) => current + 1)
    setSampleCount(0)
    setCurrentSampleData([])
  }

  const startAnimation = () => {
    setRunId((current) => current + 1)
    setCurrentSampleData([])
    setSampleCount(0)
    setIsAnimating(true)
  }

  const stopAnimation = () => {
    setIsAnimating(false)
  }

  const currentInterval = activeIntervals[activeIntervals.length - 1]

  return (
    <LessonStory
      eyebrow="Lección 5.2 · intervalos de confianza"
      title="¿Qué significa confiar un 95%?"
      lead="Un intervalo aislado no trae una garantía propia. La confianza pertenece al procedimiento que usamos una y otra vez."
    >
      <StoryBeat
        number="01"
        label="Predicción"
        title="El parámetro no se mueve; los intervalos sí"
        visual={
          <PredictionPrompt
            question="Después de calcular un intervalo del 95%, ¿hay 95% de probabilidad de que μ esté adentro?"
            options={['Sí, esa es la definición del 95%', 'No: μ es fijo; lo aleatorio es el intervalo']}
            reveal="Una vez observada la muestra, el intervalo contiene o no contiene μ. El 95% describe qué proporción de intervalos construidos con este método acertaría al repetir el muestreo."
          />
        }
      >
        <p>En esta simulación conocemos la media poblacional, μ = {populationMean.toFixed(2)}, para poder comprobar qué ocurre.</p>
        <p>En un estudio real no vemos μ. Solo vemos una muestra y el intervalo que construimos a partir de ella.</p>
      </StoryBeat>

        <div className="mx-auto max-w-5xl py-16 sm:py-24">
          {/* Panel de control */}
          <section className="mb-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-[var(--accent)]">02 · Construí un intervalo</p>
            <h2 className="mb-2 mt-2 text-2xl text-[var(--text)]">Primero, una muestra</h2>
            <p className="mb-6 max-w-3xl text-sm text-[var(--text-muted)]">Elegí las condiciones y tomá una sola muestra. Después repetiremos el procedimiento sin cambiar las reglas.</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)]">
                  Tamaño de muestra
                </label>
                <select
                  value={sampleSize}
                  onChange={(e) => {
                    archiveCurrentRun()
                    setSampleSize(Number(e.target.value))
                  }}
                  disabled={isAnimating}
                  className="mt-1 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)]">
                  Número de muestras
                </label>
                <select
                  value={numSamples}
                  onChange={(e) => setNumSamples(Number(e.target.value))}
                  disabled={isAnimating}
                  className="mt-1 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)]">
                  Nivel de confianza
                </label>
                <select
                  value={confidenceLevel}
                  onChange={(e) => {
                    archiveCurrentRun()
                    setConfidenceLevel(Number(e.target.value))
                  }}
                  disabled={isAnimating}
                  className="mt-1 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
                >
                  <option value={0.68}>68%</option>
                  <option value={0.90}>90%</option>
                  <option value={0.95}>95%</option>
                  <option value={0.99}>99%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)]">
                  Velocidad de animación
                </label>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="mt-1 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
                >
                  <option value={2000}>Muy lenta</option>
                  <option value={1200}>Lenta</option>
                  <option value={800}>Normal</option>
                  <option value={400}>Rápida</option>
                  <option value={200}>Muy rápida</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generateSample}
                disabled={isAnimating || sampleCount >= numSamples}
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Tomar una muestra
              </button>
              <button
                type="button"
                onClick={isAnimating ? stopAnimation : startAnimation}
                className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-soft)]"
              >
                {isAnimating ? 'Detener repetición' : 'Repetir automáticamente'}
              </button>
            </div>
          </section>

          <details className="mb-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <summary className="cursor-pointer font-display font-semibold text-[var(--text)]">Ver población simulada (N={populationSize})</summary>
              <p className="mt-3 text-sm text-[var(--text-muted)]">La línea roja marca μ. Las personas de la muestra más reciente aparecen resaltadas.</p>
              <div className="mt-4 flex justify-center overflow-x-auto">
                <svg ref={populationHistogramRef} className="h-auto min-w-[640px] max-w-full" aria-label="Histograma de la población simulada"></svg>
              </div>
              <div className="mt-4 flex justify-center overflow-x-auto">
                <svg 
                  ref={populationSmileysRef}
                  width="600"
                  height={Math.ceil(populationSize / 20) * 30 + 30} // Ajustado para 20 columnas y 30px de altura
                  viewBox={`0 0 600 ${Math.ceil(populationSize / 20) * 30 + 30}`}
                  className="h-auto min-w-[560px] max-w-full rounded-xl border border-[var(--border)]"
                  role="img"
                  aria-label="Personas de la población simulada"
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
          </details>

          {/* Muestra Actual - Siempre mostrar */}
          <section className="mb-8 rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-[var(--accent)]">Muestra actual</p>
            <h3 className="mb-4 mt-1 text-xl text-[var(--text)]">
              Muestra #{sampleCount} (n={sampleSize})
            </h3>
            {currentInterval ? (
              <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
                {[
                  ['Media', `x̄ = ${currentInterval.mean.toFixed(2)}`],
                  ['Desvío muestral', `s = ${currentInterval.sampleStd.toFixed(2)}`],
                  ['Error estándar', `EE = ${currentInterval.standardError.toFixed(2)}`],
                  [`IC ${(confidenceLevel * 100).toFixed(0)}%`, `[${currentInterval.lower.toFixed(2)}, ${currentInterval.upper.toFixed(2)}]`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-[var(--surface-muted)] p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
                    <p className="mt-1 font-mono text-lg font-bold text-[var(--text)]">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-5 rounded-xl border border-dashed border-[var(--border-strong)] p-5 text-sm text-[var(--text-muted)]">
                Tomá una muestra para construir el primer intervalo.
              </p>
            )}
            <div className="mt-4 flex justify-center overflow-x-auto">
              <svg ref={currentSampleHistogramRef} className="h-auto min-w-[640px] max-w-full" aria-label="Histograma de la muestra actual y su intervalo"></svg>
            </div>
          </section>

          {/* Intervalos de Confianza - Siempre mostrar */}
          <section className="mb-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-[var(--accent)]">03 · Repetición</p>
            <h3 className="mb-2 mt-1 text-xl text-[var(--text)]">
              Muchos intervalos ({sampleIntervals.length} muestras)
            </h3>
            <p className="max-w-3xl text-sm text-[var(--text-muted)]">
              En la corrida actual, verde significa que el intervalo contiene μ y rojo, que no. Los intervalos
              grises pertenecen a configuraciones anteriores. Cobertura actual:{' '}
              <strong className="text-[var(--text)]">
                {activeIntervals.length > 0 ? `${(coverage * 100).toFixed(1)}%` : '—'}
              </strong>.
            </p>
            <div className="mt-4 flex justify-center overflow-x-auto">
              <svg ref={intervalsPlotRef} className="h-auto min-w-[640px] max-w-full"></svg>
            </div>
          </section>

          <section className="mt-12 space-y-8">
            <StoryConclusion>
              Un procedimiento del {(confidenceLevel * 100).toFixed(0)}% produce intervalos que contienen μ en
              aproximadamente ese porcentaje de repeticiones. Subir la confianza ensancha los intervalos; aumentar
              n suele estrecharlos.
            </StoryConclusion>
            <TransferTask question="Un informe dice: “hay 95% de probabilidad de que la media esté entre 20 y 24”. ¿Cómo lo reformularías?">
              <p>Distinguí el intervalo concreto del comportamiento a largo plazo del método que lo produjo.</p>
            </TransferTask>
            <DataAttribution>
              Simulación didáctica generada en el navegador. La población de 200 puntuaciones es sintética, con
              μ objetivo 22,32 y σ de referencia 5,78; no representa observaciones reales.
            </DataAttribution>
            <LessonNavigation
              currentStep={6}
              totalSteps={9}
              previousUrl="/lessons/sampling"
              nextUrl="/lessons/randomization-inference"
            />
          </section>
        </div>
    </LessonStory>
  )
} 