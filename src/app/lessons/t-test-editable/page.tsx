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
const SAMPLE_SIZE = 30
const COMMON_STD = 5.8

export default function TTestMeansLabPage() {
  const [maleMean, setMaleMean] = useState(21.5)
  const [femaleMean, setFemaleMean] = useState(23.1)
  const [seed, setSeed] = useState(71)
  const [data, setData] = useState(() => generateGroups(SAMPLE_SIZE, 21.5, 23.1, COMMON_STD, 71))
  const stats = calculateIndependentT(data)
  const pValue = 2 * (1 - studentT.cdf(Math.abs(stats.tStat), stats.df))

  const regenerate = (nextMaleMean = maleMean, nextFemaleMean = femaleMean, nextSeed = seed) => {
    setData(generateGroups(SAMPLE_SIZE, nextMaleMean, nextFemaleMean, COMMON_STD, nextSeed))
  }

  return (
    <LessonStory
      eyebrow="Laboratorio · prueba t"
      title="¿Cuánto deben separarse dos medias para que la diferencia resulte difícil de atribuir al azar?"
      lead="Mantenemos fijos el tamaño y la dispersión. Solo movemos las medias para aislar el papel de la diferencia observada."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Dos distribuciones"
        title="Acercá y separá los centros"
        visual={
          <TTestWorkbench
            groupA={{
              label: 'Hombres',
              values: stats.males.map((person) => person.satisfaction),
              mean: stats.maleMean,
              std: stats.maleStd,
              color: '#4F46E5',
              emoji: '👨',
              sampleSize: SAMPLE_SIZE,
            }}
            groupB={{
              label: 'Mujeres',
              values: stats.females.map((person) => person.satisfaction),
              mean: stats.femaleMean,
              std: stats.femaleStd,
              color: '#059669',
              emoji: '👩',
              sampleSize: SAMPLE_SIZE,
            }}
            results={{ meanDiff: stats.meanDiff, tStat: stats.tStat, pValue, df: stats.df }}
            controls={
              <button
                type="button"
                onClick={() => {
                  const nextSeed = seed + 1
                  setSeed(nextSeed)
                  regenerate(maleMean, femaleMean, nextSeed)
                }}
                className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-bold text-white"
              >
                Otra muestra
              </button>
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
                      regenerate(value, femaleMean)
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
                      regenerate(maleMean, value)
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
        <p>Los controles están alineados con el eje de satisfacción: el centro elegido coincide exactamente con la media empírica de cada grupo.</p>
        <p>Cuando las distribuciones se superponen mucho, la diferencia es pequeña frente al error estándar. Al separar los centros, |t| crece y el valor p disminuye.</p>
      </StoryBeat>

      <StoryBeat
        number="02"
        label="Una comparación estandarizada"
        title="La diferencia sola no alcanza"
        visual={
          <div className="rounded-2xl bg-[var(--text)] p-6 text-white">
            <p className="text-sm text-white/65">Diferencia observada / error estándar</p>
            <p className="mt-2 font-mono text-4xl font-bold">t = {stats.tStat.toFixed(2)}</p>
            <p className="mt-4 text-sm text-white/75">Con n = {SAMPLE_SIZE} por grupo y dispersión fija, mover las medias es lo único que cambia sistemáticamente esta razón.</p>
          </div>
        }
      >
        <p>Una diferencia de dos puntos puede ser clara o ambigua según cuánto varían las personas y cuánta información contiene la muestra.</p>
        <p>En este primer laboratorio dejamos esos factores quietos. El siguiente los va a liberar.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>Con tamaño y dispersión fijos, una mayor separación entre medias produce un |t| mayor y más evidencia contra la igualdad de medias.</StoryConclusion>
        <TransferTask question="Buscá la menor diferencia de medias que produzca p < 0,05. Después generá otra muestra: ¿el umbral cambia?" />
        <DataAttribution>Datos sintéticos generados para que las medias empíricas coincidan exactamente con los controles. Las etiquetas de sexo son didácticas y no representan resultados de una encuesta.</DataAttribution>
        <LessonNavigation currentStep={8} totalSteps={9} previousUrl="/lessons/t-test" nextUrl="/lessons/t-test-editable-2" />
      </section>
    </LessonStory>
  )
}
