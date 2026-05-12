export type SubLesson = {
  id: string
  title: string
  href: string
}

export type LessonModule = {
  id: string
  title: string
  href: string
  subLessons: SubLesson[]
}

export const curriculum: LessonModule[] = [
  {
    id: '0',
    title: 'Introducción',
    href: '/lessons/introduction',
    subLessons: [],
  },
  {
    id: '1',
    title: 'Estadísticas descriptivas',
    href: '/lessons/descriptive-stats',
    subLessons: [
      { id: '1.1', title: 'Media, moda y cuartiles', href: '/lessons/descriptive-stats' },
      { id: '1.2', title: 'Editor: media, moda y cuartiles', href: '/lessons/descriptive-stats-editable' },
      { id: '1.3', title: 'Media y desvío', href: '/lessons/mean-deviation' },
      { id: '1.4', title: 'Editor: media y desvío', href: '/lessons/mean-deviation-editable' },
    ],
  },
  {
    id: '2',
    title: 'Tablas',
    href: '/lessons/univariate-tables',
    subLessons: [
      { id: '2.1', title: 'Tablas univariadas', href: '/lessons/univariate-tables' },
      { id: '2.2', title: 'Editor univariadas', href: '/lessons/univariate-tables-editable' },
      { id: '2.3', title: 'Tablas bivariadas', href: '/lessons/bivariate-tables' },
      { id: '2.4', title: 'Editor bivariadas', href: '/lessons/bivariate-tables-editable' },
      { id: '2.5', title: 'Editor avanzado', href: '/lessons/bivariate-tables-editable-2' },
    ],
  },
  {
    id: '3',
    title: 'Correlación',
    href: '/lessons/correlation',
    subLessons: [
      { id: '3.1', title: 'Correlación', href: '/lessons/correlation' },
      { id: '3.2', title: 'Editor de correlación', href: '/lessons/correlation-editable' },
    ],
  },
  {
    id: '4',
    title: 'Regresión',
    href: '/lessons/regression',
    subLessons: [
      { id: '4.1', title: 'Regresión lineal', href: '/lessons/regression' },
      { id: '4.2', title: 'Editor de regresión', href: '/lessons/regression-editable' },
      { id: '4.3', title: 'Regresión interactiva', href: '/lessons/regression-interactive' },
    ],
  },
  {
    id: '5',
    title: 'Muestreo',
    href: '/lessons/sampling',
    subLessons: [
      { id: '5.1', title: 'Muestreo', href: '/lessons/sampling' },
      { id: '5.2', title: 'Intervalos de confianza', href: '/lessons/confidence-interval' },
    ],
  },
  {
    id: '6',
    title: 'Pruebas t',
    href: '/lessons/t-test',
    subLessons: [
      { id: '6.1', title: 'Prueba t de Student', href: '/lessons/t-test' },
      { id: '6.2', title: 'Editor de prueba t', href: '/lessons/t-test-editable' },
      { id: '6.3', title: 'Editor avanzado t', href: '/lessons/t-test-editable-2' },
    ],
  },
  {
    id: '7',
    title: 'Chi cuadrado',
    href: '/lessons/chi-square',
    subLessons: [
      { id: '7.1', title: 'Chi cuadrado', href: '/lessons/chi-square' },
      { id: '7.2', title: 'Editor chi cuadrado', href: '/lessons/chi-square-editable' },
    ],
  },
]
