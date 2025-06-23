'use client';

import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import jStat from 'jstat';
import LessonHeader from '@/app/components/LessonHeader';
import SmileyViridis from '@/app/components/SmileyViridis';
import Clocky from '@/app/components/Clocky';
import { regressionLinear } from 'd3-regression';

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

export default function CorrelationPage() {
  const [alpha, setAlpha] = useState(1);
  const [data, setData] = useState<[number, number][]>([]);
  const [pearson, setPearson] = useState(1);

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
      <LessonHeader title="Correlación" />
      
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
    </article>
  );
} 