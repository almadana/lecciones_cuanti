'use client'

import { useState } from 'react'
import LessonNavigation from '@/app/components/LessonNavigation'
import { FrequencyView, type FrequencyRow } from '@/app/components/tables/TableViews'
import {
  DataAttribution,
  LessonStory,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const INITIAL: FrequencyRow[] = [
  { category: 'Muy de acuerdo', value: 140 },
  { category: 'De acuerdo', value: 426 },
  { category: 'En desacuerdo', value: 529 },
  { category: 'Muy en desacuerdo', value: 81 },
  { category: 'No sabe / no contesta', value: 24 },
]

const buttonClass = 'rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--text)]'

export default function UnivariateTablesLabPage() {
  const [data, setData] = useState(INITIAL)
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const largest = [...data].sort((a, b) => b.value - a.value)[0]

  const update = (index: number, value: number) => {
    setData((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, value } : item))
  }

  return (
    <LessonStory
      eyebrow="Laboratorio · tablas univariadas"
      title="Mové un conteo: cambian todos los porcentajes"
      lead="Editá las frecuencias y observá que cada porcentaje depende tanto de su fila como del nuevo total."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Exploración"
        title="La tabla se recalcula en conjunto"
        visual={
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <button type="button" className={buttonClass} onClick={() => setData(INITIAL)}>Restablecer</button>
              <button type="button" className={buttonClass} onClick={() => setData(INITIAL.map((item) => ({ ...item, value: 25 })))}>Todas iguales</button>
              <button type="button" className={buttonClass} onClick={() => setData(INITIAL.map((item, index) => ({ ...item, value: index === 3 ? 80 : 5 })))}>Una dominante</button>
            </div>
            <FrequencyView data={data} editable onChange={update} />
          </div>
        }
      >
        <p>Cambiá una celda. Su numerador cambia, pero también N: por eso se actualizan todas las filas.</p>
        <p>El total actual es <strong>{total}</strong>. La moda es <strong>{largest?.category ?? '—'}</strong>.</p>
      </StoryBeat>

      <StoryBeat
        number="02"
        label="Conflicto"
        title="Mismo conteo, distinto porcentaje"
        visual={
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--text-muted)]">20 casos sobre 40</p>
              <p className="mt-1 font-mono text-3xl font-bold text-[var(--accent)]">50%</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--text-muted)]">20 casos sobre 200</p>
              <p className="mt-1 font-mono text-3xl font-bold text-[var(--accent)]">10%</p>
            </div>
          </div>
        }
      >
        <p>Un conteo no tiene una interpretación relativa estable. Para comparar, necesitás saber sobre cuántos casos fue calculado.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>
          Modificar una frecuencia transforma la distribución completa porque cambia el numerador de una fila y el denominador común.
        </StoryConclusion>
        <TransferTask question="Construí dos tablas con la misma moda pero porcentajes muy diferentes. ¿Qué tuviste que cambiar?" />
        <DataAttribution>Los valores iniciales reproducen la tabulación de Latinobarómetro 2023 para Uruguay (N = 1.200) usada en la lección anterior. Al editar una celda, el resultado pasa a ser un escenario hipotético. <a className="font-bold text-[var(--accent)] underline" href="https://www.latinobarometro.org/agregados" target="_blank" rel="noreferrer">Fuente y política de uso</a>. No se redistribuyen microdatos.</DataAttribution>
        <LessonNavigation currentStep={3} totalSteps={9} previousUrl="/lessons/univariate-tables" nextUrl="/lessons/bivariate-tables" />
      </section>
    </LessonStory>
  )
}
