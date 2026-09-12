'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import SmileyViridis from '@/app/components/SmileyViridis'
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
  const [populationMean] = useState<number>(22.32)
  const [populationStd] = useState<number>(5.78)
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
    height: number = 200,
    sampleStats?: { mean: number; std: number; n: number }
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
      const currentMean = sampleStats?.mean ?? d3.mean(expandedValues) ?? 0
      const currentStd = sampleStats?.std ?? d3.deviation(expandedValues) ?? 0
      
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

      svg.append('text')
        .attr('x', innerWidth)
        .attr('y', -25)
        .attr('text-anchor', 'end')
        .attr('fill', 'var(--text)')
        .style('font-size', '12px')
        .style('font-weight', '700')
        .text(`n = ${sampleStats?.n ?? expandedValues.length}  ·  x̄ = ${currentMean.toFixed(2)}  ·  s = ${currentStd.toFixed(2)}`)

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
      updateHistogram(
        currentSampleHistogramRef as React.RefObject<SVGSVGElement>,
        currentSampleData,
        Math.ceil(sampleSize * 0.4),
        true,
        [5, 35],
        800,
        200,
        lastSample ? { mean: lastSample.mean, std: lastSample.std, n: lastSample.values.length } : undefined
      )
      updateSamplingDistribution()
    }
  }, [updateHistogram, populationData, currentSampleData, updateSamplingDistribution, populationSize, sampleSize, lastSample])

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
    <LessonStory
      eyebrow="Lección 5 · muestreo"
      title="¿Cuánto cambia una conclusión de muestra en muestra?"
      lead="Vamos a seguir una extracción completa antes de acumular medias. Primero personas y valores; después, y recién después, distribuciones."
    >
      <StoryBeat
        number="01"
        label="Predicción"
        title="Una muestra no es una versión pequeña y perfecta de la población"
        visual={
          <PredictionPrompt
            question="Si tomamos dos muestras aleatorias del mismo tamaño, ¿tendrán exactamente la misma media?"
            options={['Sí, porque vienen de la misma población', 'No: cada selección puede producir una media distinta']}
            reveal="Aunque el mecanismo sea el mismo, cambian las personas seleccionadas. Esa variación de muestra en muestra es la que necesitamos comprender."
          />
        }
      >
        <p>La población simulada tiene {populationSize} personas y una media de satisfacción fijada en μ = {populationMean.toFixed(2)}.</p>
        <p>Cada extracción selecciona personas sin reemplazo dentro de la muestra. Entre muestras, vuelven a estar disponibles.</p>
      </StoryBeat>

        <div className="mx-auto max-w-5xl py-16 sm:py-24">
          {/* Panel de control */}
          <div className="mb-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-[var(--accent)]">02 · Una muestra concreta</p>
            <h2 className="mb-2 mt-2 text-2xl text-[var(--text)]">Elegí n y mirá quiénes entran</h2>
            <p className="mb-6 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">Tomá primero una sola muestra. Leé sus valores, su media y su desvío antes de iniciar la repetición automática.</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-[var(--text)]">
                  Tamaño de muestra
                </label>
                <select
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
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
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={generateSample}
                disabled={isAnimating || sampleCount >= numSamples}
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Tomar una muestra
              </button>
              <button
                type="button"
                onClick={isAnimating ? stopAnimation : startAnimation}
                className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--accent-soft)]"
              >
                {isAnimating ? 'Detener repetición' : 'Repetir automáticamente'}
              </button>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={showMean}
                  onChange={(e) => setShowMean(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-[var(--text-muted)]">Mostrar μ poblacional</span>
              </label>
            </div>
          </div>

          {/* Población */}
          <div className="mb-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
            <h3 className="mb-2 text-lg text-[var(--text)]">Población simulada (N={populationSize})</h3>
            <p className="text-sm text-[var(--text-muted)]">Al tomar una muestra, las personas seleccionadas quedan marcadas. El histograma de arriba sigue mostrando la población completa.</p>
            <div className="mt-4 flex justify-center overflow-x-auto">
              <svg ref={populationHistogramRef} className="h-auto min-w-[640px] max-w-full" role="img" aria-label="Histograma de la población simulada"></svg>
            </div>
            <div className="mt-4 flex justify-center overflow-x-auto">
              <svg 
                ref={populationSmileysRef}
                width="600"
                height={Math.ceil(populationSize / 10) * 60 + 60}
                viewBox={`0 0 600 ${Math.ceil(populationSize / 10) * 60 + 60}`}
                className="h-auto min-w-[520px] max-w-full rounded-xl border border-[var(--border)]"
                role="img"
                aria-label="Personas de la población; las seleccionadas en la última muestra están resaltadas"
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
                    {smiley.isSelected ? (
                      <text
                        x={smiley.x}
                        y={smiley.y + 28}
                        textAnchor="middle"
                        fill="var(--text)"
                        fontSize="10"
                        fontWeight="700"
                      >
                        {smiley.value.toFixed(1)}
                      </text>
                    ) : null}
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Muestra actual: resumen compacto + histograma */}
          <div className="mb-8 rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.17em] text-[var(--accent)]">
              Muestra actual
            </p>
            <h3 className="mb-2 text-xl text-[var(--text)]">
              Distribución de los valores seleccionados
            </h3>
            <p className="mb-3 max-w-3xl text-sm text-[var(--text-muted)]">
              Las puntuaciones aparecen debajo de las personas resaltadas en la población. El histograma reúne
              esos mismos casos y muestra su media x̄ y su desvío muestral s.
            </p>

            {lastSample ? (
              <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">
                Muestra {lastSample.index} de {numSamples} · progreso {sampleMeans.length}/{numSamples}
              </p>
            ) : (
              <p className="mb-2 text-sm text-[var(--text-muted)]">Tomá una muestra para completar este gráfico.</p>
            )}

            <div className="flex justify-center overflow-x-auto">
              <svg ref={currentSampleHistogramRef} className="h-auto min-w-[640px] max-w-full" role="img" aria-label="Histograma de los valores de la muestra actual"></svg>
            </div>
          </div>

          {/* Paso 2: distribución muestral */}
          <div className="mb-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.17em] text-[var(--accent)]">
              03 · Ahora sí: muchas muestras
            </p>
            <h3 className="mb-2 text-xl text-[var(--text)]">
              Distribución muestral de la media ({sampleMeans.length} medias acumuladas)
            </h3>
            <p className="mb-4 max-w-3xl text-sm text-[var(--text-muted)]">
              Cada barra cuenta cuántas veces obtuvimos una media x̄ en un intervalo del eje. Ya no mirás los{' '}
              <strong>n</strong> valores crudos, sino la colección de resúmenes x̄ — de ahí la dispersión suele ser
              menor que la de la población (pero mide otra cosa: variación entre muestras, no dentro de una).
            </p>
            <div className="mt-4 flex justify-center overflow-x-auto">
              <svg ref={samplingDistributionRef} className="h-auto min-w-[640px] max-w-full" role="img" aria-label="Distribución de las medias obtenidas en las muestras"></svg>
            </div>
          </div>

          <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-[var(--accent)]">04 · La herramienta</p>
            <h3 className="mt-2 text-xl text-[var(--text)]">El error estándar describe cuánto varían las medias</h3>
            <p className="mt-3 max-w-3xl text-[var(--text-muted)]">
              El desvío <strong>s</strong> de la muestra actual habla de diferencias entre personas. El error estándar
              habla de diferencias entre medias de muchas muestras. En este modelo, su valor teórico es σ/√n ={' '}
              <strong className="text-[var(--text)]">{(populationStd / Math.sqrt(sampleSize)).toFixed(3)}</strong>.
            </p>
          </div>

          <div className="mt-12 space-y-8">
            <StoryConclusion>
              Una media muestral es una estimación, no un valor fijo. Al aumentar n, las medias posibles se agrupan
              más cerca de μ: ganamos precisión porque baja el error estándar.
            </StoryConclusion>
            <TransferTask question="¿Qué cambiaría si duplicaras n, pero siguieras tomando la muestra de un grupo sesgado?">
              <p>Separá dos problemas: la variación aleatoria entre muestras y el mecanismo que decide quién puede entrar.</p>
            </TransferTask>
            <DataAttribution>
              Simulación didáctica generada en el navegador. La población de 50 valores de satisfacción es sintética,
              con μ objetivo 22,32 y σ de referencia 5,78; no representa observaciones reales.
            </DataAttribution>
            <LessonNavigation
              currentStep={6}
              totalSteps={9}
              previousUrl="/lessons/regression-interactive"
              nextUrl="/lessons/confidence-interval"
            />
          </div>
        </div>
    </LessonStory>
  )
} 