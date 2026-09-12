'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { LayoutGroup, motion } from 'framer-motion'
import SmileyViridis from '@/app/components/SmileyViridis'
import LessonNavigation from '@/app/components/LessonNavigation'
import NarrativeSection from '@/app/components/narrative/NarrativeSection'
import {
  DataAttribution,
  LessonStory,
  PredictionPrompt,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const card =
  'rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_1px_4px_rgba(0,0,0,.05)]'

/** Duración fase “mezcla” antes de reasignar etiquetas (ms). */
const POOL_ANIMATION_MS = 650

const layoutTransition = { type: 'spring' as const, stiffness: 68, damping: 15, mass: 1.05 }

/** Puntuación de “satisfacción con la vida” (misma escala que otras lecciones: ~5–35). */
const SUBJECTS: { id: number; score: number }[] = [
  // Grupo A observado (primeros N_A): algo más bajo, con solape respecto a B
  { id: 0, score: 17 },
  { id: 1, score: 18 },
  { id: 2, score: 18 },
  { id: 3, score: 19 },
  { id: 4, score: 19 },
  { id: 5, score: 19 },
  { id: 6, score: 20 },
  { id: 7, score: 20 },
  { id: 8, score: 20 },
  { id: 9, score: 21 },
  { id: 10, score: 21 },
  { id: 11, score: 22 },
  // Grupo B observado
  { id: 12, score: 19 },
  { id: 13, score: 20 },
  { id: 14, score: 20 },
  { id: 15, score: 21 },
  { id: 16, score: 21 },
  { id: 17, score: 21 },
  { id: 18, score: 22 },
  { id: 19, score: 22 },
  { id: 20, score: 22 },
  { id: 21, score: 23 },
  { id: 22, score: 23 },
  { id: 23, score: 24 },
]

const N_A = 12
const N_B = 12

function happinessFromScore(score: number) {
  return Math.max(0, Math.min(1, (score - 14) / 14))
}

function meanDiff(group: ('A' | 'B')[], scores: { id: number; score: number }[]) {
  const a = scores.filter((_, i) => group[i] === 'A').map((s) => s.score)
  const b = scores.filter((_, i) => group[i] === 'B').map((s) => s.score)
  const mA = d3.mean(a) ?? 0
  const mB = d3.mean(b) ?? 0
  return mB - mA
}

/** Asignación observada en el relato: los primeros N_A individuos en A, los otros en B. */
const OBSERVED_GROUP: ('A' | 'B')[] = [
  ...Array(N_A).fill('A'),
  ...Array(N_B).fill('B'),
] as ('A' | 'B')[]

function randomLabelShuffle(): ('A' | 'B')[] {
  const labels = [...Array(N_A).fill('A'), ...Array(N_B).fill('B')] as ('A' | 'B')[]
  d3.shuffle(labels)
  return labels
}

function drawDualHistogram(
  refA: SVGSVGElement | null,
  refB: SVGSVGElement | null,
  scoresA: number[],
  scoresB: number[],
) {
  const drawOne = (
    el: SVGSVGElement | null,
    data: number[],
    title: string,
    accent: string,
    width = 360,
    height = 220,
  ) => {
    if (!el) return
    d3.select(el).selectAll('*').remove()
    const margin = { top: 36, right: 16, bottom: 44, left: 44 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom
    const svg = d3
      .select(el)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const bins = d3.bin<number, number>().domain([14, 28]).thresholds(12)(data)
    const x = d3
      .scaleLinear()
      .domain([14, 28])
      .range([0, innerW])
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (b) => b.length) || 1])
      .nice()
      .range([innerH, 0])

    svg
      .append('text')
      .attr('x', innerW / 2)
      .attr('y', -12)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text)')
      .attr('font-size', 13)
      .attr('font-weight', 600)
      .text(title)

    svg
      .selectAll('rect')
      .data(bins)
      .join('rect')
      .attr('x', (d) => x(d.x0 ?? 0) + 1)
      .attr('y', (d) => y(d.length))
      .attr('width', (d) => Math.max(0, x(d.x1 ?? 0) - x(d.x0 ?? 0) - 2))
      .attr('height', (d) => innerH - y(d.length))
      .attr('rx', 3)
      .attr('fill', accent)
      .attr('opacity', 0.85)

    const xAxis = d3.axisBottom(x).ticks(8)
    svg.append('g').attr('transform', `translate(0,${innerH})`).call(xAxis).selectAll('text').attr('fill', 'var(--text-muted)')

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -32)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-muted)')
      .attr('font-size', 11)
      .text('frecuencia')
  }

  drawOne(refA, scoresA, 'Grupo A', '#7c6ae8')
  drawOne(refB, scoresB, 'Grupo B', '#34a372')
}

function drawCombinedHistogram(
  el: SVGSVGElement | null,
  scoresA: number[],
  scoresB: number[],
  width = 720,
  height = 260,
) {
  if (!el) return
  d3.select(el).selectAll('*').remove()
  const margin = { top: 48, right: 28, bottom: 52, left: 52 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom
  const svg = d3
    .select(el)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const bin = d3.bin<number, number>().domain([14, 28]).thresholds(12)
  const binsA = bin(scoresA)
  const binsB = bin(scoresB)
  const pairs = binsA.map((ba, i) => ({ ba, bb: binsB[i] ?? { x0: ba.x0, x1: ba.x1, length: 0 } }))
  const maxCount =
    d3.max(pairs, ({ ba, bb }) => Math.max(ba.length, bb.length)) ?? 1

  const x = d3.scaleLinear().domain([14, 28]).range([0, innerW])
  const y = d3.scaleLinear().domain([0, maxCount]).nice().range([innerH, 0])

  svg
    .append('text')
    .attr('x', innerW / 2)
    .attr('y', -18)
    .attr('text-anchor', 'middle')
    .attr('fill', 'var(--text)')
    .attr('font-size', 13)
    .attr('font-weight', 600)
    .text('Distribución conjunta de las puntuaciones de satisfacción con la vida')

  const innerGap = 1
  const padOuter = 1

  svg
    .selectAll('g.bin-pair')
    .data(pairs)
    .join('g')
    .attr('class', 'bin-pair')
    .each(function ({ ba, bb }) {
      const g = d3.select(this)
      const x0 = x(ba.x0 ?? 0)
      const x1 = x(ba.x1 ?? 0)
      const fullW = Math.max(0, x1 - x0 - 2 * padOuter)
      const halfW = Math.max(0, (fullW - innerGap) / 2)

      g.append('rect')
        .attr('x', x0 + padOuter)
        .attr('width', halfW)
        .attr('y', y(ba.length))
        .attr('height', innerH - y(ba.length))
        .attr('rx', 2)
        .attr('fill', '#7c6ae8')
        .attr('opacity', 0.9)

      g.append('rect')
        .attr('x', x0 + padOuter + halfW + innerGap)
        .attr('width', halfW)
        .attr('y', y(bb.length))
        .attr('height', innerH - y(bb.length))
        .attr('rx', 2)
        .attr('fill', '#34a372')
        .attr('opacity', 0.9)
    })

  const xAxis = d3.axisBottom(x).ticks(10)
  svg.append('g').attr('transform', `translate(0,${innerH})`).call(xAxis).selectAll('text').attr('fill', 'var(--text-muted)')

  svg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerH / 2)
    .attr('y', -36)
    .attr('text-anchor', 'middle')
    .attr('fill', 'var(--text-muted)')
    .attr('font-size', 11)
    .text('frecuencia')

  const leg = svg.append('g').attr('transform', `translate(${innerW - 108}, ${8})`)
  leg
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 10)
    .attr('height', 10)
    .attr('rx', 2)
    .attr('fill', '#7c6ae8')
  leg.append('text').attr('x', 14).attr('y', 9).attr('fill', 'var(--text-muted)').attr('font-size', 10).text('A')
  leg
    .append('rect')
    .attr('x', 36)
    .attr('y', 0)
    .attr('width', 10)
    .attr('height', 10)
    .attr('rx', 2)
    .attr('fill', '#34a372')
  leg.append('text').attr('x', 50).attr('y', 9).attr('fill', 'var(--text-muted)').attr('font-size', 10).text('B')
}

function drawNullDistribution(
  el: SVGSVGElement | null,
  diffs: number[],
  observed: number,
  width = 720,
  height = 300,
) {
  if (!el || diffs.length === 0) return
  d3.select(el).selectAll('*').remove()
  const margin = { top: 52, right: 28, bottom: 56, left: 56 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom
  const root = d3
    .select(el)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', 'Distribución de la diferencia de medias bajo permutaciones aleatorias')

  const svg = root.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const dLo = d3.min(diffs) ?? 0
  const dHi = d3.max(diffs) ?? 0
  const span = Math.max(dHi - dLo, 1e-6)
  const pad = Math.max(span * 0.12, Math.abs(observed) * 0.08 + 0.15)
  const domainLo = Math.min(dLo, observed) - pad
  const domainHi = Math.max(dHi, observed) + pad

  const bins = d3.bin().domain([domainLo, domainHi]).thresholds(36)(diffs)

  const x = d3.scaleLinear().domain([domainLo, domainHi]).range([0, innerW]).nice()

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (b) => b.length) || 1])
    .nice()
    .range([innerH, 0])

  const obsAbs = Math.abs(observed)
  const extreme = diffs.filter((d) => Math.abs(d) >= obsAbs - 1e-9).length

  const xObs = x(observed)

  // Fondo del área del gráfico (alto contraste con las barras)
  svg
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', innerW)
    .attr('height', innerH)
    .attr('rx', 6)
    .attr('fill', '#e4dff5')
    .attr('stroke', '#9b87d4')
    .attr('stroke-width', 1.25)

  svg
    .append('text')
    .attr('x', innerW / 2)
    .attr('y', -36)
    .attr('text-anchor', 'middle')
    .attr('fill', '#3f3a52')
    .attr('font-size', 12)
    .attr('font-weight', 600)
    .text('Distribución nula de D (permutaciones)')

  const barMuted = '#5c4a9e'
  const barMutedStroke = '#f8f6ff'
  const barExtreme = '#2a1468'
  const barExtremeStroke = '#fecaca'

  svg
    .selectAll('rect.bar')
    .data(bins)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', (d) => x(d.x0 ?? 0) + 1)
    .attr('y', (d) => y(d.length))
    .attr('width', (d) => Math.max(0, x(d.x1 ?? 0) - x(d.x0 ?? 0) - 2))
    .attr('height', (d) => innerH - y(d.length))
    .attr('rx', 2)
    .attr('fill', (d) => {
      const mid = ((d.x0 ?? 0) + (d.x1 ?? 0)) / 2
      return Math.abs(mid) >= obsAbs ? barExtreme : barMuted
    })
    .attr('stroke', (d) => {
      const mid = ((d.x0 ?? 0) + (d.x1 ?? 0)) / 2
      return Math.abs(mid) >= obsAbs ? barExtremeStroke : barMutedStroke
    })
    .attr('stroke-width', 1)

  const axisG = svg.append('g').attr('transform', `translate(0,${innerH})`)
  axisG.call(d3.axisBottom(x).ticks(10)).selectAll('text').attr('fill', '#3f3a52').attr('font-size', 10)
  axisG.selectAll('path,line').attr('stroke', '#6b5a9e')

  svg
    .append('text')
    .attr('x', innerW / 2)
    .attr('y', innerH + 40)
    .attr('text-anchor', 'middle')
    .attr('fill', '#3f3a52')
    .attr('font-size', 11)
    .text('D = x̄_B − x̄_A bajo permutaciones (H₀)')

  // Línea observada: halo + trazo + marcador superior
  svg
    .append('line')
    .attr('x1', xObs)
    .attr('x2', xObs)
    .attr('y1', 0)
    .attr('y2', innerH)
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 8)
    .attr('opacity', 0.95)
  svg
    .append('line')
    .attr('x1', xObs)
    .attr('x2', xObs)
    .attr('y1', 0)
    .attr('y2', innerH)
    .attr('stroke', '#dc2626')
    .attr('stroke-width', 3)
    .attr('stroke-dasharray', '8 5')

  svg
    .append('circle')
    .attr('cx', xObs)
    .attr('cy', 0)
    .attr('r', 8)
    .attr('fill', '#dc2626')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 2.5)

  const label = `D_obs = ${observed.toFixed(3)}`
  const lw = 102
  const lh = 22
  const lx = Math.min(Math.max(xObs - lw / 2, 0), innerW - lw)
  const ly = 10
  svg.append('rect').attr('x', lx).attr('y', ly).attr('width', lw).attr('height', lh).attr('rx', 5).attr('fill', '#ffffff').attr('stroke', '#dc2626').attr('stroke-width', 1.5)
  svg
    .append('text')
    .attr('x', lx + lw / 2)
    .attr('y', ly + 15)
    .attr('text-anchor', 'middle')
    .attr('fill', '#991b1b')
    .attr('font-size', 12)
    .attr('font-weight', 700)
    .text(label)

  svg
    .append('text')
    .attr('x', innerW / 2)
    .attr('y', innerH + 54)
    .attr('text-anchor', 'middle')
    .attr('fill', '#5c5470')
    .attr('font-size', 10)
    .text(`Casos con |D| ≥ |D_obs|: ${extreme} de ${diffs.length} (barras más oscuras / borde rosa)`)
}

export default function RandomizationInferencePage() {
  const histARef = useRef<SVGSVGElement>(null)
  const histBRef = useRef<SVGSVGElement>(null)
  const histCombinedRef = useRef<SVGSVGElement>(null)
  const nullDistRef = useRef<SVGSVGElement>(null)

  const [assignment, setAssignment] = useState<('A' | 'B')[]>(() => [...OBSERVED_GROUP])
  const [nullDiffs, setNullDiffs] = useState<number[]>([])
  const [isPooling, setIsPooling] = useState(false)
  const [histLayout, setHistLayout] = useState<'split' | 'combined'>('split')

  const observedDiff = useMemo(() => meanDiff(OBSERVED_GROUP, SUBJECTS), [])
  const storyMeanA = useMemo(() => {
    const a = SUBJECTS.filter((_, i) => OBSERVED_GROUP[i] === 'A').map((s) => s.score)
    return d3.mean(a) ?? 0
  }, [])
  const storyMeanB = useMemo(() => {
    const b = SUBJECTS.filter((_, i) => OBSERVED_GROUP[i] === 'B').map((s) => s.score)
    return d3.mean(b) ?? 0
  }, [])
  const currentDiff = useMemo(() => meanDiff(assignment, SUBJECTS), [assignment])

  const scoresA = useMemo(
    () => SUBJECTS.filter((_, i) => assignment[i] === 'A').map((s) => s.score),
    [assignment],
  )
  const scoresB = useMemo(
    () => SUBJECTS.filter((_, i) => assignment[i] === 'B').map((s) => s.score),
    [assignment],
  )

  const meanA = d3.mean(scoresA) ?? 0
  const meanB = d3.mean(scoresB) ?? 0

  useEffect(() => {
    if (histLayout === 'split') {
      if (histCombinedRef.current) {
        d3.select(histCombinedRef.current).selectAll('*').remove()
      }
      drawDualHistogram(histARef.current, histBRef.current, scoresA, scoresB)
    } else {
      if (histARef.current) d3.select(histARef.current).selectAll('*').remove()
      if (histBRef.current) d3.select(histBRef.current).selectAll('*').remove()
      drawCombinedHistogram(histCombinedRef.current, scoresA, scoresB)
    }
  }, [scoresA, scoresB, histLayout])

  useEffect(() => {
    drawNullDistribution(nullDistRef.current, nullDiffs, observedDiff)
  }, [nullDiffs, observedDiff])

  const runOnePermutation = useCallback(() => {
    setIsPooling(true)
    window.setTimeout(() => {
      setAssignment(randomLabelShuffle())
      setIsPooling(false)
    }, POOL_ANIMATION_MS)
  }, [])

  const runMany = useCallback(
    (n: number) => {
      const out: number[] = []
      for (let i = 0; i < n; i++) {
        out.push(meanDiff(randomLabelShuffle(), SUBJECTS))
      }
      setNullDiffs(out)
    },
    [],
  )

  const pTwoSided =
    nullDiffs.length === 0
      ? null
      : (1 + nullDiffs.filter((d) => Math.abs(d) >= Math.abs(observedDiff) - 1e-9).length) /
        (nullDiffs.length + 1)

  const sortedA = useMemo(
    () => SUBJECTS.filter((_, i) => assignment[i] === 'A').sort((a, b) => a.id - b.id),
    [assignment],
  )
  const sortedB = useMemo(
    () => SUBJECTS.filter((_, i) => assignment[i] === 'B').sort((a, b) => a.id - b.id),
    [assignment],
  )
  const poolOrder = useMemo(() => [...SUBJECTS].sort((a, b) => a.id - b.id), [])

  return (
    <LessonStory
      eyebrow="Lección 6 · inferencia por randomización"
      title="¿La diferencia observada podría ser azar?"
      lead="Partimos de dos grupos que parecen distintos. Después construimos, paso a paso, el mundo en que la etiqueta de grupo no importa."
    >

      <div className="mx-auto flex max-w-3xl flex-col gap-20 py-16 sm:gap-24 sm:py-24">
        <NarrativeSection id="smileys" className="narrative-beat">
          <p className="mb-4 text-sm font-semibold text-[var(--accent-strong)]">1 · Individuos</p>
          <h2 className="text-2xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            Satisfacción como número y como cara
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-[var(--foreground)]">
            Cada persona tiene una <strong>puntuación de satisfacción</strong> en la misma escala que ves en los
            histogramas más abajo. En esta simulación enfocamos el tramo de <strong>14 a 28 puntos</strong>. El
            componente traduce ese número en color (viridis) y en forma de boca.
          </p>
          <div className={`${card} not-prose mt-6`}>
            <div className="flex flex-wrap justify-center gap-8 sm:gap-10">
              {[
                {
                  score: 16,
                  line: 'Puntuación baja en el tramo mostrado; gesto más triste.',
                },
                {
                  score: 21,
                  line: 'Puntuación intermedia, en la zona donde se solapan A y B (cerca de sus medias).',
                },
                {
                  score: 26,
                  line: 'Puntuación alta en el tramo mostrado; sonrisa marcada.',
                },
              ].map(({ score, line }) => (
                <div key={score} className="flex w-[10.5rem] flex-col items-center sm:w-[11.5rem]">
                  <svg width={56} height={56} viewBox="0 0 40 40" aria-hidden>
                    <SmileyViridis
                      cx={20}
                      cy={20}
                      radius={16}
                      happiness={happinessFromScore(score)}
                    />
                  </svg>
                  <p className="mt-2 font-mono text-sm font-semibold text-[var(--text)]">{score} pts</p>
                  <p className="mt-1 text-center text-[11px] leading-snug text-[var(--text-muted)]">{line}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 border-t border-[var(--border)] pt-4 text-center text-xs leading-relaxed text-[var(--text-muted)]">
              <span className="font-mono text-[var(--text)]">SmileyViridis</span> usa por dentro{' '}
              <span className="font-mono text-[var(--text)]">(puntuación − 14) / 14</span>; las medias de los grupos observados rondan{' '}
              <strong>{storyMeanA.toFixed(1)}</strong> y <strong>{storyMeanB.toFixed(1)}</strong>).
            </p>
          </div>
        </NarrativeSection>

        <NarrativeSection id="dos-grupos" className="narrative-beat">
          <p className="mb-4 text-sm font-semibold text-[var(--accent-strong)]">2 · Dos grupos</p>
          <h2 className="text-2xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            Grupo A y grupo B: medias distintas
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-[var(--foreground)]">
            Imagina dos muestras independientes. En los datos de este relato, el grupo A tiende a puntuaciones
            más bajas y el B más altas. Los histogramas resumen la forma de cada grupo en la misma escala.
          </p>
          <div className="not-prose mt-5 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-[var(--text-muted)]">Vista de histogramas</span>
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
                onClick={() => setHistLayout('combined')}
                aria-pressed={histLayout === 'combined'}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  histLayout === 'combined'
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm ring-1 ring-[var(--border)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                Juntos
              </button>
            </div>
          </div>
          {histLayout === 'split' ? (
            <div className="not-prose mt-6 grid gap-6 md:grid-cols-2">
              <div className="flex justify-center overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3">
                <svg ref={histARef} className="max-w-full" />
              </div>
              <div className="flex justify-center overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3">
                <svg ref={histBRef} className="max-w-full" />
              </div>
            </div>
          ) : (
            <div className="not-prose mt-6 flex justify-center overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3">
              <svg ref={histCombinedRef} className="max-w-full" />
            </div>
          )}
          <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
            Media A ≈ <strong className="text-[var(--text)]">{meanA.toFixed(2)}</strong> · Media B ≈{' '}
            <strong className="text-[var(--text)]">{meanB.toFixed(2)}</strong> · Diferencia (B − A) ≈{' '}
            <strong className="text-[var(--accent-strong)]">{currentDiff.toFixed(2)}</strong>
          </p>
          <p className="mt-4 text-center text-sm leading-relaxed text-[var(--text-muted)]">
            Las caras de cada persona y la animación al permutar están en el apartado{' '}
            <strong className="text-[var(--text)]">6 · Randomización</strong> más abajo, junto a los botones,
            para que veas el cambio justo donde interactúas.
          </p>
        </NarrativeSection>

        <NarrativeSection id="pregunta" className="narrative-beat">
          <p className="mb-4 text-sm font-semibold text-[var(--accent-strong)]">3 · Pregunta central</p>
          <h2 className="text-2xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            ¿Son de verdad diferentes?
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-[var(--foreground)]">
            Las medias difieren en esta tabla… pero eso siempre pasa un poco, aunque solo fuera por el azar.
            ¿Hay evidencia de que <em>proviene</em> de contextos distintos (por ejemplo, dos poblaciones con
            centros distintos), o podría ser el sorteo de una misma “bolsa” de personas?
          </p>
          <div className="mt-8">
            <PredictionPrompt
              question="Solo con estas dos muestras, ¿qué afirmación sostendrías?"
              options={[
                'Las medias difieren: seguro provienen de poblaciones distintas',
                'Todavía no lo sé: una diferencia así podría aparecer por azar',
              ]}
              reveal="La diferencia observada es un hecho descriptivo. Para interpretarla necesitamos cuantificar qué tan frecuente sería bajo un mundo sin diferencia entre grupos."
            />
          </div>
        </NarrativeSection>

        <NarrativeSection id="dos-universos" className="narrative-beat">
          <p className="mb-4 text-sm font-semibold text-[var(--accent-strong)]">4 · Dos mundos posibles</p>
          <h2 className="text-2xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            Una población o dos
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-[var(--foreground)]">
            Dos historias compatibles con datos parecidos. La prueba estadística formaliza la pregunta contra
            el mundo más conservador: el de una sola población.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className={card}>
              <h3 className="text-lg font-semibold text-[var(--text)]">Universo H₀ · una sola población</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                Existe una única distribución de satisfacción. A y B son solo dos muestras que podrían haber
                salido distintas por azar (tamaños fijos).
              </p>
              <svg viewBox="0 0 320 140" className="mt-4 w-full text-[var(--accent-strong)]" aria-hidden>
                <ellipse cx={160} cy={55} rx={90} ry={38} fill="currentColor" opacity={0.12} />
                <text x={160} y={50} textAnchor="middle" fontSize="11" fill="var(--text-muted)">
                  Una población
                </text>
                <path d="M100 78 L70 108" stroke="currentColor" strokeWidth="1.5" />
                <path d="M220 78 L250 108" stroke="currentColor" strokeWidth="1.5" />
                <rect x={40} y={108} width={60} height={22} rx={4} fill="var(--surface-muted)" stroke="currentColor" />
                <text x={70} y={123} textAnchor="middle" fontSize="10" fill="var(--text)">
                  Muestra A
                </text>
                <rect x={220} y={108} width={60} height={22} rx={4} fill="var(--surface-muted)" stroke="currentColor" />
                <text x={250} y={123} textAnchor="middle" fontSize="10" fill="var(--text)">
                  Muestra B
                </text>
              </svg>
            </div>
            <div className={card}>
              <h3 className="text-lg font-semibold text-[var(--text)]">Universo alternativo · dos centros</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                Hay dos poblaciones (o el mismo fenómeno bajo dos regímenes) con tendencias distintas. Entonces
                las medias poblacionales difieren y las muestras reflejan esa separación además del azar.
              </p>
              <svg viewBox="0 0 320 140" className="mt-4 w-full" aria-hidden>
                <ellipse cx={95} cy={55} rx={55} ry={32} fill="#7c6ae8" opacity={0.2} />
                <ellipse cx={225} cy={55} rx={55} ry={32} fill="#34a372" opacity={0.25} />
                <text x={95} y={48} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                  Población A
                </text>
                <text x={225} y={48} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                  Población B
                </text>
                <path d="M95 85 L70 108" stroke="#7c6ae8" strokeWidth="1.5" />
                <path d="M225 85 L250 108" stroke="#34a372" strokeWidth="1.5" />
                <rect x={40} y={108} width={60} height={22} rx={4} fill="var(--surface-muted)" stroke="#7c6ae8" />
                <text x={70} y={123} textAnchor="middle" fontSize="10" fill="var(--text)">
                  Muestra A
                </text>
                <rect x={220} y={108} width={60} height={22} rx={4} fill="var(--surface-muted)" stroke="#34a372" />
                <text x={250} y={123} textAnchor="middle" fontSize="10" fill="var(--text)">
                  Muestra B
                </text>
              </svg>
            </div>
          </div>
        </NarrativeSection>

        <NarrativeSection id="estadistico" className="narrative-beat">
          <p className="mb-4 text-sm font-semibold text-[var(--accent-strong)]">5 · Estadístico</p>
          <h2 className="text-2xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            ¿Qué medir si H₀ fuera cierta?
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-[var(--foreground)]">
            Bajo <strong>hipótesis nula</strong> (una sola población), las etiquetas “A” y “B” no aportan
            información: solo dividen al azar el mismo conjunto de puntuaciones. Elige un resumen de la
            separación entre grupos; aquí usamos la{' '}
            <strong>diferencia de medias muestrales</strong>{' '}
            <span className="whitespace-nowrap font-mono text-sm">D = x̄_B − x̄_A</span>.
          </p>
          <div className={`${card} mt-6 font-mono text-sm`}>
            <p>
              D<sub>obs</sub> = {observedDiff.toFixed(3)} (con la asignación original del relato: primeros{' '}
              {N_A} en A, los siguientes {N_B} en B).
            </p>
            <p className="mt-2 text-[var(--text-muted)]">
              La pregunta inferencial: si solo hubiera una población, ¿con qué frecuencia el azar al repartir{' '}
              {N_A} y {N_B} personas produciría un |D| tan grande como el que viste?
            </p>
          </div>
        </NarrativeSection>

        <NarrativeSection id="randomizacion" className="narrative-beat">
          <p className="mb-4 text-sm font-semibold text-[var(--accent-strong)]">6 · Randomización</p>
          <h2 className="text-2xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            Mover personas entre grupos
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-[var(--foreground)]">
            Fijamos las {N_A + N_B} puntuaciones observadas (son hechos). Bajo H₀, lo único aleatorio es quién cayó en
            la etiqueta A o B. Una <strong>permutación</strong> vuelve a repartir al azar esas puntuaciones
            en dos grupos de {N_A} y {N_B}: eso es “mezclar y reasignar”. Cada reparto da un D; muchas repeticiones
            dibujan la <em>distribución de referencia</em> bajo H₀.
          </p>
          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Asignación actual ·{' '}
            <span className="font-mono text-[var(--text)]">D = {currentDiff.toFixed(2)}</span>
            {isPooling ? (
              <span className="ml-2 text-[var(--accent-strong)]"> · mezclando…</span>
            ) : null}
          </p>
          <LayoutGroup id="panel-permutacion">
            <div className="not-prose mt-6 grid min-h-[200px] gap-4 md:grid-cols-2">
              <div
                className={`rounded-xl border border-dashed p-4 transition-colors ${
                  isPooling ? 'border-[var(--border)] bg-[var(--surface-muted)]/30' : 'border-[#7c6ae8]/50 bg-[var(--accent-soft)]/40'
                }`}
              >
                <p className="mb-3 text-center text-sm font-semibold text-[var(--text)]">Grupo A</p>
                <div className="flex min-h-[120px] flex-wrap justify-center gap-2 content-start">
                  {(isPooling ? [] : sortedA).map((s) => (
                    <motion.div
                      key={s.id}
                      layout
                      layoutId={`sub-${s.id}`}
                      transition={layoutTransition}
                      className="flex flex-col items-center rounded-lg bg-[var(--surface)] p-1 shadow-sm"
                      title={`id ${s.id}, puntuación ${s.score}`}
                    >
                      <svg width={44} height={44} viewBox="0 0 36 36" aria-hidden>
                        <SmileyViridis cx={18} cy={18} radius={14} happiness={happinessFromScore(s.score)} />
                      </svg>
                      <span className="font-mono text-[10px] font-bold text-[var(--text)]">{s.score}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div
                className={`rounded-xl border border-dashed p-4 transition-colors ${
                  isPooling ? 'border-[var(--border)] bg-[var(--surface-muted)]/30' : 'border-[#34a372]/50 bg-[rgba(52,163,114,0.08)]'
                }`}
              >
                <p className="mb-3 text-center text-sm font-semibold text-[var(--text)]">Grupo B</p>
                <div className="flex min-h-[120px] flex-wrap justify-center gap-2 content-start">
                  {(isPooling ? [] : sortedB).map((s) => (
                    <motion.div
                      key={s.id}
                      layout
                      layoutId={`sub-${s.id}`}
                      transition={layoutTransition}
                      className="flex flex-col items-center rounded-lg bg-[var(--surface)] p-1 shadow-sm"
                      title={`id ${s.id}, puntuación ${s.score}`}
                    >
                      <svg width={44} height={44} viewBox="0 0 36 36" aria-hidden>
                        <SmileyViridis cx={18} cy={18} radius={14} happiness={happinessFromScore(s.score)} />
                      </svg>
                      <span className="font-mono text-[10px] font-bold text-[var(--text)]">{s.score}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            {isPooling ? (
              <div className="not-prose mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Mezcla (misma información, etiquetas en juego)
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {poolOrder.map((s) => (
                    <motion.div
                      key={s.id}
                      layout
                      layoutId={`sub-${s.id}`}
                      transition={layoutTransition}
                      className="flex flex-col items-center rounded-lg bg-[var(--surface-muted)] p-1"
                    >
                      <svg width={44} height={44} viewBox="0 0 36 36" aria-hidden>
                        <SmileyViridis cx={18} cy={18} radius={14} happiness={happinessFromScore(s.score)} />
                      </svg>
                      <span className="font-mono text-[10px] font-bold text-[var(--text)]">{s.score}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : null}
          </LayoutGroup>
          <div className="not-prose mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runOnePermutation}
              disabled={isPooling}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--text)] shadow-sm transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:opacity-40"
            >
              Una permutación animada
            </button>
            <button
              type="button"
              onClick={() => setAssignment([...OBSERVED_GROUP])}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-2.5 text-sm font-medium text-[var(--text)] hover:border-[var(--accent)]"
            >
              Restaurar datos observados
            </button>
            <button
              type="button"
              onClick={() => runMany(2500)}
              className="rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-5 py-2.5 text-sm font-medium text-[var(--accent-strong)] shadow-sm"
            >
              Simular 2500 permutaciones
            </button>
          </div>
        </NarrativeSection>

        <NarrativeSection id="p-valor" className="narrative-beat">
          <p className="mb-4 text-sm font-semibold text-[var(--accent-strong)]">7 · Valor p</p>
          <h2 className="text-2xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            Cálculo del valor p (dos colas)
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-[var(--foreground)]">
            Tras simular muchas permutaciones, estimamos el valor p como la proporción (con corrección +1 en
            numerador y denominador) de casos en los que{' '}
            <span className="font-mono text-sm">|D| ≥ |D_obs|</span>. En el histograma, la línea roja marca
            tu <span className="font-mono text-sm">D_obs</span>; las barras más marcadas caen en colas tan
            extremas o más que la observada.
          </p>
          <div className="not-prose mt-6 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3">
            <svg ref={nullDistRef} className="min-w-[min(100%,720px)]" />
          </div>
          {pTwoSided != null ? (
            <div className={`${card} mt-6`}>
              <p className="text-sm text-[var(--text)]">
                Valor p (Monte Carlo, dos colas, corrección de permutación):{' '}
                <strong className="text-lg text-[var(--accent-strong)]">{pTwoSided.toFixed(4)}</strong>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                Fórmula usada: (1 + número de simulaciones con |D| ≥ |D_obs|) / (1 + número total de
                simulaciones). Si el valor es muy pequeño, la diferencia observada sería rara bajo “una sola
                población”; si es grande, datos como los tuyos son frecuentes sin invocar dos centros
                distintos.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Pulsa “Simular 2500 permutaciones” para ver la distribución nula y el valor p.
            </p>
          )}
        </NarrativeSection>

        <section className="space-y-8">
          <StoryConclusion>
            El valor p no mide cuán grande o importante es una diferencia. Mide qué tan incompatible resulta
            el estadístico observado con las reasignaciones que permite H₀.
          </StoryConclusion>
          <TransferTask question="¿Qué tendrías que permutar en un estudio con medidas antes y después sobre las mismas personas?">
            <p>Conservá la estructura del diseño: la randomización válida no puede romper dependencias que estaban presentes al obtener los datos.</p>
          </TransferTask>
          <DataAttribution>
            Datos sintéticos construidos para esta simulación: 24 puntuaciones de satisfacción, 12 por grupo.
            No corresponden a participantes reales. Cada permutación conserva puntuaciones y tamaños grupales.
          </DataAttribution>
          <LessonNavigation
            currentStep={7}
            totalSteps={9}
            previousUrl="/lessons/confidence-interval"
            nextUrl="/lessons/t-test"
          />
        </section>
      </div>
    </LessonStory>
  )
}
