'use client'

import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import LessonNavigation from '@/app/components/LessonNavigation'

interface Point {
  x: number
  y: number
}

interface Line {
  slope: number
  intercept: number
}

interface Handle {
  x: number
  y: number
  type: 'intercept' | 'slope'
}

export default function RegressionInteractive() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [points, setPoints] = useState<Point[]>([
    { x: 2, y: 4 },
    { x: 4, y: 6 },
    { x: 6, y: 8 },
    { x: 8, y: 7 },
    { x: 10, y: 9 },
    { x: 12, y: 11 },
    { x: 14, y: 10 },
    { x: 16, y: 12 }
  ])
  const [userLine, setUserLine] = useState<Line>({ slope: 0.5, intercept: 3 })
  const [isDragging, setIsDragging] = useState(false)
  const [draggedHandle, setDraggedHandle] = useState<'intercept' | 'line' | null>(null)
  const [showOptimalLine, setShowOptimalLine] = useState(false)
  const [sumSquares, setSumSquares] = useState(0)
  const [optimalSumSquares, setOptimalSumSquares] = useState(0)
  const [difference, setDifference] = useState(0)
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number } | null>(null)

  const width = 600
  const height = 400
  const margin = { top: 20, right: 20, bottom: 40, left: 40 }

  // Calcular la recta de regresión óptima
  const calculateOptimalLine = (points: Point[]): Line => {
    const n = points.length
    const sumX = points.reduce((sum, p) => sum + p.x, 0)
    const sumY = points.reduce((sum, p) => sum + p.y, 0)
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept }
  }

  // Calcular suma de cuadrados para una línea
  const calculateSumSquares = (line: Line, points: Point[]): number => {
    return points.reduce((sum, point) => {
      const predictedY = line.slope * point.x + line.intercept
      const residual = point.y - predictedY
      return sum + residual * residual
    }, 0)
  }

  // Actualizar cálculos cuando cambian los datos
  useEffect(() => {
    const optimalLine = calculateOptimalLine(points)
    const userSS = calculateSumSquares(userLine, points)
    const optimalSS = calculateSumSquares(optimalLine, points)
    
    setSumSquares(userSS)
    setOptimalSumSquares(optimalSS)
    setDifference(userSS - optimalSS)
  }, [points, userLine])

  // Configurar D3
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xScale = d3.scaleLinear()
      .domain([0, 20])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain([0, 15])
      .range([height - margin.bottom, margin.top])

    // Agregar ejes
    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)

    // Agregar etiquetas de ejes
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .text('Variable X')

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text('Variable Y')

    // Dibujar puntos
    svg.selectAll('circle')
      .data(points)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 5)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 2)

    // Función para dibujar línea
    const drawLine = (line: Line, color: string, strokeWidth: number = 2) => {
      const x1 = 0
      const y1 = line.slope * x1 + line.intercept
      const x2 = 20
      const y2 = line.slope * x2 + line.intercept

      svg.append('line')
        .attr('x1', xScale(x1))
        .attr('y1', yScale(y1))
        .attr('x2', xScale(x2))
        .attr('y2', yScale(y2))
        .attr('stroke', color)
        .attr('stroke-width', strokeWidth)
        .attr('stroke-dasharray', color === '#6C3BF6' ? '5,5' : 'none')
    }

    // Dibujar línea del usuario
    drawLine(userLine, '#ef4444', 3)

    // Dibujar línea óptima si está habilitada
    if (showOptimalLine) {
      const optimalLine = calculateOptimalLine(points)
      drawLine(optimalLine, '#6C3BF6', 2)
    }

    // Dibujar manijas (handles)
    const handles: Handle[] = [
      { x: 0, y: userLine.intercept, type: 'intercept' }
    ]

    // Manija del intercepto (en el eje Y) - hacer más grande
    svg.append('circle')
      .attr('cx', xScale(0))
      .attr('cy', yScale(userLine.intercept))
      .attr('r', 15) // Aumentar el radio para hit box más grande
      .attr('fill', '#f59e0b')
      .attr('stroke', '#d97706')
      .attr('stroke-width', 2)
      .style('cursor', 'ns-resize')
      .attr('data-handle', 'intercept')

    // Agregar etiquetas a las manijas
    svg.append('text')
      .attr('x', xScale(0) + 20)
      .attr('y', yScale(userLine.intercept))
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#f59e0b')
      .attr('font-weight', 'bold')
      .text('Intercepto')

    // Agregar línea invisible más gruesa para facilitar el arrastre de la pendiente
    // Pero solo en el área central, no cerca del intercepto
    const lineWidth = 20
    const interceptBuffer = 30 // Área alrededor del intercepto donde no se activa la línea
    
    svg.append('line')
      .attr('x1', xScale(5)) // Empezar después del intercepto
      .attr('y1', yScale(userLine.slope * 5 + userLine.intercept))
      .attr('x2', xScale(20))
      .attr('y2', yScale(userLine.slope * 20 + userLine.intercept))
      .attr('stroke', 'transparent')
      .attr('stroke-width', lineWidth)
      .style('cursor', 'move')
      .attr('data-handle', 'line')
      .style('pointer-events', 'all')

  }, [points, userLine, showOptimalLine])

  // Manejar interacción del mouse
  const handleMouseDown = (event: React.MouseEvent) => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const [x, y] = d3.pointer(event, svgRef.current)
    
    // Verificar si se hizo clic en una manija o en la línea
    const clickedElement = document.elementFromPoint(event.clientX, event.clientY)
    const handleType = clickedElement?.getAttribute('data-handle')
    
    if (handleType === 'intercept' || handleType === 'line') {
      setIsDragging(true)
      setDraggedHandle(handleType)
      setLastMousePos({ x, y })
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || !draggedHandle || !svgRef.current || !lastMousePos) return

    const svg = d3.select(svgRef.current)
    const [x, y] = d3.pointer(event, svgRef.current)
    
    const xScale = d3.scaleLinear()
      .domain([0, 20])
      .range([40, 580])

    const yScale = d3.scaleLinear()
      .domain([0, 15])
      .range([360, 20])

    // Calcular el movimiento relativo
    const deltaX = x - lastMousePos.x
    const deltaY = lastMousePos.y - y // Invertir la dirección

    if (draggedHandle === 'intercept') {
      // Ajustar intercepto basado en movimiento vertical relativo
      // Corregir la dirección: cuando el mouse sube, el intercepto debe subir
      const deltaYValue = yScale.invert(y) - yScale.invert(lastMousePos.y)
      const sensitivity = 0.5 // Factor de sensibilidad
      
      setUserLine(prev => ({
        ...prev,
        intercept: Math.max(-5, Math.min(15, prev.intercept + deltaYValue * sensitivity))
      }))
    } else if (draggedHandle === 'line') {
      // Simplificar el cálculo de la pendiente usando únicamente deltaY
      const deltaY = y - lastMousePos.y
      const sensitivity = 0.01 // Sensibilidad para el movimiento
      
      // Calcular el cambio en pendiente basado únicamente en el movimiento vertical
      const deltaSlope = deltaY * sensitivity
      
      setUserLine(prev => ({
        ...prev,
        slope: Math.max(-2, Math.min(2, prev.slope + deltaSlope))
      }))
    }

    // Actualizar la posición del mouse
    setLastMousePos({ x, y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedHandle(null)
    setLastMousePos(null)
  }

  return (
    <div className="py-8">
      <LessonNavigation
        currentStep={3}
        totalSteps={3}
        previousUrl="/lessons/regression-editable"
        showPrevious={true}
        nextUrl="/lessons/sampling"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Regresión Interactiva
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Traza manualmente una recta y compárala con la recta de regresión óptima
          </p>
        </div>

        <div className="mt-8 bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
          <div className="prose text-gray-700 mb-6">
            <p className="text-lg">
              En esta lección interactiva, puedes trazar manualmente una recta de regresión 
              arrastrando las manijas sobre la recta. Observa cómo cambia la suma de cuadrados 
              y compárala con el valor mínimo posible.
            </p>
          </div>
          
          <div className="bg-gris-claro p-4 rounded-lg mb-6">
            <h3 className="font-bold text-negro mb-3">💡 Instrucciones:</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Arrastra la manija <strong>naranja</strong> (en el eje Y) para ajustar el intercepto</li>
              <li>Arrastra la <strong>recta roja</strong> directamente para ajustar la pendiente</li>
              <li>Observa cómo cambia la suma de cuadrados en tiempo real</li>
              <li>Compara tu resultado con el valor mínimo posible</li>
              <li>Haz clic en "Mostrar Recta Óptima" para ver la mejor recta de regresión</li>
            </ul>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Gráfico */}
            <div className="flex-1">
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <svg
                  ref={svgRef}
                  width={width}
                  height={height}
                  onMouseMove={handleMouseMove}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor: isDragging ? 'grabbing' : 'default' }}
                />
                <div className="text-center mt-2 text-sm text-gray-600">
                  {isDragging 
                    ? `Arrastrando ${draggedHandle === 'intercept' ? 'el intercepto' : 'la pendiente'}`
                    : 'Haz clic y arrastra la manija o la recta para ajustar'
                  }
                </div>
              </div>
            </div>

            {/* Panel de control */}
            <div className="lg:w-80">
              <div className="bg-gris-claro p-4 rounded-lg space-y-4">
                <h3 className="font-bold text-negro">Estadísticas</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tu recta:</span>
                    <span className="text-sm font-mono">y = {userLine.slope.toFixed(2)}x + {userLine.intercept.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Suma de cuadrados:</span>
                    <span className="text-sm font-mono">{sumSquares.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Mínimo posible:</span>
                    <span className="text-sm font-mono">{optimalSumSquares.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Diferencia:</span>
                    <span className={`text-sm font-mono ${difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {difference > 0 ? '+' : ''}{difference.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-300">
                  <button
                    onClick={() => setShowOptimalLine(!showOptimalLine)}
                    className="w-full px-4 py-2 bg-verde-claro text-negro rounded-lg hover:bg-[#8ae671] transition-colors"
                  >
                    {showOptimalLine ? 'Ocultar' : 'Mostrar'} Recta Óptima
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setUserLine({ slope: 0.5, intercept: 3 })}
                    className="w-full px-4 py-2 bg-morado-oscuro text-blanco rounded-lg hover:bg-[#7a6bc8] transition-colors"
                  >
                    Resetear Recta
                  </button>
                </div>
              </div>

              {/* Leyenda */}
              <div className="mt-4 bg-white p-4 rounded-lg border border-gray-300">
                <h4 className="font-bold text-negro mb-2">Leyenda</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span>Puntos de datos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span>Manija del intercepto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-red-500"></div>
                    <span>Tu recta (arrastra para ajustar pendiente)</span>
                  </div>
                  {showOptimalLine && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1" style={{ backgroundColor: '#6C3BF6', backgroundImage: 'repeating-linear-gradient(to right, #6C3BF6 0, #6C3BF6 3px, transparent 3px, transparent 6px)' }}></div>
                      <span>Recta óptima</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-morado-claro p-4 rounded-lg">
            <h3 className="font-bold text-negro mb-2">Explicación</h3>
            <p className="text-negro text-sm">
              La recta de regresión óptima es aquella que minimiza la suma de los cuadrados de las diferencias 
              entre los valores observados y los valores predichos. Cuanto menor sea la suma de cuadrados, 
              mejor será el ajuste de la recta a los datos. Tu objetivo es trazar una recta que se acerque 
              lo más posible al valor mínimo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}