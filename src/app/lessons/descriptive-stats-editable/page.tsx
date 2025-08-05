'use client';

import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import jStat from 'jstat';
import LessonHeader from '@/app/components/LessonHeader';
import LessonNavigation from '@/app/components/LessonNavigation';
import Question from '@/app/components/Question';

// Configuración de la población
const POPULATION_SIZE = 2000;
const MEAN = 8;
const MIN = 4;
const MAX = 12;

// Dimensiones del gráfico
const WIDTH = 800;
const HEIGHT = 400;
const BOXPLOT_HEIGHT = 100;
const MARGIN = { top: 40, right: 40, bottom: 60, left: 60 };

// Función para generar datos normales truncados con asimetría
function generateTruncatedNormal(size: number, mean: number, std: number, skewness: number, min: number, max: number) {
  const data = [];
  
  while (data.length < size) {
    // Generar valor normal usando Box-Muller
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    let value = mean + std * z;
    
    // Aplicar asimetría usando transformación de potencia
    if (skewness !== 0) {
      // Transformación de potencia para crear asimetría realista
      const sign = Math.sign(skewness);
      const absSkew = Math.abs(skewness);
      const power = 1 + absSkew * 2;
      
      if (sign > 0) {
        // Asimetría positiva: cola pesada a la derecha, media se mueve a la izquierda
        const shift = absSkew * 1.5;
        value = value - shift + absSkew * 3 * Math.pow(Math.max(0, value - (mean - shift)), power);
      } else {
        // Asimetría negativa: cola pesada a la izquierda, media se mueve a la derecha
        const shift = absSkew * 1.5;
        value = value + shift - absSkew * 3 * Math.pow(Math.max(0, (mean + shift) - value), power);
      }
    }
    
    // Truncar al rango especificado
    if (value >= min && value <= max) {
      data.push(value);
    }
  }
  
  // Ajustar la media si hay asimetría para mantener la media objetivo
  if (skewness !== 0 && data.length > 0) {
    const currentMean = d3.mean(data) || mean;
    const adjustment = mean - currentMean;
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.max(min, Math.min(max, data[i] + adjustment));
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

export default function DescriptiveStatsEditablePage() {
  const [data, setData] = useState<number[]>([]);
  const [showQuartiles, setShowQuartiles] = useState(false);
  const [showQuintiles, setShowQuintiles] = useState(false);
  const [std, setStd] = useState(1.17);
  const [skewness, setSkewness] = useState(0);

  // Generar datos iniciales
  useEffect(() => {
    const newData = generateTruncatedNormal(POPULATION_SIZE, MEAN, std, skewness, MIN, MAX);
    setData(newData);
  }, [std, skewness]);

  // Calcular estadísticas
  const mean = d3.mean(data) ?? 0;
  const stdDev = d3.deviation(data) ?? 0;
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
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Media, Moda y Cuartiles - Editable (2 de 2)
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Esta visualización muestra la distribución de horas de sueño en una población,
            junto con diferentes medidas de tendencia central y posición.
            Puedes ajustar la dispersión y la asimetría de la distribución usando los controles.
          </p>
        </div>

        {/* Texto introductorio y instrucciones */}
        <div className="mt-8 bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
          <div className="prose text-gray-700 mb-6">
            <p className="text-lg">
              En esta lección interactiva puedes experimentar con diferentes distribuciones de datos 
              y observar cómo afectan a las medidas de tendencia central y dispersión. 
              Ajusta los controles para ver cómo cambian las estadísticas en tiempo real.
            </p>
          </div>
          
          <div className="bg-gris-claro p-4 rounded-lg">
            <h3 className="font-bold text-negro mb-3">💡 Cosas que puedes probar:</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Ajusta la dispersión (desvío estándar) para ver cómo cambia la forma de la distribución</li>
              <li>Modifica la asimetría para crear distribuciones sesgadas</li>
              <li>Observa cómo cambian la media, mediana y moda según la distribución</li>
              <li>Activa los cuartiles y quintiles para ver las divisiones de los datos</li>
              <li>Identifica outliers en el boxplot según la distribución</li>
              <li>Compara cómo se comportan las diferentes medidas de tendencia central</li>
            </ul>
          </div>
        </div>

        <div className="mt-12">
          {/* Panel de control */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Controles de Simulación</h3>
            
            <div className="mb-4">
              <h4 className="text-xl font-bold text-gray-900">
                Media = {mean?.toFixed(2) ?? '0.00'} | Desvío = {stdDev?.toFixed(2) ?? '0.00'} | Mediana = {median?.toFixed(2) ?? '0.00'} | Moda = {mode?.toFixed(2) ?? '0.00'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dispersión (Desvío Estándar):
                </label>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Bajo</span>
                  <span>Alto</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.5"
                  step="0.1"
                  value={std}
                  onChange={(e) => setStd(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asimetría:
                </label>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Negativa</span>
                  <span>Positiva</span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={skewness}
                  onChange={(e) => setSkewness(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showQuartiles}
                  onChange={(e) => setShowQuartiles(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Mostrar Cuartiles</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showQuintiles}
                  onChange={(e) => setShowQuintiles(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Mostrar Quintiles</span>
              </label>
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución de Horas de Sueño</h3>
            <div className="flex justify-center">
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
          </div>

          {/* Preguntas */}
          <div className="space-y-8">
            <Question
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
          </div>

          {/* Navegación */}
          <LessonNavigation
            currentStep={2}
            totalSteps={2}
            previousUrl="/lessons/descriptive-stats"
            showPrevious={true}
            nextUrl="/lessons/mean-deviation-editable"
          />
        </div>
      </div>
    </div>
  );
} 