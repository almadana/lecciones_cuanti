'use client'

import { useState } from 'react'
import LessonNavigation from '@/app/components/LessonNavigation'
import { generateCorrelatedData } from '@/app/components/correlation/CorrelationPlot'
import RegressionPlot, {
  calculateRegression,
  type RegressionLine,
} from '@/app/components/regression/RegressionPlot'
import {
  DataAttribution,
  LessonStory,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const DATA = generateCorrelatedData(-0.68, 18, 404)
const OPTIMAL = calculateRegression(DATA)

function squaredError(line: RegressionLine) {
  return DATA.reduce((sum, point) => sum + (point.y - (line.intercept + line.slope * point.x)) ** 2, 0)
}

export default function RegressionLineChallengePage() {
  const [line, setLine] = useState<RegressionLine>({ slope: 0, intercept: 20 })
  const [showOptimal, setShowOptimal] = useState(false)
  const error = squaredError(line)
  const excess = Math.max(0, error - OPTIMAL.sse)
  const close = excess < 12

  return (
    <LessonStory
      eyebrow="Desafío · regresión"
      title="Encontrá la recta menos equivocada"
      lead="Hay infinitas rectas posibles. Ajustá pendiente e intercepto hasta reducir al mínimo la distancia entre las predicciones y los datos."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Tu recta"
        title="Hacé pasar una línea por el centro de la nube"
        visual={
          <div className="space-y-6">
            <div className="grid gap-5 rounded-2xl bg-[var(--surface-muted)] p-5 md:grid-cols-2">
              <label className="text-sm font-bold text-[var(--text)]">
                Pendiente: <span className="font-mono text-[var(--accent)]">{line.slope.toFixed(2)}</span>
                <input
                  type="range"
                  min="-6"
                  max="2"
                  step="0.05"
                  value={line.slope}
                  onChange={(event) => setLine((current) => ({ ...current, slope: Number(event.target.value) }))}
                  className="mt-3 w-full"
                />
              </label>
              <label className="text-sm font-bold text-[var(--text)]">
                Intercepto: <span className="font-mono text-[var(--accent)]">{line.intercept.toFixed(1)}</span>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="0.5"
                  value={line.intercept}
                  onChange={(event) => setLine((current) => ({ ...current, intercept: Number(event.target.value) }))}
                  className="mt-3 w-full"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[var(--text)] p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/65">Tu ecuación</p>
                <p className="mt-1 font-mono text-lg font-bold">ŷ = {line.intercept.toFixed(1)} {line.slope < 0 ? '−' : '+'} {Math.abs(line.slope).toFixed(2)}x</p>
              </div>
              <div className="rounded-xl bg-[var(--danger-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--danger)]">Error² total</p>
                <p className="mt-1 font-mono text-2xl font-bold text-[var(--danger)]">{error.toFixed(0)}</p>
              </div>
              <div className={`rounded-xl p-4 ${close ? 'bg-[var(--success-soft)]' : 'bg-[var(--surface-muted)]'}`} role="status">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Distancia al mínimo</p>
                <p className={`mt-1 font-mono text-2xl font-bold ${close ? 'text-[var(--success)]' : 'text-[var(--accent)]'}`}>+{excess.toFixed(0)}</p>
              </div>
            </div>

            <RegressionPlot
              data={DATA}
              line={line}
              comparisonLine={showOptimal ? OPTIMAL : undefined}
              showResiduals
              showIntercept
              xDomain={[0, 10]}
              yDomain={[0, 65]}
            />
            {showOptimal ? (
              <div className="flex flex-wrap gap-5 text-xs font-bold text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-2"><span className="h-1 w-8 rounded bg-[var(--accent)]" />Tu recta</span>
                <span className="inline-flex items-center gap-2"><span className="w-8 border-t-4 border-dashed border-[var(--success)]" />Recta óptima</span>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--text)]" onClick={() => setLine({ slope: 0, intercept: 20 })}>Volver a empezar</button>
              <button type="button" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white" onClick={() => setShowOptimal((current) => !current)}>
                {showOptimal ? 'Ocultar solución' : 'Comparar con la solución'}
              </button>
            </div>
            {showOptimal ? (
              <div className="rounded-2xl border border-[var(--success)] bg-[var(--success-soft)] p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--success)]">Mínimos cuadrados</p>
                  <p className="mt-2 font-mono text-xl font-bold text-[var(--text)]">ŷ = {OPTIMAL.intercept.toFixed(2)} {OPTIMAL.slope < 0 ? '−' : '+'} {Math.abs(OPTIMAL.slope).toFixed(2)}x</p>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">Error² mínimo: {OPTIMAL.sse.toFixed(0)}</p>
                </div>
              </div>
            ) : null}
          </div>
        }
      >
        <p>La pendiente controla la inclinación; el intercepto desplaza la recta hacia arriba o abajo. Ajustá una y después la otra: sus efectos están conectados.</p>
        <p>Las líneas rojas muestran cuánto falla cada predicción. Tu objetivo no es tocar todos los puntos, sino reducir el error del conjunto.</p>
      </StoryBeat>

      <StoryBeat
        number="02"
        label="El criterio"
        title="Los errores se elevan al cuadrado antes de sumarse"
        visual={
          <div className="rounded-2xl bg-[var(--text)] p-6 text-white">
            <p className="font-mono text-3xl font-bold">Σ(y − ŷ)²</p>
            <p className="mt-4 text-sm leading-relaxed text-white/70">Los signos no se cancelan y los errores grandes reciben más peso. La recta elegida es la que hace mínima esta suma.</p>
          </div>
        }
      >
        <p>Si sumáramos residuos con signo, los puntos por encima y por debajo podrían cancelarse. Elevarlos al cuadrado convierte todas las contribuciones en positivas.</p>
        <p>Ese criterio define una solución única para estos datos: la recta de mínimos cuadrados.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>“Mejor ajuste” no significa predicción perfecta. Significa que, entre todas las rectas, ninguna obtiene una suma menor de errores cuadrados en estos datos.</StoryConclusion>
        <TransferTask question="¿Qué ocurriría con la recta óptima si agregáramos una persona con muchas horas de sueño y estrés muy alto?" />
        <DataAttribution>Datos sintéticos compartidos con este desafío. La actividad adapta la explicación visual de residuos y mínimos cuadrados de Matthew J. C. Crump.</DataAttribution>
        <LessonNavigation currentStep={5} totalSteps={9} previousUrl="/lessons/regression-editable" nextUrl="/lessons/sampling" />
      </section>
    </LessonStory>
  )
}
