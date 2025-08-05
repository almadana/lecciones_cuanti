'use client';

import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import jStat from 'jstat';
import LessonHeader from '@/app/components/LessonHeader';
import SmileyViridis from '@/app/components/SmileyViridis';
import Clocky from '@/app/components/Clocky';
import { regressionLinear } from 'd3-regression';
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

export default function CorrelationPage() {
  const [alpha, setAlpha] = useState(1);
  const [data, setData] = useState<[number, number][]>([]);
  const [pearson, setPearson] = useState(1);
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
    const satisfaction = generateTruncatedNormal(
      POPULATION_SIZE,
      SATISFACTION_MEAN,
      SATISFACTION_STD,
      X_DOMAIN[0],
      X_DOMAIN[1]
    );

    const noise = generateTruncatedNormal(
      POPULATION_SIZE,
      0,
      1,
      -3,
      3
    );

    updateData(satisfaction, noise, alpha);
  }, []);

  // Función para actualizar los datos según el coeficiente alpha
  const updateData = (satisfaction: number[], noise: number[], newAlpha: number) => {
    // Generar horas de sueño correlacionadas
    const sleep = satisfaction.map((s, i) => {
      const normalizedSat = (s - X_DOMAIN[0]) / (X_DOMAIN[1] - X_DOMAIN[0]);
      const sleepValue = SLEEP_MEAN + 
        SLEEP_STD * (newAlpha * (normalizedSat - 0.5) + (1 - Math.abs(newAlpha)) * noise[i] * 0.5);
      return Math.max(Y_DOMAIN[0], Math.min(Y_DOMAIN[1], sleepValue));
    });

    const newData = satisfaction.map((s, i) => [s, sleep[i]] as [number, number]);
    const newPearson = pearsonCorrelation(satisfaction, sleep);

    setData(newData);
    setPearson(newPearson);
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
      <LessonHeader title="Correlación (1 de 2)" />
      
      {/* Texto introductorio y instrucciones */}
      <div className="mb-8 bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
        <div className="prose text-gray-700 mb-6">
          <p className="text-lg">
            La correlación mide la fuerza y dirección de la relación lineal entre dos variables continuas. 
            En esta lección explorarás cómo el coeficiente de correlación de Pearson varía de -1 a +1, 
            y cómo interpretar su significancia estadística.
          </p>
        </div>
        
        <div className="bg-gris-claro p-4 rounded-lg">
          <h3 className="font-bold text-negro mb-3">💡 Cosas que puedes probar:</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Mueve el control deslizante para cambiar la correlación de -1 a +1</li>
            <li>Observa cómo los puntos se dispersan o agrupan según la correlación</li>
            <li>Activa el p-valor para ver la significancia estadística</li>
            <li>Interpreta el coeficiente R² que indica la proporción de varianza explicada</li>
            <li>Observa la línea de regresión que se ajusta a los datos</li>
            <li>Nota cómo los smileys y relojes representan las dos variables</li>
          </ul>
        </div>
      </div>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Satisfacción con la vida y horas de sueño</h2>
        <p className="mb-4">
          Explora la relación entre la satisfacción con la vida y las horas de sueño.
          Mueve el control deslizante para ver cómo diferentes niveles de correlación
          afectan la relación entre estas variables.
        </p>
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
            value={alpha}
            onChange={(e) => {
              const newAlpha = parseFloat(e.target.value);
              setAlpha(newAlpha);
              const satisfaction = data.map(d => d[0]);
              const noise = generateTruncatedNormal(POPULATION_SIZE, 0, 1, -3, 3);
              updateData(satisfaction, noise, newAlpha);
            }}
            className="w-full"
          />
        </div>

        <div className="border rounded p-4">
          <svg width={WIDTH} height={HEIGHT}>
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
              <g key={i}>
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

      <section className="mb-8">
        <h3 className="text-xl font-bold mb-4">Interpretación</h3>
        <p className="mb-4">
          El gráfico muestra la relación entre la satisfacción con la vida (eje X) y las horas de sueño (eje Y).
          Cada punto representa una persona, donde:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>La cara sonriente indica el nivel de satisfacción con la vida</li>
          <li>El reloj muestra las horas de sueño</li>
          <li>La línea representa la tendencia general de la relación</li>
        </ul>
        <p>
          El coeficiente de correlación (R) varía entre -1 y 1, donde:
        </p>
        <ul className="list-disc list-inside">
          <li>R = 1 indica una correlación positiva perfecta</li>
          <li>R = 0 indica ausencia de correlación lineal</li>
          <li>R = -1 indica una correlación negativa perfecta</li>
        </ul>
      </section>

      {/* Resumen de la Lección */}
      <div className="mt-8 bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
        <h2 className="text-xl font-bold text-negro bg-morado-claro p-3 rounded-lg inline-block mb-4">
          Resumen de Conceptos Clave
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-negro mb-2">Correlación de Pearson:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Rango:</strong> Varía entre -1 y +1</li>
              <li><strong>Correlación positiva:</strong> R &gt; 0, variables aumentan juntas</li>
              <li><strong>Correlación negativa:</strong> R &lt; 0, una aumenta cuando otra disminuye</li>
              <li><strong>Sin correlación:</strong> R ≈ 0, no hay relación lineal</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-negro mb-2">Interpretación:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>R = ±1:</strong> Correlación perfecta</li>
              <li><strong>R = ±0.7 a ±1:</strong> Correlación fuerte</li>
              <li><strong>R = ±0.3 a ±0.7:</strong> Correlación moderada</li>
              <li><strong>R = ±0.1 a ±0.3:</strong> Correlación débil</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gris-claro rounded-lg">
          <h3 className="font-bold text-negro mb-2">Fórmula y Conceptos:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Coeficiente de correlación:</strong><br/>
              <code>r = Σ(x-x̄)(y-ȳ) / √[Σ(x-x̄)²Σ(y-ȳ)²]</code><br/>
              <strong>Coeficiente de determinación:</strong><br/>
              <code>R² = r²</code>
            </div>
            <div>
              <strong>Significancia estadística:</strong><br/>
              <code>p &lt; 0.05</code><br/>
              <strong>Correlación no implica causalidad</strong><br/>
              <code>R ≠ Causa</code>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <LessonNavigation
        currentStep={1}
        totalSteps={2}
        nextUrl="/lessons/regression"
        showPrevious={true}
        previousUrl="/lessons/confidence-interval"
      />
    </article>
  );
} 