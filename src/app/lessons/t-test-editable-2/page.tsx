'use client'

import { useState } from 'react'
import jStat from 'jstat'
import LessonNavigation from '@/app/components/LessonNavigation'
import TTestWorkbench from '@/app/components/t-test/TTestWorkbench'
import {
  calculateIndependentT,
  generateGroups,
} from '@/app/components/t-test/syntheticSamples'
import {
  DataAttribution,
  LessonStory,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const studentT = (jStat as unknown as {
  studentt: { cdf: (value: number, degreesOfFreedom: number) => number }
}).studentt

export default function TTestEvidenceLabPage() {
  const [maleMean, setMaleMean] = useState(21.5)
  const [femaleMean, setFemaleMean] = useState(23.1)
  const [commonStd, setCommonStd] = useState(5.8)
  const [sampleSize, setSampleSize] = useState(30)
  const [seed, setSeed] = useState(303)
  const [data, setData] = useState(() => generateGroups(30, 21.5, 23.1, 5.8, 303))
  const stats = calculateIndependentT(data)
  const pValue = 2 * (1 - studentT.cdf(Math.abs(stats.tStat), stats.df))

  const regenerate = (
    nextSize = sampleSize,
    nextMaleMean = maleMean,
    nextFemaleMean = femaleMean,
    nextStd = commonStd,
    nextSeed = seed,
  ) => {
    setData(generateGroups(nextSize, nextMaleMean, nextFemaleMean, nextStd, nextSeed))
  }

  return (
    <LessonStory
      eyebrow="Laboratorio avanzado · prueba t"
      title="La misma diferencia puede contar historias estadísticas distintas"
      lead="Ahora la separación entre medias compite con dos fuerzas: la variabilidad entre personas y la cantidad de información."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Tres piezas"
        title="Diferencia, dispersión y tamaño muestral"
        visual={
          <TTestWorkbench
            groupA={{
              label: 'Hombres',
              values: stats.males.map((person) => person.satisfaction),
              mean: stats.maleMean,
              std: stats.maleStd,
              color: '#4F46E5',
              emoji: '👨',
              sampleSize,
            }}
            groupB={{
              label: 'Mujeres',
              values: stats.females.map((person) => person.satisfaction),
              mean: stats.femaleMean,
              std: stats.femaleStd,
              color: '#059669',
              emoji: '👩',
              sampleSize,
            }}
            results={{ meanDiff: stats.meanDiff, tStat: stats.tStat, pValue, df: stats.df }}
            controls={
              <>
                <label className="text-xs font-bold text-[var(--text-muted)]">
                  Desvío objetivo
                  <select
                    value={commonStd}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setCommonStd(value)
                      regenerate(sampleSize, maleMean, femaleMean, value)
                    }}
                    className="mt-1 block rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1"
                  >
                    <option value={3}>Bajo (3)</option>
                    <option value={5.8}>Medio (5,8)</option>
                    <option value={8}>Alto (8)</option>
                  </select>
                </label>
                <label className="text-xs font-bold text-[var(--text-muted)]">
                  Tamaño por grupo
                  <select
                    value={sampleSize}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setSampleSize(value)
                      regenerate(value)
                    }}
                    className="mt-1 block rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1"
                  >
                    <option value={10}>10</option>
                    <option value={30}>30</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const nextSeed = seed + 1
                    setSeed(nextSeed)
                    regenerate(sampleSize, maleMean, femaleMean, commonStd, nextSeed)
                  }}
                  className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-bold text-white"
                >
                  Otra muestra
                </button>
              </>
            }
            meanControls={{
              groupA: (
                <div className="py-1">
                  <label className="px-1 text-xs font-bold text-[#312e81]">Media hombres</label>
                  <input
                    type="range"
                    min="15"
                    max="30"
                    step="0.1"
                    value={maleMean}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setMaleMean(value)
                      regenerate(sampleSize, value, femaleMean)
                    }}
                    className="mt-1 w-full [--range-color:#4F46E5] [--range-track:#4F46E5]"
                  />
                  <span className="px-1 font-mono text-xs font-bold text-[#312e81]">{maleMean.toFixed(1)}</span>
                </div>
              ),
              groupB: (
                <div className="py-1">
                  <label className="px-1 text-xs font-bold text-[#065f46]">Media mujeres</label>
                  <input
                    type="range"
                    min="15"
                    max="30"
                    step="0.1"
                    value={femaleMean}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setFemaleMean(value)
                      regenerate(sampleSize, maleMean, value)
                    }}
                    className="mt-1 w-full [--range-color:#059669] [--range-track:#059669]"
                  />
                  <span className="px-1 font-mono text-xs font-bold text-[#065f46]">{femaleMean.toFixed(1)}</span>
                </div>
              ),
            }}
          />
        }
      >
        <p>Mantené las medias quietas y aumentá el desvío: las distribuciones se superponen más, el error estándar crece y |t| se reduce.</p>
        <p>Después mantené medias y desvío, pero aumentá n. La forma de cada grupo casi no cambia; lo que se estrecha es la incertidumbre sobre sus medias.</p>
      </StoryBeat>

      <StoryBeat
        number="02"
        label="La escala de la evidencia"
        title="t compara señal y ruido"
        visual={
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Diferencia</p>
                <p className="mt-1 font-mono text-3xl font-bold text-[var(--accent)]">{stats.meanDiff.toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Error estándar</p>
                <p className="mt-1 font-mono text-3xl font-bold text-[var(--accent)]">{stats.standardError.toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-[var(--text)] p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/65">t = diferencia / EE</p>
                <p className="mt-1 font-mono text-3xl font-bold">{stats.tStat.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">El valor p no mide el tamaño ni la importancia de la diferencia. Con n muy grande, una diferencia pequeña puede resultar incompatible con H₀.</p>
          </div>
        }
      >
        <p>La diferencia es la señal. El error estándar resume cuánto podría fluctuar esa diferencia de una muestra a otra bajo las condiciones del modelo.</p>
        <p>El estadístico t expresa cuántos errores estándar separan el resultado observado del valor nulo.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>La evidencia no depende solo de cuán distintas son las medias. También depende de la variabilidad y del tamaño muestral.</StoryConclusion>
        <TransferTask question="Construí una diferencia menor a un punto con p < 0,05. ¿Qué combinación de n y desvío necesitaste?" />
        <DataAttribution>Datos sintéticos. Las medias empíricas coinciden exactamente con los controles; cerca de los límites de la escala, la dispersión se comprime para mantener todas las observaciones entre 5 y 35.</DataAttribution>
        <LessonNavigation currentStep={8} totalSteps={9} previousUrl="/lessons/t-test-editable" nextUrl="/lessons/chi-square" />
      </section>
    </LessonStory>
  )
}
