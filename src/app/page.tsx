import Link from 'next/link'
import { BookOpenIcon, ChartBarIcon, CalculatorIcon, PencilIcon } from '@heroicons/react/24/outline'

const lessons = [
  {
    title: 'Tablas Univariadas',
    description: 'Aprende sobre tablas de frecuencias y su visualización',
    href: '/lessons/univariate-tables',
    icon: ChartBarIcon,
  },
  {
    title: 'Editor de Tablas Univariadas',
    description: 'Crea y edita tus propias tablas de frecuencias',
    href: '/lessons/univariate-tables-editable',
    icon: PencilIcon,
  },
  {
    title: 'Tablas Bivariadas',
    description: 'Explora relaciones entre dos variables',
    href: '/lessons/bivariate-tables',
    icon: CalculatorIcon,
  },
  {
    title: 'Media y Desviación Estándar',
    description: 'Comprende la tendencia central y la dispersión',
    href: '/lessons/mean-deviation',
    icon: BookOpenIcon,
  },
]

export default function Home() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-negro sm:text-5xl bg-morado-claro p-6 rounded-lg inline-block">
            Métodos y Técnicas Cuantitativas
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Explora conceptos estadísticos a través de lecciones interactivas y visualizaciones dinámicas
          </p>
        </div>

        <div className="mt-12 prose prose-indigo mx-auto">
          <h2 className="text-negro bg-morado-claro p-3 rounded-lg inline-block">Estructura de las lecciones</h2>
          <p className="text-negro">
            Este curso está diseñado para ayudarte a comprender los conceptos fundamentales
            de la estadística a través de ejemplos interactivos y visualizaciones dinámicas.
          </p>

          <h3 className="text-negro font-bold">Lección 1: Tablas Univariadas</h3>
          <p className="text-negro">
            Comenzaremos con el análisis de una sola variable, aprendiendo a organizar
            y visualizar datos usando tablas de frecuencia. Además, podrás crear y
            editar tus propias tablas en la sección 1.1.
          </p>

          <h3 className="text-negro font-bold">Lección 2: Tablas Bivariadas</h3>
          <p className="text-negro">
            Exploraremos la relación entre dos variables, aprendiendo a crear y
            interpretar tablas de contingencia.
          </p>

          <h3 className="text-negro font-bold">Lección 3: Medidas de Tendencia Central</h3>
          <p className="text-negro">
            Aprenderás sobre diferentes formas de resumir datos numéricos, incluyendo
            la media, mediana y moda.
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
