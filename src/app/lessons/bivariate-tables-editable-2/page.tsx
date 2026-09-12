'use client'

import { useState } from 'react'
import LessonNavigation from '@/app/components/LessonNavigation'
import { calculateCells, ContingencyView, type Cell } from '@/app/components/tables/TableViews'
import {
  DataAttribution,
  LessonStory,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const INITIAL: Cell[] = [
  { row: 'Grupo A', col: 'Respuesta 1', value: 18 },
  { row: 'Grupo A', col: 'Respuesta 2', value: 22 },
  { row: 'Grupo B', col: 'Respuesta 1', value: 10 },
  { row: 'Grupo B', col: 'Respuesta 2', value: 30 },
]

const inputClass = 'min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm'
const buttonClass = 'rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-bold text-[var(--text)]'

export default function AdvancedTablesLabPage() {
  const [data, setData] = useState(INITIAL)
  const [normalization, setNormalization] = useState<'count' | 'row' | 'column'>('count')
  const [newRow, setNewRow] = useState('')
  const [newCol, setNewCol] = useState('')
  const { rows, cols } = calculateCells(data)

  const addRow = () => {
    const label = newRow.trim()
    if (!label || rows.includes(label)) return
    setData((current) => [...current, ...cols.map((col) => ({ row: label, col, value: 0 }))])
    setNewRow('')
  }

  const addColumn = () => {
    const label = newCol.trim()
    if (!label || cols.includes(label)) return
    setData((current) => [...current, ...rows.map((row) => ({ row, col: label, value: 0 }))])
    setNewCol('')
  }

  const update = (row: string, col: string, value: number) => {
    setData((current) => current.map((cell) => cell.row === row && cell.col === col ? { ...cell, value } : cell))
  }

  return (
    <LessonStory
      eyebrow="Laboratorio abierto · tablas"
      title="Diseñá una tabla para tu propia pregunta"
      lead="Definí las categorías, completá los conteos y elegí qué grupos deben sumar 100%. El objetivo ya no es operar una tabla dada, sino construir una comparación válida."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Diseño"
        title="Las categorías vienen antes que los porcentajes"
        visual={
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-[var(--border)] p-4">
                <label htmlFor="new-row" className="text-sm font-bold text-[var(--text)]">Nueva fila</label>
                <div className="mt-2 flex gap-2">
                  <input id="new-row" className={inputClass} value={newRow} onChange={(event) => setNewRow(event.target.value)} placeholder="Ej.: Grupo C" />
                  <button type="button" className={buttonClass} onClick={addRow}>Agregar</button>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-[var(--text-muted)]">
                  {rows.map((row) => (
                    <li key={row} className="flex items-center justify-between gap-2">
                      <span>{row}</span>
                      <button type="button" disabled={rows.length === 1} onClick={() => setData((current) => current.filter((cell) => cell.row !== row))} className="text-xs font-bold text-[var(--danger)] disabled:opacity-40">Quitar</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4">
                <label htmlFor="new-column" className="text-sm font-bold text-[var(--text)]">Nueva columna</label>
                <div className="mt-2 flex gap-2">
                  <input id="new-column" className={inputClass} value={newCol} onChange={(event) => setNewCol(event.target.value)} placeholder="Ej.: Respuesta 3" />
                  <button type="button" className={buttonClass} onClick={addColumn}>Agregar</button>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-[var(--text-muted)]">
                  {cols.map((col) => (
                    <li key={col} className="flex items-center justify-between gap-2">
                      <span>{col}</span>
                      <button type="button" disabled={cols.length === 1} onClick={() => setData((current) => current.filter((cell) => cell.col !== col))} className="text-xs font-bold text-[var(--danger)] disabled:opacity-40">Quitar</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                ['count', 'Editar conteos'],
                ['row', '% por fila'],
                ['column', '% por columna'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={normalization === value}
                  onClick={() => setNormalization(value)}
                  className={`${buttonClass} ${normalization === value ? '!border-[var(--accent)] !bg-[var(--accent)] !text-white' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <ContingencyView data={data} normalization={normalization} editable onChange={update} />
          </div>
        }
      >
        <p>Las filas y columnas deben ser categorías mutuamente excluyentes y comprensibles. Un caso tiene que caer en una sola celda.</p>
        <p>Después cargá los conteos y recién entonces decidí qué porcentaje responde tu pregunta.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>Una buena tabla no empieza por una fórmula: empieza por variables bien definidas, categorías claras y una pregunta que identifica el denominador.</StoryConclusion>
        <TransferTask question="Diseñá una tabla para comparar una respuesta categórica entre dos grupos. Escribí la frase “entre quienes…” antes de elegir la normalización." />
        <DataAttribution>Laboratorio vacío y datos iniciales sintéticos. Cualquier dato cargado permanece solo en el navegador durante esta sesión.</DataAttribution>
        <LessonNavigation currentStep={3} totalSteps={9} previousUrl="/lessons/bivariate-tables-editable" nextUrl="/lessons/correlation" />
      </section>
    </LessonStory>
  )
}
