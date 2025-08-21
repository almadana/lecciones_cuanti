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
}

// Función para generar un valor de la distribución normal
const generateNormalValue = (mean: number, std: number): number => {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return Math.max(5, Math.min(35, mean + z * std))
}

export default function MeanDeviationEditablePage() {
  const [data, setData] = useState<DataPoint[]>([])
  const [smileys, setSmileys] = useState<SmileyPoint[]>([])
  const [sampleSize, setSampleSize] = useState<number>(100)
  const [showMean, setShowMean] = useState<boolean>(true)
  const [showMedian, setShowMedian] = useState<boolean>(true)
  const [showMode, setShowMode] = useState<boolean>(true)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [animationSpeed, setAnimationSpeed] = useState<number>(800) // Default a velocidad normal
  const [smileyCount, setSmileyCount] = useState<number>(0)
  const [targetMean, setTargetMean] = useState<number>(22.32)
  const [targetStd, setTargetStd] = useState<number>(5.78)
  const histogramRef = useRef<SVGSVGElement>(null)
  const smileysRef = useRef<SVGSVGElement>(null)

  // Calcular estadísticas solo de los datos existentes
  const validData = data.filter(d => d !== undefined && d.value !== undefined && d.frequency > 0)
  const allValues = validData.flatMap(d => Array(d.frequency).fill(d.value))
  
  const mean = allValues.length > 0 ? d3.mean(allValues) || targetMean : targetMean
  const median = allValues.length > 0 ? d3.median(allValues) || targetMean : targetMean
  const mode = validData.length > 0 
    ? validData.reduce((a, b) => (a.frequency > b.frequency ? a : b)).value 
    : targetMean

  // Función para agregar un nuevo smiley
  const addSmiley = useCallback(() => {
    const value = generateNormalValue(targetMean, targetStd)
    const happiness = (value - 5) / 30 // Normalizar entre 0 y 1
    
    // Actualizar histograma
    const binIndex = Math.floor((value - 5) / 5)
    setData(prevData => {
      const newData = [...prevData]
      // Asegurarnos de que el array tenga el tamaño correcto
      while (newData.length <= binIndex) {
        newData.push({ value: 5 + newData.length * 5, frequency: 0 })
      }
      newData[binIndex].frequency++
      return newData
    })

    // Agregar nuevo smiley
    const newSmiley: SmileyPoint = {
      id: smileyCount,
      value,
      x: (smileyCount % 20) * 40 + 20,
      y: Math.floor(smileyCount / 20) * 40 + 20
    }
    setSmileys(prev => [...prev, newSmiley])
    setSmileyCount(prev => prev + 1)
  }, [smileyCount, targetMean, targetStd])

  // Efecto para manejar la animación
  useEffect(() => {
    if (!isAnimating) return

    if (smileyCount >= sampleSize) {
      setIsAnimating(false)
      setSmileyCount(0)
      return
    }

    const timeoutId = setTimeout(addSmiley, animationSpeed)
    return () => clearTimeout(timeoutId)
  }, [isAnimating, smileyCount, sampleSize, animationSpeed, addSmiley])

  const startAnimation = () => {
    setData([])
    setSmileys([])
    setSmileyCount(0)
    setIsAnimating(true)
  }

  const stopAnimation = () => {
    setIsAnimating(false)
  }

  // Función para actualizar el histograma
  const updateHistogram = useCallback(() => {
    if (!histogramRef.current) return

    const margin = { top: 40, right: 40, bottom: 60, left: 60 }
    const width = 800 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    // Limpiar SVG
    d3.select(histogramRef.current).selectAll('*').remove()

    // Crear SVG
    const svg = d3.select(histogramRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Escalas
    const x = d3.scaleLinear()
      .domain([0, 40])
      .range([0, width])

    // Calcular el máximo esperado para el eje Y
    // Para una distribución normal, necesitamos dar suficiente espacio
    // para las fluctuaciones en el bin central
    const expectedMaxFreq = Math.ceil(sampleSize * 0.9)
    
    const y = d3.scaleLinear()
      .domain([0, expectedMaxFreq])
      .range([height, 0])

    // Ejes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(8))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('Nivel de Satisfacción')

    svg.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('Frecuencia')

    // Barras
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.value - 2.5))
      .attr('y', d => y(d.frequency))
      .attr('width', width / 16)
      .attr('height', d => height - y(d.frequency))
      .attr('fill', '#4F46E5')
      .attr('opacity', 0.7)

    // Líneas de medidas centrales
    if (showMean) {
      svg.append('line')
        .attr('x1', x(mean))
        .attr('x2', x(mean))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')

      svg.append('text')
        .attr('x', x(mean))
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('fill', 'red')
        .text(`Media: ${mean.toFixed(2)}`)
    }

    if (showMedian) {
      svg.append('line')
        .attr('x1', x(median))
        .attr('x2', x(median))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', 'green')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')

      svg.append('text')
        .attr('x', x(median))
        .attr('y', -25)
        .attr('text-anchor', 'middle')
        .attr('fill', 'green')
        .text(`Mediana: ${median.toFixed(2)}`)
    }

    if (showMode) {
      const modeFrequency = data.find(d => d.value === mode)?.frequency || 0
      
      svg.append('circle')
        .attr('cx', x(mode))
        .attr('cy', y(modeFrequency))
        .attr('r', 6)
        .attr('fill', 'blue')

      svg.append('text')
        .attr('x', x(mode))
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .attr('fill', 'blue')
        .text(`Moda: ${mode}`)
    }
  }, [data, mean, median, mode, showMean, showMedian, showMode, sampleSize])

  // Efecto para actualizar el histograma cuando cambian los datos
  useEffect(() => {
    updateHistogram()
  }, [updateHistogram])

  return (
    <div className="py-8">
      <LessonNavigation
        currentStep={4}
        totalSteps={4}
        previousUrl="/lessons/mean-deviation"
        showPrevious={true}
        nextUrl="/lessons/univariate-tables"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Editor de Media y Desvío
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Experimenta con diferentes valores de media y desviación estándar para ver cómo afectan la distribución de los datos.
          </p>
        </div>

        <div className="mt-12">
          {/* Panel de control */}
          <div className="panel-contenido">
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
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
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
                {isAnimating ? 'Detener' : 'Comenzar'}
              </button>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showMean}
                  onChange={(e) => setShowMean(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">Mostrar Media</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showMedian}
                  onChange={(e) => setShowMedian(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">Mostrar Mediana</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showMode}
                  onChange={(e) => setShowMode(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">Mostrar Moda</span>
              </label>
            </div>
          </div>

          {/* Área de Smileys */}
          <div className="panel-contenido">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Muestra Actual</h3>
            <div className="mt-4 flex justify-center">
              <svg 
                ref={smileysRef}
                width="800"
                height={Math.ceil(sampleSize / 20) * 40 + 40}
                className="border border-gray-200 rounded-lg"
              >
                {smileys.map(smiley => (
                  <SmileyViridis
                    key={smiley.id}
                    cx={smiley.x}
                    cy={smiley.y}
                    happiness={(smiley.value - 5) / 30}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Histograma y Controles de Distribución */}
          <div className="panel-contenido">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución de Satisfacción con la Vida</h3>
            <div className="mt-4 flex justify-center">
              <svg ref={histogramRef}></svg>
            </div>
            {/* Sliders para media y desvío */}
            <div className="mt-8 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Media objetivo: {targetMean.toFixed(1)}
                  </label>
                </div>
                <input
                  type="range"
                  min={5}
                  max={35}
                  step={0.1}
                  value={targetMean}
                  onChange={(e) => setTargetMean(Number(e.target.value))}
                  disabled={isAnimating}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Desviación estándar: {targetStd.toFixed(1)}
                  </label>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={targetStd}
                  onChange={(e) => setTargetStd(Number(e.target.value))}
                  disabled={isAnimating}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Explicación */}
          <div className="panel-contenido">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Explicación</h3>
            <div className="prose max-w-none">
              <h4 className="text-base font-medium text-gray-900">Media</h4>
              <p className="text-gray-600 mb-4">
                La media es el promedio aritmético de todos los valores. Se calcula sumando todos los valores y dividiendo por el número total de observaciones.
                Puedes ajustar la media objetivo para ver cómo afecta la ubicación central de la distribución.
              </p>

              <h4 className="text-base font-medium text-gray-900">Desviación Estándar</h4>
              <p className="text-gray-600 mb-4">
                La desviación estándar mide qué tan dispersos están los valores respecto a la media.
                Un valor menor hará que los datos estén más concentrados alrededor de la media, mientras que un valor mayor los dispersará más.
              </p>

              <h4 className="text-base font-medium text-gray-900">Interpretación</h4>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Aproximadamente el 68% de los datos caen dentro de ±1 desviación estándar de la media</li>
                <li>Cerca del 95% caen dentro de ±2 desviaciones estándar</li>
                <li>La distribución es simétrica alrededor de la media</li>
                <li>Los valores extremos son menos frecuentes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <LessonNavigation
        currentStep={4}
        totalSteps={4}
        previousUrl="/lessons/mean-deviation"
        showPrevious={true}
        nextUrl="/lessons/univariate-tables"
      />
    </div>
  )
} 