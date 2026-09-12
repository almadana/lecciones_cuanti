'use client'

import { useState } from 'react'
import LessonNavigation from '@/app/components/LessonNavigation'
import { generateCorrelatedData } from '@/app/components/correlation/CorrelationPlot'
import RegressionPlot, { calculateRegression } from '@/app/components/regression/RegressionPlot'
import {
  DataAttribution,
  LessonStory,
  PredictionPrompt,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const DATA = generateCorrelatedData(-0.63, 36, 2026)
const MODEL = calculateRegression(DATA)

export default function RegressionPage() {
  const [predictionX, setPredictionX] = useState(7)
  const predicted = MODEL.intercept + MODEL.slope * predictionX

  return (
    <LessonStory
      eyebrow="Lección 5 · regresión"
      title="Si alguien duerme siete horas, ¿cuánto estrés esperaríamos?"
      lead="La correlación describía una dirección. La regresión agrega una recta que permite anticipar un valor —sin prometer acertar cada experiencia individual."
    >
      <StoryBeat
        number="01"
        label="Una predicción"
        title="La nube orienta, pero no devuelve un número"
        visual={
          <PredictionPrompt
            question="Para una persona que durmió 7 horas, ¿cuál sería una predicción razonable de estrés?"
            options={['El centro de los puntos cercanos a 7 horas', 'El punto más alto de toda la nube', 'Cualquier valor da lo mismo']}
            reveal="La primera estrategia usa el patrón colectivo. Una recta de regresión formaliza esa idea y produce la misma regla para cualquier valor de sueño."
          />
        }
      >
        <p>En la lección anterior vimos que menos sueño tendía a acompañarse de más estrés. Ahora aparece una necesidad distinta: pasar de una descripción general a una predicción concreta.</p>
        <p>Los puntos cercanos a siete horas no coinciden exactamente. La mejor respuesta no será una certeza individual, sino el centro esperado para personas con ese valor de sueño.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="02"
        label="La recta"
        title="Una predicción para cada cantidad de sueño"
        visual={<RegressionPlot data={DATA} line={MODEL} />}
      >
        <p>La recta atraviesa el centro de la nube. Para cualquier valor horizontal, su altura indica el estrés predicho por el modelo.</p>
        <p>No intenta tocar todos los puntos. Resume cómo cambia el valor esperado de estrés a medida que cambian las horas de sueño.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="03"
        label="La regla"
        title="La pendiente convierte horas en cambio esperado"
        visual={
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Pendiente</p>
                <p className="mt-1 font-mono text-2xl font-bold text-[var(--accent)]">{MODEL.slope.toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Sueño elegido</p>
                <p className="mt-1 font-mono text-2xl font-bold text-[var(--accent)]">{predictionX.toFixed(1)} h</p>
              </div>
              <div className="rounded-xl bg-[var(--success-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--success)]">Estrés predicho</p>
                <p className="mt-1 font-mono text-2xl font-bold text-[var(--success)]">{predicted.toFixed(1)}</p>
              </div>
            </div>
            <label className="block text-sm font-bold text-[var(--text)]">
              Horas de sueño
              <input
                type="range"
                min="4"
                max="10"
                step="0.1"
                value={predictionX}
                onChange={(event) => setPredictionX(Number(event.target.value))}
                className="mt-3 w-full"
              />
            </label>
            <RegressionPlot data={DATA} line={MODEL} predictionX={predictionX} />
            <p className="rounded-xl bg-[var(--text)] p-4 font-mono text-sm text-white">
              estrés predicho = {MODEL.intercept.toFixed(2)} {MODEL.slope < 0 ? '−' : '+'} {Math.abs(MODEL.slope).toFixed(2)} × horas
            </p>
          </div>
        }
      >
        <p>La pendiente es el cambio predicho en estrés por cada hora adicional de sueño. Como es negativa, la recta baja: una hora más se asocia con {Math.abs(MODEL.slope).toFixed(2)} puntos menos de estrés, en promedio.</p>
        <p>Mové el control y seguí las líneas verdes. La ecuación transforma un valor de sueño en un punto sobre la recta.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="04"
        label="Los errores"
        title="Cada persona conserva una distancia a la predicción"
        visual={<RegressionPlot data={DATA} line={MODEL} showResiduals />}
      >
        <p>Las líneas rojas son residuos: la diferencia vertical entre el estrés observado y el predicho para cada persona.</p>
        <p>La recta de mínimos cuadrados es la que hace menor la suma de esos residuos elevados al cuadrado. Es la menos equivocada entre todas las rectas posibles para esta nube.</p>
      </StoryBeat>

      <StoryBeat
        number="05"
        label="El borde"
        title="La ecuación sigue; la evidencia termina"
        visual={
          <div className="space-y-4 rounded-2xl bg-[var(--danger-soft)] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--danger)]">Fuera del rango observado</p>
            <p className="font-mono text-3xl font-bold text-[var(--text)]">0 horas → {MODEL.intercept.toFixed(1)} puntos</p>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">La cuenta existe, pero no observamos personas cerca de cero horas. El intercepto organiza la recta; acá no tiene una interpretación psicológica segura.</p>
          </div>
        }
      >
        <p>Los datos abarcan aproximadamente entre cuatro y diez horas. Usar la ecuación mucho más allá de ese rango es extrapolar.</p>
        <p>Además, una relación lineal no puede continuar indefinidamente: las escalas tienen límites y el fenómeno puede cambiar de forma.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>La regresión convierte una relación lineal en una regla de predicción. La pendiente describe cambio esperado, los residuos muestran el error y el rango observado marca hasta dónde confiar.</StoryConclusion>
        <TransferTask question="Si la pendiente fuera −2,5, ¿cómo explicarías su significado sin afirmar que dormir una hora más causa una reducción del estrés?" />
        <DataAttribution>Datos sintéticos, compartidos con la lección de correlación. Adaptación conceptual de Matthew J. C. Crump, capítulo “Correlación”, traducido al español rioplatense bajo supervisión de Álvaro Cabana.</DataAttribution>
        <LessonNavigation currentStep={5} totalSteps={9} previousUrl="/lessons/correlation-editable" nextUrl="/lessons/regression-editable" />
      </section>
    </LessonStory>
  )
}
