'use client'

import * as d3 from 'd3'

type MarksProps = {
  data: number[]
  x: (value: number) => number
  y: number
  labelX: number
  labelY?: number
}

export function QuartileBoxPlotMarks({ data, x, y, labelX, labelY = y + 42 }: MarksProps) {
  const sorted = [...data].sort(d3.ascending)
  const minimum = d3.min(sorted) ?? 0
  const q1 = d3.quantileSorted(sorted, 0.25) ?? 0
  const median = d3.quantileSorted(sorted, 0.5) ?? 0
  const q3 = d3.quantileSorted(sorted, 0.75) ?? 0
  const maximum = d3.max(sorted) ?? 0

  return (
    <g role="img" aria-label={`Diagrama de caja: mínimo ${minimum.toFixed(1)}, Q1 ${q1.toFixed(1)}, mediana ${median.toFixed(1)}, Q3 ${q3.toFixed(1)} y máximo ${maximum.toFixed(1)}`}>
      <line x1={x(minimum)} x2={x(q1)} y1={y} y2={y} stroke="var(--accent)" />
      <rect
        x={x(q1)}
        y={y - 18}
        width={Math.max(1, x(q3) - x(q1))}
        height={36}
        fill="var(--color-verde-seleccion)"
        stroke="var(--accent)"
      />
      <line x1={x(median)} x2={x(median)} y1={y - 18} y2={y + 18} stroke="var(--accent)" strokeWidth={3} />
      <line x1={x(q3)} x2={x(maximum)} y1={y} y2={y} stroke="var(--accent)" />
      {[minimum, maximum].map((value) => (
        <line key={value} x1={x(value)} x2={x(value)} y1={y - 10} y2={y + 10} stroke="var(--accent)" />
      ))}
      <text x={labelX} y={labelY} fontSize={11} fill="var(--text-muted)">
        50% central entre Q1 y Q3
      </text>
    </g>
  )
}

export function QuartileBoxPlot({
  data,
  domain,
  width = 800,
  left = 48,
  right = 24,
}: {
  data: number[]
  domain: [number, number]
  width?: number
  left?: number
  right?: number
}) {
  const x = d3.scaleLinear().domain(domain).range([left, width - right])

  return (
    <svg viewBox={`0 0 ${width} 96`} className="h-auto w-full">
      <QuartileBoxPlotMarks data={data} x={x} y={36} labelX={left} labelY={82} />
    </svg>
  )
}

export function QuartilesToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={shown}
      onClick={onToggle}
      className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-soft)]"
    >
      {shown ? 'Ocultar cuartiles' : 'Mostrar cuartiles'}
    </button>
  )
}
