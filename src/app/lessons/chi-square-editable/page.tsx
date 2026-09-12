'use client'

import { useState } from 'react'
import jStat from 'jstat'
import LessonNavigation from '@/app/components/LessonNavigation'
import ChiSquareTable, {
  calculateChiSquare,
  type ChiCell,
} from '@/app/components/chi-square/ChiSquareTable'
import {
  DataAttribution,
  LessonStory,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const INITIAL: ChiCell[] = [
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

const rows = Array.from(new Set(INITIAL.map((cell) => cell.row)))
const NO_ASSOCIATION = INITIAL.map((cell) => ({
  ...cell,
  value: [20, 60, 80, 15, 5][rows.indexOf(cell.row)],
}))
const STRONG_ASSOCIATION = INITIAL.map((cell) => ({
  ...cell,
  value: (cell.col === 'Hombre' ? [5, 20, 100, 30, 5] : [35, 80, 20, 5, 5])[rows.indexOf(cell.row)],
}))
const buttonClass = 'rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--text)]'
const chiSquareDistribution = (jStat as unknown as {
  chisquare: { cdf: (value: number, degreesOfFreedom: number) => number }
}).chisquare

export default function ChiSquareLabPage() {
  const [data, setData] = useState(INITIAL)
  const [mode, setMode] = useState<'observed' | 'expected' | 'residual' | 'contribution'>('observed')
  const result = calculateChiSquare(data)
  const pValue = result.degreesOfFreedom > 0
    ? 1 - chiSquareDistribution.cdf(result.chiSquare, result.degreesOfFreedom)
    : 1

  const update = (row: string, col: string, value: number) => {
    setData((current) => current.map((cell) => cell.row === row && cell.col === col ? { ...cell, value } : cell))
  }

  return (
    <LessonStory
      eyebrow="Laboratorio · chi cuadrado"
      title="¿Qué hace crecer la evidencia contra la independencia?"
      lead="Editá las celdas, reconstruí el mundo esperado y observá cómo responden χ² y el valor p."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Laboratorio"
        title="Cambian los conteos; cambia la distancia a lo esperado"
        visual={
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <button type="button" className={buttonClass} onClick={() => { setData(INITIAL); setMode('observed') }}>Latinobarómetro</button>
              <button type="button" className={buttonClass} onClick={() => setData(NO_ASSOCIATION)}>Mismo patrón</button>
              <button type="button" className={buttonClass} onClick={() => setData(STRONG_ASSOCIATION)}>Contraste fuerte</button>
              <button type="button" className={buttonClass} onClick={() => setData((current) => current.map((cell) => ({ ...cell, value: cell.value * 3 })))}>Triplicar N</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--text-muted)]">N</p>
                <p className="mt-1 font-mono text-3xl font-bold text-[var(--accent)]">{result.total}</p>
              </div>
              <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--text-muted)]">χ²</p>
                <p className="mt-1 font-mono text-3xl font-bold text-[var(--accent)]">{result.chiSquare.toFixed(2)}</p>
              </div>
              <div className={`rounded-xl p-4 ${pValue < 0.05 ? 'bg-[var(--success-soft)]' : 'bg-[var(--danger-soft)]'}`}>
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--text-muted)]">Valor p</p>
                <p className="mt-1 font-mono text-3xl font-bold text-[var(--text)]">{pValue < 0.000001 ? '< 0,000001' : pValue.toFixed(4)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                ['observed', 'Editar observado'],
                ['expected', 'Ver esperado'],
                ['residual', 'Ver residuos'],
                ['contribution', 'Ver aportes'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  onClick={() => setMode(value)}
                  className={`${buttonClass} ${mode === value ? '!border-[var(--accent)] !bg-[var(--accent)] !text-white' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <ChiSquareTable data={data} mode={mode} editable onChange={update} />
          </div>
        }
      >
        <p>“Mismo patrón” da a hombres y mujeres la misma distribución de respuestas: observado y esperado coinciden, y χ² cae a cero.</p>
        <p>“Contraste fuerte” separa las distribuciones. Podés volver a “Editar observado” y localizar qué celdas empujan el resultado.</p>
      </StoryBeat>

      <StoryBeat
        number="02"
        label="La cantidad de casos"
        title="Las mismas proporciones pueden producir evidencia distinta"
        visual={
          <div className="space-y-4">
            <div className="h-4 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(100, result.chiSquare)}%` }} />
            </div>
            <p className="font-mono text-2xl font-bold text-[var(--accent)]">χ² = {result.chiSquare.toFixed(2)}</p>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">Triplicar todas las celdas conserva exactamente los porcentajes, pero triplica χ². Con más casos, una misma discrepancia proporcional es menos compatible con fluctuación muestral.</p>
          </div>
        }
      >
        <p>Probá “Mismo patrón”, luego “Contraste fuerte” y finalmente “Triplicar N”. El valor p responde tanto al tamaño de la diferencia como a la cantidad de información.</p>
        <p>Por eso un valor p pequeño no es una medida de importancia. Para interpretar el fenómeno hay que mirar porcentajes, residuos y tamaño del efecto.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>Chi cuadrado aumenta cuando las celdas se alejan de la independencia y también cuando el mismo patrón se sostiene con más observaciones.</StoryConclusion>
        <TransferTask question="Construí una tabla con una diferencia porcentual pequeña pero valor p muy bajo. ¿Qué tuviste que hacer con N?" />
        <DataAttribution>Los valores iniciales reproducen Latinobarómetro 2023, Uruguay. Toda edición, preset o multiplicación crea un escenario hipotético y no nuevos datos de encuesta. <a className="font-bold text-[var(--accent)] underline" href="https://www.latinobarometro.org/agregados" target="_blank" rel="noreferrer">Fuente y política de uso</a>. El cálculo didáctico no incorpora ponderadores ni diseño muestral complejo.</DataAttribution>
        <LessonNavigation currentStep={9} totalSteps={9} previousUrl="/lessons/chi-square" showNext={false} />
      </section>
    </LessonStory>
  )
}
