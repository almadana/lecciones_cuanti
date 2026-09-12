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
  PredictionPrompt,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const DATA: ChiCell[] = [
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

const chiSquareDistribution = (jStat as unknown as {
  chisquare: { cdf: (value: number, degreesOfFreedom: number) => number }
}).chisquare
const RESULT = calculateChiSquare(DATA)
const P_VALUE = 1 - chiSquareDistribution.cdf(RESULT.chiSquare, RESULT.degreesOfFreedom)

export default function ChiSquarePage() {
  const [mode, setMode] = useState<'observed' | 'expected' | 'residual' | 'contribution'>('observed')

  return (
    <LessonStory
      eyebrow="Lección 8 · chi cuadrado"
      title="¿Las diferencias entre hombres y mujeres son solo fluctuación muestral?"
      lead="Ya vimos porcentajes distintos frente a la misma afirmación. Chi cuadrado enfrenta la tabla observada con una tabla hipotética donde el sexo y la respuesta no están asociados."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="La diferencia observada"
        title="La tabla vuelve, pero la pregunta cambia"
        visual={<ChiSquareTable data={DATA} mode="observed" />}
      >
        <p>Entre los hombres, el 37,4% expresó algún grado de acuerdo. Entre las mujeres, lo hizo el 55,6%. La diferencia está en esta muestra de Uruguay.</p>
        <p>Ahora queremos saber cuán extraña sería una tabla así si, en la población, el patrón de respuestas no dependiera del sexo registrado en la encuesta.</p>
      </StoryBeat>

      <StoryBeat
        number="02"
        label="Un mundo sin asociación"
        title="Los márgenes permanecen; las combinaciones cambian"
        visual={
          <PredictionPrompt
            question="Hay 140 respuestas “Muy de acuerdo” y 644 mujeres sobre 1.200 casos. Bajo independencia, ¿cuántas mujeres esperaríamos en esa celda?"
            options={['Alrededor de 75', 'Exactamente 99', 'Alrededor de 140']}
            reveal="La proporción de mujeres es 644 / 1.200. Aplicada a las 140 respuestas “Muy de acuerdo”, produce 140 × 644 / 1.200 = 75,1 casos esperados."
          />
        }
      >
        <p>Independencia no significa repartir cada fila mitad y mitad. Hay más mujeres que hombres en la muestra, así que esa diferencia se conserva.</p>
        <p>El valor esperado de cada celda combina su total de fila con su total de columna: E = total de fila × total de columna / N.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="03"
        label="Observado y esperado"
        title="Cada celda deja una discrepancia"
        visual={
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {([
                ['observed', 'Observado'],
                ['expected', 'Esperado'],
                ['residual', 'Residuo'],
                ['contribution', 'Aporte a χ²'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  onClick={() => setMode(value)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold ${mode === value ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <ChiSquareTable data={DATA} mode={mode} />
            {mode === 'residual' ? (
              <p className="text-xs text-[var(--text-muted)]">Verde: más casos que los esperados. Rosa: menos. La intensidad aumenta con la discrepancia estandarizada.</p>
            ) : null}
          </div>
        }
      >
        <p>En “Muy de acuerdo” observamos 99 mujeres donde la independencia predecía 75,1; entre los hombres observamos 41 donde esperaba 64,9.</p>
        <p>Los residuos dividen esas diferencias por el tamaño esperado de la celda. “Aporte a χ²” eleva cada discrepancia estandarizada al cuadrado: así ninguna se cancela y podemos sumarlas.</p>
      </StoryBeat>

      <StoryBeat
        number="04"
        label="La tabla completa"
        title="Una sola medida reúne todas las discrepancias"
        visual={
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-[var(--surface-muted)] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">χ²</p>
              <p className="mt-1 font-mono text-3xl font-bold text-[var(--accent)]">{RESULT.chiSquare.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-[var(--surface-muted)] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Grados de libertad</p>
              <p className="mt-1 font-mono text-3xl font-bold text-[var(--accent)]">{RESULT.degreesOfFreedom}</p>
            </div>
            <div className="rounded-xl bg-[var(--success-soft)] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--success)]">Valor p</p>
              <p className="mt-1 font-mono text-3xl font-bold text-[var(--success)]">&lt; 0,000001</p>
            </div>
          </div>
        }
      >
        <p>La suma da χ² = {RESULT.chiSquare.toFixed(2)}. Bajo el modelo de independencia, una discrepancia igual o mayor tendría una probabilidad extremadamente pequeña (p = {P_VALUE.toExponential(2)}).</p>
        <p>Hay evidencia contra la independencia en este análisis. Eso no mide la importancia psicológica de la diferencia, no demuestra causalidad y no identifica por sí solo qué procesos sociales producen el patrón.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>Chi cuadrado pregunta cuánto se aleja la tabla observada de la que esperaríamos bajo independencia. El resultado global necesita volver a las celdas para entender dónde está el patrón.</StoryConclusion>
        <TransferTask question="¿Qué celdas explican la mayor parte de χ²? Describí su dirección comparando observado y esperado, sin usar lenguaje causal." />
        <DataAttribution>Latinobarómetro 2023, Uruguay (N = 1.200). Tabulación provista por el usuario de la afirmación “Los hombres tienen grandes ventajas sobre las mujeres a la hora de comenzar un negocio”. <a className="font-bold text-[var(--accent)] underline" href="https://www.latinobarometro.org/agregados" target="_blank" rel="noreferrer">Fuente y política de uso</a>. “No sabe / no contesta” se conserva como categoría. La prueba pedagógica trata los casos como observaciones independientes simples y no incorpora ponderadores ni el diseño complejo de la encuesta; no debe sustituir un análisis de encuesta completo.</DataAttribution>
        <LessonNavigation currentStep={9} totalSteps={9} previousUrl="/lessons/t-test-editable-2" nextUrl="/lessons/chi-square-editable" />
      </section>
    </LessonStory>
  )
}
