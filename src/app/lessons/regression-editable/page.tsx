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
  if (data.length < 2) {
    return { slope: 0, intercept: 0, rSquared: 0 }
  }

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
  const rSquared = ssTot === 0 ? 0 : 1 - (ssRes / ssTot)

  return { slope, intercept, rSquared }
}

// Datos iniciales
const initialData: DataPoint[] = [
  { x: 2, y: 65 },
  { x: 4, y: 75 },
  { x: 6, y: 85 },
  { x: 8, y: 92 }
]

export default function RegressionEditable() {
  const [data, setData] = useState<DataPoint[]>(initialData)
  const [newX, setNewX] = useState<string>('')
  const [newY, setNewY] = useState<string>('')
  const [regression, setRegression] = useState<RegressionLine>(calculateRegression(initialData))
  const [showLine, setShowLine] = useState(true)
  const [showEquation, setShowEquation] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    setRegression(calculateRegression(data))
  }, [data])

  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    if (data.length === 0) return

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
      .text('Variable X')

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('fill', 'currentColor')
      .text('Variable Y')

    // Add regression line
    if (showLine && data.length >= 2) {
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
      .attr('r', 6)
      .attr('fill', '#8c7ddc')
      .attr('stroke', '#6b5b95')
      .attr('stroke-width', 2)
      .on('click', (event, d) => {
        // Remove point on click
        setData(data.filter(point => point !== d))
      })
      .append('title')
      .text(d => `(${d.x}, ${d.y}) - Click para eliminar`)

    // Add equation text
    if (showEquation && data.length >= 2) {
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

  const addPoint = () => {
    const x = parseFloat(newX)
    const y = parseFloat(newY)
    
    if (!isNaN(x) && !isNaN(y) && x >= 0 && y >= 0) {
      setData([...data, { x, y }])
      setNewX('')
      setNewY('')
    }
  }

  const resetData = () => {
    setData(initialData)
  }

  const clearData = () => {
    setData([])
  }

  const predictValue = (x: number) => {
    return regression.slope * x + regression.intercept
  }

  return (
    <div className="py-8">
      <LessonNavigation
        currentStep={2}
        totalSteps={2}
        previousUrl="/lessons/regression"
        showPrevious={true}
        nextUrl="/lessons/t-test"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Editor de Regresión Lineal (2 de 2)
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Agrega tus propios datos y observa cómo cambia la línea de regresión
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {/* Controles */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              Controles Interactivos
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-negro mb-3">Agregar Punto</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor X:
                    </label>
                    <input
                      type="number"
                      value={newX}
                      onChange={(e) => setNewX(e.target.value)}
                      className="w-full p-2 border border-gris-borde rounded-md"
                      placeholder="Ingresa valor X"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Y:
                    </label>
                    <input
                      type="number"
                      value={newY}
                      onChange={(e) => setNewY(e.target.value)}
                      className="w-full p-2 border border-gris-borde rounded-md"
                      placeholder="Ingresa valor Y"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <button
                    onClick={addPoint}
                    disabled={!newX || !newY}
                    className="w-full bg-morado-oscuro text-blanco py-2 px-4 rounded-md hover:bg-morado-claro disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Agregar Punto
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-negro mb-3">Opciones de Visualización</h3>
                <div className="space-y-3">
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
                  <div className="space-y-2">
                    <button
                      onClick={resetData}
                      className="w-full bg-verde-claro text-negro py-2 px-4 rounded-md hover:bg-verde-oscuro"
                    >
                      Restaurar Datos Originales
                    </button>
                    <button
                      onClick={clearData}
                      className="w-full bg-red-500 text-blanco py-2 px-4 rounded-md hover:bg-red-600"
                    >
                      Limpiar Todos los Datos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visualización */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              Visualización Interactiva
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-negro mb-3">Gráfico de Dispersión</h3>
                <div className="flex justify-center">
                  <svg ref={svgRef}></svg>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Haz clic en cualquier punto para eliminarlo. Agrega nuevos puntos usando los controles.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-negro mb-3">Datos Actuales</h3>
                <div className="overflow-x-auto max-h-60">
                  <table className="min-w-full divide-y divide-gris-borde">
                    <thead>
                      <tr className="bg-morado-claro">
                        <th className="px-4 py-2 text-left text-xs font-medium text-negro">X</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-negro">Y</th>
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
                <p className="text-sm text-gray-600 mt-2">
                  Total de puntos: {data.length}
                </p>
              </div>
            </div>
          </div>

          {/* Resultados */}
          {data.length >= 2 && (
            <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
              <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
                Resultados del Análisis
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gris-claro p-4 rounded-lg text-center">
                  <h3 className="font-bold text-negro mb-2">Pendiente (m)</h3>
                  <p className="text-2xl font-bold text-morado-oscuro">{regression.slope.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Cambio en Y por unidad de cambio en X
                  </p>
                </div>
                <div className="bg-gris-claro p-4 rounded-lg text-center">
                  <h3 className="font-bold text-negro mb-2">Intercepto (b)</h3>
                  <p className="text-2xl font-bold text-morado-oscuro">{regression.intercept.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Valor de Y cuando X = 0
                  </p>
                </div>
                <div className="bg-gris-claro p-4 rounded-lg text-center">
                  <h3 className="font-bold text-negro mb-2">R²</h3>
                  <p className="text-2xl font-bold text-morado-oscuro">{(regression.rSquared * 100).toFixed(1)}%</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Variabilidad explicada por el modelo
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Predicciones */}
          {data.length >= 2 && (
            <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
              <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
                Predicciones
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-negro mb-3">Ecuación de Predicción</h3>
                  <div className="bg-gris-claro p-4 rounded-lg">
                    <p className="text-lg font-mono">
                      Y = {regression.slope.toFixed(2)} × X + {regression.intercept.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-negro mb-3">Ejemplos de Predicción</h3>
                  <div className="space-y-2">
                    {[1, 5, 10].map(x => (
                      <div key={x} className="bg-gris-claro p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>X = {x}:</strong> 
                          Y predicha = {predictValue(x).toFixed(1)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preguntas de Evaluación */}
          <div className="space-y-6">
            <Question
              question="¿Qué sucede con R² cuando agregas puntos que se alejan de la línea de regresión?"
              type="multiple-choice"
              options={[
                { text: 'R² siempre aumenta', value: false },
                { text: 'R² siempre disminuye', value: false },
                { text: 'R² puede aumentar o disminuir dependiendo de los puntos', value: true },
                { text: 'R² no cambia nunca', value: false }
              ]}
              explanation="R² puede aumentar o disminuir dependiendo de cómo los nuevos puntos se ajusten a la línea de regresión. Puntos que se alejan mucho de la línea tienden a disminuir R²."
            />

            <Question
              question="¿Cuál es el mínimo número de puntos necesarios para calcular una regresión lineal?"
              type="multiple-choice"
              options={[
                { text: '1 punto', value: false },
                { text: '2 puntos', value: true },
                { text: '3 puntos', value: false },
                { text: '5 puntos', value: false }
              ]}
              explanation="Se necesitan al menos 2 puntos para calcular una línea de regresión, ya que se necesita al menos 2 puntos para definir una línea recta."
            />

            <Question
              question="¿Qué significa una pendiente negativa en el contexto de regresión?"
              type="multiple-choice"
              options={[
                { text: 'No hay relación entre las variables', value: false },
                { text: 'Hay una relación inversa: cuando X aumenta, Y disminuye', value: true },
                { text: 'Los datos son inválidos', value: false },
                { text: 'El modelo no es confiable', value: false }
              ]}
              explanation="Una pendiente negativa indica una relación inversa: cuando la variable independiente (X) aumenta, la variable dependiente (Y) disminuye."
            />
          </div>

          {/* Interpretación */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              Experimenta y Observa
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-negro mb-2">Actividades Sugeridas:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Agrega puntos que sigan una línea perfecta y observa R² = 1</li>
                  <li>Agrega puntos dispersos y observa cómo disminuye R²</li>
                  <li>Prueba con diferentes pendientes (positivas y negativas)</li>
                  <li>Observa cómo cambia la línea al agregar o eliminar puntos</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-negro mb-2">Conceptos Clave:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>La línea de regresión minimiza la suma de cuadrados de los residuos</li>
                  <li>R² mide qué tan bien el modelo explica la variabilidad</li>
                  <li>La pendiente indica la dirección y magnitud de la relación</li>
                  <li>El intercepto es el valor predicho cuando X = 0</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LessonNavigation
        currentStep={2}
        totalSteps={2}
        previousUrl="/lessons/regression"
        showPrevious={true}
        nextUrl="/lessons/t-test"
      />
    </div>
  )
} 