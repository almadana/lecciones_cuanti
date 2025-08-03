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
    description: 'Comprende la tendencia central y la dispersión de los datos',
    href: '/lessons/mean-deviation',
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
]

export default function Home() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-negro sm:text-5xl bg-morado-claro p-6 rounded-lg inline-block">
            Lecciones Cuanti - Métodos y Técnicas Cuantitativas
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Explora conceptos estadísticos a través de lecciones interactivas y visualizaciones 
          </p>
        </div>

        <div className="mt-12 prose prose-indigo mx-auto">
          <h2 className="text-negro bg-morado-claro p-3 rounded-lg inline-block">Estructura de las lecciones</h2>
          <p className="text-negro">
            Estas lecciones están diseñadas para ayudarte a comprender los conceptos fundamentales
            de la estadística a través de ejemplos interactivos y visualizaciones dinámicas.
          </p>

          <h3 className="text-negro font-bold">Lección 0: Introducción</h3>
          <p className="text-negro">
            Comenzaremos con los conceptos fundamentales de la estadística, incluyendo tipos de variables,
            escalas de medición y la diferencia entre estadística descriptiva e inferencial.
          </p>

          <h3 className="text-negro font-bold">Lección 1: Tablas</h3>
          <p className="text-negro">
            Aprenderás a organizar y visualizar datos usando tablas de frecuencia univariadas y bivariadas.
            Podrás crear y editar tus propias tablas en las secciones interactivas.
          </p>

          <h3 className="text-negro font-bold">Lección 2: Estadísticas Descriptivas</h3>
          <p className="text-negro">
            Exploraremos las medidas de tendencia central (media, mediana, moda) y
            las medidas de dispersión (desviación estándar, varianza) para resumir
            datos numéricos de manera efectiva.
          </p>

          <h3 className="text-negro font-bold">Lección 3: Muestreo</h3>
          <p className="text-negro">
            Aprenderás sobre los conceptos fundamentales del muestreo estadístico
            y cómo calcular intervalos de confianza para estimar parámetros poblacionales.
          </p>

          <h3 className="text-negro font-bold">Lección 4: Correlación</h3>
          <p className="text-negro">
            Analizaremos la relación entre variables continuas usando el coeficiente
            de correlación de Pearson y su interpretación.
          </p>

          <h3 className="text-negro font-bold">Lección 5: Regresión</h3>
          <p className="text-negro">
            Extenderemos el análisis de correlación para modelar relaciones lineales
            y realizar predicciones usando regresión lineal simple.
          </p>

          <h3 className="text-negro font-bold">Lección 6: Pruebas t</h3>
          <p className="text-negro">
            Comprenderás cómo comparar medias entre grupos usando las pruebas t de Student,
            tanto para muestras independientes como para muestras relacionadas.
          </p>

          <h3 className="text-negro font-bold">Lección 7: Chi cuadrado</h3>
          <p className="text-negro">
            Exploraremos la prueba de chi cuadrado para analizar la independencia
            entre variables categóricas y la bondad de ajuste.
          </p>

          <div className="mt-8 bg-morado-claro p-4 rounded-lg border border-morado-oscuro">
            <p className="text-negro font-bold">
              Utiliza el menú de navegación a la izquierda para acceder a las diferentes
              lecciones y sus componentes interactivos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
