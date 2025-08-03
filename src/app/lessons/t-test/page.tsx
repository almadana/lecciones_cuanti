'use client'

import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import SmileyViridis from '@/app/components/SmileyViridis'
import { createRoot } from 'react-dom/client'
import jStat from 'jstat'
import LessonNavigation from '@/app/components/LessonNavigation';

interface Person {
  id: number
  gender: 'male' | 'female'
  satisfaction: number
}

// Datos de satisfacción por género (datos simulados basados en Latinobarómetro)
const sampleData: Person[] = [
  // Hombres (media ≈ 21.5, std ≈ 5.8)
  ...Array.from({ length: 30 }, (_, i) => ({
    id: i,
    gender: 'male' as const,
    satisfaction: [
      22, 19, 25, 20, 23, 18, 24, 21, 26, 20,
      23, 19, 22, 21, 25, 17, 24, 20, 23, 21,
      19, 22, 20, 24, 21, 23, 18, 25, 20, 22
    ][i]
  })),
  // Mujeres (media ≈ 23.1, std ≈ 5.9)
  ...Array.from({ length: 30 }, (_, i) => ({
    id: i + 30,
    gender: 'female' as const,
    satisfaction: [
      24, 21, 26, 22, 25, 20, 27, 23, 25, 22,
      26, 21, 24, 23, 28, 19, 25, 22, 26, 23,
      21, 24, 22, 27, 23, 25, 20, 26, 22, 24
    ][i]
  }))
]

export default function TTestPage() {
  // Referencias para los gráficos
  const maleHistogramRef = useRef<SVGSVGElement>(null)
  const femaleHistogramRef = useRef<SVGSVGElement>(null)
  const distributionPlotRef = useRef<SVGSVGElement>(null)

  // Calcular estadísticas
  const males = sampleData.filter(p => p.gender === 'male')
  const females = sampleData.filter(p => p.gender === 'female')

  const maleMean = d3.mean(males, d => d.satisfaction) || 0
  const femaleMean = d3.mean(females, d => d.satisfaction) || 0
  const maleStd = d3.deviation(males, d => d.satisfaction) || 0
  const femaleStd = d3.deviation(females, d => d.satisfaction) || 0

  // Calcular estadístico t y valor p
  const n1 = males.length
  const n2 = females.length
  const pooledStd = Math.sqrt(
    ((n1 - 1) * Math.pow(maleStd, 2) + (n2 - 1) * Math.pow(femaleStd, 2)) /
    (n1 + n2 - 2)
  )
  const tStat = (femaleMean - maleMean) / (pooledStd * Math.sqrt(1/n1 + 1/n2))
  const df = n1 + n2 - 2
  
  // Calcular el valor p (prueba de dos colas)
  // @ts-ignore - jStat types are incomplete
  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), df))

  // Estado para las posiciones de los smileys
  const [smileyPositions, setSmileyPositions] = useState<{left: number, right: number}>({ left: 0, right: 0 })

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
      .thresholds(15)(data)

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
  }, [])

  return (
    <div className="py-8">
      <LessonNavigation
        currentStep={1}
        totalSteps={3}
        nextUrl="/lessons/t-test-editable"
        showPrevious={true}
        previousUrl="/lessons/regression-editable"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Prueba T (1 de 3)
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Comparación de la satisfacción con la vida entre hombres y mujeres
          </p>
        </div>

        <div className="mt-12">
          {/* Visualización de datos */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Datos por Género</h3>
            
            {/* Emojis representativos */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <span className="text-6xl">👨</span>
                <p className="mt-2 text-sm text-gray-600">30 hombres</p>
              </div>
              <div className="text-center">
                <span className="text-6xl">👩</span>
                <p className="mt-2 text-sm text-gray-600">30 mujeres</p>
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
                    Media: {maleMean.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Desviación estándar: {maleStd.toFixed(2)}
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
                    Media: {femaleMean.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Desviación estándar: {femaleStd.toFixed(2)}
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
                  Diferencia de medias: {(femaleMean - maleMean).toFixed(2)}
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
                En este ejemplo, comparamos la satisfacción con la vida entre hombres y mujeres usando la prueba t de Student:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Los datos muestran que las mujeres reportan una satisfacción media de {femaleMean.toFixed(2)} puntos, mientras que los hombres reportan {maleMean.toFixed(2)} puntos</li>
                <li>La diferencia de {(femaleMean - maleMean).toFixed(2)} puntos es {pValue < 0.05 ? 'estadísticamente significativa' : 'no es estadísticamente significativa'} (p = {pValue.toFixed(4)})</li>
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

        {/* Resumen de la Lección */}
        <div className="mt-8 bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
          <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
            Resumen de Conceptos Clave
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-negro mb-2">Prueba t de Student:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Propósito:</strong> Comparar medias entre dos grupos</li>
                <li><strong>Hipótesis nula:</strong> No hay diferencia entre grupos</li>
                <li><strong>Hipótesis alternativa:</strong> Existe diferencia entre grupos</li>
                <li><strong>Nivel de significancia:</strong> α = 0.05</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-negro mb-2">Interpretación:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>p &lt; 0.05:</strong> Rechazar H₀, diferencia significativa</li>
                <li><strong>p ≥ 0.05:</strong> No rechazar H₀, diferencia no significativa</li>
                <li><strong>Estadístico t:</strong> Mide la magnitud de la diferencia</li>
                <li><strong>Grados de libertad:</strong> n₁ + n₂ - 2</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gris-claro rounded-lg">
            <h3 className="font-bold text-negro mb-2">Fórmulas Importantes:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Estadístico t:</strong><br/>
                <code>t = (x̄₁ - x̄₂) / SE</code><br/>
                <strong>Error estándar:</strong><br/>
                <code>SE = √[s²(1/n₁ + 1/n₂)]</code>
              </div>
              <div>
                <strong>Varianza combinada:</strong><br/>
                <code>s² = [(n₁-1)s₁² + (n₂-1)s₂²] / (n₁+n₂-2)</code><br/>
                <strong>Grados de libertad:</strong><br/>
                <code>df = n₁ + n₂ - 2</code>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LessonNavigation
        currentStep={1}
        totalSteps={3}
        nextUrl="/lessons/t-test-editable"
        showPrevious={false}
      />
    </div>
  )
} 