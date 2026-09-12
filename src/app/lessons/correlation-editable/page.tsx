'use client'

import { useState } from 'react'
import LessonNavigation from '@/app/components/LessonNavigation'
import CorrelationPlot, {
  generateCorrelatedData,
  pearson,
  type CorrelationPoint,
} from '@/app/components/correlation/CorrelationPlot'
import {
  DataAttribution,
  LessonStory,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const INITIAL_TARGET = -0.6
const INITIAL_SIZE = 24

export default function CorrelationLabPage() {
  const [target, setTarget] = useState(INITIAL_TARGET)
  const [sampleSize, setSampleSize] = useState(INITIAL_SIZE)
  const [seed, setSeed] = useState(17)
  const [data, setData] = useState<CorrelationPoint[]>(() => generateCorrelatedData(INITIAL_TARGET, INITIAL_SIZE, 17))
  const actual = pearson(data)

  const regenerate = (nextTarget = target, nextSize = sampleSize, nextSeed = seed) => {
    setData(generateCorrelatedData(nextTarget, nextSize, nextSeed))
  }

  const changePoint = (index: number, point: CorrelationPoint) => {
    setData((current) => current.map((item, itemIndex) => itemIndex === index ? point : item))
  }

  return (
    <LessonStory
      eyebrow="Laboratorio · correlación"
      title="¿Cuánto puede cambiar r si movés una persona?"
      lead="Construí una nube, cambiá su tamaño y arrastrá observaciones. El coeficiente responde en tiempo real a la geometría de los datos."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Laboratorio"
        title="De la nube al coeficiente —y de vuelta"
        visual={
          <div className="space-y-6">
            <div className="grid gap-5 rounded-2xl bg-[var(--surface-muted)] p-5 md:grid-cols-2">
              <label className="block text-sm font-bold text-[var(--text)]">
                Patrón buscado: <span className="font-mono text-[var(--accent)]">r = {target.toFixed(2)}</span>
                <input
                  type="range"
                  min="-0.95"
                  max="0.95"
                  step="0.05"
                  value={target}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    setTarget(value)
                    regenerate(value, sampleSize, seed)
                  }}
                  className="mt-3 w-full"
                />
              </label>
              <label className="block text-sm font-bold text-[var(--text)]">
                Cantidad de personas: <span className="font-mono text-[var(--accent)]">{sampleSize}</span>
                <input
                  type="range"
                  min="6"
                  max="60"
                  step="1"
                  value={sampleSize}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    setSampleSize(value)
                    regenerate(target, value, seed)
                  }}
                  className="mt-3 w-full"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">Correlación actual</p>
                <p className="font-mono text-4xl font-bold text-[var(--accent)]">r = {actual.toFixed(2)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--text)]"
                  onClick={() => {
                    const nextSeed = seed + 1
                    setSeed(nextSeed)
                    regenerate(target, sampleSize, nextSeed)
                  }}
                >
                  Otra nube
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--text)]"
                  onClick={() => setData((current) => current.map((point, index) => index === 0 ? { x: 9.7, y: 38 } : point))}
                >
                  Mover un caso al extremo
                </button>
              </div>
            </div>

            <CorrelationPlot data={data} editable onChange={changePoint} />
            <p className="text-xs text-[var(--text-muted)]">Arrastrá cualquier punto. Con teclado, enfocalo y usá las flechas; Shift aumenta el paso.</p>
          </div>
        }
      >
        <p>El control genera una nube con la dirección elegida. Después de tocar un punto, el valor buscado y el observado pueden separarse: ahora manda la configuración que construiste.</p>
        <p>Probá mover un caso cercano al centro y luego uno ubicado en un extremo del eje horizontal. No todos los puntos tienen la misma influencia sobre <em>r</em>.</p>
      </StoryBeat>

      <StoryBeat
        number="02"
        label="Un caso influyente"
        title="Lejos del centro, una observación pesa más"
        visual={
          <div className="rounded-2xl bg-[var(--accent-soft)] p-6">
            <p className="font-mono text-5xl font-bold text-[var(--accent)]">{actual.toFixed(2)}</p>
            <p className="mt-4 leading-relaxed text-[var(--text-muted)]">
              Este número resume toda la nube. Miralo junto al gráfico: un coeficiente aislado no muestra casos extremos, grupos separados ni curvaturas.
            </p>
          </div>
        }
      >
        <p>Un punto alejado del centro puede reforzar una pendiente o contradecirla. En muestras pequeñas, ese movimiento puede transformar mucho el resumen.</p>
        <p>Eso no obliga a borrar el caso. Primero hay que preguntar si es un error, una observación válida o una señal de que la población contiene situaciones diferentes.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>
          El valor de <em>r</em> pertenece a una nube concreta. Antes de interpretarlo, mirá el gráfico, el tamaño de la muestra y las observaciones influyentes.
        </StoryConclusion>
        <TransferTask question="Generá r ≈ 0,70 y tratá de acercarlo a cero moviendo un solo punto. ¿Dónde necesitaste colocarlo y por qué?" />
        <DataAttribution>Datos completamente sintéticos. El laboratorio construye correlaciones geométricas deliberadas y no simula una muestra obtenida de una población real.</DataAttribution>
        <LessonNavigation currentStep={4} totalSteps={9} previousUrl="/lessons/correlation" nextUrl="/lessons/regression" />
      </section>
    </LessonStory>
  )
}
