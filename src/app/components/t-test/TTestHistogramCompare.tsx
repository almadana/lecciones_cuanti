'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as d3 from 'd3'
import SmileyViridis from '@/app/components/SmileyViridis'

export type TTestGroup = {
  label: string
  values: number[]
  mean: number
  std: number
  color: string
  emoji?: string
  sampleSize?: number
}

type Props = {
  groupA: TTestGroup
  groupB: TTestGroup
  xDomain?: [number, number]
  xAxisLabel?: string
  meanControls?: {
    groupA: ReactNode
    groupB: ReactNode
  }
  /** Layout más bajo para panel unificado con resultados al lado */
  compact?: boolean
}

const DEFAULT_DOMAIN: [number, number] = [15, 30]

function drawSplitHistogram(
  ref: SVGSVGElement | null,
  values: number[],
  title: string,
  color: string,
  width = 400,
  height = 300,
) {
  if (!ref) return { left: 0, right: 0 }

  const margin = { top: 40, right: 20, bottom: 60, left: 40 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  d3.select(ref).selectAll('*').remove()

  const svg = d3
    .select(ref)
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const bins = d3.bin().domain(DEFAULT_DOMAIN).thresholds(15)(values)

  const x = d3.scaleLinear().domain(DEFAULT_DOMAIN).range([0, innerWidth])
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (d) => d.length) || 0])
    .range([innerHeight, 0])

  svg
    .selectAll('rect')
    .data(bins)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.x0 ?? 0))
    .attr('width', (d) => Math.max(0, x(d.x1 ?? 0) - x(d.x0 ?? 0)))
    .attr('y', (d) => y(d.length))
    .attr('height', (d) => innerHeight - y(d.length))
    .attr('fill', color)
    .attr('opacity', 0.75)

  const mean = d3.mean(values) || 0
  svg
    .append('line')
    .attr('x1', x(mean))
    .attr('x2', x(mean))
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '5,5')

  svg.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x))
  svg.append('g').call(d3.axisLeft(y))

  svg
    .append('text')
    .attr('x', innerWidth / 2)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .attr('fill', 'var(--text)')
    .attr('font-size', 12)
    .text(title)

  return {
    left: margin.left + x(DEFAULT_DOMAIN[0]),
    right: margin.left + x(DEFAULT_DOMAIN[1]),
  }
}

function drawOverlaidHistogram(
  ref: SVGSVGElement | null,
  groupA: TTestGroup,
  groupB: TTestGroup,
  xAxisLabel: string,
  width = 720,
  height = 320,
) {
  if (!ref) return

  d3.select(ref).selectAll('*').remove()

  const margin = { top: 52, right: 28, bottom: 56, left: 48 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const svg = d3
    .select(ref)
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const bin = d3.bin<number, number>().domain(DEFAULT_DOMAIN).thresholds(15)
  const binsA = bin(groupA.values)
  const binsB = bin(groupB.values)
  const maxCount = d3.max([...binsA, ...binsB], (d) => d.length) ?? 1

  const x = d3.scaleLinear().domain(DEFAULT_DOMAIN).range([0, innerW])
  const y = d3.scaleLinear().domain([0, maxCount]).nice().range([innerH, 0])

  const appendBars = (
    parent: d3.Selection<SVGGElement, unknown, null, undefined>,
    bins: d3.Bin<number, number>[],
    color: string,
    opacity: number,
  ) => {
    parent
      .selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.x0 ?? 0) + 1)
      .attr('width', (d) => Math.max(0, x(d.x1 ?? 0) - x(d.x0 ?? 0) - 2))
      .attr('y', (d) => y(d.length))
      .attr('height', (d) => innerH - y(d.length))
      .attr('fill', color)
      .attr('opacity', opacity)
      .attr('rx', 2)
  }

  appendBars(svg.append('g').attr('class', 'bars-a'), binsA, groupA.color, 0.55)
  appendBars(svg.append('g').attr('class', 'bars-b'), binsB, groupB.color, 0.55)

  const meanLine = (mean: number, color: string, label: string, yOffset: number) => {
    svg
      .append('line')
      .attr('x1', x(mean))
      .attr('x2', x(mean))
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,4')
    svg
      .append('text')
      .attr('x', x(mean))
      .attr('y', yOffset)
      .attr('text-anchor', 'middle')
      .attr('fill', color)
      .attr('font-size', 11)
      .attr('font-weight', 600)
      .text(label)
  }

  meanLine(groupA.mean, groupA.color, `${groupA.label} x̄=${groupA.mean.toFixed(2)}`, -8)
  meanLine(groupB.mean, groupB.color, `${groupB.label} x̄=${groupB.mean.toFixed(2)}`, -24)

  svg.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(x).ticks(8))
  svg.append('g').call(d3.axisLeft(y).ticks(6))

  svg
    .append('text')
    .attr('x', innerW / 2)
    .attr('y', innerH + 42)
    .attr('text-anchor', 'middle')
    .attr('fill', 'var(--text-muted)')
    .attr('font-size', 11)
    .text(xAxisLabel)

  const leg = svg.append('g').attr('transform', `translate(${innerW - 130}, 4)`)
  ;[
    { c: groupA.color, t: groupA.label },
    { c: groupB.color, t: groupB.label },
  ].forEach((item, i) => {
    leg
      .append('rect')
      .attr('x', 0)
      .attr('y', i * 16)
      .attr('width', 10)
      .attr('height', 10)
      .attr('rx', 2)
      .attr('fill', item.c)
      .attr('opacity', 0.7)
    leg
      .append('text')
      .attr('x', 14)
      .attr('y', i * 16 + 9)
      .attr('fill', 'var(--text-muted)')
      .attr('font-size', 10)
      .text(item.t)
  })
}

export default function TTestHistogramCompare({
  groupA,
  groupB,
  xAxisLabel = 'Nivel de satisfacción',
  meanControls,
  compact = false,
}: Props) {
  const [histLayout, setHistLayout] = useState<'split' | 'overlay'>(compact ? 'overlay' : 'split')
  const splitW = compact ? 300 : 400
  const splitH = compact ? 200 : 300
  const overlayW = compact ? 560 : 720
  const overlayH = compact ? 340 : 320
  const histARef = useRef<SVGSVGElement>(null)
  const histBRef = useRef<SVGSVGElement>(null)
  const histOverlayRef = useRef<SVGSVGElement>(null)
  const [smileyPositions, setSmileyPositions] = useState({ left: 0, right: 0 })

  useEffect(() => {
    if (histLayout === 'split') {
      const posA = drawSplitHistogram(
        histARef.current,
        groupA.values,
        groupA.label,
        groupA.color,
        splitW,
        splitH,
      )
      drawSplitHistogram(histBRef.current, groupB.values, groupB.label, groupB.color, splitW, splitH)
      setSmileyPositions(posA)
      if (histOverlayRef.current) d3.select(histOverlayRef.current).selectAll('*').remove()
    } else {
      drawOverlaidHistogram(histOverlayRef.current, groupA, groupB, xAxisLabel, overlayW, overlayH)
      if (histARef.current) d3.select(histARef.current).selectAll('*').remove()
      if (histBRef.current) d3.select(histBRef.current).selectAll('*').remove()
    }
  }, [histLayout, groupA, groupB, xAxisLabel, splitW, splitH, overlayW, overlayH])

  const axisSmiley = (value: number) => (value - 5) / 30

  return (
    <div>
      <div className={`flex flex-wrap items-center justify-center gap-2 ${compact ? 'mb-3' : 'mb-6'}`}>
        {!compact && <span className="text-sm text-[var(--text-muted)]">Vista de histogramas</span>}
        <div
          className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-muted)]/50 p-0.5"
          role="group"
          aria-label="Vista de histogramas"
        >
          <button
            type="button"
            onClick={() => setHistLayout('split')}
            aria-pressed={histLayout === 'split'}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              histLayout === 'split'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm ring-1 ring-[var(--border)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            Separados
          </button>
          <button
            type="button"
            onClick={() => setHistLayout('overlay')}
            aria-pressed={histLayout === 'overlay'}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              histLayout === 'overlay'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm ring-1 ring-[var(--border)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            Solapados
          </button>
        </div>
      </div>

      {!compact && (groupA.emoji || groupB.emoji) && (
        <div className="mb-6 grid grid-cols-2 gap-8">
          <div className="text-center">
            {groupA.emoji && <span className="text-6xl">{groupA.emoji}</span>}
            <p className="mt-2 text-sm text-gray-600">
              {groupA.sampleSize != null ? `${groupA.sampleSize} ` : ''}
              {groupA.label.toLowerCase()}
            </p>
          </div>
          <div className="text-center">
            {groupB.emoji && <span className="text-6xl">{groupB.emoji}</span>}
            <p className="mt-2 text-sm text-gray-600">
              {groupB.sampleSize != null ? `${groupB.sampleSize} ` : ''}
              {groupB.label.toLowerCase()}
            </p>
          </div>
        </div>
      )}

      {compact && (groupA.emoji || groupB.emoji) && (
        <p className="mb-2 text-center text-xs text-[var(--text-muted)]">
          {groupA.emoji} {groupA.label}
          {groupA.sampleSize != null ? ` (n=${groupA.sampleSize})` : ''} · {groupB.emoji} {groupB.label}
          {groupB.sampleSize != null ? ` (n=${groupB.sampleSize})` : ''}
        </p>
      )}

      {histLayout === 'split' ? (
        <div className={`grid grid-cols-1 ${compact ? 'gap-3 md:grid-cols-2' : 'gap-8 md:grid-cols-2'}`}>
          <div className={`relative ${compact ? 'overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/30 pb-3' : ''}`}>
            <div className={`flex justify-center ${compact ? '' : 'overflow-x-auto'}`}>
              <svg ref={histARef} />
            </div>
            {compact && meanControls?.groupA ? (
              <div
                className="mx-auto"
                style={{ width: splitW, paddingLeft: 40, paddingRight: 20 }}
              >
                {meanControls.groupA}
              </div>
            ) : null}
            {!compact && (
              <>
                <div
                  className="pointer-events-none absolute"
                  style={{ left: `${smileyPositions.left}px`, bottom: '65px' }}
                >
                  <svg width="30" height="30" aria-hidden>
                    <SmileyViridis cx={15} cy={15} radius={15} happiness={axisSmiley(15)} />
                  </svg>
                </div>
                <div
                  className="pointer-events-none absolute"
                  style={{ left: `${smileyPositions.right}px`, bottom: '65px' }}
                >
                  <svg width="30" height="30" aria-hidden>
                    <SmileyViridis cx={15} cy={15} radius={15} happiness={axisSmiley(30)} />
                  </svg>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Media: {groupA.mean.toFixed(2)}</p>
                  <p>Desviación típica: {groupA.std.toFixed(2)}</p>
                </div>
              </>
            )}
          </div>
          <div className={`relative ${compact ? 'overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/30 pb-3' : ''}`}>
            <div className={`flex justify-center ${compact ? '' : 'overflow-x-auto'}`}>
              <svg ref={histBRef} />
            </div>
            {compact && meanControls?.groupB ? (
              <div
                className="mx-auto"
                style={{ width: splitW, paddingLeft: 40, paddingRight: 20 }}
              >
                {meanControls.groupB}
              </div>
            ) : null}
            {!compact && (
              <>
                <div
                  className="pointer-events-none absolute"
                  style={{ left: `${smileyPositions.left}px`, bottom: '65px' }}
                >
                  <svg width="30" height="30" aria-hidden>
                    <SmileyViridis cx={15} cy={15} radius={15} happiness={axisSmiley(15)} />
                  </svg>
                </div>
                <div
                  className="pointer-events-none absolute"
                  style={{ left: `${smileyPositions.right}px`, bottom: '65px' }}
                >
                  <svg width="30" height="30" aria-hidden>
                    <SmileyViridis cx={15} cy={15} radius={15} happiness={axisSmiley(30)} />
                  </svg>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Media: {groupB.mean.toFixed(2)}</p>
                  <p>Desviación típica: {groupB.std.toFixed(2)}</p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div
            className={`overflow-x-auto ${compact ? 'rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/30 pb-3' : 'rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3'}`}
          >
            <div className="mx-auto" style={{ width: overlayW }}>
              <svg ref={histOverlayRef} />
              {compact && meanControls ? (
                <div className="space-y-2" style={{ paddingLeft: 48, paddingRight: 28 }}>
                  {meanControls.groupA}
                  {meanControls.groupB}
                </div>
              ) : null}
            </div>
          </div>
          {!compact && (
            <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
              Las barras semitransparentes comparten el mismo eje: donde se superponen ves regiones en las que
              ambos grupos concentran casos.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
