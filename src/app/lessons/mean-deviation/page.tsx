'use client'

import { useState } from 'react'
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

const VALUES = [12, 16, 19, 22, 25, 28, 32]
const MEAN = d3.mean(VALUES) ?? 0
const STD = d3.deviation(VALUES) ?? 0

function DeviationPlot({ squared }: { squared: boolean }) {
  const width = 760
  const height = 260
  const x = d3.scaleLinear().domain([5, 35]).range([48, width - 28])
  const zeroLine = 120
  const scoreAxis = 215

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Valores y distancias respecto de la media">
      <line x1={48} x2={width - 28} y1={zeroLine} y2={zeroLine} stroke="var(--border-strong)" strokeDasharray="4 4" />
      <text x={48} y={zeroLine - 8} fontSize={10} fill="var(--text-muted)">desviación = 0</text>
      <line x1={48} x2={width - 28} y1={scoreAxis} y2={scoreAxis} stroke="var(--text)" />
      {d3.range(5, 36, 5).map((tick) => (
        <g key={tick} transform={`translate(${x(tick)},${scoreAxis})`}>
          <line y2={6} stroke="var(--text)" />
          <text y={22} textAnchor="middle" fontSize={11} fill="var(--text-muted)">{tick}</text>
        </g>
      ))}
      <line x1={x(MEAN)} x2={x(MEAN)} y1={28} y2={scoreAxis} stroke="#b42348" strokeWidth={3} strokeDasharray="6 4" />
      <text x={x(MEAN)} y={18} textAnchor="middle" fontSize={12} fontWeight={700} fill="#b42348">x̄ = {MEAN}</text>
      {VALUES.map((value) => {
        const deviation = value - MEAN
        const endY = squared
          ? zeroLine - (deviation ** 2) * 0.75
          : zeroLine - deviation * 7
        return (
          <g key={value}>
            <line x1={x(value)} x2={x(value)} y1={zeroLine} y2={endY} stroke="var(--accent)" strokeWidth={8} opacity={0.34} />
            <circle cx={x(value)} cy={endY} r={8} fill="var(--accent)" />
            <text
              x={x(value)}
              y={endY + (!squared && deviation < 0 ? 14 : -14)}
              textAnchor="middle"
              fontSize={10}
              fill="var(--text)"
            >
              {squared ? `${deviation ** 2}` : `${deviation > 0 ? '+' : ''}${deviation}`}
            </text>
          </g>
        )
      })}
      <text x={width / 2} y={height - 10} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
        {squared ? 'Todas las desviaciones al cuadrado quedan por encima de cero' : 'Desviaciones con signo: x − x̄'}
      </text>
    </svg>
  )
}

export default function MeanDeviationPage() {
  const [squared, setSquared] = useState(false)
  const signedSum = d3.sum(VALUES.map((value) => value - MEAN))

  return (
    <LessonStory
      eyebrow="Lección 1 · de la media al desvío"
      title="¿Qué significa estar lejos de la media?"
      lead="La media ubica el equilibrio. Para describir la variación necesitamos medir cuánto se aparta cada caso."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Predicción"
        title="La misma media puede esconder grupos muy distintos"
        visual={
          <PredictionPrompt
            question="Dos grupos tienen media 22. ¿Eso implica que sus valores se parecen?"
            options={['Sí, compartir media implica distribuciones parecidas', 'No, pueden tener dispersiones muy diferentes']}
            reveal="La media fija un centro, no la distancia de los casos a ese centro. Necesitamos una segunda medida."
          />
        }
      >
        <p>En este pequeño conjunto, los siete valores se equilibran exactamente en {MEAN}.</p>
        <p>Ahora vamos a conservar ese centro y mirar las distancias individuales.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="02"
        label="Datos"
        title="Cada caso aporta una desviación"
        visual={
          <div>
            <div className="overflow-x-auto"><DeviationPlot squared={squared} /></div>
            <button
              type="button"
              onClick={() => setSquared((value) => !value)}
              className="mt-3 rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-soft)]"
            >
              {squared ? 'Ver distancias absolutas' : 'Elevar desviaciones al cuadrado'}
            </button>
          </div>
        }
      >
        <p>Una desviación es <span className="font-mono">x − x̄</span>: negativa a la izquierda de la media y positiva a la derecha.</p>
        <p>La dirección ayuda a ubicar el caso; la magnitud indica qué tan lejos está.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="03"
        label="Conflicto"
        title="Las desviaciones con signo se cancelan"
        visual={
          <div className="rounded-2xl bg-[var(--surface-muted)] p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Suma de desviaciones</p>
            <p className="mt-2 font-mono text-4xl font-bold text-[var(--text)]">Σ(x − x̄) = {signedSum.toFixed(0)}</p>
          </div>
        }
      >
        <p>Promediar desviaciones con signo no sirve para medir dispersión: alrededor de la media siempre suman cero.</p>
        <p>Elevarlas al cuadrado evita la cancelación y da más peso a los casos lejanos.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="04"
        label="Herramienta"
        title="El desvío vuelve a las unidades originales"
        visual={
          <div className="rounded-2xl bg-[var(--text)] p-6 text-white">
            <p className="font-mono text-lg">s = √[Σ(x − x̄)² / (n − 1)]</p>
            <p className="mt-4 font-mono text-3xl font-bold">s = {STD.toFixed(2)}</p>
            <p className="mt-2 text-sm text-white/70">En las mismas unidades que los valores.</p>
          </div>
        }
      >
        <p>La varianza promedia desviaciones cuadradas. El desvío estándar toma su raíz para recuperar la escala original.</p>
        <p>No es una frontera que contenga necesariamente cierta cantidad de casos: resume una distancia típica bajo reglas específicas.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>
          La media describe dónde se equilibra una distribución; el desvío, cuán lejos suelen quedar sus valores. Ninguno reemplaza mirar la forma.
        </StoryConclusion>
        <TransferTask question="Inventá dos conjuntos de cinco valores con media 20, uno concentrado y otro disperso. ¿Cuál tendrá mayor desvío?" />
        <DataAttribution>
          Conjunto sintético de siete valores creado para mostrar desviaciones y cancelación algebraica. No representa observaciones reales.
        </DataAttribution>
        <LessonNavigation currentStep={2} totalSteps={9} previousUrl="/lessons/descriptive-stats-editable" nextUrl="/lessons/mean-deviation-editable" />
      </section>
    </LessonStory>
  )
}
