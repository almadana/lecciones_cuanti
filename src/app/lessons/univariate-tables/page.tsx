'use client'

import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import LessonHeader from '@/app/components/LessonHeader';
import LessonNavigation from '@/app/components/LessonNavigation';
import Question from '@/app/components/Question'

interface DataPoint {
  category: string
  value: number
  percentage: number
}

// Calculate percentages once at initialization
const calculatePercentages = (data: Omit<DataPoint, 'percentage'>[]) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0)
  return data.map(item => ({
    ...item,
    percentage: (item.value / total) * 100
  }))
}

const rawData = [
  { category: 'Para nada satisfecho', value: 37 },
  { category: 'No muy satisfecho', value: 230 },
  { category: 'Bastante satisfecho', value: 668 },
  { category: 'Muy satisfecho', value: 264 },
]

const initialData = calculatePercentages(rawData)

export default function UnivariateTables() {
  const [data] = useState<DataPoint[]>(initialData)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 40, left: 40 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create scales
    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1)
      .domain(data.map(d => d.category))

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d.value) || 0])

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))

    // Create bars
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.category) || 0)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.value))
      .attr('fill', '#8c7ddc')
  }, [data]) // Only re-run if data changes

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Resultados de la Encuesta de Satisfacción con la Vida (1 de 2)
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            La encuesta Latinobarómetro de 2017 preguntó a las personas sobre su grado de satisfacción con la vida.
            Estos son los resultados para Uruguay.
          </p>
        </div>

        {/* Texto introductorio y instrucciones */}
        <div className="mt-8 bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
          <div className="prose text-gray-700 mb-6">
            <p className="text-lg">
              Las tablas de frecuencia son la forma más básica y fundamental de organizar datos categóricos. 
              Te permiten ver de un vistazo cuántas observaciones hay en cada categoría y qué porcentaje 
              representan del total. Esta lección te mostrará cómo interpretar estas tablas usando datos reales.
            </p>
          </div>
          
          <div className="bg-gris-claro p-4 rounded-lg">
            <h3 className="font-bold text-negro mb-3">💡 Cosas que puedes probar:</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Observa cómo se organizan los datos en la tabla de frecuencia</li>
              <li>Calcula mentalmente los porcentajes para verificar tu comprensión</li>
              <li>Identifica la categoría con mayor frecuencia (la moda)</li>
              <li>Analiza el gráfico de barras que complementa la tabla</li>
              <li>Responde las preguntas de evaluación sobre los datos</li>
              <li>En la siguiente lección podrás crear tus propias tablas</li>
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gris-borde">
                <thead>
                  <tr className="bg-morado-claro">
                    <th className="px-6 py-3 text-left text-xs font-medium text-negro uppercase tracking-wider">
                      Nivel de Satisfacción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-negro uppercase tracking-wider">
                      Frecuencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-negro uppercase tracking-wider">
                      Porcentaje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-blanco divide-y divide-gris-borde">
                  {data.map((item) => (
                    <tr key={item.category}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-negro">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-negro bg-morado-claro p-2 rounded-lg inline-block">Visualización</h3>
              <div className="mt-4 flex justify-center">
                <svg ref={svgRef}></svg>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <Question
              question="¿Qué porcentaje de personas están al menos bastante satisfechas con su vida?"
              type="numeric"
              hint="Suma los porcentajes de 'Bastante satisfecho' y 'Muy satisfecho'"
              correctAnswer={77.7} // (668 + 264) / (37 + 230 + 668 + 264) * 100
              explanation="Para encontrar este porcentaje, sumamos el número de personas que están 'Bastante satisfechas' (668) y 'Muy satisfechas' (264), luego dividimos por el total de encuestados (1199) y multiplicamos por 100. Esto nos da aproximadamente 77.7%."
            />

            <Question
              question="¿Es verdad que la mayoría de las personas no están para nada satisfechas con su vida?"
              type="multiple-choice"
              options={[
                { text: 'Verdadero', value: false },
                { text: 'Falso', value: true }
              ]}
              explanation="Esta afirmación es falsa. Mirando los datos, solo 37 personas (aproximadamente 3.1%) no están 'Para nada satisfechas' con su vida. Esto está lejos de ser una mayoría."
            />
          </div>

          {/* Resumen de la Lección */}
          <div className="mt-8 bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              Resumen de Conceptos Clave
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-negro mb-2">Tablas de Frecuencia:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Frecuencia absoluta:</strong> Número de casos en cada categoría</li>
                  <li><strong>Frecuencia relativa:</strong> Proporción o porcentaje del total</li>
                  <li><strong>Frecuencia acumulada:</strong> Suma de frecuencias hasta esa categoría</li>
                  <li><strong>Total:</strong> Suma de todas las frecuencias absolutas</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-negro mb-2">Interpretación:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Las tablas organizan datos categóricos de manera clara</li>
                  <li>Los porcentajes facilitan la comparación entre categorías</li>
                  <li>Los gráficos de barras complementan la información numérica</li>
                  <li>La moda es la categoría con mayor frecuencia</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gris-claro rounded-lg">
              <h3 className="font-bold text-negro mb-2">Fórmulas Importantes:</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Frecuencia relativa:</strong><br/>
                  <code>fr = f / N × 100%</code>
                </div>
                <div>
                  <strong>Porcentaje:</strong><br/>
                  <code>% = (f / N) × 100</code>
                </div>
                <div>
                  <strong>Total:</strong><br/>
                  <code>N = Σf</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <LessonNavigation
          currentStep={1}
          totalSteps={5}
          previousUrl="/lessons/introduction"
          nextUrl="/lessons/univariate-tables-editable"
          showPrevious={true}
        />
      </div>
    </div>
  )
} 