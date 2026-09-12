'use client'

import LessonNavigation from '@/app/components/LessonNavigation'
import { FrequencyView, type FrequencyRow } from '@/app/components/tables/TableViews'
import {
  DataAttribution,
  LessonStory,
  PredictionPrompt,
  StoryBeat,
  StoryConclusion,
  TransferTask,
} from '@/app/components/narrative/LessonStory'

const DATA: FrequencyRow[] = [
  { category: 'Muy de acuerdo', value: 140 },
  { category: 'De acuerdo', value: 426 },
  { category: 'En desacuerdo', value: 529 },
  { category: 'Muy en desacuerdo', value: 81 },
  { category: 'No sabe / no contesta', value: 24 },
]

export default function UnivariateTablesPage() {
  return (
    <LessonStory
      eyebrow="Lección 2 · tablas univariadas"
      title="¿Qué porcentaje de qué total?"
      lead="¿Cuánto acuerdo hay en Uruguay con que los hombres tienen grandes ventajas al comenzar un negocio? Una tabla empieza con conteos; el porcentaje permite leer el conjunto."
    >
      <StoryBeat
        layout="stacked"
        number="01"
        label="Una pregunta social"
        title="¿Todas las personas empiezan desde el mismo lugar?"
        visual={
          <div className="rounded-2xl bg-[var(--surface-muted)] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Latinobarómetro 2023 · Uruguay</p>
            <blockquote className="mt-4 border-l-4 border-[var(--accent)] pl-5 text-xl font-semibold leading-relaxed text-[var(--text)] sm:text-2xl">
              “Los hombres tienen grandes ventajas sobre las mujeres a la hora de comenzar un negocio”.
            </blockquote>
            <p className="mt-5 text-sm leading-relaxed text-[var(--text-muted)]">¿Muy de acuerdo, de acuerdo, en desacuerdo o muy en desacuerdo?</p>
          </div>
        }
      >
        <p>Empezar un negocio requiere recursos, contactos, confianza y oportunidades. ¿Están disponibles de la misma manera para hombres y mujeres? En 2023, Latinobarómetro invitó a las personas entrevistadas en Uruguay a posicionarse frente a esa tensión.</p>
        <p>La respuesta habla de cómo cada persona percibe la desigualdad. Puede estar atravesada por sus experiencias, por lo que observa a su alrededor y también por la forma en que interpreta la frase.</p>
        <p>El resultado no prueba cuánta ventaja existe ni explica sus causas. Dibuja otra cosa: un mapa de las opiniones expresadas por la muestra. Nuestra historia comienza ahí.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="02"
        label="Predicción"
        title="Primero contá casos"
        visual={
          <PredictionPrompt
            question="529 personas respondieron “En desacuerdo”. ¿Eso representa más o menos del 50%?"
            options={['Más del 50%', 'Menos del 50%', 'Necesito conocer el total']}
            reveal="La última opción identifica la información necesaria. Como N = 1.200, 529 / 1.200 = 44,1%: menos de la mitad."
          />
        }
      >
        <p>Una frecuencia absoluta responde “¿cuántos casos?”. Por sí sola no dice qué parte de la muestra representan.</p>
        <p>El denominador —el total relevante— completa la comparación.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="03"
        label="Datos"
        title="Cinco respuestas forman el total"
        visual={<FrequencyView data={DATA} />}
      >
        <p>La tabla organiza las respuestas a la afirmación “Los hombres tienen grandes ventajas sobre las mujeres a la hora de comenzar un negocio”.</p>
        <p>Dividir cada frecuencia por N produce una proporción; multiplicarla por 100 la expresa como porcentaje.</p>
      </StoryBeat>

      <StoryBeat
        layout="stacked"
        number="04"
        label="Herramienta"
        title="El porcentaje conserva el denominador"
        visual={
          <div className="rounded-2xl bg-[var(--text)] p-6 text-white">
            <p className="font-mono text-xl">% = f / N × 100</p>
            <p className="mt-4 font-mono text-3xl font-bold">529 / 1.200 × 100 = 44,1%</p>
            <p className="mt-3 text-sm text-white/70">f es el conteo de la categoría; N, el total de casos válidos.</p>
          </div>
        }
      >
        <p>Los porcentajes facilitan comparar conjuntos de tamaños diferentes, pero solo si usan denominadores comparables.</p>
        <p>La categoría más frecuente es la moda. No hace falta convertirla en número para identificarla.</p>
      </StoryBeat>

      <section className="space-y-8 py-16 sm:py-24">
        <StoryConclusion>
          Una tabla univariada resume cómo se distribuyen los casos de una variable. Para interpretar un porcentaje, nombrá siempre su numerador y su denominador.
        </StoryConclusion>
        <TransferTask question="Sumá “Muy de acuerdo” y “De acuerdo”. ¿Qué porcentaje expresa algún grado de acuerdo con la afirmación?" />
        <DataAttribution>
          Latinobarómetro 2023, Uruguay (N = 1.200). Tabulación de la afirmación “Los hombres tienen grandes ventajas sobre las mujeres a la hora de comenzar un negocio”, provista por el usuario. Fuente y política de uso: <a className="font-bold text-[var(--accent)] underline" href="https://www.latinobarometro.org/agregados" target="_blank" rel="noreferrer">Latinobarómetro, datos agregados por oleada</a>. No se redistribuyen microdatos.
        </DataAttribution>
        <LessonNavigation currentStep={3} totalSteps={9} previousUrl="/lessons/mean-deviation-editable" nextUrl="/lessons/univariate-tables-editable" />
      </section>
    </LessonStory>
  )
}
