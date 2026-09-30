'use client'

import { useMemo, useState } from 'react'
import * as d3 from 'd3'
import LessonNavigation from '@/app/components/LessonNavigation'
import { QuartileBoxPlot, QuartilesToggle } from '@/app/components/descriptive/QuartileBoxPlot'
import {
  DataAttribution,
  LessonStory,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const WIDTH = 800
const HEIGHT = 420
const MARGIN = { top: 48, right: 24, bottom: 56, left: 48 }
const DOMAIN: [number, number] = [5, 35]

function makeData(n: number, mean: number, targetStd: number, skew: number, seed: number) {
  const raw = Array.from({ length: n }, (_, index) => {
    const phase = (index + 1) * (1.73 + seed * 0.013)
    return Math.sin(phase) + 0.55 * Math.cos(phase * 2.17) + 0.2 * Math.sin(phase * 4.03)
  })
  const rawMean = d3.mean(raw) ?? 0
  const rawCentered = raw.map((value) => value - rawMean)
  const rawVariance = d3.mean(rawCentered, (value) => value ** 2) ?? 1
  const shaped = rawCentered.map(
    (value) => value + skew * 0.65 * (value ** 2 - rawVariance),
  )
  const centered = shaped.map((value) => value - (d3.mean(shaped) ?? 0))
  const rawStd = d3.deviation(centered) || 1
  const deviations = centered.map((value) => (value / rawStd) * targetStd)
  const boundaryScale = deviations.reduce((scale, deviation) => {
    if (deviation > 0) return Math.min(scale, (35 - mean) / deviation)
    if (deviation < 0) return Math.min(scale, (5 - mean) / deviation)
    return scale
  }, 1)
  const values = deviations.map((deviation) => mean + deviation * boundaryScale)
  values[values.length - 1] += mean * n - d3.sum(values)
  return values
}

function EditableHistogram({ data }: { data: number[] }) {
  const mean = d3.mean(data) ?? 0
  const bins = d3.bin().domain(DOMAIN).thresholds(12)(data)
  const x = d3.scaleLinear().domain(DOMAIN).range([MARGIN.left, WIDTH - MARGIN.right])
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (bin) => bin.length) ?? 1])
    .nice()
    .range([HEIGHT - MARGIN.bottom, MARGIN.top])

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="Histograma editable con media">
      {bins.map((bin, index) => (
        <rect
          key={index}
          x={x(bin.x0 ?? 5) + 1}
          y={y(bin.length)}
          width={Math.max(0, x(bin.x1 ?? 5) - x(bin.x0 ?? 5) - 2)}
          height={HEIGHT - MARGIN.bottom - y(bin.length)}
          fill="var(--accent)"
          opacity={0.72}
          rx={3}
        />
      ))}
      <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={HEIGHT - MARGIN.bottom} y2={HEIGHT - MARGIN.bottom} stroke="var(--text)" />
      {d3.range(5, 36, 5).map((tick) => (
        <g key={tick} transform={`translate(${x(tick)},${HEIGHT - MARGIN.bottom})`}>
          <line y2={6} stroke="var(--text)" />
          <text y={22} textAnchor="middle" fontSize={11} fill="var(--text-muted)">{tick}</text>
        </g>
      ))}
      <line x1={x(mean)} x2={x(mean)} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} stroke="#b42348" strokeWidth={3} strokeDasharray="6 4" />
      <text x={x(mean)} y={24} textAnchor="middle" fontSize={12} fontWeight={700} fill="#b42348">Media {mean.toFixed(2)}</text>
      <text x={WIDTH / 2} y={HEIGHT - 12} textAnchor="middle" fontSize={12} fill="var(--text-muted)">Puntuación</text>
    </svg>
  )
}

export default function MeanDeviationEditablePage() {
  const [targetMean, setTargetMean] = useState(22.3)
  const [targetStd, setTargetStd] = useState(5.8)
  const [targetSkew, setTargetSkew] = useState(0)
  const [sampleSize, setSampleSize] = useState(100)
  const [seed, setSeed] = useState(1)
  const [showQuartiles, setShowQuartiles] = useState(false)
  const data = useMemo(
    () => makeData(sampleSize, targetMean, targetStd, targetSkew, seed),
    [sampleSize, targetMean, targetStd, targetSkew, seed],
  )
  const mean = d3.mean(data) ?? 0
  const std = d3.deviation(data) ?? 0

  return (
    <LessonStory
      eyebrow="Lección 1 · laboratorio de media y desvío"
      title="Mové el centro, abrí la distribución y estirá una cola"
      lead="Los controles están ligados al gráfico: media, desvío y asimetría modifican propiedades diferentes de la misma distribución."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Exploración"
        title="Centro, dispersión y forma son controles independientes"
        visual={
          <div>
            <div className="flex flex-wrap items-end gap-4 border-b border-[var(--border)] pb-4">
              <label className="text-sm font-medium text-[var(--text)]">
                Casos
                <select value={sampleSize} onChange={(event) => setSampleSize(Number(event.target.value))} className="ml-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
                  {[20, 50, 100, 200].map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => setSeed((value) => value + 1)} className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-soft)]">
                Nueva forma
              </button>
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)]">
              <div className="mx-auto pb-3" style={{ width: WIDTH }}>
                <EditableHistogram data={data} />
                {showQuartiles ? (
                  <div aria-live="polite">
                    <QuartileBoxPlot data={data} domain={DOMAIN} width={WIDTH} left={MARGIN.left} right={MARGIN.right} />
                  </div>
                ) : null}
                <div style={{ paddingLeft: MARGIN.left, paddingRight: MARGIN.right }}>
                  <label className="px-1 text-sm font-bold text-[#7f1235]">Media objetivo: {targetMean.toFixed(1)}</label>
                  <input
                    type="range"
                    min={5}
                    max={35}
                    step={0.1}
                    value={targetMean}
                    onChange={(event) => setTargetMean(Number(event.target.value))}
                    className="mt-1 w-full [--range-color:#b42348] [--range-track:#b42348]"
                  />
                </div>
              </div>
            </div>
            <label className="mt-5 block text-sm font-medium text-[var(--text)]">
              Desvío objetivo: <span className="font-mono">{targetStd.toFixed(1)}</span>
              <input type="range" min={0.5} max={9} step={0.1} value={targetStd} onChange={(event) => setTargetStd(Number(event.target.value))} className="mt-2 w-full" />
            </label>
            <label className="mt-5 block text-sm font-medium text-[var(--text)]">
              Asimetría: <span className="font-mono">{targetSkew.toFixed(1)}</span>
              <input
                type="range"
                min={-1.5}
                max={1.5}
                step={0.1}
                value={targetSkew}
                onChange={(event) => setTargetSkew(Number(event.target.value))}
                className="mt-2 w-full"
              />
              <span className="mt-1 flex justify-between text-xs font-normal text-[var(--text-muted)]">
                <span>Cola izquierda</span>
                <span>Simétrica</span>
                <span>Cola derecha</span>
              </span>
            </label>
            <div className="mt-5 flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
              <QuartilesToggle shown={showQuartiles} onToggle={() => setShowQuartiles((value) => !value)} />
            </div>
          </div>
        }
      >
        <p>Mové primero la media sin tocar el desvío: la distribución se desplaza sobre el eje.</p>
        <p>Después dejá fija la media y cambiá el desvío: el centro permanece mientras la distribución se abre o se cierra.</p>
        <p>Por último, mové la asimetría: una cola se alarga mientras la media permanece en la posición elegida.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="02"
        label="Comprobación"
        title="El gráfico y los datos responden al mismo parámetro"
        visual={
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] p-4">
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Media generada</dt>
              <dd className="mt-1 font-mono text-2xl font-bold text-[#7f1235]">{mean.toFixed(2)}</dd>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-4">
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Desvío generado</dt>
              <dd className="mt-1 font-mono text-2xl font-bold text-[var(--accent)]">{std.toFixed(2)}</dd>
            </div>
          </dl>
        }
      >
        <p>La muestra se centra matemáticamente en la media elegida. Cerca de los límites de la escala, la dispersión puede comprimirse para mantener todos los valores entre 5 y 35.</p>
        <p>Eso vuelve visible una restricción real: no todas las combinaciones de centro, dispersión y rango son posibles.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>
          Cambiar la media traslada la distribución; cambiar el desvío modifica su anchura. Leer ambos parámetros juntos evita confundir posición con variabilidad.
        </StoryConclusion>
        <TransferTask question="Construí dos distribuciones con media 20: una con s≈2 y otra con s≈8. ¿Qué comparten y qué no?" />
        <DataAttribution>
          Datos sintéticos generados de forma determinista en el navegador. No representan observaciones reales.
        </DataAttribution>
        <LessonNavigation currentStep={2} totalSteps={9} previousUrl="/lessons/mean-deviation" nextUrl="/lessons/univariate-tables" />
      </section>
    </LessonStory>
  )
}
