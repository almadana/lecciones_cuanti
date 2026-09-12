export type SubLesson = {
  id: string
  title: string
  href: string
}

export type LessonModule = {
  id: string
  title: string
  question: string
  description: string
  href: string
  subLessons: SubLesson[]
}

export const curriculum: LessonModule[] = [
  {
    id: '0',
    title: 'Introducción',
    question: '¿Qué puede —y qué no puede— decirnos un dato?',
    description: 'De una pregunta cotidiana a variables, evidencia e inferencia.',
    href: '/lessons/introduction',
    subLessons: [],
  },
  {
    id: '1',
    title: 'Estadísticas descriptivas',
    question: '¿Cómo resumimos un conjunto sin borrar lo importante?',
    description: 'Centro, posición y variabilidad para describir distribuciones.',
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
    question: '¿Qué porcentaje de qué?',
    description: 'Frecuencias y proporciones para leer variables categóricas.',
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
    question: '¿Dos variables se mueven juntas?',
    description: 'Relaciones lineales, patrones y límites de la asociación.',
    href: '/lessons/correlation',
    subLessons: [
      { id: '3.1', title: 'Correlación', href: '/lessons/correlation' },
      { id: '3.2', title: 'Editor de correlación', href: '/lessons/correlation-editable' },
    ],
  },
  {
    id: '4',
    title: 'Regresión',
    question: '¿Podemos anticipar un valor?',
    description: 'Modelos lineales para explicar relaciones y hacer predicciones.',
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
    question: '¿Cuánto cambia una conclusión de muestra en muestra?',
    description: 'Muestras concretas, error estándar e intervalos de confianza.',
    href: '/lessons/sampling',
    subLessons: [
      { id: '5.1', title: 'Muestreo', href: '/lessons/sampling' },
      { id: '5.2', title: 'Intervalos de confianza', href: '/lessons/confidence-interval' },
    ],
  },
  {
    id: '6',
    title: 'Inferencia (randomización)',
    question: '¿Qué veríamos si el grupo no importara?',
    description: 'Hipótesis nula, permutaciones y evidencia por simulación.',
    href: '/lessons/randomization-inference',
    subLessons: [
      {
        id: '6.1',
        title: 'Fundamentos e inferencia por randomización',
        href: '/lessons/randomization-inference',
      },
    ],
  },
  {
    id: '7',
    title: 'Pruebas t',
    question: '¿La diferencia observada podría ser azar?',
    description: 'Comparación de medias, estadístico t y valor p.',
    href: '/lessons/t-test',
    subLessons: [
      { id: '7.1', title: 'Prueba t de Student', href: '/lessons/t-test' },
      { id: '7.2', title: 'Editor de prueba t', href: '/lessons/t-test-editable' },
      { id: '7.3', title: 'Editor avanzado t', href: '/lessons/t-test-editable-2' },
    ],
  },
  {
    id: '8',
    title: 'Chi cuadrado',
    question: '¿Estas variables categóricas son independientes?',
    description: 'Frecuencias observadas, esperadas y residuos.',
    href: '/lessons/chi-square',
    subLessons: [
      { id: '8.1', title: 'Chi cuadrado', href: '/lessons/chi-square' },
      { id: '8.2', title: 'Editor chi cuadrado', href: '/lessons/chi-square-editable' },
    ],
  },
]
