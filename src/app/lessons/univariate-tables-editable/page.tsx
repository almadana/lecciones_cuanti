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

const calculatePercentages = (data: DataPoint[]) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0)
  return data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }))
}

// Datos originales de la encuesta
const initialData: DataPoint[] = [
  { category: 'Para nada satisfecho', value: 37, percentage: 0 },
  { category: 'No muy satisfecho', value: 230, percentage: 0 },
  { category: 'Bastante satisfecho', value: 668, percentage: 0 },
  { category: 'Muy satisfecho', value: 264, percentage: 0 },
]

export default function EditableUnivariateTables() {
  const [data, setData] = useState<DataPoint[]>(calculatePercentages(initialData))
  const svgRef = useRef<SVGSVGElement>(null)

  const updateFrequency = (index: number, newValue: number) => {
    const newData = [...data]
    newData[index] = {
      ...newData[index],
      value: newValue
    }
    setData(calculatePercentages(newData))
  }

  // Calcular la respuesta correcta para la primera pregunta basada en los datos actuales
  const calculateCorrectPercentage = () => {
    const bastanteSatisfechos = data.find(d => d.category === 'Bastante satisfecho')?.value || 0
    const muySatisfechos = data.find(d => d.category === 'Muy satisfecho')?.value || 0
    const total = data.reduce((acc, curr) => acc + curr.value, 0)
    return total > 0 ? ((bastanteSatisfechos + muySatisfechos) / total) * 100 : 0
  }

  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 60, left: 40 }
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
      .attr('fill', '#4F46E5')
      .attr('stroke', 'none')
  }, [data])

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Editor de Tablas Univariadas 2/5
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Modifica las frecuencias de la encuesta de satisfacción y observa cómo cambian los porcentajes y la visualización
          </p>
        </div>

        {/* Texto introductorio y instrucciones */}
        <div className="panel-contenido">
          <div className="prose text-gray-700 mb-6">
            <p className="text-lg">
              En esta lección interactiva puedes modificar los datos de la encuesta de satisfacción con la vida 
              y observar cómo los cambios afectan los porcentajes, la visualización y las respuestas a las preguntas.
            </p>
          </div>
          
          <div className="bg-gris-claro p-4 rounded-lg">
            <h3 className="font-bold text-negro mb-3">💡 Cosas que puedes probar:</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Modifica las frecuencias (número de casos) para cada categoría</li>
              <li>Observa cómo los porcentajes se actualizan automáticamente</li>
              <li>Ve cómo cambia la visualización del gráfico de barras</li>
              <li>Experimenta con diferentes distribuciones de datos</li>
              <li>Observa cómo las respuestas correctas se ajustan a los nuevos datos</li>
              <li>Prueba crear escenarios extremos para ver el impacto</li>
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <div className="panel-contenido">
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
                  {data.map((item, index) => (
                    <tr key={item.category}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-negro">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.value}
                          onChange={(e) => updateFrequency(index, parseInt(e.target.value) || 0)}
                          className="block w-full rounded-md border-morado-claro shadow-sm focus:border-morado-oscuro focus:ring-morado-oscuro p-2"
                          min="0"
                        />
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
              correctAnswer={calculateCorrectPercentage()}
              explanation={`Para encontrar este porcentaje, sumamos el número de personas que están 'Bastante satisfechas' (${
                data.find(d => d.category === 'Bastante satisfecho')?.value
              }) y 'Muy satisfechas' (${
                data.find(d => d.category === 'Muy satisfecho')?.value
              }), luego dividimos por el total de encuestados (${
                data.reduce((acc, curr) => acc + curr.value, 0)
              }) y multiplicamos por 100. Esto nos da aproximadamente ${
                calculateCorrectPercentage().toFixed(1)
              }%.`}
            />

            <Question
              question="¿Es verdad que la mayoría de las personas no están para nada satisfechas con su vida?"
              type="multiple-choice"
              options={[
                { text: 'Verdadero', value: false },
                { text: 'Falso', value: true }
              ]}
              explanation={`Esta afirmación es falsa. Mirando los datos, solo ${
                data.find(d => d.category === 'Para nada satisfecho')?.value
              } personas (aproximadamente ${
                data.find(d => d.category === 'Para nada satisfecho')?.percentage.toFixed(1)
              }%) no están 'Para nada satisfechas' con su vida. Esto está lejos de ser una mayoría.`}
            />
          </div>
        </div>

        {/* Navegación */}
        <LessonNavigation
          currentStep={2}
          totalSteps={5}
          previousUrl="/lessons/univariate-tables"
          showPrevious={true}
          nextUrl="/lessons/bivariate-tables"
        />
      </div>
    </div>
  )
} 