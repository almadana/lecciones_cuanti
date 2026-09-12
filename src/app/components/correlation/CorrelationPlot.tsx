'use client'

import { useState } from 'react'

export type CorrelationPoint = {
  x: number
  y: number
}

const WIDTH = 760
const HEIGHT = 430
const MARGIN = { top: 24, right: 24, bottom: 62, left: 68 }

export function pearson(data: CorrelationPoint[]) {
  if (data.length < 2) return 0
  const meanX = data.reduce((sum, point) => sum + point.x, 0) / data.length
  const meanY = data.reduce((sum, point) => sum + point.y, 0) / data.length
  const products = data.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0)
  const squaresX = data.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0)
  const squaresY = data.reduce((sum, point) => sum + (point.y - meanY) ** 2, 0)
  const denominator = Math.sqrt(squaresX * squaresY)
  return denominator === 0 ? 0 : products / denominator
}

export function generateCorrelatedData(target: number, size: number, seed = 1): CorrelationPoint[] {
  let state = seed >>> 0
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
  const rawX = Array.from({ length: size }, () => random() * 2 - 1)
  const rawNoise = Array.from({ length: size }, () => random() * 2 - 1)
  const center = (values: number[]) => {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length
    return values.map((value) => value - mean)
  }
  const xCentered = center(rawX)
  const xLength = Math.sqrt(xCentered.reduce((sum, value) => sum + value ** 2, 0))
  const xZ = xCentered.map((value) => value / xLength * Math.sqrt(size))
  const noiseCentered = center(rawNoise)
  const projection = noiseCentered.reduce((sum, value, index) => sum + value * xZ[index], 0)
    / xZ.reduce((sum, value) => sum + value ** 2, 0)
  const orthogonalNoise = noiseCentered.map((value, index) => value - projection * xZ[index])
  const noiseLength = Math.sqrt(orthogonalNoise.reduce((sum, value) => sum + value ** 2, 0))
  const noiseZ = orthogonalNoise.map((value) => value / noiseLength * Math.sqrt(size))
  const boundedTarget = Math.max(-0.99, Math.min(0.99, target))

  return xZ.map((x, index) => {
    const y = boundedTarget * x + Math.sqrt(1 - boundedTarget ** 2) * noiseZ[index]
    return { x: 7 + x * 1.25, y: 20 + y * 7 }
  })
}

export function nonlinearData(size = 35): CorrelationPoint[] {
  return Array.from({ length: size }, (_, index) => {
    const x = 4.4 + (index / (size - 1)) * 5.2
    const centered = x - 7
    const noise = Math.sin(index * 2.3) * 1.2
    return { x, y: 7 + centered ** 2 * 4.2 + noise }
  })
}

function regression(data: CorrelationPoint[]) {
  if (data.length < 2) return null
  const meanX = data.reduce((sum, point) => sum + point.x, 0) / data.length
  const meanY = data.reduce((sum, point) => sum + point.y, 0) / data.length
  const denominator = data.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0)
  if (denominator === 0) return null
  const slope = data.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0) / denominator
  return { slope, intercept: meanY - slope * meanX }
}

export default function CorrelationPlot({
  data,
  xLabel = 'Horas de sueño',
  yLabel = 'Estrés percibido',
  xDomain = [4, 10],
  yDomain = [0, 40],
  editable = false,
  showLine = true,
  onChange,
}: {
  data: CorrelationPoint[]
  xLabel?: string
  yLabel?: string
  xDomain?: [number, number]
  yDomain?: [number, number]
  editable?: boolean
  showLine?: boolean
  onChange?: (index: number, point: CorrelationPoint) => void
}) {
  const [dragging, setDragging] = useState<number | null>(null)
  const xScale = (value: number) => MARGIN.left + ((value - xDomain[0]) / (xDomain[1] - xDomain[0])) * (WIDTH - MARGIN.left - MARGIN.right)
  const yScale = (value: number) => HEIGHT - MARGIN.bottom - ((value - yDomain[0]) / (yDomain[1] - yDomain[0])) * (HEIGHT - MARGIN.top - MARGIN.bottom)
  const xInvert = (value: number) => xDomain[0] + ((value - MARGIN.left) / (WIDTH - MARGIN.left - MARGIN.right)) * (xDomain[1] - xDomain[0])
  const yInvert = (value: number) => yDomain[0] + ((HEIGHT - MARGIN.bottom - value) / (HEIGHT - MARGIN.top - MARGIN.bottom)) * (yDomain[1] - yDomain[0])
  const fit = regression(data)
  const ticks = [0, 0.25, 0.5, 0.75, 1]

  const movePoint = (index: number, x: number, y: number) => {
    onChange?.(index, {
      x: Math.max(xDomain[0], Math.min(xDomain[1], x)),
      y: Math.max(yDomain[0], Math.min(yDomain[1], y)),
    })
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Diagrama de dispersión de ${xLabel} y ${yLabel}; r = ${pearson(data).toFixed(2)}`}
      onPointerMove={(event) => {
        if (dragging === null) return
        const bounds = event.currentTarget.getBoundingClientRect()
        const x = (event.clientX - bounds.left) * WIDTH / bounds.width
        const y = (event.clientY - bounds.top) * HEIGHT / bounds.height
        movePoint(dragging, xInvert(x), yInvert(y))
      }}
      onPointerUp={() => setDragging(null)}
      onPointerLeave={() => setDragging(null)}
    >
      <rect x={MARGIN.left} y={MARGIN.top} width={WIDTH - MARGIN.left - MARGIN.right} height={HEIGHT - MARGIN.top - MARGIN.bottom} rx="12" fill="var(--surface-muted)" />
      {ticks.map((position) => {
        const xValue = xDomain[0] + position * (xDomain[1] - xDomain[0])
        const yValue = yDomain[0] + position * (yDomain[1] - yDomain[0])
        return (
          <g key={position} fill="var(--text-muted)" fontSize="12">
            <line x1={xScale(xValue)} x2={xScale(xValue)} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} stroke="var(--border)" />
            <text x={xScale(xValue)} y={HEIGHT - MARGIN.bottom + 22} textAnchor="middle">{xValue.toFixed(xValue % 1 ? 1 : 0)}</text>
            <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={yScale(yValue)} y2={yScale(yValue)} stroke="var(--border)" />
            <text x={MARGIN.left - 10} y={yScale(yValue) + 4} textAnchor="end">{yValue.toFixed(0)}</text>
          </g>
        )
      })}
      {showLine && fit ? (
        <line
          x1={xScale(xDomain[0])}
          y1={yScale(fit.intercept + fit.slope * xDomain[0])}
          x2={xScale(xDomain[1])}
          y2={yScale(fit.intercept + fit.slope * xDomain[1])}
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ) : null}
      {data.map((point, index) => (
        <circle
          key={index}
          cx={xScale(point.x)}
          cy={yScale(point.y)}
          r={editable ? 8 : 7}
          fill="var(--color-morado-oscuro)"
          stroke="var(--surface)"
          strokeWidth="2"
          className={editable ? 'cursor-grab focus:outline-none focus:ring-2' : ''}
          tabIndex={editable ? 0 : undefined}
          role={editable ? 'button' : undefined}
          aria-label={editable ? `Punto ${index + 1}: ${point.x.toFixed(1)} horas, estrés ${point.y.toFixed(1)}. Usá las flechas para moverlo.` : undefined}
          onPointerDown={(event) => {
            if (!editable) return
            event.currentTarget.setPointerCapture(event.pointerId)
            setDragging(index)
          }}
          onKeyDown={(event) => {
            if (!editable) return
            const stepX = event.shiftKey ? 0.5 : 0.1
            const stepY = event.shiftKey ? 2 : 0.5
            if (event.key === 'ArrowLeft') movePoint(index, point.x - stepX, point.y)
            else if (event.key === 'ArrowRight') movePoint(index, point.x + stepX, point.y)
            else if (event.key === 'ArrowUp') movePoint(index, point.x, point.y + stepY)
            else if (event.key === 'ArrowDown') movePoint(index, point.x, point.y - stepY)
            else return
            event.preventDefault()
          }}
        >
          <title>{`${xLabel}: ${point.x.toFixed(1)}; ${yLabel}: ${point.y.toFixed(1)}`}</title>
        </circle>
      ))}
      <text x={(MARGIN.left + WIDTH - MARGIN.right) / 2} y={HEIGHT - 14} textAnchor="middle" fill="var(--text)" fontSize="14" fontWeight="700">{xLabel}</text>
      <text transform={`translate(18 ${(MARGIN.top + HEIGHT - MARGIN.bottom) / 2}) rotate(-90)`} textAnchor="middle" fill="var(--text)" fontSize="14" fontWeight="700">{yLabel}</text>
    </svg>
  )
}
