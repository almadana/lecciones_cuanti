'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isOpen: boolean;
}

const lessons = [
  {
    id: '0',
    title: 'Introducción',
    href: '/lessons/introduction',
    subLessons: []
  },
  {
    id: '1',
    title: 'Estadísticas Descriptivas',
    href: '/lessons/descriptive-stats',
    subLessons: [
      {
        id: '1.1',
        title: 'Media, Moda y Cuartiles',
        href: '/lessons/descriptive-stats',
      },
      {
        id: '1.2',
        title: 'Editor de Media, Moda y Cuartiles',
        href: '/lessons/descriptive-stats-editable',
      },
      {
        id: '1.3',
        title: 'Media y Desvío',
        href: '/lessons/mean-deviation',
      },
      {
        id: '1.4',
        title: 'Editor de Media y Desvío',
        href: '/lessons/mean-deviation-editable',
      }
    ]
  },
  {
    id: '2',
    title: 'Tablas',
    href: '/lessons/univariate-tables',
    subLessons: [
      {
        id: '2.1',
        title: 'Tablas Univariadas',
        href: '/lessons/univariate-tables',
      },
      {
        id: '2.2',
        title: 'Editor de Tablas Univariadas',
        href: '/lessons/univariate-tables-editable',
      },
      {
        id: '2.3',
        title: 'Tablas Bivariadas',
        href: '/lessons/bivariate-tables',
      },
      {
        id: '2.4',
        title: 'Editor de Tablas Bivariadas',
        href: '/lessons/bivariate-tables-editable',
      },
      {
        id: '2.5',
        title: 'Editor Avanzado de Tablas',
        href: '/lessons/bivariate-tables-editable-2',
      }
    ]
  },
  {
    id: '3',
    title: 'Correlación',
    href: '/lessons/correlation',
    subLessons: [
      {
        id: '3.1',
        title: 'Correlación',
        href: '/lessons/correlation',
      },
      {
        id: '3.2',
        title: 'Editor de Correlación',
        href: '/lessons/correlation-editable',
      }
    ]
  },
  {
    id: '4',
    title: 'Regresión',
    href: '/lessons/regression',
    subLessons: [
      {
        id: '4.1',
        title: 'Regresión Lineal',
        href: '/lessons/regression',
      },
      {
        id: '4.2',
        title: 'Editor de Regresión',
        href: '/lessons/regression-editable',
      },
      {
        id: '4.3',
        title: 'Regresión Interactiva',
        href: '/lessons/regression-interactive',
      }
    ]
  },
  {
    id: '5',
    title: 'Muestreo',
    href: '/lessons/sampling',
    subLessons: [
      {
        id: '5.1',
        title: 'Muestreo',
        href: '/lessons/sampling',
      },
      {
        id: '5.2',
        title: 'Intervalos de Confianza',
        href: '/lessons/confidence-interval',
      }
    ]
  },
  {
    id: '6',
    title: 'Pruebas t',
    href: '/lessons/t-test',
    subLessons: [
      {
        id: '6.1',
        title: 'Prueba t de Student',
        href: '/lessons/t-test',
      },
      {
        id: '6.2',
        title: 'Editor de Prueba t',
        href: '/lessons/t-test-editable',
      },
      {
        id: '6.3',
        title: 'Editor Avanzado de Prueba t',
        href: '/lessons/t-test-editable-2',
      }
    ]
  },
  {
    id: '7',
    title: 'Chi cuadrado',
    href: '/lessons/chi-square',
    subLessons: [
      {
        id: '7.1',
        title: 'Chi cuadrado',
        href: '/lessons/chi-square',
      },
      {
        id: '7.2',
        title: 'Editor de Chi cuadrado',
        href: '/lessons/chi-square-editable',
      }
    ]
  }
]

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={`fixed left-0 top-0 h-full w-64 bg-[#4b00f9] shadow-lg border-r border-morado-claro overflow-y-auto transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="bg-black/30 p-3 rounded-none">
        <h2 className="text-lg font-bold text-white text-center">
          Lecciones Cuanti
        </h2>
      </div>
      <div className="p-4">
        <nav className="space-y-1">
          {lessons.map((lesson) => (
            <div key={lesson.id}>
              <Link
                href={lesson.href}
                className={`${
                  pathname === lesson.href
                    ? 'bg-white text-[#4b00f9] font-bold'
                    : 'text-white hover:bg-white hover:text-[#4b00f9] hover:font-bold'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
              >
                <span className="truncate">{lesson.title}</span>
              </Link>
              {lesson.subLessons.map((subLesson) => (
                <Link
                  key={subLesson.id}
                  href={subLesson.href}
                  className={`${
                    pathname === subLesson.href
                      ? 'bg-white text-[#4b00f9] font-bold'
                      : 'text-white hover:bg-white hover:text-[#4b00f9] hover:font-bold'
                  } group flex items-center pl-8 pr-3 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                >
                  <span className="truncate">{subLesson.title}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
} 