'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Question from '@/app/components/Question';
import jStat from 'jstat';
import LessonHeader from '@/app/components/LessonHeader';
import LessonNavigation from '@/app/components/LessonNavigation';

export default function ChiSquareEditablePage() {
  const initialData = [
    [52, 183, 226, 80],  // Hombres
    [114, 280, 194, 58], // Mujeres
  ];

  const [observedData, setObservedData] = useState(initialData);
  const [showExplanation, setShowExplanation] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const rowLabels = ['Hombres', 'Mujeres'];
  const colLabels = ['Muy fuerte', 'Fuerte', 'Débil', 'No existe'];

  const rowTotals = observedData.map(row => 
    row.reduce((acc, val) => acc + val, 0)
  );

  const colTotals = observedData[0].map((_, colIndex) =>
    observedData.reduce((acc, row) => acc + row[colIndex], 0)
  );

  const grandTotal = rowTotals.reduce((acc, val) => acc + val, 0);

  const expectedData = observedData.map((row, i) =>
    row.map((_, j) => (rowTotals[i] * colTotals[j]) / grandTotal)
  );

  const chiSquare = observedData.reduce((acc, row, i) =>
    acc + row.reduce((rowAcc, observed, j) => {
      const expected = expectedData[i][j];
      return rowAcc + Math.pow(observed - expected, 2) / expected;
    }, 0),
    0
  );

  const degreesOfFreedom = (observedData.length - 1) * (observedData[0].length - 1);
  const pValue = 1 - (jStat as any).chisquare.cdf(chiSquare, degreesOfFreedom);

  const handleValueChange = (rowIndex: number, colIndex: number, value: string) => {
    const newValue = parseInt(value) || 0;
    const newData = observedData.map((row, i) =>
      i === rowIndex
        ? row.map((cell, j) => (j === colIndex ? newValue : cell))
        : [...row]
    );
    setObservedData(newData);
    setDataVersion(prev => prev + 1);
  };

  const resetData = () => {
    setObservedData(initialData);
    setDataVersion(prev => prev + 1);
  };

  // Función para calcular el desvío relativo
  const getRelativeDeviation = (observed: number, expected: number) => {
    return (observed - expected) / expected;
  };

  // Función para obtener el color de fondo basado en el desvío
  const getBackgroundColor = (deviation: number) => {
    // Normalizar el desvío para que valores extremos no generen colores muy saturados
    // Usando ±0.5 (50% de diferencia) como valores extremos
    const normalizedDev = Math.min(Math.max(deviation, -0.5), 0.5) / 0.5;
    
    if (normalizedDev < 0) {
      // Rojo para valores menores que lo esperado
      return `rgba(255, 0, 0, ${Math.abs(normalizedDev) * 0.3})`;
    } else if (normalizedDev > 0) {
      // Azul para valores mayores que lo esperado
      return `rgba(0, 0, 255, ${normalizedDev * 0.3})`;
    }
    return 'white'; // Para valores cercanos a lo esperado
  };

  return (
    <div className="py-8">
      <LessonNavigation
        currentStep={2}
        totalSteps={2}
        previousUrl="/lessons/chi-square"
        showNext={false}
      />
      <article className="max-w-4xl mx-auto p-4">
        <LessonHeader title="Chi cuadrado de independencia - Versión Editable" />
        
        <section className="mb-8">
          <p className="mb-4">
            En esta versión puedes modificar los valores de la tabla original y ver cómo los cambios 
            afectan al estadístico Chi cuadrado y su significancia estadística.
          </p>
          <button
            onClick={resetData}
            className="bg-gray-500 text-white px-4 py-2 rounded mr-4"
          >
            Resetear Datos
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setShowExplanation(!showExplanation)}
          >
            {showExplanation ? "Ocultar detalles" : "Mostrar más detalles"}
          </motion.button>

          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <p className="mb-2">
                Prueba diferentes escenarios modificando los valores en la tabla. Por ejemplo:
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>¿Qué sucede si las proporciones son iguales entre hombres y mujeres?</li>
                <li>¿Qué pasa si aumentas las diferencias entre los grupos?</li>
                <li>¿Cómo afecta el tamaño total de la muestra al valor p?</li>
              </ul>
            </motion.div>
          )}
        </section>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Datos Observados</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 mb-4">
              <thead>
                <tr>
                  <th className="border p-2">Género</th>
                  {colLabels.map((label, i) => (
                    <th key={i} className="border p-2">{label}</th>
                  ))}
                  <th className="border p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {observedData.map((row, i) => (
                  <tr key={i}>
                    <td className="border p-2 font-semibold">{rowLabels[i]}</td>
                    {row.map((val, j) => {
                      const deviation = getRelativeDeviation(val, expectedData[i][j]);
                      return (
                        <td key={j} className="border p-2" style={{ backgroundColor: getBackgroundColor(deviation) }}>
                          <input
                            type="number"
                            min="0"
                            value={val}
                            onChange={(e) => handleValueChange(i, j, e.target.value)}
                            className="w-20 p-1 border rounded text-center bg-transparent"
                          />
                        </td>
                      );
                    })}
                    <td className="border p-2 font-semibold">{rowTotals[i]}</td>
                  </tr>
                ))}
                <tr>
                  <td className="border p-2 font-semibold">Total</td>
                  {colTotals.map((total, i) => (
                    <td key={i} className="border p-2 font-semibold">{total}</td>
                  ))}
                  <td className="border p-2 font-semibold">{grandTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Frecuencias Esperadas</h2>
          <div className="mb-2 text-sm text-gray-600">
            <p>Los colores indican la diferencia entre lo observado y lo esperado:</p>
            <ul className="list-disc list-inside">
              <li><span className="text-red-500">Rojo</span>: menos casos que lo esperado</li>
              <li><span className="text-blue-500">Azul</span>: más casos que lo esperado</li>
              <li>Blanco: similar a lo esperado</li>
            </ul>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 mb-4">
              <thead>
                <tr>
                  <th className="border p-2">Género</th>
                  {colLabels.map((label, i) => (
                    <th key={i} className="border p-2">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expectedData.map((row, i) => (
                  <tr key={i}>
                    <td className="border p-2 font-semibold">{rowLabels[i]}</td>
                    {row.map((val, j) => {
                      const deviation = getRelativeDeviation(observedData[i][j], val);
                      return (
                        <td 
                          key={j} 
                          className="border p-2 text-center"
                          style={{ backgroundColor: getBackgroundColor(deviation) }}
                        >
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-2">Resultados:</h3>
            <p>Estadístico χ² = {chiSquare.toFixed(2)}</p>
            <p>Grados de libertad = {degreesOfFreedom}</p>
            <p>Valor p = {pValue.toFixed(4)}</p>
            <p className="mt-2 font-semibold">
              {pValue < 0.05 
                ? "Existe evidencia estadística de una asociación entre el género y la percepción del conflicto."
                : "No hay evidencia suficiente para concluir que existe una asociación."}
            </p>
          </div>

          {/* Preguntas dinámicas basadas en los datos actuales */}
          <div className="space-y-8">
            <Question
              key={`q1-${dataVersion}`}
              type="multiple-choice"
              question="¿Qué sucede con el valor p cuando aumentas las diferencias entre los grupos?"
              options={[
                { text: "Aumenta, indicando menor evidencia de asociación", value: false },
                { text: "Disminuye, indicando mayor evidencia de asociación", value: true },
                { text: "No cambia, es independiente de las diferencias", value: false },
                { text: "Siempre se mantiene en 0.05", value: false }
              ]}
              correctAnswer={1}
              explanation="Cuando las diferencias entre los grupos son mayores (es decir, cuando los datos observados se alejan más de los esperados bajo independencia), el estadístico Chi cuadrado aumenta y el valor p disminuye, indicando mayor evidencia de una asociación entre las variables."
            />

            {/* Pregunta sobre la celda con mayor desvío */}
            {(() => {
              // Encontrar la celda con mayor desvío absoluto
              let maxDeviation = 0;
              let maxDevRow = 0;
              let maxDevCol = 0;
              observedData.forEach((row, i) => {
                row.forEach((val, j) => {
                  const deviation = Math.abs(getRelativeDeviation(val, expectedData[i][j]));
                  if (deviation > maxDeviation) {
                    maxDeviation = deviation;
                    maxDevRow = i;
                    maxDevCol = j;
                  }
                });
              });

              const observed = observedData[maxDevRow][maxDevCol];
              const expected = expectedData[maxDevRow][maxDevCol];
              const isMore = observed > expected;

              return (
                <Question
                  key={`q2-${dataVersion}`}
                  type="multiple-choice"
                  question={`La diferencia más notable está en la celda "${rowLabels[maxDevRow]} - ${colLabels[maxDevCol]}", donde hay ${observed} casos observados y ${expected.toFixed(1)} esperados. ¿Qué significa esto?`}
                  options={[
                    { 
                      text: `Hay ${isMore ? "más" : "menos"} ${rowLabels[maxDevRow].toLowerCase()} que perciben el conflicto como "${colLabels[maxDevCol].toLowerCase()}" de lo que esperaríamos si no hubiera relación con el género`,
                      value: true 
                    },
                    { 
                      text: "Es solo una variación aleatoria sin importancia",
                      value: false 
                    },
                    { 
                      text: "Indica un error en la recolección de datos",
                      value: false 
                    },
                    { 
                      text: "No se puede interpretar sin más información",
                      value: false 
                    }
                  ]}
                  correctAnswer={0}
                  explanation={`La diferencia del ${(Math.abs(maxDeviation) * 100).toFixed(1)}% entre lo observado y lo esperado en esta celda sugiere un patrón sistemático en cómo ${rowLabels[maxDevRow].toLowerCase()} y ${rowLabels[1-maxDevRow].toLowerCase()} perciben diferentemente el conflicto.`}
                />
              );
            })()}

            {/* Pregunta sobre el nivel de significancia */}
            <Question
              key={`q3-${dataVersion}`}
              type="multiple-choice"
              question={`Con un valor p de ${pValue.toFixed(4)}, ¿cuál es el nivel de significancia más estricto al que podemos rechazar la hipótesis nula?`}
              options={[
                { text: "0.001 (0.1%)", value: pValue < 0.001 },
                { text: "0.01 (1%)", value: pValue < 0.01 && pValue >= 0.001 },
                { text: "0.05 (5%)", value: pValue < 0.05 && pValue >= 0.01 },
                { text: "No se puede rechazar a ningún nivel convencional", value: pValue >= 0.05 }
              ]}
              correctAnswer={(() => {
                if (pValue < 0.001) return 0;
                if (pValue < 0.01) return 1;
                if (pValue < 0.05) return 2;
                return 3;
              })()}
              explanation={`Con un valor p de ${pValue.toFixed(4)}, ${
                pValue < 0.05 
                  ? `podemos rechazar la hipótesis nula de independencia al nivel ${
                      pValue < 0.001 ? "0.1%" 
                      : pValue < 0.01 ? "1%" 
                      : "5%"
                    }, indicando una fuerte evidencia estadística de asociación entre género y percepción del conflicto.`
                  : "no tenemos evidencia suficiente para rechazar la hipótesis nula de independencia a ningún nivel convencional."
              }`}
            />

            {/* Pregunta sobre el patrón general */}
            {(() => {
              // Calcular las proporciones por género y categoría
              const proportions = rowLabels.map((_, rowIndex) => {
                const total = rowTotals[rowIndex];
                return colLabels.map((_, colIndex) => 
                  (observedData[rowIndex][colIndex] / total) * 100
                );
              });

              // Encontrar las diferencias más notables
              const differences = colLabels.map((_, colIndex) => ({
                category: colLabels[colIndex],
                diff: proportions[0][colIndex] - proportions[1][colIndex],
                prop1: proportions[0][colIndex],
                prop2: proportions[1][colIndex]
              }));

              // Ordenar las diferencias por magnitud absoluta
              differences.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

              // Construir la descripción del patrón
              const mainDiff = differences[0];
              const secondDiff = differences[1];
              
              const patternDescription = pValue < 0.05
                ? `Los ${rowLabels[0].toLowerCase()} tienen un ${mainDiff.prop1.toFixed(1)}% de respuestas "${mainDiff.category.toLowerCase()}" versus ${mainDiff.prop2.toFixed(1)}% en ${rowLabels[1].toLowerCase()}, y un ${proportions[0][colLabels.indexOf(secondDiff.category)].toFixed(1)}% versus ${proportions[1][colLabels.indexOf(secondDiff.category)].toFixed(1)}% en "${secondDiff.category.toLowerCase()}"`
                : "Las diferencias observadas no son estadísticamente significativas";

              return (
                <Question
                  key={`q4-${dataVersion}`}
                  type="multiple-choice"
                  question={`Con los datos actuales (p = ${pValue.toFixed(4)}), ¿cuál es la interpretación correcta del patrón de respuestas?`}
                  options={[
                    { 
                      text: pValue < 0.05
                        ? `Hay una asociación significativa: ${patternDescription}`
                        : "No hay evidencia suficiente para concluir que existe una asociación entre género y percepción del conflicto",
                      value: true 
                    },
                    { 
                      text: pValue < 0.05
                        ? "Las diferencias observadas son probablemente producto del azar"
                        : "Hay diferencias importantes pero necesitamos más datos",
                      value: false 
                    },
                    { 
                      text: pValue < 0.05
                        ? "Las diferencias son significativas pero no interpretables"
                        : "La falta de significancia se debe al tamaño de la muestra",
                      value: false 
                    },
                    { 
                      text: "La distribución es uniforme entre géneros",
                      value: false 
                    }
                  ]}
                  correctAnswer={0}
                  explanation={pValue < 0.05
                    ? `Con un valor p de ${pValue.toFixed(4)}, hay evidencia estadística de una asociación. La diferencia más notable está en la categoría "${mainDiff.category.toLowerCase()}" (${Math.abs(mainDiff.diff).toFixed(1)} puntos porcentuales de diferencia), seguida por "${secondDiff.category.toLowerCase()}" (${Math.abs(secondDiff.diff).toFixed(1)} puntos porcentuales).`
                    : `Con un valor p de ${pValue.toFixed(4)}, no podemos rechazar la hipótesis nula de independencia. Aunque hay algunas diferencias en las proporciones, no son lo suficientemente grandes para descartar que se deban al azar.`}
                />
              );
            })()}
          </div>
        </div>
      </article>
      <LessonNavigation
        currentStep={2}
        totalSteps={2}
        previousUrl="/lessons/chi-square"
        showNext={false}
      />
    </div>
  );
} 