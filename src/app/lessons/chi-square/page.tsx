'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Question from '@/app/components/Question';
import jStat from 'jstat';
import LessonHeader from '@/app/components/LessonHeader';
import LessonNavigation from '@/app/components/LessonNavigation';

export default function ChiSquarePage() {
  const [showExplanation, setShowExplanation] = useState(false);

  // Datos del Latinobarómetro
  const observedData = [
    [52, 183, 226, 80],  // Hombres
    [114, 280, 194, 58], // Mujeres
  ];

  const rowLabels = ['Hombres', 'Mujeres'];
  const colLabels = ['Muy fuerte', 'Fuerte', 'Débil', 'No existe'];

  // Cálculo de totales
  const rowTotals = observedData.map(row => 
    row.reduce((acc, val) => acc + val, 0)
  );

  const colTotals = observedData[0].map((_, colIndex) =>
    observedData.reduce((acc, row) => acc + row[colIndex], 0)
  );

  const grandTotal = rowTotals.reduce((acc, val) => acc + val, 0);

  // Cálculo de frecuencias esperadas
  const expectedData = observedData.map((row, i) =>
    row.map((_, j) => (rowTotals[i] * colTotals[j]) / grandTotal)
  );

  // Cálculo de Chi cuadrado
  const chiSquare = observedData.reduce((acc, row, i) =>
    acc + row.reduce((rowAcc, observed, j) => {
      const expected = expectedData[i][j];
      return rowAcc + Math.pow(observed - expected, 2) / expected;
    }, 0),
    0
  );

  const degreesOfFreedom = (observedData.length - 1) * (observedData[0].length - 1);
  const pValue = 1 - (jStat as any).chisquare.cdf(chiSquare, degreesOfFreedom);

  // Determinar nivel de significancia
  const getSignificanceLevel = () => {
    if (pValue < 0.001) return 3;
    if (pValue < 0.01) return 2;
    if (pValue < 0.05) return 1;
    return 0;
  };

  const significanceLevel = getSignificanceLevel();

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
        currentStep={1}
        totalSteps={2}
        nextUrl="/lessons/chi-square-editable"
        showPrevious={false}
      />
      <article className="max-w-4xl mx-auto p-4">
        <LessonHeader title="Chi cuadrado de independencia" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Datos de Latinobarómetro</h2>
          <p className="mb-4">
            A continuación se reproduce la tabla acerca de la existencia de diferencias o conflictos 
            entre hombres y mujeres. Si bien puede verse una clara diferencia en las respuestas entre 
            hombres y mujeres, cabe preguntarse si esta diferencia existente en la muestra podría 
            generalizarse a la población de la que procede.
          </p>
          <p className="mb-4">
            Con ese fin, en esta lección se realiza una prueba de <strong>Chi cuadrado</strong> de 
            independencia. Abajo podrás ver la tabla con las frecuencias absolutas provenientes del 
            estudio, las frecuencias esperadas si existiera independencia entre las variables, y el 
            valor del estadístico Chi cuadrado y su p-valor asociado.
          </p>
        </section>

        <section className="mb-8">
          {/* Tabla de frecuencias observadas */}
          <div className="overflow-x-auto mb-8">
            <h3 className="text-xl font-bold mb-4">Frecuencias observadas</h3>
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="border p-2"></th>
                  {colLabels.map((label, i) => (
                    <th key={i} className="border p-2">{label}</th>
                  ))}
                  <th className="border p-2">Totales</th>
                </tr>
              </thead>
              <tbody>
                {observedData.map((row, i) => (
                  <tr key={i}>
                    <th className="border p-2">{rowLabels[i]}</th>
                    {row.map((value, j) => {
                      const deviation = getRelativeDeviation(value, expectedData[i][j]);
                      return (
                        <td 
                          key={j} 
                          className="border p-2 text-center"
                          style={{ backgroundColor: getBackgroundColor(deviation) }}
                        >
                          {value}
                        </td>
                      );
                    })}
                    <th className="border p-2">{rowTotals[i]}</th>
                  </tr>
                ))}
                <tr>
                  <th className="border p-2">Totales</th>
                  {colTotals.map((total, i) => (
                    <th key={i} className="border p-2">{total}</th>
                  ))}
                  <th className="border p-2">{grandTotal}</th>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tabla de frecuencias esperadas */}
          <div className="overflow-x-auto mb-8">
            <h3 className="text-xl font-bold mb-4">Frecuencias esperadas</h3>
            <div className="mb-2 text-sm text-gray-600">
              <p>Los colores indican la diferencia entre lo observado y lo esperado:</p>
              <ul className="list-disc list-inside">
                <li><span className="text-red-500">Rojo</span>: menos casos que lo esperado</li>
                <li><span className="text-blue-500">Azul</span>: más casos que lo esperado</li>
                <li>Blanco: similar a lo esperado</li>
              </ul>
            </div>
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="border p-2"></th>
                  {colLabels.map((label, i) => (
                    <th key={i} className="border p-2">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expectedData.map((row, i) => (
                  <tr key={i}>
                    <th className="border p-2">{rowLabels[i]}</th>
                    {row.map((value, j) => {
                      const deviation = getRelativeDeviation(observedData[i][j], value);
                      return (
                        <td 
                          key={j} 
                          className="border p-2 text-center"
                          style={{ backgroundColor: getBackgroundColor(deviation) }}
                        >
                          {value.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resultados */}
          <div className={`p-4 border rounded mb-8 significance-${significanceLevel}`}>
            <p className="mb-2">
              Chi cuadrado: {chiSquare.toFixed(2)} || p-valor: 
              <span className="font-bold ml-1">
                {pValue.toFixed(5)}
                {significanceLevel > 0 && '*'.repeat(significanceLevel)}
              </span>
            </p>
            <p>
              La asociación entre las variables
              {significanceLevel === 0 ? (
                <span> no es </span>
              ) : (
                <span> es </span>
              )}
              estadísticamente significativa a nivel alfa = 
              {significanceLevel === 0 && <span> 0.05</span>}
              {significanceLevel === 1 && <span> 0.05</span>}
              {significanceLevel === 2 && <span> 0.01</span>}
              {significanceLevel === 3 && <span> 0.001</span>}
            </p>
          </div>

          <Question
            question="¿Qué significa el p-valor en este contexto?"
            type="multiple-choice"
            options={[
              { text: "La probabilidad de que las variables sean independientes", value: false },
              { text: "La probabilidad de obtener una diferencia igual o más extrema que la observada si las variables fueran independientes", value: true },
              { text: "La probabilidad de que las variables estén relacionadas", value: false },
              { text: "El porcentaje de casos que no siguen el patrón observado", value: false }
            ]}
            correctAnswer={1}
            explanation="El p-valor representa la probabilidad de obtener una diferencia igual o más extrema que la observada en la muestra, asumiendo que las variables son independientes en la población (hipótesis nula)."
          />
        </section>
      </article>
      <LessonNavigation
        currentStep={1}
        totalSteps={2}
        nextUrl="/lessons/chi-square-editable"
        showPrevious={false}
      />
    </div>
  );
} 