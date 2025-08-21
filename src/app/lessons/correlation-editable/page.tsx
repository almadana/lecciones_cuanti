'use client';

import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import jStat from 'jstat';
import LessonHeader from '@/app/components/LessonHeader';
import SmileyViridis from '@/app/components/SmileyViridis';
import Clocky from '@/app/components/Clocky';
import Question from '@/app/components/Question';
import { regressionLinear } from 'd3-regression';
import { scaleLinear } from 'd3-scale';
import LessonNavigation from '@/app/components/LessonNavigation';

// Configuración de la población
const POPULATION_SIZE = 50;
const SATISFACTION_MEAN = 21.7;
const SATISFACTION_STD = 5.78;
const SLEEP_MEAN = 7.23;
const SLEEP_STD = 1.17;

// Rangos del dominio
const X_DOMAIN = [5, 35];
const Y_DOMAIN = [4, 9];

// Dimensiones del gráfico
const WIDTH = 800;
const HEIGHT = 400;
const MARGIN = { top: 40, right: 40, bottom: 60, left: 60 };

// Función para generar datos normales truncados
function generateTruncatedNormal(size: number, mean: number, std: number, min: number, max: number) {
  const data = [];
  while (data.length < size) {
    const value = (jStat as any).normal.sample(mean, std);
    if (value >= min && value <= max) {
      data.push(value);
    }
  }
  return data;
}

// Función para calcular la correlación de Pearson
function pearsonCorrelation(x: number[], y: number[]) {
  const n = x.length;
  const sum_x = x.reduce((a, b) => a + b, 0);
  const sum_y = y.reduce((a, b) => a + b, 0);
  const sum_xy = x.reduce((acc, curr, i) => acc + curr * y[i], 0);
  const sum_x2 = x.reduce((a, b) => a + b * b, 0);
  const sum_y2 = y.reduce((a, b) => a + b * b, 0);

  const numerator = n * sum_xy - sum_x * sum_y;
  const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));

  return numerator / denominator;
}

// Función para calcular el p-valor de la correlación
function calculatePValue(r: number, n: number) {
  if (n <= 2) return 1;
  
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  const df = n - 2;
  
  // Usar la distribución t de Student para calcular el p-valor
  const pValue = 2 * (1 - (jStat as any).studentt.cdf(Math.abs(t), df));
  return pValue;
}

// Función para determinar si la correlación es significativa
function isSignificant(pValue: number, alpha: number = 0.05) {
  return pValue < alpha;
}

export default function CorrelationEditablePage() {
  const [alpha, setAlpha] = useState(1);
  const [data, setData] = useState<[number, number][]>([]);
  const [pearson, setPearson] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [correlation, setCorrelation] = useState(0.5);
  const [sampleSize, setSampleSize] = useState(10);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [showPValue, setShowPValue] = useState(false);

  // Calcular p-valor y significancia
  const pValue = calculatePValue(pearson, data.length);
  const isSignificantResult = isSignificant(pValue);

  // Escalas
  const xScale = d3.scaleLinear()
    .domain(X_DOMAIN)
    .range([MARGIN.left, WIDTH - MARGIN.right]);

  const yScale = d3.scaleLinear()
    .domain(Y_DOMAIN)
    .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

  // Generar datos iniciales
  useEffect(() => {
    generateData();
  }, [correlation, sampleSize]);

  const generateData = () => {
    const newData: [number, number][] = [];
    
    // Calcular medias y desvíos para la transformación
    const xMean = (X_DOMAIN[0] + X_DOMAIN[1]) / 2;
    const xStd = (X_DOMAIN[1] - X_DOMAIN[0]) / 4; // Aproximación del desvío para una distribución uniforme
    const yMean = (Y_DOMAIN[0] + Y_DOMAIN[1]) / 2;
    const yStd = (Y_DOMAIN[1] - Y_DOMAIN[0]) / 4;

    for (let i = 0; i < sampleSize; i++) {
      // Generar x como z-score
      const xZ = (jStat as any).normal.sample(0, 1);
      
      // Generar y como z-score correlacionado con x
      const noise = (jStat as any).normal.sample(0, 1);
      const yZ = xZ * correlation + Math.sqrt(1 - correlation * correlation) * noise;
      
      // Transformar a los rangos originales
      const x = xZ * xStd + xMean;
      const y = yZ * yStd + yMean;
      
      // Asegurar que los valores estén dentro de los rangos
      const xClamped = Math.max(X_DOMAIN[0], Math.min(X_DOMAIN[1], x));
      const yClamped = Math.max(Y_DOMAIN[0], Math.min(Y_DOMAIN[1], y));
      
      newData.push([xClamped, yClamped]);
    }
    setData(newData);
    setPearson(pearsonCorrelation(newData.map(d => d[0]), newData.map(d => d[1])));
    setDataVersion(prev => prev + 1);
  };

  // Función para manejar el arrastre de puntos
  const handleDrag = (event: React.MouseEvent<SVGElement>, index: number) => {
    if (selectedPoint === null) return;

    const coords = d3.pointer(event.nativeEvent);
    const newX = Math.max(X_DOMAIN[0], Math.min(X_DOMAIN[1], xScale.invert(coords[0])));
    const newY = Math.max(Y_DOMAIN[0], Math.min(Y_DOMAIN[1], yScale.invert(coords[1])));

    const newData = [...data];
    newData[index] = [newX, newY];
    
    setData(newData);
    setPearson(pearsonCorrelation(newData.map(d => d[0]), newData.map(d => d[1])));
    setDataVersion(prev => prev + 1);
  };

  // Calcular la línea de regresión
  const regression = regressionLinear()
    .x((d: [number, number]) => d[0])
    .y((d: [number, number]) => d[1]);
  
  const regressionPoints = data.length >= 2 ? regression(data) : null;
  const regressionLine: [number, number][] | null = regressionPoints ? [
    [xScale(regressionPoints[0][0]), yScale(regressionPoints[0][1])],
    [xScale(regressionPoints[1][0]), yScale(regressionPoints[1][1])]
  ] : null;

  return (
    <article className="max-w-4xl mx-auto p-4">
      <LessonHeader title="Correlación - Versión Editable (2 de 2)" />
      
      {/* Texto introductorio y instrucciones */}
      <div className="panel-contenido">
        <div className="prose text-gray-700 mb-6">
          <p className="text-lg">
            En esta lección interactiva puedes modificar los datos de la encuesta de satisfacción con la vida 
            y observar cómo los cambios afectan la correlación, la visualización y las respuestas a las preguntas.
          </p>
        </div>
        
        <div className="bg-gris-claro p-4 rounded-lg">
          <h3 className="font-bold text-negro mb-3">💡 Cosas que puedes probar:</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Arrastra los puntos para modificar sus valores directamente</li>
            <li>Usa el control deslizante para cambiar la correlación de -1 a +1</li>
            <li>Ajusta el tamaño de la muestra para ver cómo afecta la correlación</li>
            <li>Observa cómo cambia el coeficiente R de Pearson en tiempo real</li>
            <li>Activa el p-valor para ver la significancia estadística</li>
            <li>Experimenta creando correlaciones perfectas, moderadas y nulas</li>
          </ul>
        </div>
      </div>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Satisfacción con la vida y horas de sueño</h2>
        <p className="mb-4">
          En esta versión puedes:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Arrastrar los puntos para modificar sus valores</li>
          <li>Usar el control deslizante para cambiar la correlación</li>
          <li>Observar cómo los cambios afectan al coeficiente de correlación</li>
        </ul>
      </section>

      <section className="mb-8">
        <div className="mb-4">
          <h3 className="text-xl font-bold">
            R de Pearson = {pearson.toFixed(2)} | R² = {(pearson * pearson).toFixed(2)}
          </h3>
          
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="showPValue"
              checked={showPValue}
              onChange={(e) => setShowPValue(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="showPValue" className="text-sm font-medium">
              Mostrar p-valor y prueba de significancia
            </label>
          </div>
          
          {showPValue && (
            <div className="mt-2 p-3 bg-gray-100 rounded">
              <p className="text-sm">
                <strong>p-valor:</strong> {pValue.toFixed(4)}
              </p>
              <p className="text-sm">
                <strong>Significancia estadística:</strong>{' '}
                {isSignificantResult ? (
                  <span className="text-green-600 font-semibold">Sí, la correlación es estadísticamente significativa (p &lt; 0.05)</span>
                ) : (
                  <span className="text-red-600 font-semibold">No, la correlación no es estadísticamente significativa (p ≥ 0.05)</span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="font-bold">-1</span>
            <span className="font-bold">1</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={correlation}
            onChange={(e) => setCorrelation(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tamaño de la muestra: {sampleSize}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={sampleSize}
            onChange={(e) => setSampleSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="border rounded p-4">
          <svg 
            width={WIDTH} 
            height={HEIGHT}
            onMouseMove={(e) => selectedPoint !== null && handleDrag(e, selectedPoint)}
            onMouseUp={() => setSelectedPoint(null)}
            onMouseLeave={() => setSelectedPoint(null)}
          >
            {/* Ejes */}
            <g>
              {/* Eje X */}
              <line
                x1={MARGIN.left}
                y1={HEIGHT - MARGIN.bottom}
                x2={WIDTH - MARGIN.right}
                y2={HEIGHT - MARGIN.bottom}
                stroke="black"
              />
              {/* Etiquetas X */}
              {d3.range(X_DOMAIN[0], X_DOMAIN[1] + 1, 5).map(tick => (
                <g key={tick} transform={`translate(${xScale(tick)},${HEIGHT - MARGIN.bottom})`}>
                  <line y2="6" stroke="black" />
                  <text
                    y="20"
                    textAnchor="middle"
                    fontSize="12"
                  >
                    {tick}
                  </text>
                </g>
              ))}
              {/* Título X */}
              <text
                x={WIDTH / 2}
                y={HEIGHT - 10}
                textAnchor="middle"
                fontSize="14"
              >
                Satisfacción con la vida
              </text>

              {/* Eje Y */}
              <line
                x1={MARGIN.left}
                y1={MARGIN.top}
                x2={MARGIN.left}
                y2={HEIGHT - MARGIN.bottom}
                stroke="black"
              />
              {/* Etiquetas Y */}
              {d3.range(Y_DOMAIN[0], Y_DOMAIN[1] + 1, 1).map(tick => (
                <g key={tick} transform={`translate(${MARGIN.left},${yScale(tick)})`}>
                  <line x2="-6" stroke="black" />
                  <text
                    x="-10"
                    y="4"
                    textAnchor="end"
                    fontSize="12"
                  >
                    {tick}
                  </text>
                </g>
              ))}
              {/* Título Y */}
              <text
                transform={`translate(20,${HEIGHT / 2}) rotate(-90)`}
                textAnchor="middle"
                fontSize="14"
              >
                Horas de sueño
              </text>
            </g>

            {/* Línea de regresión */}
            {regressionLine && (
              <line
                x1={regressionLine[0][0]}
                y1={regressionLine[0][1]}
                x2={regressionLine[1][0]}
                y2={regressionLine[1][1]}
                stroke="black"
                strokeWidth="1"
                opacity="0.5"
              />
            )}

            {/* Puntos */}
            {data.map((d, i) => (
              <g 
                key={i}
                onMouseDown={() => setSelectedPoint(i)}
                style={{ cursor: 'pointer' }}
              >
                <SmileyViridis
                  cx={xScale(d[0])}
                  cy={yScale(d[1])}
                  radius={12}
                  happiness={(d[0] - X_DOMAIN[0]) / (X_DOMAIN[1] - X_DOMAIN[0])}
                />
                <Clocky
                  cx={xScale(d[0])}
                  cy={yScale(d[1])}
                  radius={15}
                  hours={d[1]}
                  min={Y_DOMAIN[0]}
                  max={Y_DOMAIN[1]}
                />
              </g>
            ))}
          </svg>
        </div>
      </section>

      {/* Preguntas dinámicas */}
      <section className="space-y-8">
        <Question
          key={`q1-${dataVersion}`}
          type="multiple-choice"
          question="¿Qué sucede con el coeficiente de correlación cuando mueves un punto?"
          options={[
            { text: "Siempre aumenta", value: false },
            { text: "Siempre disminuye", value: false },
            { text: "Puede aumentar o disminuir dependiendo de la dirección del movimiento", value: true },
            { text: "No cambia", value: false }
          ]}
          correctAnswer={2}
          explanation="El coeficiente de correlación cambia según cómo el movimiento del punto afecte a la relación lineal entre las variables. Si el punto se mueve en la dirección de la tendencia general, la correlación aumenta; si se mueve en contra, disminuye."
        />

        <Question
          key={`q2-${dataVersion}`}
          type="multiple-choice"
          question={`Con el coeficiente de correlación actual (R = ${pearson.toFixed(2)}), ¿cómo describirías la relación entre las variables?`}
          options={[
            { 
              text: "Fuerte correlación positiva", 
              value: pearson > 0.7 
            },
            { 
              text: "Correlación positiva moderada", 
              value: pearson > 0.3 && pearson <= 0.7 
            },
            { 
              text: "Correlación débil o nula", 
              value: pearson >= -0.3 && pearson <= 0.3 
            },
            { 
              text: "Correlación negativa moderada", 
              value: pearson < -0.3 && pearson >= -0.7 
            },
            { 
              text: "Fuerte correlación negativa", 
              value: pearson < -0.7 
            }
          ]}
          correctAnswer={(() => {
            if (pearson > 0.7) return 0;
            if (pearson > 0.3) return 1;
            if (pearson >= -0.3) return 2;
            if (pearson >= -0.7) return 3;
            return 4;
          })()}
          explanation={`Con R = ${pearson.toFixed(2)}, la correlación es ${
            pearson > 0.7 ? "fuerte y positiva" :
            pearson > 0.3 ? "moderada y positiva" :
            pearson >= -0.3 ? "débil o prácticamente nula" :
            pearson >= -0.7 ? "moderada y negativa" :
            "fuerte y negativa"
          }. Esto significa que ${
            Math.abs(pearson) > 0.7 ? "hay una clara relación lineal" :
            Math.abs(pearson) > 0.3 ? "hay cierta relación lineal" :
            "no hay una clara relación lineal"
          } entre la satisfacción con la vida y las horas de sueño.`}
        />

        <Question
          key={`q3-${dataVersion}`}
          type="multiple-choice"
          question="¿Qué porcentaje de la variación en las horas de sueño puede explicarse por la satisfacción con la vida?"
          options={[
            { text: `${(pearson * pearson * 100).toFixed(1)}%`, value: true },
            { text: `${(Math.abs(pearson) * 100).toFixed(1)}%`, value: false },
            { text: "100%", value: false },
            { text: "No se puede determinar", value: false }
          ]}
          correctAnswer={0}
          explanation={`El coeficiente de determinación (R²) es ${(pearson * pearson).toFixed(2)}, lo que significa que el ${(pearson * pearson * 100).toFixed(1)}% de la variación en las horas de sueño puede explicarse por su relación lineal con la satisfacción con la vida. El ${(100 - pearson * pearson * 100).toFixed(1)}% restante se debe a otros factores.`}
        />
      </section>

      {/* Navegación */}
      <LessonNavigation
        currentStep={2}
        totalSteps={2}
        previousUrl="/lessons/correlation"
        showPrevious={true}
        nextUrl="/lessons/regression"
      />
    </article>
  );
} 