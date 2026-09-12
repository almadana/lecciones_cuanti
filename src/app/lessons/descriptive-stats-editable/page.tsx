'use client'

import { useMemo, useState } from 'react'
import * as d3 from 'd3'
import LessonNavigation from '@/app/components/LessonNavigation'
import {
  DataAttribution,
  LessonStory,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const WIDTH = 800
const HEIGHT = 390
const MARGIN = { top: 45, right: 24, bottom: 55, left: 48 }
const DOMAIN: [number, number] = [4, 12]

function makeDistribution(std: number, skew: number) {
  const raw = Array.from({ length: 80 }, (_, index) => {
    const u = (index + 0.7) / 81
    const v = (((index * 37) % 80) + 0.5) / 80
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    return z + skew * 0.8 * (z * z - 1)
  })
  const centered = raw.map((value) => value - (d3.mean(raw) ?? 0))
  const scale = d3.deviation(centered) || 1
  return centered.map((value) => Math.max(4, Math.min(12, 8 + (value / scale) * std)))
}

function ShapePlot({ data }: { data: number[] }) {
  const mean = d3.mean(data) ?? 0
  const median = d3.median(data) ?? 0
  const bins = d3.bin().domain(DOMAIN).thresholds(14)(data)
  const x = d3.scaleLinear().domain(DOMAIN).range([MARGIN.left, WIDTH - MARGIN.right])
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (bin) => bin.length) ?? 1])
    .nice()
    .range([HEIGHT - MARGIN.bottom, MARGIN.top])

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="Distribución editable de horas de sueño">
      {bins.map((bin, index) => (
        <rect
          key={index}
          x={x(bin.x0 ?? 4) + 1}
          y={y(bin.length)}
          width={Math.max(0, x(bin.x1 ?? 4) - x(bin.x0 ?? 4) - 2)}
          height={HEIGHT - MARGIN.bottom - y(bin.length)}
          fill="var(--accent)"
          opacity={0.72}
          rx={3}
        />
      ))}
      <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={HEIGHT - MARGIN.bottom} y2={HEIGHT - MARGIN.bottom} stroke="var(--text)" />
      {d3.range(4, 13).map((tick) => (
        <g key={tick} transform={`translate(${x(tick)},${HEIGHT - MARGIN.bottom})`}>
          <line y2={6} stroke="var(--text)" />
          <text y={22} textAnchor="middle" fontSize={11} fill="var(--text-muted)">{tick}</text>
        </g>
      ))}
      {[
        { value: mean, color: '#b42348', label: `Media ${mean.toFixed(2)}`, y: 18 },
        { value: median, color: '#2f7d4b', label: `Mediana ${median.toFixed(2)}`, y: 34 },
      ].map((marker) => (
        <g key={marker.label}>
          <line x1={x(marker.value)} x2={x(marker.value)} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} stroke={marker.color} strokeWidth={2.5} strokeDasharray="6 4" />
          <text x={x(marker.value)} y={marker.y} textAnchor="middle" fontSize={11} fontWeight={700} fill={marker.color}>{marker.label}</text>
        </g>
      ))}
      <text x={WIDTH / 2} y={HEIGHT - 12} textAnchor="middle" fontSize={12} fill="var(--text-muted)">Horas de sueño</text>
    </svg>
  )
}

export default function DescriptiveStatsEditablePage() {
  const [std, setStd] = useState(0.9)
  const [skew, setSkew] = useState(0)
  const data = useMemo(() => makeDistribution(std, skew), [std, skew])
  const mean = d3.mean(data) ?? 0
  const median = d3.median(data) ?? 0

  return (
    <LessonStory
      eyebrow="Lección 1 · laboratorio de forma"
      title="Deformá la distribución y mirá qué resumen resiste"
      lead="Ahora controlás dispersión y asimetría. No busques un número correcto: buscá qué información conserva cada medida."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Exploración"
        title="Misma escala, formas distintas"
        visual={
          <div>
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <ShapePlot data={data} />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-[var(--text)]">
                Dispersión: <span className="font-mono">{std.toFixed(1)}</span>
                <input type="range" min={0.3} max={2.2} step={0.1} value={std} onChange={(event) => setStd(Number(event.target.value))} className="mt-2 w-full" />
              </label>
              <label className="text-sm font-medium text-[var(--text)]">
                Asimetría: <span className="font-mono">{skew.toFixed(1)}</span>
                <input type="range" min={-1.5} max={1.5} step={0.1} value={skew} onChange={(event) => setSkew(Number(event.target.value))} className="mt-2 w-full" />
              </label>
            </div>
          </div>
        }
      >
        <p>Mové primero solo la dispersión: el centro permanece aproximadamente estable mientras cambia la anchura.</p>
        <p>Después introducí asimetría y compará las líneas de media y mediana.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="02"
        label="Lectura"
        title="Describir exige nombrar forma, centro y dispersión"
        visual={
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] p-4">
              <dt className="text-xs font-bold uppercase tracking-wide text-[#b42348]">Media</dt>
              <dd className="mt-1 font-mono text-2xl font-bold text-[var(--text)]">{mean.toFixed(2)}</dd>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-4">
              <dt className="text-xs font-bold uppercase tracking-wide text-[#2f7d4b]">Mediana</dt>
              <dd className="mt-1 font-mono text-2xl font-bold text-[var(--text)]">{median.toFixed(2)}</dd>
            </div>
          </dl>
        }
      >
        <p>Un resumen completo no es una lista de estadísticas. Es una selección argumentada de rasgos relevantes.</p>
        <p>Cuando la distribución es asimétrica, informá esa forma antes de reducirla a un promedio.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>
          La dispersión puede cambiar sin mover el centro; la asimetría puede separar media y mediana. Mirar la forma evita interpretar ambos fenómenos como si fueran lo mismo.
        </StoryConclusion>
        <TransferTask question="Construí dos distribuciones con medias parecidas pero dispersiones muy distintas. ¿Qué afirmación sería engañosa si informaras solo la media?" />
        <DataAttribution>
          Distribuciones sintéticas deterministas, transformadas para controlar dispersión y asimetría. No representan observaciones reales.
        </DataAttribution>
        <LessonNavigation currentStep={2} totalSteps={9} previousUrl="/lessons/descriptive-stats" nextUrl="/lessons/mean-deviation" />
      </section>
    </LessonStory>
  )
}
