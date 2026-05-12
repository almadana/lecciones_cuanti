'use client'

import { useState } from 'react'
import Question from '@/app/components/Question'
import LessonNavigation from '@/app/components/LessonNavigation'
import NarrativeSection from '@/app/components/narrative/NarrativeSection'

const card =
  'rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_1px_4px_rgba(0,0,0,.05)]'

export default function Introduction() {
  const [selectedExample, setSelectedExample] = useState<string>('')

  const variableExamples = [
    {
      name: 'Edad',
      type: 'cuantitativa',
      scale: 'razón',
      description: 'Se puede medir en años, meses, días. Tiene un cero absoluto.',
    },
    {
      name: 'Temperatura (Celsius)',
      type: 'cuantitativa',
      scale: 'intervalo',
      description:
        'Se mide en grados. El cero no es absoluto (0°C no significa ausencia de temperatura).',
    },
    {
      name: 'Nivel de satisfacción',
      type: 'cualitativa',
      scale: 'ordinal',
      description:
        'Se puede ordenar: Muy insatisfecho < Insatisfecho < Neutral < Satisfecho < Muy satisfecho',
    },
    {
      name: 'Color de ojos',
      type: 'cualitativa',
      scale: 'nominal',
      description: 'No se puede ordenar: Azul, Verde, Marrón, Negro',
    },
    {
      name: 'Número de hijos',
      type: 'cuantitativa',
      scale: 'razón',
      description: 'Se puede contar. El cero significa ausencia de hijos.',
    },
    {
      name: 'Género',
      type: 'cualitativa',
      scale: 'nominal',
      description: 'Categorías sin orden: Masculino, Femenino, No binario',
    },
  ]

  const active = variableExamples.find((v) => v.name === selectedExample)

  return (
    <article className="lesson-scroll">
      <header className="narrative-beat pb-12 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Lección 0 · mapa inicial
        </p>
        <h1 className="text-balance text-3xl font-bold text-[var(--text)] sm:text-4xl" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
          Introducción a la estadística
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-[var(--text-muted)]">
          Vas a ir descubriendo ideas de una en una. Sin prisa: cada bloque prepara el siguiente.
        </p>
        <p className="mt-6 text-sm text-[var(--accent-strong)]">
          Desplázate hacia abajo para comenzar
        </p>
      </header>

      <div className="mx-auto flex max-w-3xl flex-col gap-20 sm:gap-24">
        <NarrativeSection className="narrative-beat">
          <p className="mb-4 text-sm font-semibold text-[var(--accent-strong)]">Primero · el big picture</p>
          <h2 className="text-2xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            ¿Qué es la estadística?
          </h2>
          <p className="mt-4 text-pretty text-[var(--foreground)] leading-relaxed">
            La estadística organiza datos para que puedas responder preguntas con evidencia en lugar de
            intuiciones sueltas.
          </p>
        </NarrativeSection>

        <NarrativeSection className="narrative-beat">
          <p className="mb-4 text-sm font-semibold text-[var(--accent-strong)]">
            Dos formas de usar los datos
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className={card}>
              <h3 className="text-lg font-semibold text-[var(--text)]">Descriptiva</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                Resume lo que ya tienes entre manos: gráficos, medias, dispersión. No extrapola más allá
                del conjunto observado.
              </p>
            </div>
            <div className={card}>
              <h3 className="text-lg font-semibold text-[var(--text)]">Inferencial</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                Pregunta qué hay detrás de la muestra: hipótesis, intervalos y significación. Habla del
                mundo más amplio que no viste completo.
              </p>
            </div>
          </div>
        </NarrativeSection>

        <NarrativeSection className="narrative-beat">
          <p className="mb-4 text-sm font-semibold text-[var(--accent-strong)]">Variables · ¿cómo se miran?</p>
          <h2 className="text-xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            Tipos de variables
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className={`${card} !p-5`}>
              <h3 className="font-semibold text-[var(--text)]">Cualitativas (categóricas)</h3>
              <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                <li><span className="text-[var(--text)]">Nominales</span> sin orden natural.</li>
                <li><span className="text-[var(--text)]">Ordinales</span> con orden, sin distancia fija.</li>
              </ul>
            </div>
            <div className={`${card} !p-5`}>
              <h3 className="font-semibold text-[var(--text)]">Cuantitativas (numéricas)</h3>
              <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                <li><span className="text-[var(--text)]">Discretas</span> cuentas en enteros.</li>
                <li><span className="text-[var(--text)]">Continuas</span> pueden tomar valores decimales.</li>
              </ul>
            </div>
          </div>
        </NarrativeSection>

        <NarrativeSection className="narrative-beat">
          <p className="mb-4 text-sm font-semibold text-[var(--accent-strong)]">Un paso más fino</p>
          <h2 className="text-xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            Niveles de medida
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: 'Nominal', d: 'Solo etiqueta. Ej.: color de ojos.' },
              { t: 'Ordinal', d: 'Orden claro. Ej.: satisfacción.' },
              { t: 'Intervalo', d: 'Distancias fijas sin cero absoluto. Ej.: °C.' },
              { t: 'Razón', d: 'Cero verdadero + proporciones. Ej.: edad.' },
            ].map((x) => (
              <div key={x.t} className={`${card} !p-4`}>
                <h3 className="font-semibold text-[var(--text)]">{x.t}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">{x.d}</p>
              </div>
            ))}
          </div>
        </NarrativeSection>

        <NarrativeSection className="narrative-beat">
          <p className="mb-4 text-sm font-semibold text-[var(--accent-strong)]">Interactividad sencilla</p>
          <h2 className="text-xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            Pon nombres a ejemplos reales
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
            Elige un caso. Observa cómo etiquetamos tipo y nivel sin mezclar ambas ideas todavía: primero ves
            el mapa verbal, después lo automatizamos en tus ejercicios.
          </p>
          <div className={`mt-8 ${card}`}>
            <label htmlFor="var-pick" className="block text-sm font-medium text-[var(--text)]">
              Elige una variable
            </label>
            <select
              id="var-pick"
              value={selectedExample}
              onChange={(e) => setSelectedExample(e.target.value)}
              className="mt-3 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">Selecciona…</option>
              {variableExamples.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
            {active && (
              <div className="mt-6 space-y-3 rounded-xl bg-[var(--surface-muted)] p-4 text-sm">
                <p className="text-[var(--text)]">{active.description}</p>
                <p>
                  <span className="font-medium text-[var(--text)]">Tipo </span>
                  <span className="text-[var(--text-muted)]">{active.type}</span>
                </p>
                <p>
                  <span className="font-medium text-[var(--text)]">Nivel de medida </span>
                  <span className="text-[var(--text-muted)]">{active.scale}</span>
                </p>
              </div>
            )}
          </div>
        </NarrativeSection>

        <NarrativeSection className="narrative-beat">
          <p className="mb-4 text-sm font-semibold text-[var(--accent-strong)]">
            ¿Lo tienes presente?
          </p>
          <h2 className="text-xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            Tres comprobaciones rápidas
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
            Una pregunta por bloque para no saturar la lectura.
          </p>
        </NarrativeSection>

        <NarrativeSection className="narrative-beat">
          <Question
            question="¿Cuál de las siguientes variables es cuantitativa continua?"
            type="multiple-choice"
            options={[
              { text: 'Número de hermanos', value: false },
              { text: 'Altura en centímetros', value: true },
              { text: 'Color de cabello', value: false },
              { text: 'Nivel educativo', value: false },
            ]}
            explanation="La altura en centímetros es cuantitativa continua porque puede tomar valores decimales dentro de un rango y tiene unidades en escala de razón."
          />
        </NarrativeSection>

        <NarrativeSection className="narrative-beat">
          <Question
            question="¿Qué nivel de medida tiene la variable 'Temperatura en grados Celsius'?"
            type="multiple-choice"
            options={[
              { text: 'Nominal', value: false },
              { text: 'Ordinal', value: false },
              { text: 'Intervalo', value: true },
              { text: 'Razón', value: false },
            ]}
            explanation="Celsius tiene escala de intervalo: hay orden y distancias interpretables, pero 0 °C no significa ausencia total de temperatura."
          />
        </NarrativeSection>

        <NarrativeSection className="narrative-beat">
          <Question
            question="¿Cuál es la diferencia principal entre variables cualitativas y cuantitativas?"
            type="multiple-choice"
            options={[
              { text: 'Las cualitativas siempre tienen más categorías', value: false },
              { text: 'Las cuantitativas se miden con números útiles como magnitud; las cualitativas, con categorías', value: true },
              { text: 'Las cualitativas son menos importantes en estadística', value: false },
              { text: 'Las cuantitativas siempre son continuas', value: false },
            ]}
            explanation="La distinción clave está en cómo registras cada observación: categorías versus magnitudes numéricas con interpretación consistente."
          />
        </NarrativeSection>

        <NarrativeSection className="narrative-beat">
          <h2 className="text-xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            Para cerrar esta parada
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className={`${card} !p-5`}>
              <h3 className="font-semibold text-[var(--text)]">Memoriza el mapa mental</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
                <li>Diferencias entre descripción e inferencia</li>
                <li>Tipos cualitativos vs cuantitativos</li>
                <li>Niveles de medida ordenados de menor a mayor riqueza</li>
              </ul>
            </div>
            <div className={`${card} !p-5`}>
              <h3 className="font-semibold text-[var(--text)]">¿Qué sigue?</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                Tablas para organizar información, después medidas de tendencia central y dispersión. Cada tema
                reutiliza el vocabulario que acabas de montar aquí.
              </p>
            </div>
          </div>
        </NarrativeSection>
      </div>

      <LessonNavigation
        currentStep={1}
        totalSteps={1}
        nextUrl="/lessons/descriptive-stats"
        showPrevious={false}
      />
    </article>
  )
}
