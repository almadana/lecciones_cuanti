'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isOpen: boolean;
}

const lessons = [
  {
    id: '1',
    title: 'Tablas Univariadas',
    href: '/lessons/univariate-tables',
    subLessons: [
      {
        id: '1.1',
        title: 'Editor de Tablas',
        href: '/lessons/univariate-tables-editable',
      }
    ]
  },
  {
    id: '2',
    title: 'Tablas Bivariadas',
    href: '/lessons/bivariate-tables',
    subLessons: [
      {
        id: '2.1',
        title: 'Editor de Tablas',
        href: '/lessons/bivariate-tables-editable',
      },
      {
        id: '2.2',
        title: 'Editor Avanzado',
        href: '/lessons/bivariate-tables-editable-2',
      }
    ]
  },
  {
    id: '3',
    title: 'Media y Desvío',
    href: '/lessons/mean-deviation',
    subLessons: [
      {
        id: '3.1',
        title: 'Editor de Media y Desvío',
        href: '/lessons/mean-deviation-editable',
      }
    ]
  },
  {
    id: '4',
    title: 'Muestreo',
    href: '/lessons/sampling',
    subLessons: [
      {
        id: '4.1',
        title: 'Intervalos de Confianza',
        href: '/lessons/confidence-interval',
      }
    ]
  },
  {
    id: '5',
    title: 'Prueba t de Student',
    href: '/lessons/t-test',
    subLessons: [
      {
        id: '5.1',
        title: 'Editor de Prueba t',
        href: '/lessons/t-test-editable',
      },
      {
        id: '5.2',
        title: 'Editor Avanzado',
        href: '/lessons/t-test-editable-2',
      }
    ]
  },
  {
    id: '6',
    title: 'Chi cuadrado',
    href: '/lessons/chi-square',
    subLessons: [
      {
        id: '6.1',
        title: 'Editor de Chi cuadrado',
        href: '/lessons/chi-square-editable',
      }
    ]
  },
  {
    id: '7',
    title: 'Correlación',
    href: '/lessons/correlation',
    subLessons: [
      {
        id: '7.1',
        title: 'Editor de Correlación',
        href: '/lessons/correlation-editable',
      }
    ]
  },
  {
    id: '8',
    title: 'Estadísticas Descriptivas',
    href: '/lessons/descriptive-stats',
    subLessons: [
      {
        id: '8.1',
        title: 'Editor de Estadísticas Descriptivas',
        href: '/lessons/descriptive-stats-editable',
      }
    ]
  }
]

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={`fixed left-0 top-0 h-full w-64 bg-blanco shadow-lg border-r border-gris-borde overflow-y-auto transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4">
        <h2 className="text-lg font-bold text-negro mb-4 bg-morado-claro p-3 rounded-lg">
          Lecciones de Estadística
        </h2>
        <nav className="space-y-1">
          {lessons.map((lesson) => (
            <div key={lesson.id}>
              <Link
                href={lesson.href}
                className={`${
                  pathname === lesson.href
                    ? 'bg-morado-oscuro text-blanco font-bold'
                    : 'text-negro hover:bg-morado-oscuro hover:text-blanco hover:font-bold'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
              >
                <span className="truncate">{lesson.id}. {lesson.title}</span>
              </Link>
              {lesson.subLessons.map((subLesson) => (
                <Link
                  key={subLesson.id}
                  href={subLesson.href}
                  className={`${
                    pathname === subLesson.href
                      ? 'bg-morado-oscuro text-blanco font-bold'
                      : 'text-negro hover:bg-morado-oscuro hover:text-blanco hover:font-bold'
                  } group flex items-center pl-8 pr-3 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                >
                  <span className="truncate">{subLesson.id}. {subLesson.title}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
} 