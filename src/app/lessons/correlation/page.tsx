'use client'

import { useState } from 'react'
import LessonNavigation from '@/app/components/LessonNavigation'
import CorrelationPlot, {
  generateCorrelatedData,
  nonlinearData,
  pearson,
} from '@/app/components/correlation/CorrelationPlot'
import {
  DataAttribution,
  LessonStory,
  PredictionPrompt,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const OBSERVED = generateCorrelatedData(-0.63, 36, 2026)
const NONLINEAR = nonlinearData()
const scenarios = {
  negative: { label: 'Negativa', data: generateCorrelatedData(-0.78, 36, 31) },
  none: { label: 'Casi nula', data: generateCorrelatedData(0, 36, 31) },
  positive: { label: 'Positiva', data: generateCorrelatedData(0.78, 36, 31) },
} as const

export default function CorrelationPage() {
  const [scenario, setScenario] = useState<keyof typeof scenarios>('negative')
  const active = scenarios[scenario]

  return (
    <LessonStory
      eyebrow="Lección 4 · correlación"
      title="¿Dormir menos implica más estrés?"
      lead="Dos medidas tomadas a las mismas personas pueden moverse juntas. El desafío es describir ese movimiento sin convertirlo demasiado rápido en una explicación causal."
    >
      <StoryBeat
        number="01"
        label="Una sospecha"
        title="Las noches cortas dejan huella"
        visual={
          <PredictionPrompt
            question="Si las personas que duermen menos tienden a informar más estrés, ¿qué forma esperás ver?"
            options={[
              'Una nube que baja de izquierda a derecha',
              'Una nube que sube de izquierda a derecha',
              'Puntos sin ninguna dirección',
            ]}
            reveal="Horas de sueño está en el eje horizontal y estrés en el vertical. Menos sueño junto con más estrés produce una nube descendente: una relación negativa."
          />
        }
      >
        <p>Después de una semana exigente, es fácil sentir que el sueño y el estrés están conectados. Para explorar esa intuición, imaginemos que preguntamos a un grupo cuántas horas durmió y cuánto estrés sintió.</p>
        <p>Cada respuesta conserva una experiencia individual. La pregunta es si, al reunirlas, aparece un patrón compartido.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="02"
        label="Las parejas"
        title="Una persona, un punto"
        visual={<CorrelationPlot data={OBSERVED} showLine={false} />}
      >
        <p>Cada punto une dos medidas de la misma persona. Separar las horas y el estrés en dos listas rompería justamente la información que buscamos: quién obtuvo cada par de valores.</p>
        <p>La nube desciende, aunque no forma una línea perfecta. Dormir lo mismo no garantiza sentir el mismo estrés; hay variabilidad y muchas otras experiencias en juego.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="03"
        label="Una medida del patrón"
        title="Dirección y ajuste en un solo número"
        visual={
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">r de Pearson</p>
                <p className="font-mono text-4xl font-bold text-[var(--accent)]">{pearson(active.data).toFixed(2)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(scenarios) as Array<keyof typeof scenarios>).map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={scenario === key}
                    onClick={() => setScenario(key)}
                    className={`rounded-full border px-4 py-2 text-sm font-bold ${scenario === key ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)]'}`}
                  >
                    {scenarios[key].label}
                  </button>
                ))}
              </div>
            </div>
            <CorrelationPlot data={active.data} />
          </div>
        }
      >
        <p>El coeficiente <em>r</em> de Pearson va de −1 a 1. El signo indica hacia dónde se inclina la nube; la cercanía a los extremos indica cuánto se parece a una línea recta.</p>
        <p>Cambiá entre los tres patrones. Cuando <em>r</em> se acerca a cero, no aparece una dirección lineal clara.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="04"
        label="El límite"
        title="Cero no siempre significa “sin relación”"
        visual={
          <div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <p className="text-sm font-bold text-[var(--text)]">Estrés más alto con muy poco o demasiado sueño</p>
              <p className="font-mono text-2xl font-bold text-[var(--accent)]">r = {pearson(NONLINEAR).toFixed(2)}</p>
            </div>
            <CorrelationPlot data={NONLINEAR} showLine={false} />
          </div>
        }
      >
        <p>Esta nube tiene una forma clara, pero cambia de dirección: primero baja y después sube. Una sola recta no puede resumirla.</p>
        <p>Pearson responde una pregunta precisa —cuánta relación lineal hay—, no si existe cualquier tipo de relación. Por eso el gráfico debe venir antes que el coeficiente.</p>
      </StoryBeat>

      <StoryBeat
        number="05"
        label="La explicación"
        title="El patrón no decide qué causa qué"
        visual={
          <div className="space-y-3 text-center text-sm font-bold text-[var(--text)]">
            <div className="rounded-xl bg-[var(--surface-muted)] p-4">Menos sueño <span className="px-2 text-[var(--accent)]">→</span> Más estrés</div>
            <div className="rounded-xl bg-[var(--surface-muted)] p-4">Más estrés <span className="px-2 text-[var(--accent)]">→</span> Menos sueño</div>
            <div className="rounded-xl bg-[var(--surface-muted)] p-4">Semana de parciales <span className="px-2 text-[var(--accent)]">→</span> ambos</div>
          </div>
        }
      >
        <p>Una correlación negativa es compatible con varias historias. El estrés podría dificultar el sueño, dormir poco podría aumentar el estrés o una tercera variable podría afectar a ambos.</p>
        <p>Elegir entre esas explicaciones requiere diseño de investigación, temporalidad y evidencia adicional. El coeficiente, por sí solo, no alcanza.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>
          Una correlación resume dirección y fuerza lineal entre dos medidas emparejadas. No detecta bien todos los patrones y no transforma una asociación en causa.
        </StoryConclusion>
        <TransferTask question="Encontrás r = −0,70 entre uso nocturno del celular y horas de sueño. Escribí una interpretación descriptiva válida y dos explicaciones causales alternativas." />
        <DataAttribution>
          Datos sintéticos construidos para mostrar patrones lineales y no lineales. La situación de sueño y estrés es ilustrativa y no reproduce resultados de un estudio real. Adaptación conceptual de Matthew J. C. Crump, capítulo “Correlación”, traducido al español rioplatense bajo supervisión de Álvaro Cabana.
        </DataAttribution>
        <LessonNavigation currentStep={4} totalSteps={9} previousUrl="/lessons/bivariate-tables-editable-2" nextUrl="/lessons/correlation-editable" />
      </section>
    </LessonStory>
  )
}
