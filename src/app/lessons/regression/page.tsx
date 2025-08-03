'use client'

import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import Question from '@/app/components/Question'
import LessonNavigation from '@/app/components/LessonNavigation'

interface DataPoint {
  x: number
  y: number
}

interface RegressionLine {
  slope: number
  intercept: number
  rSquared: number
}

const calculateRegression = (data: DataPoint[]): RegressionLine => {
  const n = data.length
  const sumX = data.reduce((acc, point) => acc + point.x, 0)
  const sumY = data.reduce((acc, point) => acc + point.y, 0)
  const sumXY = data.reduce((acc, point) => acc + point.x * point.y, 0)
  const sumX2 = data.reduce((acc, point) => acc + point.x * point.x, 0)
  const sumY2 = data.reduce((acc, point) => acc + point.y * point.y, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate R-squared
  const meanY = sumY / n
  const ssRes = data.reduce((acc, point) => {
    const predicted = slope * point.x + intercept
    return acc + Math.pow(point.y - predicted, 2)
  }, 0)
  const ssTot = data.reduce((acc, point) => {
    return acc + Math.pow(point.y - meanY, 2)
  }, 0)
  const rSquared = 1 - (ssRes / ssTot)

  return { slope, intercept, rSquared }
}

// Datos de ejemplo: Horas de estudio vs Calificación
const sampleData: DataPoint[] = [
  { x: 2, y: 65 },
  { x: 3, y: 70 },
  { x: 4, y: 75 },
  { x: 5, y: 80 },
  { x: 6, y: 85 },
  { x: 7, y: 88 },
  { x: 8, y: 92 },
  { x: 9, y: 95 },
  { x: 10, y: 98 },
  { x: 12, y: 100 }
]

export default function Regression() {
  const [data] = useState<DataPoint[]>(sampleData)
  const [regression] = useState<RegressionLine>(calculateRegression(sampleData))
  const [showLine, setShowLine] = useState(true)
  const [showEquation, setShowEquation] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Set up dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 60 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create scales
    const x = d3.scaleLinear()
      .range([0, width])
      .domain([0, d3.max(data, d => d.x) || 0])

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d.y) || 0])

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', 'currentColor')
      .text('Horas de Estudio')

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('fill', 'currentColor')
      .text('Calificación')

    // Add regression line
    if (showLine) {
      const line = d3.line<DataPoint>()
        .x(d => x(d.x))
        .y(d => y(regression.slope * d.x + regression.intercept))

      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#8c7ddc')
        .attr('stroke-width', 2)
        .attr('d', line)
    }

    // Add scatter plot
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 5)
      .attr('fill', '#8c7ddc')
      .attr('stroke', '#6b5b95')
      .attr('stroke-width', 1)

    // Add equation text
    if (showEquation) {
      svg.append('text')
        .attr('x', 10)
        .attr('y', 30)
        .attr('fill', '#8c7ddc')
        .attr('font-size', '14px')
        .text(`y = ${regression.slope.toFixed(2)}x + ${regression.intercept.toFixed(2)}`)

      svg.append('text')
        .attr('x', 10)
        .attr('y', 50)
        .attr('fill', '#8c7ddc')
        .attr('font-size', '14px')
        .text(`R² = ${regression.rSquared.toFixed(3)}`)
    }

  }, [data, regression, showLine, showEquation])

  const predictValue = (x: number) => {
    return regression.slope * x + regression.intercept
  }

  return (
    <div className="py-8">
      <LessonNavigation
        currentStep={1}
        totalSteps={2}
        nextUrl="/lessons/regression-editable"
        showPrevious={true}
        previousUrl="/lessons/correlation"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Regresión Lineal (1 de 2)
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Relación entre horas de estudio y calificaciones
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {/* Introducción */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              ¿Qué es la Regresión Lineal?
            </h2>
            <div className="prose text-gray-700">
              <p className="mb-4">
                La <strong>regresión lineal</strong> es una técnica estadística que modela la relación 
                entre una variable dependiente (Y) y una o más variables independientes (X) usando 
                una línea recta.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gris-claro p-4 rounded-lg">
                  <h3 className="font-bold text-negro mb-2">Ecuación de la Línea</h3>
                  <p className="text-sm">
                    <strong>y = mx + b</strong><br/>
                    Donde:<br/>
                    • m = pendiente (slope)<br/>
                    • b = intercepto (intercept)<br/>
                    • x = variable independiente<br/>
                    • y = variable dependiente
                  </p>
                </div>
                <div className="bg-gris-claro p-4 rounded-lg">
                  <h3 className="font-bold text-negro mb-2">Coeficiente de Determinación</h3>
                  <p className="text-sm">
                    <strong>R²</strong> indica qué porcentaje de la variabilidad en Y 
                    puede ser explicado por X. Un valor más cercano a 1 indica 
                    una mejor predicción.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Datos y Visualización */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              Datos y Visualización
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-negro mb-3">Datos de Ejemplo</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gris-borde">
                    <thead>
                      <tr className="bg-morado-claro">
                        <th className="px-4 py-2 text-left text-xs font-medium text-negro">Horas (X)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-negro">Calificación (Y)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-blanco divide-y divide-gris-borde">
                      {data.map((point, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-600">{point.x}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{point.y}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-negro mb-3">Gráfico de Dispersión</h3>
                <div className="flex justify-center">
                  <svg ref={svgRef}></svg>
                </div>
                <div className="mt-4 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showLine}
                      onChange={(e) => setShowLine(e.target.checked)}
                      className="mr-2"
                    />
                    Mostrar línea de regresión
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showEquation}
                      onChange={(e) => setShowEquation(e.target.checked)}
                      className="mr-2"
                    />
                    Mostrar ecuación
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Resultados del Análisis */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              Resultados del Análisis
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gris-claro p-4 rounded-lg text-center">
                <h3 className="font-bold text-negro mb-2">Pendiente (m)</h3>
                <p className="text-2xl font-bold text-morado-oscuro">{regression.slope.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Por cada hora adicional de estudio, la calificación aumenta en {regression.slope.toFixed(2)} puntos.
                </p>
              </div>
              <div className="bg-gris-claro p-4 rounded-lg text-center">
                <h3 className="font-bold text-negro mb-2">Intercepto (b)</h3>
                <p className="text-2xl font-bold text-morado-oscuro">{regression.intercept.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Calificación esperada cuando no se estudia (0 horas).
                </p>
              </div>
              <div className="bg-gris-claro p-4 rounded-lg text-center">
                <h3 className="font-bold text-negro mb-2">R²</h3>
                <p className="text-2xl font-bold text-morado-oscuro">{(regression.rSquared * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-600 mt-2">
                  Porcentaje de variabilidad explicada por el modelo.
                </p>
              </div>
            </div>
          </div>

          {/* Predicciones */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              Predicciones
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-negro mb-3">Ecuación de Predicción</h3>
                <div className="bg-gris-claro p-4 rounded-lg">
                  <p className="text-lg font-mono">
                    Calificación = {regression.slope.toFixed(2)} × Horas + {regression.intercept.toFixed(2)}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Usa esta ecuación para predecir calificaciones basadas en horas de estudio.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-negro mb-3">Ejemplos de Predicción</h3>
                <div className="space-y-2">
                  {[1, 5, 10, 15].map(hours => (
                    <div key={hours} className="bg-gris-claro p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>{hours} hora{hours !== 1 ? 's' : ''}:</strong> 
                        Calificación predicha = {predictValue(hours).toFixed(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preguntas de Evaluación */}
          <div className="space-y-6">
            <Question
              question="¿Qué significa la pendiente de 3.5 en este contexto?"
              type="multiple-choice"
              options={[
                { text: 'La calificación máxima posible es 3.5', value: false },
                { text: 'Por cada hora de estudio, la calificación aumenta 3.5 puntos', value: true },
                { text: 'El 3.5% de la variabilidad es explicada por el modelo', value: false },
                { text: 'La calificación mínima es 3.5', value: false }
              ]}
              explanation="La pendiente de 3.5 significa que por cada hora adicional de estudio, la calificación aumenta en 3.5 puntos en promedio."
            />

            <Question
              question="¿Cuál sería la calificación predicha para alguien que estudia 6 horas?"
              type="numeric"
              hint="Usa la ecuación: Calificación = 3.5 × Horas + 58.5"
              correctAnswer={predictValue(6)}
              explanation={`Para 6 horas de estudio: Calificación = ${regression.slope.toFixed(1)} × 6 + ${regression.intercept.toFixed(1)} = ${predictValue(6).toFixed(1)}`}
            />

            <Question
              question="¿Qué tan bien predice el modelo las calificaciones?"
              type="multiple-choice"
              options={[
                { text: 'Muy mal (R² < 0.3)', value: false },
                { text: 'Regular (R² entre 0.3 y 0.7)', value: false },
                { text: 'Bien (R² entre 0.7 y 0.9)', value: true },
                { text: 'Excelente (R² > 0.9)', value: false }
              ]}
              explanation={`Con un R² de ${(regression.rSquared * 100).toFixed(1)}%, el modelo explica bien la relación entre horas de estudio y calificaciones.`}
            />
          </div>

          {/* Interpretación */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              Interpretación de Resultados
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-negro mb-2">Fortalezas del Modelo:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>R² alto indica buena capacidad predictiva</li>
                  <li>Pendiente positiva muestra relación directa</li>
                  <li>Datos bien distribuidos alrededor de la línea</li>
                  <li>Ecuación simple y fácil de interpretar</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-negro mb-2">Limitaciones:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Asume relación lineal</li>
                  <li>No considera otros factores (motivación, inteligencia)</li>
                  <li>Predicciones fuera del rango pueden ser poco confiables</li>
                  <li>No establece causalidad</li>
                </ul>
              </div>
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
              <h3 className="font-bold text-negro mb-2">Regresión Lineal:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Ecuación:</strong> y = mx + b</li>
                <li><strong>Pendiente (m):</strong> Cambio en Y por unidad de cambio en X</li>
                <li><strong>Intercepto (b):</strong> Valor de Y cuando X = 0</li>
                <li><strong>R²:</strong> Porcentaje de variabilidad explicada</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-negro mb-2">Interpretación:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>R² &gt; 0.9:</strong> Excelente predicción</li>
                <li><strong>R² 0.7-0.9:</strong> Buena predicción</li>
                <li><strong>R² 0.3-0.7:</strong> Predicción moderada</li>
                <li><strong>R² &lt; 0.3:</strong> Predicción débil</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gris-claro rounded-lg">
            <h3 className="font-bold text-negro mb-2">Fórmulas Importantes:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Pendiente:</strong><br/>
                <code>m = (nΣxy - ΣxΣy) / (nΣx² - (Σx)²)</code><br/>
                <strong>Intercepto:</strong><br/>
                <code>b = (Σy - mΣx) / n</code>
              </div>
              <div>
                <strong>R²:</strong><br/>
                <code>R² = 1 - (SSres / SStot)</code><br/>
                <strong>Predicción:</strong><br/>
                <code>ŷ = mx + b</code>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LessonNavigation
        currentStep={1}
        totalSteps={2}
        nextUrl="/lessons/regression-editable"
        showPrevious={true}
        previousUrl="/lessons/correlation"
      />
    </div>
  )
} 