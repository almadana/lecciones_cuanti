'use client'

import { useMemo, useState } from 'react'
import * as d3 from 'd3'
import LessonNavigation from '@/app/components/LessonNavigation'
import {
  DataAttribution,
  LessonStory,
  PredictionPrompt,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const SYMMETRIC_SHAPE = [
  -2, -1.7, -1.45, -1.25, -1.05, -0.88, -0.72, -0.57, -0.43, -0.3, -0.18, -0.06,
  0.06, 0.18, 0.3, 0.43, 0.57, 0.72, 0.88, 1.05, 1.25, 1.45, 1.7, 2,
]
const SHAPE_STD = d3.deviation(SYMMETRIC_SHAPE) ?? 1
const BASE_DATA = SYMMETRIC_SHAPE.map((value) => 7.2 + (value / SHAPE_STD) * 0.85)
const ATYPICAL_VALUES = [12, 12]
const WIDTH = 800
const HEIGHT = 410
const MARGIN = { top: 46, right: 24, bottom: 56, left: 48 }
const DOMAIN: [number, number] = [3, 12.5]

function DistributionPlot({
  data,
  showQuartiles,
}: {
  data: number[]
  showQuartiles: boolean
}) {
  const mean = d3.mean(data) ?? 0
  const median = d3.median(data) ?? 0
  const q1 = d3.quantile(data, 0.25) ?? 0
  const q3 = d3.quantile(data, 0.75) ?? 0
  const bins = d3.bin().domain(DOMAIN).thresholds(12)(data)
  const innerWidth = WIDTH - MARGIN.left - MARGIN.right
  const histogramHeight = 235
  const x = d3.scaleLinear().domain(DOMAIN).range([MARGIN.left, WIDTH - MARGIN.right])
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (bin) => bin.length) ?? 1])
    .nice()
    .range([MARGIN.top + histogramHeight, MARGIN.top])
  const ticks = [4, 5, 6, 7, 8, 9, 10, 11, 12]
  const boxY = 344

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label="Distribución sintética de horas de sueño con media, mediana y cuartiles"
    >
      {showQuartiles ? (
        <rect
          x={x(q1)}
          y={MARGIN.top}
          width={x(q3) - x(q1)}
          height={histogramHeight}
          fill="var(--color-verde-seleccion)"
          opacity={0.35}
        />
      ) : null}

      {bins.map((bin, index) => (
        <rect
          key={`${bin.x0}-${index}`}
          x={x(bin.x0 ?? DOMAIN[0]) + 1}
          y={y(bin.length)}
          width={Math.max(0, x(bin.x1 ?? DOMAIN[0]) - x(bin.x0 ?? DOMAIN[0]) - 2)}
          height={MARGIN.top + histogramHeight - y(bin.length)}
          rx={3}
          fill="var(--accent)"
          opacity={0.72}
        />
      ))}

      <line
        x1={MARGIN.left}
        x2={WIDTH - MARGIN.right}
        y1={MARGIN.top + histogramHeight}
        y2={MARGIN.top + histogramHeight}
        stroke="var(--text)"
      />
      {ticks.map((tick) => (
        <g key={tick} transform={`translate(${x(tick)},${MARGIN.top + histogramHeight})`}>
          <line y2={6} stroke="var(--text)" />
          <text y={22} textAnchor="middle" fontSize={11} fill="var(--text-muted)">{tick}</text>
        </g>
      ))}
      <text x={MARGIN.left + innerWidth / 2} y={MARGIN.top + histogramHeight + 43} textAnchor="middle" fontSize={12} fill="var(--text-muted)">
        Horas de sueño
      </text>

      {[
        { value: mean, label: `Media ${mean.toFixed(2)}`, color: '#b42348', y: 18 },
        { value: median, label: `Mediana ${median.toFixed(2)}`, color: '#2f7d4b', y: 34 },
      ].map((marker) => (
        <g key={marker.label}>
          <line
            x1={x(marker.value)}
            x2={x(marker.value)}
            y1={MARGIN.top}
            y2={MARGIN.top + histogramHeight}
            stroke={marker.color}
            strokeWidth={2.5}
            strokeDasharray="6 4"
          />
          <text x={x(marker.value)} y={marker.y} textAnchor="middle" fontSize={11} fontWeight={700} fill={marker.color}>
            {marker.label}
          </text>
        </g>
      ))}

      {showQuartiles ? (
        <g>
          <line x1={x(d3.min(data) ?? 0)} x2={x(q1)} y1={boxY} y2={boxY} stroke="var(--accent)" />
          <rect x={x(q1)} y={boxY - 18} width={x(q3) - x(q1)} height={36} fill="var(--color-verde-seleccion)" stroke="var(--accent)" />
          <line x1={x(median)} x2={x(median)} y1={boxY - 18} y2={boxY + 18} stroke="var(--accent)" strokeWidth={3} />
          <line x1={x(q3)} x2={x(d3.max(data) ?? 0)} y1={boxY} y2={boxY} stroke="var(--accent)" />
          {[d3.min(data) ?? 0, d3.max(data) ?? 0].map((value) => (
            <line key={value} x1={x(value)} x2={x(value)} y1={boxY - 10} y2={boxY + 10} stroke="var(--accent)" />
          ))}
          <text x={MARGIN.left} y={boxY + 42} fontSize={11} fill="var(--text-muted)">50% central entre Q1 y Q3</text>
        </g>
      ) : null}
    </svg>
  )
}

export default function DescriptiveStatsPage() {
  const [showAtypical, setShowAtypical] = useState(false)
  const [showQuartiles, setShowQuartiles] = useState(false)
  const data = useMemo(
    () => (showAtypical ? [...BASE_DATA, ...ATYPICAL_VALUES] : BASE_DATA),
    [showAtypical],
  )
  const mean = d3.mean(data) ?? 0
  const median = d3.median(data) ?? 0
  const std = d3.deviation(data) ?? 0
  const baseMean = d3.mean(BASE_DATA) ?? 0
  const baseMedian = d3.median(BASE_DATA) ?? 0

  return (
    <LessonStory
      eyebrow="Lección 1 · estadísticas descriptivas"
      title="¿Cómo resumimos una distribución sin borrar su forma?"
      lead="Un único número puede orientar, pero también esconder. Vamos a mirar primero los datos y elegir el resumen después."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Predicción"
        title="¿Dónde está el centro de una noche típica?"
        visual={
          <PredictionPrompt
            question="Si la mayoría duerme cerca de 7 horas, pero aparecen algunas noches de 12 horas, ¿qué medida cambiará más?"
            options={['La media', 'La mediana', 'Cambiarán exactamente igual']}
            reveal="La media incorpora la distancia de cada valor y se desplaza hacia los extremos. La mediana depende sobre todo del orden, por lo que suele moverse menos."
          />
        }
      >
        <p>Centro no significa siempre lo mismo. Podemos buscar el punto de equilibrio de los valores o la observación que deja la mitad a cada lado.</p>
        <p>La forma de la distribución decidirá cuánto se parecen esas respuestas.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="02"
        label="Datos"
        title="Primero mirá la distribución"
        visual={
          <div>
            <div className="overflow-x-auto">
              <DistributionPlot data={data} showQuartiles={showQuartiles} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
              <button
                type="button"
                aria-pressed={showAtypical}
                onClick={() => setShowAtypical((value) => !value)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  showAtypical
                    ? 'bg-[var(--danger)] text-white'
                    : 'border border-[var(--border-strong)] text-[var(--text)] hover:bg-[var(--accent-soft)]'
                }`}
              >
                {showAtypical ? 'Quitar noches atípicas' : 'Agregar dos noches de 12 h'}
              </button>
              <button
                type="button"
                aria-pressed={showQuartiles}
                onClick={() => setShowQuartiles((value) => !value)}
                className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-soft)]"
              >
                {showQuartiles ? 'Ocultar cuartiles' : 'Mostrar cuartiles'}
              </button>
            </div>
          </div>
        }
      >
        <p>Los datos sintéticos representan horas de sueño. La distribución inicial es aproximadamente simétrica alrededor de 7,2 horas.</p>
        <p>Agregá los valores atípicos y observá las líneas de media y mediana antes de mirar sus números.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="03"
        label="Conflicto"
        title="La media escucha la distancia; la mediana, el orden"
        visual={
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-[var(--border)] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b42348]">Media</p>
              <p className="mt-2 font-mono text-2xl font-bold text-[var(--text)]">{mean.toFixed(2)} h</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Cambio: {(mean - baseMean).toFixed(2)} h</p>
            </article>
            <article className="rounded-2xl border border-[var(--border)] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f7d4b]">Mediana</p>
              <p className="mt-2 font-mono text-2xl font-bold text-[var(--text)]">{median.toFixed(2)} h</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Cambio: {(median - baseMedian).toFixed(2)} h</p>
            </article>
          </div>
        }
      >
        <p>En una distribución simétrica, media y mediana suelen quedar cerca. Con asimetría o valores extremos pueden contar historias distintas.</p>
        <p>La moda responde otra pregunta: cuál es el valor o categoría más frecuente. En mediciones continuas depende mucho de cómo agrupemos los datos.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="04"
        label="Herramienta"
        title="El centro no alcanza: también necesitamos dispersión"
        visual={
          <div className="space-y-4">
            <div className="rounded-2xl bg-[var(--text)] p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-verde-claro)]">Desvío estándar</p>
              <p className="mt-2 font-mono text-3xl font-bold">s = {std.toFixed(2)} h</p>
              <p className="mt-2 text-sm text-white/70">Distancia típica de los valores respecto de la media.</p>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              Los cuartiles dividen los datos ordenados en cuatro partes. El tramo Q1–Q3 contiene el 50% central y es menos sensible a valores extremos.
            </p>
          </div>
        }
      >
        <p>Dos grupos pueden compartir la misma media y, sin embargo, tener distribuciones muy distintas. Por eso centro y dispersión deben leerse juntos.</p>
        <p>Activá los cuartiles para relacionar el histograma con el diagrama de caja.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>
          No existe un resumen universalmente mejor. La media y el desvío aprovechan las distancias entre valores;
          la mediana y el rango intercuartílico resisten mejor la asimetría y los extremos.
        </StoryConclusion>
        <TransferTask question="¿Cómo resumirías los ingresos de un grupo donde unas pocas personas ganan muchísimo más que el resto?">
          <p>Elegí una medida de centro y otra de dispersión. Justificá la elección mirando la forma esperable de la distribución.</p>
        </TransferTask>
        <DataAttribution>
          Datos sintéticos construidos con cuantiles de una distribución normal de media 7,2 y desvío 0,85.
          Las dos noches de 12 horas son casos didácticos agregados, no observaciones reales.
        </DataAttribution>
        <LessonNavigation
          currentStep={2}
          totalSteps={9}
          previousUrl="/lessons/introduction"
          nextUrl="/lessons/descriptive-stats-editable"
        />
      </section>
    </LessonStory>
  )
}
