import Link from 'next/link'
import { BookOpenIcon, ChartBarIcon, CalculatorIcon, PencilIcon } from '@heroicons/react/24/outline'

const lessons = [
  {
    title: 'Introducción',
    description: 'Conceptos fundamentales de estadística y tipos de variables',
    href: '/lessons/introduction',
    icon: BookOpenIcon,
  },
  {
    title: 'Tablas',
    description: 'Aprende sobre tablas de frecuencias univariadas y bivariadas',
    href: '/lessons/univariate-tables',
    icon: ChartBarIcon,
  },
  {
    title: 'Estadísticas Descriptivas',
    description: 'Comprende la tendencia central, moda y cuartiles de los datos',
    href: '/lessons/descriptive-stats',
    icon: CalculatorIcon,
  },
  {
    title: 'Muestreo',
    description: 'Explora conceptos de muestreo e intervalos de confianza',
    href: '/lessons/sampling',
    icon: BookOpenIcon,
  },
  {
    title: 'Correlación',
    description: 'Analiza la relación entre variables continuas',
    href: '/lessons/correlation',
    icon: PencilIcon,
  },
  {
    title: 'Regresión',
    description: 'Modela relaciones lineales y realiza predicciones',
    href: '/lessons/regression',
    icon: CalculatorIcon,
  },
  {
    title: 'Pruebas t',
    description: 'Compara medias entre grupos usando pruebas t de Student',
    href: '/lessons/t-test',
    icon: CalculatorIcon,
  },
  {
    title: 'Chi cuadrado',
    description: 'Analiza la independencia entre variables categóricas',
    href: '/lessons/chi-square',
    icon: ChartBarIcon,
  },
  {
    title: 'Inferencia por randomización',
    description: 'Hipótesis nula, permutaciones y valor p con satisfacción y grupos',
    href: '/lessons/randomization-inference',
    icon: BookOpenIcon,
  },
]

export default function Home() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Lecciones Cuanti - Métodos y Técnicas Cuantitativas
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Explora conceptos estadísticos a través de lecciones interactivas y visualizaciones 
          </p>
        </div>

        <div className="mt-12 prose prose-indigo mx-auto">
          <h2>Estructura de las lecciones</h2>
          <p>
            Estas lecciones están diseñadas para ayudarte a comprender los conceptos fundamentales
            de la estadística a través de ejemplos interactivos y visualizaciones dinámicas.
          </p>

          <h3 className="font-bold" >Lección 0: Introducción</h3>
          <p >
            Comenzaremos con los conceptos fundamentales de la estadística, incluyendo tipos de variables,
            escalas de medición y la diferencia entre estadística descriptiva e inferencial.
          </p>

          <h3 className="font-bold" >Lección 1: Tablas</h3>
          <p >
            Aprenderás a organizar y visualizar datos usando tablas de frecuencia univariadas y bivariadas.
            Podrás crear y editar tus propias tablas en las secciones interactivas.
          </p>

          <h3 className="font-bold" >Lección 2: Estadísticas Descriptivas</h3>
          <p >
            Exploraremos las medidas de tendencia central (media, moda) y posición (cuartiles) 
            para resumir datos numéricos de manera efectiva. También aprenderás sobre 
            las medidas de dispersión (desviación estándar, varianza).
          </p>

          <h3 className="font-bold" >Lección 3: Muestreo</h3>
          <p >
            Aprenderás sobre los conceptos fundamentales del muestreo estadístico
            y cómo calcular intervalos de confianza para estimar parámetros poblacionales.
          </p>

          <h3 className="font-bold" >Lección 4: Correlación</h3>
          <p >
            Analizaremos la relación entre variables continuas usando el coeficiente
            de correlación de Pearson y su interpretación.
          </p>

          <h3 className="font-bold" >Lección 5: Regresión</h3>
          <p >
            Extenderemos el análisis de correlación para modelar relaciones lineales
            y realizar predicciones usando regresión lineal simple.
          </p>

          <h3 className="font-bold" >Lección 6: Pruebas t</h3>
          <p >
            Comprenderás cómo comparar medias entre grupos usando las pruebas t de Student,
            tanto para muestras independientes como para muestras relacionadas.
          </p>

          <h3 className="font-bold" >Lección 7: Chi cuadrado</h3>
          <p >
            Exploraremos la prueba de chi cuadrado para analizar la independencia
            entre variables categóricas y la bondad de ajuste.
          </p>

          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm not-prose">
            <p className="text-sm font-medium text-[var(--text)]">
              Abre el botón <strong>Índice</strong> arriba a la derecha para saltar a cualquier lección o
              subsección interactiva.
            </p>
          </div>

          <h2 className="mt-14 not-prose text-2xl font-semibold text-[var(--text)]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            Saltos rápidos
          </h2>
          <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
            {lessons.map(({ title, description, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--accent-strong)] group-hover:bg-[var(--surface)]">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text)]">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
