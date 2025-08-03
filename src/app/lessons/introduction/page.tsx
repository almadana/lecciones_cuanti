'use client'

import { useState } from 'react'
import Question from '@/app/components/Question'
import LessonNavigation from '@/app/components/LessonNavigation'

export default function Introduction() {
  const [selectedVariableType, setSelectedVariableType] = useState<string>('')
  const [selectedScale, setSelectedScale] = useState<string>('')

  const variableExamples = [
    {
      name: 'Edad',
      type: 'cuantitativa',
      scale: 'razón',
      description: 'Se puede medir en años, meses, días. Tiene un cero absoluto.'
    },
    {
      name: 'Temperatura (Celsius)',
      type: 'cuantitativa',
      scale: 'intervalo',
      description: 'Se mide en grados. El cero no es absoluto (0°C no significa ausencia de temperatura).'
    },
    {
      name: 'Nivel de satisfacción',
      type: 'cualitativa',
      scale: 'ordinal',
      description: 'Se puede ordenar: Muy insatisfecho < Insatisfecho < Neutral < Satisfecho < Muy satisfecho'
    },
    {
      name: 'Color de ojos',
      type: 'cualitativa',
      scale: 'nominal',
      description: 'No se puede ordenar: Azul, Verde, Marrón, Negro'
    },
    {
      name: 'Número de hijos',
      type: 'cuantitativa',
      scale: 'razón',
      description: 'Se puede contar. El cero significa ausencia de hijos.'
    },
    {
      name: 'Género',
      type: 'cualitativa',
      scale: 'nominal',
      description: 'Categorías sin orden: Masculino, Femenino, No binario'
    }
  ]

  const checkVariableType = (variableName: string) => {
    const variable = variableExamples.find(v => v.name === variableName)
    return variable?.type === selectedVariableType
  }

  const checkScale = (variableName: string) => {
    const variable = variableExamples.find(v => v.name === variableName)
    return variable?.scale === selectedScale
  }

  return (
    <div className="py-8">
      <LessonNavigation
        currentStep={0}
        totalSteps={1}
        nextUrl="/lessons/univariate-tables"
        showPrevious={false}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Introducción a la Estadística
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Conceptos fundamentales para el análisis de datos
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {/* ¿Qué es la Estadística? */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              ¿Qué es la Estadística?
            </h2>
            <div className="prose text-gray-700">
              <p className="mb-4">
                La <strong>estadística</strong> es la ciencia que se encarga de recolectar, organizar, 
                analizar, interpretar y presentar datos para tomar decisiones informadas.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gris-claro p-4 rounded-lg">
                  <h3 className="font-bold text-negro mb-2">Estadística Descriptiva</h3>
                  <p className="text-sm">
                    Se encarga de resumir y describir las características principales de un conjunto de datos.
                    Incluye medidas de tendencia central, dispersión y visualizaciones.
                  </p>
                </div>
                <div className="bg-gris-claro p-4 rounded-lg">
                  <h3 className="font-bold text-negro mb-2">Estadística Inferencial</h3>
                  <p className="text-sm">
                    Permite hacer conclusiones sobre una población basándose en muestras de datos.
                    Incluye pruebas de hipótesis, intervalos de confianza y correlaciones.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tipos de Variables */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              Tipos de Variables
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gris-claro p-4 rounded-lg">
                <h3 className="font-bold text-negro mb-3">Variables Cualitativas (Categóricas)</h3>
                <ul className="text-sm space-y-2">
                  <li>• <strong>Nominales:</strong> No tienen orden (género, color de ojos)</li>
                  <li>• <strong>Ordinales:</strong> Tienen orden pero no distancia fija (nivel educativo, satisfacción)</li>
                </ul>
                <p className="mt-3 text-sm text-gray-600">
                  Se miden en categorías o etiquetas.
                </p>
              </div>
              <div className="bg-gris-claro p-4 rounded-lg">
                <h3 className="font-bold text-negro mb-3">Variables Cuantitativas (Numéricas)</h3>
                <ul className="text-sm space-y-2">
                  <li>• <strong>Discretas:</strong> Valores enteros (número de hijos, calificaciones)</li>
                  <li>• <strong>Continuas:</strong> Valores decimales (altura, peso, tiempo)</li>
                </ul>
                <p className="mt-3 text-sm text-gray-600">
                  Se miden en números con unidades específicas.
                </p>
              </div>
            </div>
          </div>

          {/* Escalas de Medición */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              Escalas de Medición
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gris-claro p-4 rounded-lg">
                <h3 className="font-bold text-negro mb-2">Nominal</h3>
                <p className="text-sm">
                  Solo clasificación sin orden. Ejemplo: Color de ojos, Género
                </p>
              </div>
              <div className="bg-gris-claro p-4 rounded-lg">
                <h3 className="font-bold text-negro mb-2">Ordinal</h3>
                <p className="text-sm">
                  Clasificación con orden. Ejemplo: Nivel educativo, Satisfacción
                </p>
              </div>
              <div className="bg-gris-claro p-4 rounded-lg">
                <h3 className="font-bold text-negro mb-2">Intervalo</h3>
                <p className="text-sm">
                  Orden y distancia fija, sin cero absoluto. Ejemplo: Temperatura Celsius
                </p>
              </div>
              <div className="bg-gris-claro p-4 rounded-lg">
                <h3 className="font-bold text-negro mb-2">Razón</h3>
                <p className="text-sm">
                  Orden, distancia fija y cero absoluto. Ejemplo: Edad, Peso, Altura
                </p>
              </div>
            </div>
          </div>

          {/* Ejemplos Interactivos */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              Ejemplos Interactivos
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-negro mb-3">Clasifica el tipo de variable:</h3>
                <select
                  value={selectedVariableType}
                  onChange={(e) => setSelectedVariableType(e.target.value)}
                  className="w-full p-2 border border-gris-borde rounded-md mb-4"
                >
                  <option value="">Selecciona una variable...</option>
                  {variableExamples.map(v => (
                    <option key={v.name} value={v.name}>{v.name}</option>
                  ))}
                </select>
                {selectedVariableType && (
                  <div className="bg-gris-claro p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>{selectedVariableType}</strong>: {variableExamples.find(v => v.name === selectedVariableType)?.description}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-negro mb-3">Identifica la escala de medición:</h3>
                <select
                  value={selectedScale}
                  onChange={(e) => setSelectedScale(e.target.value)}
                  className="w-full p-2 border border-gris-borde rounded-md mb-4"
                >
                  <option value="">Selecciona una variable...</option>
                  {variableExamples.map(v => (
                    <option key={v.name} value={v.name}>{v.name}</option>
                  ))}
                </select>
                {selectedScale && (
                  <div className="bg-gris-claro p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Escala {variableExamples.find(v => v.name === selectedScale)?.scale}</strong>: {variableExamples.find(v => v.name === selectedScale)?.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preguntas de Evaluación */}
          <div className="space-y-6">
            <Question
              question="¿Cuál de las siguientes variables es cuantitativa continua?"
              type="multiple-choice"
              options={[
                { text: 'Número de hermanos', value: false },
                { text: 'Altura en centímetros', value: true },
                { text: 'Color de cabello', value: false },
                { text: 'Nivel educativo', value: false }
              ]}
              explanation="La altura en centímetros es una variable cuantitativa continua porque puede tomar cualquier valor decimal dentro de un rango y se mide en una escala de razón."
            />

            <Question
              question="¿Qué escala de medición tiene la variable 'Temperatura en grados Celsius'?"
              type="multiple-choice"
              options={[
                { text: 'Nominal', value: false },
                { text: 'Ordinal', value: false },
                { text: 'Intervalo', value: true },
                { text: 'Razón', value: false }
              ]}
              explanation="La temperatura en Celsius tiene escala de intervalo porque tiene orden y distancia fija entre valores, pero no tiene un cero absoluto (0°C no significa ausencia de temperatura)."
            />

            <Question
              question="¿Cuál es la diferencia principal entre variables cualitativas y cuantitativas?"
              type="multiple-choice"
              options={[
                { text: 'Las cualitativas siempre tienen más categorías', value: false },
                { text: 'Las cuantitativas se pueden medir con números, las cualitativas no', value: true },
                { text: 'Las cualitativas son más importantes en estadística', value: false },
                { text: 'Las cuantitativas siempre son continuas', value: false }
              ]}
              explanation="La diferencia principal es que las variables cuantitativas se pueden medir con números y tienen unidades específicas, mientras que las cualitativas se miden en categorías o etiquetas."
            />
          </div>

          {/* Resumen */}
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
              Resumen de Conceptos Clave
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-negro mb-2">Para recordar:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>La estadística ayuda a tomar decisiones basadas en datos</li>
                  <li>Las variables cualitativas se miden en categorías</li>
                  <li>Las variables cuantitativas se miden en números</li>
                  <li>La escala de medición determina qué análisis usar</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-negro mb-2">Próximos pasos:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Aprenderás a organizar datos en tablas de frecuencia</li>
                  <li>Explorarás medidas de tendencia central</li>
                  <li>Analizarás relaciones entre variables</li>
                  <li>Realizarás pruebas estadísticas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LessonNavigation
        currentStep={0}
        totalSteps={1}
        nextUrl="/lessons/univariate-tables"
        showPrevious={false}
      />
    </div>
  )
} 