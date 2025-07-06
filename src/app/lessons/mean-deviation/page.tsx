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

export default function MeanDeviationPage() {
  const [data, setData] = useState<DataPoint[]>([])
  const [smileys, setSmileys] = useState<SmileyPoint[]>([])
  const [sampleSize, setSampleSize] = useState<number>(100)
  const [showMean, setShowMean] = useState<boolean>(true)
  const [showMedian, setShowMedian] = useState<boolean>(true)
  const [showMode, setShowMode] = useState<boolean>(true)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [animationSpeed, setAnimationSpeed] = useState<number>(30)
  const [smileyCount, setSmileyCount] = useState<number>(0)
  const histogramRef = useRef<SVGSVGElement>(null)
  const smileysRef = useRef<SVGSVGElement>(null)

  // Calcular estadísticas solo de los datos existentes
  const validData = data.filter(d => d !== undefined && d.value !== undefined && d.frequency > 0)
  const allValues = validData.flatMap(d => Array(d.frequency).fill(d.value))
  
  const mean = allValues.length > 0 ? d3.mean(allValues) || 22.32 : 22.32
  const median = allValues.length > 0 ? d3.median(allValues) || 22.32 : 22.32
  const mode = validData.length > 0 
    ? validData.reduce((a, b) => (a.frequency > b.frequency ? a : b)).value 
    : 22.32

  // Función para agregar un nuevo smiley
  const addSmiley = useCallback(() => {
    const value = generateNormalValue(22.32, 5.78)
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
  }, [smileyCount])

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
        currentStep={1}
        totalSteps={2}
        nextUrl="/lessons/mean-deviation-editable"
        showPrevious={false}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Media y Desviación (1 de 2)
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Desde el año 2015, en el curso "Métodos y Técnicas Cuantitativas", recabamos datos sobre la satisfacción general con la vida de los estudiantes.
            La escala va de 5 a 35 puntos, con una media de 22.32 y un desvío estándar de 5.78.
          </p>
        </div>

        <div className="mt-12">
          {/* Panel de control */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 mb-8 border border-gris-borde">
            <h3 className="text-lg font-medium text-negro bg-morado-claro p-2 rounded-lg inline-block mb-4">Controles de Simulación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tamaño de muestra
                </label>
                <select
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  disabled={isAnimating}
                  className="mt-1 block w-full rounded-md border-gris-borde shadow-sm focus:border-morado-oscuro focus:ring-morado-oscuro p-2"
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
                  className="mt-1 block w-full rounded-md border-gris-borde shadow-sm focus:border-morado-oscuro focus:ring-morado-oscuro p-2"
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-negro bg-morado-oscuro hover:bg-verde-claro transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-morado-oscuro"
              >
                {isAnimating ? 'Detener' : 'Comenzar'}
              </button>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showMean}
                  onChange={(e) => setShowMean(e.target.checked)}
                  className="rounded border-gris-borde text-morado-oscuro focus:ring-morado-oscuro"
                />
                <span className="ml-2 text-gray-700">Mostrar Media</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showMedian}
                  onChange={(e) => setShowMedian(e.target.checked)}
                  className="rounded border-gris-borde text-morado-oscuro focus:ring-morado-oscuro"
                />
                <span className="ml-2 text-gray-700">Mostrar Mediana</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showMode}
                  onChange={(e) => setShowMode(e.target.checked)}
                  className="rounded border-gris-borde text-morado-oscuro focus:ring-morado-oscuro"
                />
                <span className="ml-2 text-gray-700">Mostrar Moda</span>
              </label>
            </div>
          </div>

          {/* Área de Smileys */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 mb-8 border border-gris-borde">
            <h3 className="text-lg font-medium text-negro bg-morado-claro p-2 rounded-lg inline-block mb-4">Muestra Actual</h3>
            <div className="mt-4 flex justify-center">
              <svg 
                ref={smileysRef}
                width="800"
                height={Math.ceil(sampleSize / 20) * 40 + 40}
                className="border border-gris-borde rounded-lg"
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

          {/* Histograma */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h3 className="text-lg font-medium text-negro bg-morado-claro p-2 rounded-lg inline-block mb-4">Distribución de Satisfacción con la Vida</h3>
            <div className="mt-4 flex justify-center">
              <svg ref={histogramRef}></svg>
            </div>
          </div>

          {/* Explicación */}
          <div className="mt-8 bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h3 className="text-lg font-medium text-negro bg-morado-claro p-2 rounded-lg inline-block mb-4">Explicación</h3>
            <div className="prose max-w-none">
              <h4 className="text-base font-medium text-negro">Media</h4>
              <p className="text-gray-600 mb-4">
                La media es el promedio aritmético de todos los valores. Se calcula sumando todos los valores y dividiendo por el número total de observaciones.
                En nuestra encuesta, la media de satisfacción es 22.32, lo que indica un nivel moderado-alto de satisfacción general.
              </p>

              <h4 className="text-base font-medium text-negro">Desviación Estándar</h4>
              <p className="text-gray-600 mb-4">
                La desviación estándar (5.78 en nuestra encuesta) mide qué tan dispersos están los valores respecto a la media.
                Un desvío menor indica que los valores tienden a estar más cerca de la media, mientras que un desvío mayor indica mayor dispersión.
              </p>

              <h4 className="text-base font-medium text-negro">Interpretación</h4>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Aproximadamente el 68% de los estudiantes tienen un nivel de satisfacción entre 16.54 y 28.10 (media ± 1 desvío)</li>
                <li>Cerca del 95% tienen un nivel entre 10.76 y 33.88 (media ± 2 desvíos)</li>
                <li>La distribución tiende a ser simétrica alrededor de la media</li>
                <li>Los valores extremos (muy alta o muy baja satisfacción) son menos frecuentes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <LessonNavigation
        currentStep={1}
        totalSteps={2}
        nextUrl="/lessons/mean-deviation-editable"
        showPrevious={false}
      />
    </div>
  )
} 