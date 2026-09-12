'use client'

import { useState } from 'react'
import LessonNavigation from '@/app/components/LessonNavigation'
import { ContingencyView, type Cell } from '@/app/components/tables/TableViews'
import {
  DataAttribution,
  LessonStory,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const INITIAL: Cell[] = [
  { row: 'Muy de acuerdo', col: 'Hombre', value: 41 },
  { row: 'Muy de acuerdo', col: 'Mujer', value: 99 },
  { row: 'De acuerdo', col: 'Hombre', value: 167 },
  { row: 'De acuerdo', col: 'Mujer', value: 259 },
  { row: 'En desacuerdo', col: 'Hombre', value: 291 },
  { row: 'En desacuerdo', col: 'Mujer', value: 238 },
  { row: 'Muy en desacuerdo', col: 'Hombre', value: 44 },
  { row: 'Muy en desacuerdo', col: 'Mujer', value: 37 },
  { row: 'No sabe / no contesta', col: 'Hombre', value: 13 },
  { row: 'No sabe / no contesta', col: 'Mujer', value: 11 },
]

const responses = Array.from(new Set(INITIAL.map((cell) => cell.row)))
const SAME_DISTRIBUTION = INITIAL.map((cell) => ({
  ...cell,
  value: [10, 30, 45, 10, 5][responses.indexOf(cell.row)],
}))
const STRONG_CONTRAST = INITIAL.map((cell) => ({
  ...cell,
  value: (cell.col === 'Hombre' ? [5, 15, 60, 15, 5] : [20, 45, 25, 5, 5])[responses.indexOf(cell.row)],
}))

const controlClass = 'rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--text)]'

export default function BivariateTablesLabPage() {
  const [data, setData] = useState(INITIAL)
  const [normalization, setNormalization] = useState<'count' | 'row' | 'column'>('count')

  const update = (row: string, col: string, value: number) => {
    setData((current) => current.map((cell) => cell.row === row && cell.col === col ? { ...cell, value } : cell))
  }

  return (
    <LessonStory
      eyebrow="Laboratorio · tablas bivariadas"
      title="Construí o borrá una asociación"
      lead="Partí de los datos de Uruguay, editá los diez conteos y alterná el denominador. El patrón no vive en una celda aislada, sino en la comparación entre distribuciones."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Laboratorio"
        title="Conteos para editar; porcentajes para comparar"
        visual={
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <button type="button" className={controlClass} onClick={() => { setData(INITIAL); setNormalization('count') }}>Restablecer</button>
              <button type="button" className={controlClass} onClick={() => setData(SAME_DISTRIBUTION)}>Sin diferencias</button>
              <button type="button" className={controlClass} onClick={() => setData(STRONG_CONTRAST)}>Contraste fuerte</button>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Forma de mostrar la tabla">
              {([
                ['count', 'Editar conteos'],
                ['row', 'Comparar % por fila'],
                ['column', 'Comparar % por columna'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={normalization === value}
                  onClick={() => setNormalization(value)}
                  className={`${controlClass} ${normalization === value ? '!border-[var(--accent)] !bg-[var(--accent)] !text-white' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <ContingencyView data={data} normalization={normalization} editable onChange={update} rowLabel="Respuesta" />
          </div>
        }
      >
        <p>Empezá en “Editar conteos”. Luego compará porcentajes por columna: cada barra representa a hombres o mujeres y suma 100%.</p>
        <p>El preset “Sin diferencias” hace idénticas las composiciones. “Contraste fuerte” las separa deliberadamente.</p>
      </StoryBeat>

      <StoryBeat
        number="02"
        label="Lectura"
        title="Una diferencia visible no implica causalidad"
        visual={
          <div className="rounded-2xl bg-[var(--accent-soft)] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Chequeo rápido</p>
            <p className="mt-3 text-xl font-semibold text-[var(--text)]">¿Las barras tienen la misma composición?</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">Si no, hay asociación descriptiva en esta tabla. Para explicar por qué existe hacen falta diseño, teoría y evidencia adicional.</p>
          </div>
        }
      >
        <p>La tabla permite describir diferencias entre grupos. No prueba que una variable produzca cambios en la otra.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>La asociación aparece cuando las distribuciones condicionales no son iguales. Comparalas usando un denominador coherente con la pregunta.</StoryConclusion>
        <TransferTask question="Creá columnas con totales muy distintos pero exactamente los mismos porcentajes de respuesta." />
        <DataAttribution>Los valores iniciales reproducen la tabulación de Latinobarómetro 2023 para Uruguay. Al editar o elegir un preset, el resultado pasa a ser hipotético. <a className="font-bold text-[var(--accent)] underline" href="https://www.latinobarometro.org/agregados" target="_blank" rel="noreferrer">Fuente y política de uso</a>. No se redistribuyen microdatos.</DataAttribution>
        <LessonNavigation currentStep={3} totalSteps={9} previousUrl="/lessons/bivariate-tables" nextUrl="/lessons/bivariate-tables-editable-2" />
      </section>
    </LessonStory>
  )
}
