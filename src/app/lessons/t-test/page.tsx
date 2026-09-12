'use client'

import * as d3 from 'd3'
import jStat from 'jstat'
import LessonNavigation from '@/app/components/LessonNavigation'
import TTestWorkbench from '@/app/components/t-test/TTestWorkbench'
import {
  DataAttribution,
  LessonStory,
  PredictionPrompt,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'
import NarrativeSection from '@/app/components/narrative/NarrativeSection'

interface Person {
  id: number
  group: 'A' | 'B'
  satisfaction: number
}

// Datos sintéticos para mostrar el funcionamiento de la prueba.
const sampleData: Person[] = [
  ...Array.from({ length: 30 }, (_, i) => ({
    id: i,
    group: 'A' as const,
    satisfaction: [
      22, 19, 25, 20, 23, 18, 24, 21, 26, 20,
      23, 19, 22, 21, 25, 17, 24, 20, 23, 21,
      19, 22, 20, 24, 21, 23, 18, 25, 20, 22,
    ][i],
  })),
  ...Array.from({ length: 30 }, (_, i) => ({
    id: i + 30,
    group: 'B' as const,
    satisfaction: [
      24, 21, 26, 22, 25, 20, 27, 23, 25, 22,
      26, 21, 24, 23, 28, 19, 25, 22, 26, 23,
      21, 24, 22, 27, 23, 25, 20, 26, 22, 24,
    ][i],
  })),
]

export default function TTestPage() {
  const groupA = sampleData.filter((person) => person.group === 'A')
  const groupB = sampleData.filter((person) => person.group === 'B')

  const meanA = d3.mean(groupA, (person) => person.satisfaction) ?? 0
  const meanB = d3.mean(groupB, (person) => person.satisfaction) ?? 0
  const stdA = d3.deviation(groupA, (person) => person.satisfaction) ?? 0
  const stdB = d3.deviation(groupB, (person) => person.satisfaction) ?? 0
  const nA = groupA.length
  const nB = groupB.length

  const pooledStd = Math.sqrt(
    ((nA - 1) * stdA ** 2 + (nB - 1) * stdB ** 2) / (nA + nB - 2),
  )
  const standardError = pooledStd * Math.sqrt(1 / nA + 1 / nB)
  const meanDiff = meanB - meanA
  const tStat = meanDiff / standardError
  const df = nA + nB - 2
  // @ts-expect-error -- Las definiciones de jStat no incluyen correctamente studentt.cdf.
  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), df))

  const workbench = (
    <TTestWorkbench
      groupA={{
        label: 'Grupo A',
        values: groupA.map((person) => person.satisfaction),
        mean: meanA,
        std: stdA,
        color: '#4b00f9',
        sampleSize: nA,
      }}
      groupB={{
        label: 'Grupo B',
        values: groupB.map((person) => person.satisfaction),
        mean: meanB,
        std: stdB,
        color: '#2f7d4b',
        sampleSize: nB,
      }}
      results={{ meanDiff, tStat, pValue, df }}
    />
  )

  return (
    <LessonStory
      eyebrow="Lección 7 · prueba t"
      title="¿Una diferencia de medias alcanza para hablar de grupos distintos?"
      lead="La diferencia observada importa, pero no viaja sola: necesitamos leerla junto con la variabilidad y el tamaño de las muestras."
    >
      <StoryBeat
        number="01"
        label="Predicción"
        title="Dos medias distintas no resuelven la pregunta"
        visual={
          <PredictionPrompt
            question={`El grupo A tiene media ${meanA.toFixed(2)} y el B, ${meanB.toFixed(2)}. ¿Eso demuestra una diferencia poblacional?`}
            options={[
              'Sí: las medias muestrales son distintas',
              'No: falta comparar la diferencia con su variabilidad esperable',
            ]}
            reveal="En muestras reales casi nunca obtenemos medias idénticas. La pregunta inferencial es cuán grande resulta la diferencia respecto del error estándar."
          />
        }
      >
        <p>Tenemos dos grupos independientes de {nA} observaciones y una diferencia observada de <strong className="text-[var(--text)]">{meanDiff.toFixed(2)} puntos</strong>.</p>
        <p>Antes de decidir, necesitamos mirar cuánto se superponen sus distribuciones.</p>
      </StoryBeat>

      <StoryBeat
        number="02"
        label="Datos"
        title="Centro y dispersión cuentan partes distintas de la historia"
        visual={
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Grupo A', meanA, stdA, '#4b00f9'],
              ['Grupo B', meanB, stdB, '#2f7d4b'],
            ].map(([label, mean, std, color]) => (
              <article key={String(label)} className="rounded-2xl bg-[var(--surface-muted)] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: String(color) }}>{label}</p>
                <p className="mt-3 font-mono text-2xl font-bold text-[var(--text)]">x̄ = {Number(mean).toFixed(2)}</p>
                <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">s = {Number(std).toFixed(2)} · n = 30</p>
              </article>
            ))}
          </div>
        }
      >
        <p>La media ubica el centro de cada grupo. El desvío muestra cuánto varían las observaciones dentro de cada uno.</p>
        <p>Si la dispersión es grande, una misma diferencia de medias resulta menos excepcional.</p>
      </StoryBeat>

      <NarrativeSection className="border-b border-[var(--border)] py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-[var(--accent)]">03 · Comparación</p>
          <h2 className="mt-2 text-3xl text-[var(--text)]">Separá y solapá los histogramas</h2>
          <p className="mt-4 text-[var(--text-muted)]">
            Usá el selector dentro del bloque. El panel mantiene visualización, estadístico y valor p juntos para que puedas relacionarlos sin perder contexto.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-5xl">{workbench}</div>
      </NarrativeSection>

      <StoryBeat
        number="04"
        label="Herramienta"
        title="t expresa la diferencia en unidades de error estándar"
        visual={
          <div className="space-y-4">
            <div className="rounded-2xl bg-[var(--text)] p-5 text-white">
              <p className="font-mono text-lg">t = (x̄<sub>B</sub> − x̄<sub>A</sub>) / EE</p>
              <p className="mt-3 font-mono text-sm text-white/75">{meanDiff.toFixed(2)} / {standardError.toFixed(2)} = {tStat.toFixed(3)}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                <dt className="text-[var(--text-muted)]">Grados de libertad</dt>
                <dd className="mt-1 font-mono font-bold text-[var(--text)]">{df}</dd>
              </div>
              <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                <dt className="text-[var(--text-muted)]">Valor p, dos colas</dt>
                <dd className="mt-1 font-mono font-bold text-[var(--text)]">{pValue.toFixed(4)}</dd>
              </div>
            </dl>
          </div>
        }
      >
        <p>Bajo H₀, la diferencia poblacional es cero. La distribución t indica qué valores del estadístico serían frecuentes si esa hipótesis y los supuestos del modelo fueran razonables.</p>
        <p>Acá usamos la versión con varianza combinada: supone observaciones independientes y varianzas poblacionales similares.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>
          Con p = {pValue.toFixed(4)}, estos datos sintéticos {pValue < 0.05 ? 'resultan poco compatibles' : 'siguen siendo compatibles'} con H₀ al usar α = 0,05. Esto no mide la importancia práctica de la diferencia ni demuestra causalidad.
        </StoryConclusion>
        <TransferTask question="¿Qué cambiaría si fueran mediciones antes y después sobre las mismas personas?">
          <p>Las observaciones dejarían de ser independientes entre grupos: habría que analizar las diferencias dentro de cada persona con una prueba t pareada.</p>
        </TransferTask>
        <DataAttribution>
          Las 60 puntuaciones son sintéticas y fueron construidas para esta demostración. No son observaciones de Latinobarómetro ni permiten conclusiones sobre grupos sociales reales.
        </DataAttribution>
        <LessonNavigation
          currentStep={8}
          totalSteps={9}
          previousUrl="/lessons/randomization-inference"
          nextUrl="/lessons/t-test-editable"
        />
      </section>
    </LessonStory>
  )
}
