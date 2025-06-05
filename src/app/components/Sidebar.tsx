'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
  }
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-1">
      {lessons.map((lesson) => (
        <div key={lesson.id}>
          <Link
            href={lesson.href}
            className={`${
              pathname === lesson.href
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
          >
            <span className="truncate">{lesson.id}. {lesson.title}</span>
          </Link>
          {lesson.subLessons.map((subLesson) => (
            <Link
              key={subLesson.id}
              href={subLesson.href}
              className={`${
                pathname === subLesson.href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center pl-8 pr-3 py-2 text-sm font-medium rounded-md`}
            >
              <span className="truncate">{subLesson.id}. {subLesson.title}</span>
            </Link>
          ))}
        </div>
      ))}
    </nav>
  )
} 