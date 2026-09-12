'use client'

import { useState } from 'react'
import LessonNavigation from '@/app/components/LessonNavigation'
import { generateCorrelatedData, type CorrelationPoint } from '@/app/components/correlation/CorrelationPlot'
import RegressionPlot, { calculateRegression } from '@/app/components/regression/RegressionPlot'
import {
  DataAttribution,
  LessonStory,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const INITIAL = generateCorrelatedData(-0.63, 24, 92)
const buttonClass = 'rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--text)]'

export default function RegressionLabPage() {
  const [data, setData] = useState<CorrelationPoint[]>(INITIAL)
  const [predictionX, setPredictionX] = useState(7)
  const [showResiduals, setShowResiduals] = useState(false)
  const model = calculateRegression(data)
  const prediction = model.intercept + model.slope * predictionX

  const movePoint = (index: number, point: CorrelationPoint) => {
    setData((current) => current.map((item, itemIndex) => itemIndex === index ? point : item))
  }

  return (
    <LessonStory
      eyebrow="Laboratorio · regresión"
      title="Cuando movés un caso, también se mueve la predicción"
      lead="La recta no está dibujada de antemano: depende de todos los puntos. Alterá la nube y observá qué partes del modelo cambian."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Laboratorio"
        title="La recta responde a los datos"
        visual={
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <button type="button" className={buttonClass} onClick={() => setData(INITIAL)}>Restablecer</button>
              <button type="button" className={buttonClass} onClick={() => setData(generateCorrelatedData(-0.9, 24, 92))}>Nube ajustada</button>
              <button type="button" className={buttonClass} onClick={() => setData(generateCorrelatedData(-0.2, 24, 92))}>Nube dispersa</button>
              <button type="button" className={buttonClass} onClick={() => setData((current) => current.map((point, index) => index === 0 ? { x: 9.7, y: 38 } : point))}>Caso influyente</button>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ['Pendiente', model.slope.toFixed(2)],
                ['Intercepto', model.intercept.toFixed(2)],
                ['R²', `${(model.rSquared * 100).toFixed(1)}%`],
                ['Error² total', model.sse.toFixed(0)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[var(--surface-muted)] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[var(--accent)]">{value}</p>
                </div>
              ))}
            </div>

            <label className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <input type="checkbox" checked={showResiduals} onChange={(event) => setShowResiduals(event.target.checked)} />
              Mostrar residuos
            </label>
            <RegressionPlot data={data} line={model} showResiduals={showResiduals} editable onChange={movePoint} />
            <p className="text-xs text-[var(--text-muted)]">Arrastrá los puntos o usá las flechas del teclado. Shift aumenta el paso.</p>
          </div>
        }
      >
        <p>Mové un punto hacia arriba: cambia su residuo y la recta intenta acercarse. Si está lejos del centro horizontal, puede modificar bastante la pendiente.</p>
        <p>Compará una nube ajustada con una dispersa. La pendiente puede ser parecida, pero la precisión de las predicciones no lo es.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="02"
        label="Predicción"
        title="Una misma hora, una respuesta que depende de la nube"
        visual={
          <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <label className="min-w-[16rem] flex-1 text-sm font-bold text-[var(--text)]">
                Horas de sueño: <span className="font-mono text-[var(--accent)]">{predictionX.toFixed(1)}</span>
                <input type="range" min="4" max="10" step="0.1" value={predictionX} onChange={(event) => setPredictionX(Number(event.target.value))} className="mt-3 w-full" />
              </label>
              <div className="rounded-xl bg-[var(--success-soft)] px-5 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--success)]">Estrés predicho</p>
                <p className="font-mono text-3xl font-bold text-[var(--success)]">{prediction.toFixed(1)}</p>
              </div>
            </div>
            <RegressionPlot data={data} line={model} predictionX={predictionX} />
          </div>
        }
      >
        <p>Elegí una cantidad de sueño y después cambiá la forma de la nube. La predicción se actualiza porque cambian la pendiente y el intercepto.</p>
        <p>R² describe qué proporción de la variabilidad observada queda capturada por esta recta. No dice que el modelo sea causal ni que vaya a funcionar igual en otra población.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>Una predicción de regresión depende de la muestra, la forma de la relación y los casos influyentes. La ecuación nunca reemplaza la inspección de la nube.</StoryConclusion>
        <TransferTask question="Construí dos nubes con pendientes parecidas pero R² muy distintos. ¿En cuál confiarías más para una predicción individual?" />
        <DataAttribution>Datos sintéticos editables. Los presets fueron diseñados para contrastar ajuste, dispersión e influencia; no representan muestras reales.</DataAttribution>
        <LessonNavigation currentStep={5} totalSteps={9} previousUrl="/lessons/regression" nextUrl="/lessons/regression-interactive" />
      </section>
    </LessonStory>
  )
}
