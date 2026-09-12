'use client'

import { useId, useState } from 'react'
import type { CorrelationPoint } from '@/app/components/correlation/CorrelationPlot'

export type RegressionLine = {
  slope: number
  intercept: number
}

export type RegressionResult = RegressionLine & {
  sse: number
  rSquared: number
}

export function calculateRegression(data: CorrelationPoint[]): RegressionResult {
  if (data.length < 2) return { slope: 0, intercept: 0, sse: 0, rSquared: 0 }
  const meanX = data.reduce((sum, point) => sum + point.x, 0) / data.length
  const meanY = data.reduce((sum, point) => sum + point.y, 0) / data.length
  const denominator = data.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0)
  const slope = denominator === 0
    ? 0
    : data.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0) / denominator
  const intercept = meanY - slope * meanX
  const sse = data.reduce((sum, point) => sum + (point.y - (intercept + slope * point.x)) ** 2, 0)
  const total = data.reduce((sum, point) => sum + (point.y - meanY) ** 2, 0)
  return { slope, intercept, sse, rSquared: total === 0 ? 0 : 1 - sse / total }
}

const WIDTH = 760
const HEIGHT = 430
const MARGIN = { top: 24, right: 24, bottom: 62, left: 68 }

export default function RegressionPlot({
  data,
  line,
  showResiduals = false,
  predictionX,
  xLabel = 'Horas de sueño',
  yLabel = 'Estrés percibido',
  xDomain = [4, 10],
  yDomain = [0, 40],
  editable = false,
  onChange,
  showIntercept = false,
  comparisonLine,
}: {
  data: CorrelationPoint[]
  line?: RegressionLine
  showResiduals?: boolean
  predictionX?: number
  xLabel?: string
  yLabel?: string
  xDomain?: [number, number]
  yDomain?: [number, number]
  editable?: boolean
  onChange?: (index: number, point: CorrelationPoint) => void
  showIntercept?: boolean
  comparisonLine?: RegressionLine
}) {
  const [dragging, setDragging] = useState<number | null>(null)
  const clipId = `regression-${useId().replaceAll(':', '')}`
  const xScale = (value: number) => MARGIN.left + ((value - xDomain[0]) / (xDomain[1] - xDomain[0])) * (WIDTH - MARGIN.left - MARGIN.right)
  const yScale = (value: number) => HEIGHT - MARGIN.bottom - ((value - yDomain[0]) / (yDomain[1] - yDomain[0])) * (HEIGHT - MARGIN.top - MARGIN.bottom)
  const xInvert = (value: number) => xDomain[0] + ((value - MARGIN.left) / (WIDTH - MARGIN.left - MARGIN.right)) * (xDomain[1] - xDomain[0])
  const yInvert = (value: number) => yDomain[0] + ((HEIGHT - MARGIN.bottom - value) / (HEIGHT - MARGIN.top - MARGIN.bottom)) * (yDomain[1] - yDomain[0])
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  const predictionY = line && predictionX !== undefined ? line.intercept + line.slope * predictionX : undefined

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Regresión de ${yLabel} sobre ${xLabel}`}
      onPointerMove={(event) => {
        if (dragging === null) return
        const bounds = event.currentTarget.getBoundingClientRect()
        const x = (event.clientX - bounds.left) * WIDTH / bounds.width
        const y = (event.clientY - bounds.top) * HEIGHT / bounds.height
        onChange?.(dragging, {
          x: Math.max(xDomain[0], Math.min(xDomain[1], xInvert(x))),
          y: Math.max(yDomain[0], Math.min(yDomain[1], yInvert(y))),
        })
      }}
      onPointerUp={() => setDragging(null)}
      onPointerLeave={() => setDragging(null)}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={MARGIN.left} y={MARGIN.top} width={WIDTH - MARGIN.left - MARGIN.right} height={HEIGHT - MARGIN.top - MARGIN.bottom} rx="12" />
        </clipPath>
      </defs>
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
      <g clipPath={`url(#${clipId})`}>
        {line && showResiduals ? data.map((point, index) => {
          const predicted = line.intercept + line.slope * point.x
          return (
            <line
              key={index}
              x1={xScale(point.x)}
              x2={xScale(point.x)}
              y1={yScale(point.y)}
              y2={yScale(predicted)}
              stroke="var(--danger)"
              strokeWidth="2"
              opacity="0.7"
            />
          )
        }) : null}
        {line ? (
          <line
            x1={xScale(xDomain[0])}
            y1={yScale(line.intercept + line.slope * xDomain[0])}
            x2={xScale(xDomain[1])}
            y2={yScale(line.intercept + line.slope * xDomain[1])}
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ) : null}
        {comparisonLine ? (
          <line
            x1={xScale(xDomain[0])}
            y1={yScale(comparisonLine.intercept + comparisonLine.slope * xDomain[0])}
            x2={xScale(xDomain[1])}
            y2={yScale(comparisonLine.intercept + comparisonLine.slope * xDomain[1])}
            stroke="var(--success)"
            strokeWidth="4"
            strokeDasharray="9 7"
            strokeLinecap="round"
          />
        ) : null}
        {line && showIntercept && xDomain[0] <= 0 && xDomain[1] >= 0 ? (
          <>
            <circle cx={xScale(0)} cy={yScale(line.intercept)} r="9" fill="var(--success)" stroke="white" strokeWidth="3" />
            <text x={xScale(0) + 14} y={yScale(line.intercept) - 12} fill="var(--success)" fontSize="13" fontWeight="700">
              b = {line.intercept.toFixed(1)}
            </text>
          </>
        ) : null}
        {comparisonLine && showIntercept && xDomain[0] <= 0 && xDomain[1] >= 0 ? (
          <>
            <circle cx={xScale(0)} cy={yScale(comparisonLine.intercept)} r="7" fill="var(--surface)" stroke="var(--success)" strokeWidth="3" />
            <text x={xScale(0) + 14} y={yScale(comparisonLine.intercept) + 20} fill="var(--success)" fontSize="13" fontWeight="700">
              b óptimo = {comparisonLine.intercept.toFixed(1)}
            </text>
          </>
        ) : null}
        {predictionX !== undefined && predictionY !== undefined ? (
          <>
            <line x1={xScale(predictionX)} x2={xScale(predictionX)} y1={yScale(yDomain[0])} y2={yScale(predictionY)} stroke="var(--success)" strokeWidth="2" strokeDasharray="6 5" />
            <line x1={xScale(xDomain[0])} x2={xScale(predictionX)} y1={yScale(predictionY)} y2={yScale(predictionY)} stroke="var(--success)" strokeWidth="2" strokeDasharray="6 5" />
            <circle cx={xScale(predictionX)} cy={yScale(predictionY)} r="9" fill="var(--success)" stroke="white" strokeWidth="3" />
          </>
        ) : null}
        {data.map((point, index) => (
          <circle
            key={index}
            cx={xScale(point.x)}
            cy={yScale(point.y)}
            r={editable ? 9 : 7}
            fill="var(--color-morado-oscuro)"
            stroke="white"
            strokeWidth="2"
            className={editable ? 'cursor-grab focus:outline-none' : ''}
            tabIndex={editable ? 0 : undefined}
            role={editable ? 'button' : undefined}
            aria-label={editable ? `Punto ${index + 1}. Usá las flechas para moverlo.` : undefined}
            onPointerDown={(event) => {
              if (!editable) return
              event.currentTarget.setPointerCapture(event.pointerId)
              setDragging(index)
            }}
            onKeyDown={(event) => {
              if (!editable) return
              const dx = event.shiftKey ? 0.5 : 0.1
              const dy = event.shiftKey ? 2 : 0.5
              let next = point
              if (event.key === 'ArrowLeft') next = { ...point, x: point.x - dx }
              else if (event.key === 'ArrowRight') next = { ...point, x: point.x + dx }
              else if (event.key === 'ArrowUp') next = { ...point, y: point.y + dy }
              else if (event.key === 'ArrowDown') next = { ...point, y: point.y - dy }
              else return
              onChange?.(index, {
                x: Math.max(xDomain[0], Math.min(xDomain[1], next.x)),
                y: Math.max(yDomain[0], Math.min(yDomain[1], next.y)),
              })
              event.preventDefault()
            }}
          >
            <title>{`${xLabel}: ${point.x.toFixed(1)}; ${yLabel}: ${point.y.toFixed(1)}`}</title>
          </circle>
        ))}
      </g>
      <text x={(MARGIN.left + WIDTH - MARGIN.right) / 2} y={HEIGHT - 14} textAnchor="middle" fill="var(--text)" fontSize="14" fontWeight="700">{xLabel}</text>
      <text transform={`translate(18 ${(MARGIN.top + HEIGHT - MARGIN.bottom) / 2}) rotate(-90)`} textAnchor="middle" fill="var(--text)" fontSize="14" fontWeight="700">{yLabel}</text>
    </svg>
  )
}
