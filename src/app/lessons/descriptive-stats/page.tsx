'use client';

import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import jStat from 'jstat';
import LessonHeader from '@/app/components/LessonHeader';
import LessonNavigation from '@/app/components/LessonNavigation';
import Question from '@/app/components/Question';

// Configuración de la población
const POPULATION_SIZE = 1000;
const MEAN = 7.23;
const STD = 1.17;
const MIN = 4;
const MAX = 9;

// Dimensiones del gráfico
const WIDTH = 800;
const HEIGHT = 400;
const BOXPLOT_HEIGHT = 100;
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

// Función para calcular la moda
function calculateMode(data: number[]) {
  // Redondear los datos a 2 decimales para agrupar mejor
  const roundedData = data.map(x => Math.round(x * 100) / 100);
  
  const counts = new Map<number, number>();
  roundedData.forEach(value => {
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  
  let maxCount = 0;
  let mode = roundedData[0];
  
  counts.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      mode = value;
    }
  });
  
  return mode;
}

export default function DescriptiveStatsPage() {
  const [data, setData] = useState<number[]>([]);
  const [showQuartiles, setShowQuartiles] = useState(false);
  const [showQuintiles, setShowQuintiles] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  // Generar datos iniciales
  useEffect(() => {
    const newData = generateTruncatedNormal(POPULATION_SIZE, MEAN, STD, MIN, MAX);
    setData(newData);
  }, []);

  // Calcular estadísticas
  const mean = d3.mean(data) ?? 0;
  const std = d3.deviation(data) ?? 0;
  const median = d3.median(data) ?? 0;
  const mode = calculateMode(data) ?? 0;
  const quartiles = [0.25, 0.5, 0.75].map(q => d3.quantile(data, q) ?? 0);
  const quintiles = [0.2, 0.4, 0.6, 0.8].map(q => d3.quantile(data, q) ?? 0);

  // Calcular bigotes y outliers usando criterio estándar (1.5 * IQR)
  const q1 = quartiles[0];
  const q3 = quartiles[2];
  const iqr = q3 - q1;
  const lowerWhisker = Math.max(MIN, q1 - 1.5 * iqr);
  const upperWhisker = Math.min(MAX, q3 + 1.5 * iqr);
  
  // Identificar outliers
  const outliers = data.filter(d => d < lowerWhisker || d > upperWhisker);

  // Escalas
  const xScale = d3.scaleLinear()
    .domain([MIN, MAX])
    .range([MARGIN.left, WIDTH - MARGIN.right]);

  const histogram = d3.histogram<number, number>()
    .domain([MIN, MAX])
    .thresholds(20)(data);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(histogram, d => d.length) || 0])
    .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

  return (
    <article className="max-w-4xl mx-auto p-4">
      <LessonHeader title="Media, Moda y Cuartiles (1 de 2)" />
      
      {/* Texto introductorio y instrucciones */}
      <div className="mb-8 bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
        <div className="prose text-gray-700 mb-6">
          <p className="text-lg">
            Las medidas de tendencia central y posición te permiten resumir grandes cantidades de datos con solo 
            unos pocos números. En esta lección aprenderás sobre la media, moda y cuartiles, 
            y cómo interpretar la distribución de los datos.
          </p>
        </div>
        
        <div className="bg-gris-claro p-4 rounded-lg">
          <h3 className="font-bold text-negro mb-3">💡 Cosas que puedes probar:</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Observa cómo se distribuyen los datos en el histograma</li>
            <li>Compara los valores de media, mediana y moda</li>
            <li>Activa los cuartiles y quintiles para ver las divisiones de los datos</li>
            <li>Identifica si la distribución es simétrica o asimétrica</li>
            <li>Observa los outliers (valores atípicos) en el boxplot</li>
            <li>Genera nuevos datos para ver cómo cambian las estadísticas</li>
          </ul>
        </div>
      </div>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Distribución de Horas de Sueño</h2>
        <p className="mb-4">
          Esta visualización muestra la distribución de horas de sueño en una población,
          junto con diferentes medidas de tendencia central y posición.
        </p>
      </section>

      <section className="mb-8">
        <div className="mb-4">
          <h3 className="text-xl font-bold">
            Media = {mean?.toFixed(2) ?? '0.00'} | Desvío = {std?.toFixed(2) ?? '0.00'} | Mediana = {median?.toFixed(2) ?? '0.00'} | Moda = {mode?.toFixed(2) ?? '0.00'}
          </h3>
        </div>

        <div className="mb-4 flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showQuartiles}
              onChange={(e) => setShowQuartiles(e.target.checked)}
              className="mr-2"
            />
            Mostrar Cuartiles
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showQuintiles}
              onChange={(e) => setShowQuintiles(e.target.checked)}
              className="mr-2"
            />
            Mostrar Quintiles
          </label>
        </div>

        <div className="border rounded p-4">
          <svg width={WIDTH} height={HEIGHT + BOXPLOT_HEIGHT}>
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
              {d3.range(MIN, MAX + 1).map(tick => (
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
                Horas de sueño
              </text>

              {/* Eje Y */}
              <line
                x1={MARGIN.left}
                y1={MARGIN.top}
                x2={MARGIN.left}
                y2={HEIGHT - MARGIN.bottom}
                stroke="black"
              />
              {/* Título Y */}
              <text
                transform={`translate(20,${HEIGHT / 2}) rotate(-90)`}
                textAnchor="middle"
                fontSize="14"
              >
                Frecuencia
              </text>
            </g>

            {/* Histograma */}
            {histogram.map((d, i) => (
              <rect
                key={i}
                x={xScale(d.x0 || 0)}
                y={yScale(d.length)}
                width={xScale(d.x1 || 0) - xScale(d.x0 || 0)}
                height={HEIGHT - MARGIN.bottom - yScale(d.length)}
                fill="#6446fa"
                opacity="0.7"
              />
            ))}

            {/* Media */}
            <line
              x1={xScale(mean)}
              y1={MARGIN.top}
              x2={xScale(mean)}
              y2={HEIGHT - MARGIN.bottom}
              stroke="red"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <text
              x={xScale(mean)}
              y={MARGIN.top - 15}
              textAnchor="middle"
              fill="red"
              fontSize="12"
              fontFamily="Roboto"
            >
              Media
            </text>

            {/* Mediana */}
            <line
              x1={xScale(median)}
              y1={MARGIN.top}
              x2={xScale(median)}
              y2={HEIGHT - MARGIN.bottom}
              stroke="green"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <text
              x={xScale(median)}
              y={MARGIN.top - 30}
              textAnchor="middle"
              fill="green"
              fontSize="12"
              fontFamily="Roboto"
            >
              Mediana
            </text>

            {/* Moda */}
            <line
              x1={xScale(mode)}
              y1={MARGIN.top}
              x2={xScale(mode)}
              y2={HEIGHT - MARGIN.bottom}
              stroke="black"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <text
              x={xScale(mode)}
              y={MARGIN.top - 5}
              textAnchor="middle"
              fill="black"
              fontSize="12"
              fontFamily="Roboto"
            >
              Moda
            </text>

            {/* Cuartiles */}
            {showQuartiles && quartiles.map((q, i) => (
              <g key={`q${i}`}>
                <line
                  x1={xScale(q)}
                  y1={MARGIN.top}
                  x2={xScale(q)}
                  y2={HEIGHT - MARGIN.bottom}
                  stroke="#9bfa82"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <text
                  x={xScale(q)}
                  y={MARGIN.top - 5}
                  textAnchor="middle"
                  fill="#9bfa82"
                  fontSize="12"
                  fontFamily="Roboto"
                  transform={`translate(0,${20 + i * 15})`}
                >
                  {i === 0 ? 'C1' : i === 1 ? 'C2' : 'C3'}
                </text>
              </g>
            ))}

            {/* Quintiles */}
            {showQuintiles && quintiles.map((q, i) => (
              <g key={`quint${i}`}>
                <line
                  x1={xScale(q)}
                  y1={MARGIN.top}
                  x2={xScale(q)}
                  y2={HEIGHT - MARGIN.bottom}
                  stroke="#8c7ddc"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <text
                  x={xScale(q)}
                  y={MARGIN.top - 5}
                  textAnchor="middle"
                  fill="#8c7ddc"
                  fontSize="12"
                  fontFamily="Roboto"
                  transform={`translate(0,${35 + i * 15})`}
                >
                  {`Q${i + 1}`}
                </text>
              </g>
            ))}

            {/* Diagrama de caja */}
            <g transform={`translate(0,${HEIGHT})`}>
              {/* Caja */}
              <rect
                x={xScale(quartiles[0])}
                y={BOXPLOT_HEIGHT / 4}
                width={xScale(quartiles[2]) - xScale(quartiles[0])}
                height={BOXPLOT_HEIGHT / 2}
                fill="#9bfa82"
                stroke="#8c7ddc"
                strokeWidth="1"
              />
              
              {/* Línea mediana */}
              <line
                x1={xScale(median)}
                y1={BOXPLOT_HEIGHT / 4}
                x2={xScale(median)}
                y2={BOXPLOT_HEIGHT * 3/4}
                stroke="#8c7ddc"
                strokeWidth="2"
              />
              
              {/* Bigotes */}
              <line
                x1={xScale(lowerWhisker)}
                y1={BOXPLOT_HEIGHT / 2}
                x2={xScale(q1)}
                y2={BOXPLOT_HEIGHT / 2}
                stroke="#8c7ddc"
                strokeWidth="1"
              />
              <line
                x1={xScale(q3)}
                y1={BOXPLOT_HEIGHT / 2}
                x2={xScale(upperWhisker)}
                y2={BOXPLOT_HEIGHT / 2}
                stroke="#8c7ddc"
                strokeWidth="1"
              />
              
              {/* Líneas verticales de los bigotes */}
              <line
                x1={xScale(lowerWhisker)}
                y1={BOXPLOT_HEIGHT / 4}
                x2={xScale(lowerWhisker)}
                y2={BOXPLOT_HEIGHT * 3/4}
                stroke="#8c7ddc"
                strokeWidth="1"
              />
              <line
                x1={xScale(upperWhisker)}
                y1={BOXPLOT_HEIGHT / 4}
                x2={xScale(upperWhisker)}
                y2={BOXPLOT_HEIGHT * 3/4}
                stroke="#8c7ddc"
                strokeWidth="1"
              />
              
              {/* Outliers */}
              {outliers.map((outlier, i) => (
                <circle
                  key={i}
                  cx={xScale(outlier)}
                  cy={BOXPLOT_HEIGHT / 2}
                  r="3"
                  fill="#ff6b6b"
                  stroke="#8c7ddc"
                  strokeWidth="1"
                />
              ))}
            </g>
          </svg>
        </div>
      </section>

      {/* Preguntas */}
      <section className="space-y-8">
        <Question
          key={`q1-${dataVersion}`}
          type="multiple-choice"
          question="¿Qué medida de tendencia central es más sensible a valores extremos?"
          options={[
            { text: "La media", value: true },
            { text: "La mediana", value: false },
            { text: "La moda", value: false },
            { text: "Ninguna de las anteriores", value: false }
          ]}
          explanation="La media es la medida más sensible a valores extremos porque considera todos los valores en su cálculo. La mediana y la moda son más robustas a valores atípicos."
        />

        <Question
          key={`q2-${dataVersion}`}
          type="multiple-choice"
          question="¿Qué representa el segundo cuartil (Q2)?"
          options={[
            { text: "La media", value: false },
            { text: "La mediana", value: true },
            { text: "La moda", value: false },
            { text: "El valor más frecuente", value: false }
          ]}
          explanation="El segundo cuartil (Q2) es igual a la mediana, ya que divide los datos en dos partes iguales."
        />

        <Question
          key={`q3-${dataVersion}`}
          type="multiple-choice"
          question="¿Qué porcentaje de los datos se encuentra entre el primer y tercer cuartil?"
          options={[
            { text: "25%", value: false },
            { text: "50%", value: true },
            { text: "75%", value: false },
            { text: "100%", value: false }
          ]}
          explanation="El 50% de los datos se encuentra entre el primer cuartil (Q1) y el tercer cuartil (Q3). Esto se conoce como el rango intercuartílico."
        />
      </section>

      {/* Navegación */}
      <LessonNavigation
        currentStep={1}
        totalSteps={2}
        nextUrl="/lessons/mean-deviation"
        showPrevious={false}
      />
    </article>
  );
} 