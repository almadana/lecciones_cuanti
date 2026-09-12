'use client'

import { useState } from 'react'
import LessonNavigation from '@/app/components/LessonNavigation'
import { ContingencyView, type Cell } from '@/app/components/tables/TableViews'
import {
  DataAttribution,
  LessonStory,
  PredictionPrompt,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const DATA: Cell[] = [
  { row: 'Muy de acuerdo', col: 'Hombre', value: 41 },
  { row: 'Muy de acuerdo', col: 'Mujer', value: 99 },
  { row: 'De acuerdo', col: 'Hombre', value: 167 },
  { row: 'De acuerdo', col: 'Mujer', value: 259 },
  { row: 'En desacuerdo', col: 'Hombre', value: 291 },
  { row: 'En desacuerdo', col: 'Mujer', value: 238 },
  { row: 'Muy en desacuerdo', col: 'Hombre', value: 44 },
  { row: 'Muy en desacuerdo', col: 'Mujer', value: 37 },
  { row: 'No sabe / no contesta', col: 'Hombre', value: 13 },
  { row: 'No sabe / no contesta', col: 'Mujer', value: 11 },
]

export default function BivariateTablesPage() {
  const [normalization, setNormalization] = useState<'count' | 'row' | 'column'>('count')

  return (
    <LessonStory
      eyebrow="Lección 3 · tablas bivariadas"
      title="Un mismo casillero puede contar tres historias"
      lead="Cruzar dos variables es fácil. Interpretar el porcentaje exige decidir primero cuál es la pregunta y, por lo tanto, cuál es el denominador."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Datos"
        title="Una fila ubica; una columna clasifica"
        visual={<ContingencyView data={DATA} normalization="count" rowLabel="Respuesta" />}
      >
        <p>Ahora cruzamos la actitud declarada con la variable “sexo entrevistado”. Las categorías “Hombre” y “Mujer” reproducen la tabulación disponible: no describen toda la diversidad de identidades de género.</p>
        <p>La comparación puede mostrar que las respuestas se distribuyen de manera diferente entre ambos grupos. No permite concluir que el sexo cause esas respuestas ni explicar los procesos psicológicos y sociales involucrados.</p>
        <p>Cada celda combina una respuesta y el sexo de la persona entrevistada. Por ejemplo, 99 mujeres respondieron “Muy de acuerdo”.</p>
        <p>Los márgenes muestran los totales de cada fila y columna. Van a funcionar como denominadores posibles.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="02"
        label="Predicción"
        title="¿Porcentaje de qué total?"
        visual={
          <PredictionPrompt
            question="Para responder “entre quienes están muy de acuerdo, ¿qué porcentaje son mujeres?”, ¿qué total usarías?"
            options={['El total de la fila “Muy de acuerdo”', 'El total de la columna “Mujer”', 'El total general']}
            reveal="La frase “entre quienes están muy de acuerdo” fija el universo: 99 / 140 = 70,7%. Es un porcentaje por fila."
          />
        }
      >
        <p>La misma celda —99— puede dividirse por su fila, por su columna o por el total general. Los tres cálculos son correctos, pero responden preguntas distintas.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="03"
        label="Herramienta"
        title="Elegí el denominador antes de mirar el patrón"
        visual={
          <div className="space-y-5">
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-[var(--text)]">Mostrar</legend>
              <div className="flex flex-wrap gap-2">
                {([
                  ['count', 'Conteos'],
                  ['row', '% por fila'],
                  ['column', '% por columna'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={normalization === value}
                    onClick={() => setNormalization(value)}
                    className={`rounded-full border px-4 py-2 text-sm font-bold ${normalization === value ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            <ContingencyView data={DATA} normalization={normalization} rowLabel="Respuesta" />
          </div>
        }
      >
        <p>Los porcentajes por columna comparan cómo se distribuyen las respuestas dentro de hombres y mujeres. Para comparar ambos grupos, esta es la vista más directa.</p>
        <p>Los porcentajes por fila invierten la pregunta: describen la composición por sexo dentro de cada respuesta.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>
          Antes de calcular un porcentaje condicional, completá la frase “entre quienes…”. Ese grupo define el 100%.
        </StoryConclusion>
        <TransferTask question="¿Qué porcentaje de hombres y qué porcentaje de mujeres expresa algún grado de acuerdo? Elegí primero el denominador y luego sumá categorías." />
        <DataAttribution>Latinobarómetro 2023, Uruguay (N = 1.200; hombres = 556, mujeres = 644). Tabulación de la afirmación “Los hombres tienen grandes ventajas sobre las mujeres a la hora de comenzar un negocio”, provista por el usuario. <a className="font-bold text-[var(--accent)] underline" href="https://www.latinobarometro.org/agregados" target="_blank" rel="noreferrer">Fuente y política de uso</a>. No se redistribuyen microdatos.</DataAttribution>
        <LessonNavigation currentStep={3} totalSteps={9} previousUrl="/lessons/univariate-tables-editable" nextUrl="/lessons/bivariate-tables-editable" />
      </section>
    </LessonStory>
  )
}
