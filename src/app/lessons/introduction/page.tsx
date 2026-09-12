'use client'

import { useState } from 'react'
import LessonNavigation from '@/app/components/LessonNavigation'
import {
  DataAttribution,
  LessonStory,
  PredictionPrompt,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const variables = [
  { name: 'Edad', type: 'Cuantitativa', scale: 'Razón', reason: 'Es una magnitud, admite diferencias y tiene un cero con significado.' },
  { name: 'Temperatura (°C)', type: 'Cuantitativa', scale: 'Intervalo', reason: 'Las diferencias son comparables, pero 0 °C no significa ausencia de temperatura.' },
  { name: 'Nivel de satisfacción', type: 'Cualitativa', scale: 'Ordinal', reason: 'Sus categorías tienen orden, aunque no conocemos la distancia entre ellas.' },
  { name: 'Color de ojos', type: 'Cualitativa', scale: 'Nominal', reason: 'Distingue categorías que no tienen un orden natural.' },
  { name: 'Número de hijas o hijos', type: 'Cuantitativa', scale: 'Razón', reason: 'Es un conteo y cero representa ausencia.' },
]

export default function Introduction() {
  const [selected, setSelected] = useState(variables[0].name)
  const active = variables.find((variable) => variable.name === selected) ?? variables[0]

  return (
    <LessonStory
      eyebrow="Lección 0 · mapa inicial"
      title="¿Qué puede decirnos un dato?"
      lead="Antes de calcular nada, necesitamos decidir qué observamos, cómo lo registramos y hasta dónde alcanza la evidencia."
    >
      <StoryBeat
        number="01"
        label="Pregunta"
        title="Una respuesta no es todavía evidencia"
        visual={
          <PredictionPrompt
            question="Si 8 de 10 estudiantes dicen que durmieron mal, ¿podemos afirmar que al estudiantado universitario le pasa lo mismo?"
            options={['Sí, 8 de 10 es una mayoría clara', 'No: primero necesito saber cómo se obtuvieron esos datos']}
            reveal="La proporción describe con precisión a esas diez personas. Para hablar de un grupo más amplio necesitamos saber de quiénes provienen y cómo fueron seleccionadas."
          />
        }
      >
        <p>La estadística empieza cuando una pregunta se convierte en observaciones comparables.</p>
        <p>También obliga a separar dos movimientos: describir lo que vimos e inferir algo sobre lo que no vimos.</p>
      </StoryBeat>

      <StoryBeat
        number="02"
        label="Dos alcances"
        title="Describir no es lo mismo que generalizar"
        visual={
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl bg-[var(--surface-muted)] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Descriptiva</p>
              <h3 className="mt-2 text-lg">¿Qué muestran estos datos?</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Organiza, representa y resume el conjunto observado.</p>
            </article>
            <article className="rounded-2xl bg-[var(--surface-muted)] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Inferencial</p>
              <h3 className="mt-2 text-lg">¿Qué sugieren más allá de la muestra?</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Cuantifica la incertidumbre al generalizar o comparar.</p>
            </article>
          </div>
        }
      >
        <p>Una media, una tabla o un gráfico pueden describir muy bien una muestra sin justificar por sí solos una conclusión sobre toda la población.</p>
        <p>Ese salto —de lo observado a lo más amplio— es el problema que retomaremos durante el curso.</p>
      </StoryBeat>

      <StoryBeat
        number="03"
        label="Datos"
        title="Antes de resumir, mirá qué clase de variable tenés"
        visual={
          <div>
            <label htmlFor="variable" className="text-sm font-medium text-[var(--text)]">Elegí una variable</label>
            <select
              id="variable"
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)]"
            >
              {variables.map((variable) => <option key={variable.name}>{variable.name}</option>)}
            </select>
            <div className="mt-5 rounded-2xl bg-[var(--surface-muted)] p-5" aria-live="polite">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--accent)]">{active.type}</span>
                <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--accent)]">Escala de {active.scale.toLowerCase()}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">{active.reason}</p>
            </div>
          </div>
        }
      >
        <p>Las variables <strong className="text-[var(--text)]">cualitativas</strong> registran categorías; las <strong className="text-[var(--text)]">cuantitativas</strong>, magnitudes numéricas.</p>
        <p>Después afinamos la pregunta: ¿las categorías se ordenan? ¿las diferencias numéricas son interpretables? ¿el cero representa ausencia?</p>
      </StoryBeat>

      <StoryBeat
        number="04"
        label="Herramienta"
        title="El nivel de medida delimita qué comparaciones tienen sentido"
        visual={
          <ol className="grid gap-3 sm:grid-cols-2">
            {[
              ['Nominal', 'Distingue categorías.'],
              ['Ordinal', 'Agrega un orden.'],
              ['Intervalo', 'Agrega diferencias comparables.'],
              ['Razón', 'Agrega un cero con significado.'],
            ].map(([title, description], index) => (
              <li key={title} className="rounded-2xl border border-[var(--border)] p-4">
                <span className="text-xs font-bold text-[var(--accent)]">0{index + 1}</span>
                <h3 className="mt-1">{title}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
              </li>
            ))}
          </ol>
        }
      >
        <p>Una categoría codificada con un número no se vuelve automáticamente cuantitativa. Los códigos pueden ser apenas etiquetas.</p>
        <p>Clasificar bien la variable evita cálculos posibles en el software, pero vacíos de significado.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>
          El dato no habla solo: adquiere sentido por la pregunta, la forma de medición y el alcance de la población que queremos comprender.
        </StoryConclusion>
        <TransferTask question="Una escala de estrés va de 1 a 5. ¿Qué necesitarías justificar antes de calcular su media?">
          <p>Identificá qué comparación supone ese cálculo y qué información se perdería al resumir todas las respuestas en un único valor.</p>
        </TransferTask>
        <DataAttribution>
          Esta introducción usa ejemplos conceptuales, sin un conjunto de datos empírico. La distinción entre descripción, inferencia y niveles de medida organiza las lecciones siguientes.
        </DataAttribution>
        <LessonNavigation currentStep={1} totalSteps={9} nextUrl="/lessons/descriptive-stats" showPrevious={false} />
      </section>
    </LessonStory>
  )
}
