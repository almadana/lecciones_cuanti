'use client'

import { useMemo, useState } from 'react'
import LessonNavigation from '@/app/components/LessonNavigation'
import { generateCorrelatedData, pearson, type CorrelationPoint } from '@/app/components/correlation/CorrelationPlot'
import { formatDataPairs, paddedDomain, parseDataPairs } from '@/app/components/regression/dataPairs'
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
const fieldClass = 'w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 font-mono text-sm text-[var(--text)] shadow-inner'

export default function RegressionLabPage() {
  const [data, setData] = useState<CorrelationPoint[]>(INITIAL)
  const [dataDraft, setDataDraft] = useState(() => formatDataPairs(INITIAL))
  const [predictionX, setPredictionX] = useState(7)
  const [showResiduals, setShowResiduals] = useState(false)
  const model = calculateRegression(data)
  const parsedDraft = useMemo(() => parseDataPairs(dataDraft), [dataDraft])
  const hasModel = data.length >= 2 && new Set(data.map((point) => point.x)).size >= 2
  const correlation = hasModel ? pearson(data) : null
  const prediction = hasModel ? model.intercept + model.slope * predictionX : null
  const xDomain = useMemo(() => paddedDomain(data.map((point) => point.x), [0, 10]), [data])
  const yDomain = useMemo(() => paddedDomain(data.map((point) => point.y), [0, 40]), [data])
  const observedXDomain = useMemo<[number, number]>(() => {
    if (data.length === 0) return [0, 10]
    return [Math.min(...data.map((point) => point.x)), Math.max(...data.map((point) => point.x))]
  }, [data])

  const replaceData = (points: CorrelationPoint[]) => {
    setData(points)
    setDataDraft(formatDataPairs(points))
    if (points.length > 0) {
      const minimumX = Math.min(...points.map((point) => point.x))
      const maximumX = Math.max(...points.map((point) => point.x))
      setPredictionX((current) => current < minimumX || current > maximumX ? (minimumX + maximumX) / 2 : current)
    }
  }

  const applyDraft = () => {
    if (parsedDraft.errors.length > 0 || parsedDraft.points.length === 0) return
    replaceData(parsedDraft.points)
  }

  const movePoint = (index: number, point: CorrelationPoint) => {
    replaceData(data.map((item, itemIndex) => itemIndex === index ? point : item))
  }

  const loadAdjustedCloud = () => replaceData(generateCorrelatedData(-0.9, 24, 92))
  const loadScatteredCloud = () => replaceData(generateCorrelatedData(-0.2, 24, 92))
  const loadInfluentialCase = () => replaceData(INITIAL.map((point, index) => index === 0 ? { x: 9.7, y: 38 } : point))

  const modelValue = (value: number | null, digits = 2) => value === null ? '—' : value.toFixed(digits)

  return (
    <LessonStory
      eyebrow="Laboratorio · regresión"
      title="Ingresá tus datos y mirá cómo cambia la recta"
      lead="Pegá una lista de pares x e y, cargá el conjunto y observá cómo responden la gráfica, el ajuste y todos los coeficientes del modelo."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Laboratorio"
        title="La gráfica responde a tu lista de puntos"
        visual={
          <div className="space-y-6">
            <div className="grid gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)]">
              <div>
                <label htmlFor="regression-data" className="block text-sm font-bold text-[var(--text)]">
                  Datos (un par x, y por línea)
                </label>
                <textarea
                  id="regression-data"
                  value={dataDraft}
                  onChange={(event) => setDataDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                      event.preventDefault()
                      applyDraft()
                    }
                  }}
                  rows={10}
                  spellCheck={false}
                  aria-invalid={parsedDraft.errors.length > 0}
                  aria-describedby="regression-data-help regression-data-status"
                  className={`${fieldClass} mt-2 min-h-56 resize-y`}
                  placeholder={'4, 30\n5, 27\n6, 24\n7, 19'}
                />
                <p id="regression-data-help" className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                  Podés separar los valores con coma, punto y coma, tabulación o espacio. Para decimales con coma, usá punto y coma: <span className="font-mono">4,5; 22,1</span>.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={applyDraft}
                    disabled={parsedDraft.errors.length > 0 || parsedDraft.points.length === 0}
                    className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Actualizar gráfica
                  </button>
                  <button type="button" className={buttonClass} onClick={() => replaceData(INITIAL)}>Restablecer ejemplo</button>
                  <button type="button" className={buttonClass} onClick={() => replaceData([])}>Vaciar datos</button>
                </div>
                <div id="regression-data-status" aria-live="polite" className="mt-3 min-h-5 text-xs">
                  {parsedDraft.errors.length > 0 ? (
                    <p className="font-bold text-[var(--danger)]">{parsedDraft.errors[0]}</p>
                  ) : parsedDraft.points.length > 0 ? (
                    <p className="text-[var(--success)]">{parsedDraft.points.length} {parsedDraft.points.length === 1 ? 'punto listo' : 'puntos listos'} para cargar.</p>
                  ) : (
                    <p className="text-[var(--text-muted)]">Ingresá al menos un par para comenzar.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Modelo actual</p>
                <div className="rounded-xl bg-[var(--text)] p-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">Ecuación estimada</p>
                  <p className="mt-2 break-words font-mono text-xl font-bold">
                    {hasModel ? `ŷ = ${model.intercept.toFixed(3)} ${model.slope < 0 ? '−' : '+'} ${Math.abs(model.slope).toFixed(3)}x` : 'ŷ = —'}
                  </p>
                </div>
                <p className={`rounded-xl p-4 text-sm leading-relaxed ${hasModel ? 'bg-[var(--success-soft)] text-[var(--success)]' : 'bg-[var(--danger-soft)] text-[var(--danger)]'}`} role="status">
                  {hasModel
                    ? `Modelo calculado con ${data.length} observaciones.`
                    : 'Para ajustar la recta se necesitan al menos dos puntos con valores de X distintos.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" className={buttonClass} onClick={() => replaceData(INITIAL)}>Restablecer</button>
              <button type="button" className={buttonClass} onClick={loadAdjustedCloud}>Nube ajustada</button>
              <button type="button" className={buttonClass} onClick={loadScatteredCloud}>Nube dispersa</button>
              <button type="button" className={buttonClass} onClick={loadInfluentialCase}>Caso influyente</button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {[
                ['Puntos', data.length.toString()],
                ['Pendiente', modelValue(hasModel ? model.slope : null)],
                ['Intercepto', modelValue(hasModel ? model.intercept : null)],
                ['r de Pearson', modelValue(correlation, 3)],
                ['R²', modelValue(hasModel ? model.rSquared : null, 3)],
                ['Error² total', modelValue(hasModel ? model.sse : null, 1)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[var(--surface-muted)] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
                  <p className="mt-1 break-words font-mono text-xl font-bold text-[var(--accent)]">{value}</p>
                </div>
              ))}
            </div>

            <label className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <input type="checkbox" checked={showResiduals} onChange={(event) => setShowResiduals(event.target.checked)} />
              Mostrar residuos
            </label>
            <RegressionPlot
              data={data}
              line={hasModel ? model : undefined}
              showResiduals={showResiduals}
              editable
              onChange={movePoint}
              xLabel="Variable X"
              yLabel="Variable Y"
              xDomain={xDomain}
              yDomain={yDomain}
            />
            <p className="text-xs text-[var(--text-muted)]">Después de cargar la lista también podés arrastrar los puntos o usar las flechas del teclado. Shift aumenta el paso.</p>
          </div>
        }
      >
        <p>Escribí o pegá un par por línea y pulsá “Actualizar gráfica”. La recta, la ecuación y los coeficientes se recalculan con ese conjunto.</p>
        <p>Después podés mover un punto: cambia su residuo y la recta intenta acercarse. Si está lejos del centro horizontal, puede modificar bastante la pendiente.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="02"
        label="Predicción"
        title="Un mismo valor de X, una respuesta que depende de la nube"
        visual={
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <button type="button" className={buttonClass} onClick={() => replaceData(INITIAL)}>Restablecer</button>
              <button type="button" className={buttonClass} onClick={loadAdjustedCloud}>Nube ajustada</button>
              <button type="button" className={buttonClass} onClick={loadScatteredCloud}>Nube dispersa</button>
              <button type="button" className={buttonClass} onClick={loadInfluentialCase}>Caso influyente</button>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <label className="min-w-[16rem] flex-1 text-sm font-bold text-[var(--text)]">
                Valor de X: <span className="font-mono text-[var(--accent)]">{Number(predictionX.toFixed(2))}</span>
                <input
                  type="range"
                  min={observedXDomain[0]}
                  max={observedXDomain[1]}
                  step="any"
                  value={predictionX}
                  disabled={observedXDomain[0] === observedXDomain[1]}
                  onChange={(event) => setPredictionX(Number(event.target.value))}
                  className="mt-3 w-full disabled:cursor-not-allowed disabled:opacity-45"
                />
              </label>
              <div className="rounded-xl bg-[var(--success-soft)] px-5 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--success)]">Y predicha</p>
                <p className="font-mono text-3xl font-bold text-[var(--success)]">{prediction === null ? '—' : prediction.toFixed(1)}</p>
              </div>
            </div>
            <RegressionPlot
              data={data}
              line={hasModel ? model : undefined}
              predictionX={hasModel ? predictionX : undefined}
              editable
              onChange={movePoint}
              xLabel="Variable X"
              yLabel="Variable Y"
              xDomain={xDomain}
              yDomain={yDomain}
            />
            <p className="text-xs text-[var(--text-muted)]">Cambiá la nube con los controles o arrastrá un punto: la recta y la predicción se actualizan en el momento.</p>
          </div>
        }
      >
        <p>Elegí un valor de X y después cambiá la forma de la nube. La predicción se actualiza porque cambian la pendiente y el intercepto.</p>
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
