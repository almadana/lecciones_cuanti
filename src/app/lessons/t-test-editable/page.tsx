'use client'

import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import SmileyViridis from '@/app/components/SmileyViridis'
import jStat from 'jstat'
import LessonNavigation from '@/app/components/LessonNavigation';

interface Person {
  id: number
  gender: 'male' | 'female'
  satisfaction: number
}

// Función para generar datos normales
const generateNormalData = (n: number, mean: number, std: number): number[] => {
  return Array.from({ length: n }, () => {
    let u = 0, v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return Math.max(5, Math.min(35, mean + z * std))
  })
}

export default function TTestEditable() {
  // Estados para las medias y desviaciones estándar
  const [maleMean, setMaleMean] = useState(21.5)
  const [femaleMean, setFemaleMean] = useState(23.1)
  const [maleStd] = useState(5.8)
  const [femaleStd] = useState(5.9)
  const [sampleSize] = useState(30)

  // Estado para las posiciones de los smileys
  const [smileyPositions, setSmileyPositions] = useState<{left: number, right: number}>({ left: 0, right: 0 })

  // Referencias para los gráficos
  const maleHistogramRef = useRef<SVGSVGElement>(null)
  const femaleHistogramRef = useRef<SVGSVGElement>(null)

  // Generar datos
  const generateData = () => {
    const males = generateNormalData(sampleSize, maleMean, maleStd).map((satisfaction, i) => ({
      id: i,
      gender: 'male' as const,
      satisfaction
    }))

    const females = generateNormalData(sampleSize, femaleMean, femaleStd).map((satisfaction, i) => ({
      id: i + sampleSize,
      gender: 'female' as const,
      satisfaction
    }))

    return [...males, ...females]
  }

  // Estado para los datos
  const [data, setData] = useState<Person[]>(generateData())

  // Separar datos por género
  const males = data.filter(p => p.gender === 'male')
  const females = data.filter(p => p.gender === 'female')

  // Calcular estadísticas
  const calculatedMaleMean = d3.mean(males, d => d.satisfaction) || 0
  const calculatedFemaleMean = d3.mean(females, d => d.satisfaction) || 0
  const calculatedMaleStd = d3.deviation(males, d => d.satisfaction) || 0
  const calculatedFemaleStd = d3.deviation(females, d => d.satisfaction) || 0

  // Calcular estadístico t y valor p
  const n1 = males.length
  const n2 = females.length
  const pooledStd = Math.sqrt(
    ((n1 - 1) * Math.pow(calculatedMaleStd, 2) + (n2 - 1) * Math.pow(calculatedFemaleStd, 2)) /
    (n1 + n2 - 2)
  )
  const tStat = (calculatedFemaleMean - calculatedMaleMean) / (pooledStd * Math.sqrt(1/n1 + 1/n2))
  const df = n1 + n2 - 2
  
  // Calcular el valor p (prueba de dos colas)
  // @ts-ignore - jStat types are incomplete
  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), df))

  // Función para actualizar histogramas
  const updateHistogram = (
    ref: SVGSVGElement | null,
    data: number[],
    title: string,
    color: string,
    width: number = 400,
    height: number = 300
  ) => {
    if (!ref) return

    const margin = { top: 40, right: 20, bottom: 60, left: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Limpiar SVG
    d3.select(ref).selectAll('*').remove()

    // Crear SVG
    const svg = d3.select(ref)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Calcular bins
    const bins = d3.bin()
      .domain([15, 30])
      .thresholds(8)(data)

    // Escalas
    const x = d3.scaleLinear()
      .domain([15, 30])
      .range([0, innerWidth])

    // Actualizar posiciones de los smileys
    setSmileyPositions({
      left: margin.left + x(15),
      right: margin.left + x(30)
    })

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 0])
      .range([innerHeight, 0])

    // Barras
    svg.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', d => x(d.x0 || 0))
      .attr('width', d => x(d.x1 || 0) - x(d.x0 || 0))
      .attr('y', d => y(d.length))
      .attr('height', d => innerHeight - y(d.length))
      .attr('fill', color)
      .attr('opacity', 0.7)

    // Línea de la media
    const mean = d3.mean(data) || 0
    svg.append('line')
      .attr('x1', x(mean))
      .attr('x2', x(mean))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')

    // Ejes
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))

    svg.append('g')
      .call(d3.axisLeft(y))

    // Título
    svg.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .text(title)
  }

  // Efecto para actualizar visualizaciones
  useEffect(() => {
    updateHistogram(
      maleHistogramRef.current,
      males.map(m => m.satisfaction),
      'Satisfacción - Hombres',
      '#4F46E5' // Índigo oscuro
    )
    updateHistogram(
      femaleHistogramRef.current,
      females.map(f => f.satisfaction),
      'Satisfacción - Mujeres',
      '#059669' // Verde esmeralda
    )
  }, [data])

  return (
    <div className="py-8">
      <LessonNavigation
        currentStep={2}
        totalSteps={3}
        previousUrl="/lessons/t-test"
        nextUrl="/lessons/t-test-editable-2"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Prueba T - Editable (2 de 3)
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Comparación de la satisfacción con la vida entre hombres y mujeres
          </p>
        </div>

        <div className="mt-12">
          {/* Controles */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Controles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Media - Hombres
                </label>
                <input
                  type="range"
                  min="15"
                  max="30"
                  step="0.1"
                  value={maleMean}
                  onChange={(e) => {
                    setMaleMean(parseFloat(e.target.value))
                    setData(generateData())
                  }}
                  className="w-full mt-2"
                />
                <span className="text-sm text-gray-600">{maleMean.toFixed(1)}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Media - Mujeres
                </label>
                <input
                  type="range"
                  min="15"
                  max="30"
                  step="0.1"
                  value={femaleMean}
                  onChange={(e) => {
                    setFemaleMean(parseFloat(e.target.value))
                    setData(generateData())
                  }}
                  className="w-full mt-2"
                />
                <span className="text-sm text-gray-600">{femaleMean.toFixed(1)}</span>
              </div>
            </div>
            <button
              onClick={() => setData(generateData())}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Generar Nueva Muestra
            </button>
          </div>

          {/* Visualización de datos */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Datos por Género</h3>
            
            {/* Emojis representativos */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <span className="text-6xl">👨</span>
                <p className="mt-2 text-sm text-gray-600">{sampleSize} hombres</p>
              </div>
              <div className="text-center">
                <span className="text-6xl">👩</span>
                <p className="mt-2 text-sm text-gray-600">{sampleSize} mujeres</p>
              </div>
            </div>

            {/* Histogramas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative">
                <svg ref={maleHistogramRef}></svg>
                {/* Smileys para el histograma masculino */}
                <div style={{
                  position: 'absolute',
                  left: `${smileyPositions.left}px`,
                  bottom: '65px',
                }}>
                  <svg width="30" height="30">
                    <SmileyViridis cx={15} cy={15} radius={15} happiness={(15 - 5) / 30} />
                  </svg>
                </div>
                <div style={{
                  position: 'absolute',
                  left: `${smileyPositions.right}px`,
                  bottom: '65px',
                }}>
                  <svg width="30" height="30">
                    <SmileyViridis cx={15} cy={15} radius={15} happiness={(30 - 5) / 30} />
                  </svg>
                </div>
                <div className="mt-8">
                  <p className="text-sm text-gray-600">
                    Media: {calculatedMaleMean.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Desviación estándar: {calculatedMaleStd.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="relative">
                <svg ref={femaleHistogramRef}></svg>
                {/* Smileys para el histograma femenino */}
                <div style={{
                  position: 'absolute',
                  left: `${smileyPositions.left}px`,
                  bottom: '65px',
                }}>
                  <svg width="30" height="30">
                    <SmileyViridis cx={15} cy={15} radius={15} happiness={(15 - 5) / 30} />
                  </svg>
                </div>
                <div style={{
                  position: 'absolute',
                  left: `${smileyPositions.right}px`,
                  bottom: '65px',
                }}>
                  <svg width="30" height="30">
                    <SmileyViridis cx={15} cy={15} radius={15} happiness={(30 - 5) / 30} />
                  </svg>
                </div>
                <div className="mt-8">
                  <p className="text-sm text-gray-600">
                    Media: {calculatedFemaleMean.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Desviación estándar: {calculatedFemaleStd.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resultados de la prueba */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resultados de la Prueba t</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">
                  Diferencia de medias: {(calculatedFemaleMean - calculatedMaleMean).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Estadístico t: {tStat.toFixed(3)}
                </p>
                <p className="text-sm text-gray-600">
                  Valor p: {pValue.toFixed(4)}
                </p>
                <p className={`text-sm font-medium ${pValue < 0.05 ? 'text-red-600' : 'text-green-600'}`}>
                  Decisión: {pValue < 0.05 ? 
                    'Rechazar H₀' : 
                    'No rechazar H₀'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Hipótesis nula (H₀): No hay diferencia en la satisfacción media entre hombres y mujeres
                </p>
                <p className="text-sm text-gray-600">
                  Hipótesis alternativa (H₁): Existe una diferencia en la satisfacción media entre hombres y mujeres
                </p>
                <p className="text-sm text-gray-600">
                  Nivel de significancia (α): 0.05
                </p>
              </div>
            </div>
          </div>

          {/* Explicación */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Interpretación</h3>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                En este ejemplo interactivo, puedes manipular las medias de satisfacción para cada grupo y observar cómo esto afecta los resultados de la prueba t:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Los datos muestran que las mujeres reportan una satisfacción media de {calculatedFemaleMean.toFixed(2)} puntos, mientras que los hombres reportan {calculatedMaleMean.toFixed(2)} puntos</li>
                <li>La diferencia de {(calculatedFemaleMean - calculatedMaleMean).toFixed(2)} puntos es {pValue < 0.05 ? 'estadísticamente significativa' : 'no es estadísticamente significativa'} (p = {pValue.toFixed(4)})</li>
                <li>El estadístico t de {tStat.toFixed(3)} nos indica cuántas desviaciones estándar separan las medias de los grupos</li>
                <li>Con un nivel de significancia de 5%, {pValue < 0.05 ? 'rechazamos' : 'no rechazamos'} la hipótesis nula de que no hay diferencia entre los grupos</li>
              </ul>

              <h4 className="text-base font-medium text-gray-900 mt-4">Supuestos de la Prueba</h4>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Los datos de cada grupo provienen de una distribución normal</li>
                <li>Las observaciones son independientes dentro de cada grupo</li>
                <li>Las varianzas de ambos grupos son similares (homocedasticidad)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <LessonNavigation
        currentStep={2}
        totalSteps={3}
        previousUrl="/lessons/t-test"
        nextUrl="/lessons/t-test-editable-2"
      />
    </div>
  )
} 