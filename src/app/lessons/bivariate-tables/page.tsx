'use client'

import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import Question from '@/app/components/Question'

interface CellData {
  row: string
  col: string
  value: number
  rowPercentage: number
  colPercentage: number
  totalPercentage: number
}

interface StackedDataItem {
  _row?: string
  _col?: string
  [key: string]: string | number | undefined
}

const calculatePercentages = (data: { value: number, row: string, col: string }[]): CellData[] => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0)
  const rowTotals = data.reduce((acc, curr) => {
    acc[curr.row] = (acc[curr.row] || 0) + curr.value
    return acc
  }, {} as { [key: string]: number })
  const colTotals = data.reduce((acc, curr) => {
    acc[curr.col] = (acc[curr.col] || 0) + curr.value
    return acc
  }, {} as { [key: string]: number })

  return data.map(cell => ({
    ...cell,
    rowPercentage: (cell.value / rowTotals[cell.row]) * 100,
    colPercentage: (cell.value / colTotals[cell.col]) * 100,
    totalPercentage: (cell.value / total) * 100
  }))
}

// Datos de ejemplo: Nivel educativo vs Satisfacción con la vida
const rawData = [
  { row: 'Primaria', col: 'No satisfecho', value: 89 },
  { row: 'Primaria', col: 'Satisfecho', value: 287 },
  { row: 'Secundaria', col: 'No satisfecho', value: 134 },
  { row: 'Secundaria', col: 'Satisfecho', value: 456 },
  { row: 'Universidad', col: 'No satisfecho', value: 44 },
  { row: 'Universidad', col: 'Satisfecho', value: 189 },
]

const initialData = calculatePercentages(rawData)

export default function BivariateTables() {
  const [data] = useState<CellData[]>(initialData)
  const [normalization, setNormalization] = useState<'row' | 'column'>('row')
  const svgRef = useRef<SVGSVGElement>(null)

  // Obtener valores únicos para filas y columnas
  const rows = Array.from(new Set(data.map(d => d.row)))
  const cols = Array.from(new Set(data.map(d => d.col)))

  // Calcular totales
  const rowTotals = rows.map(row => ({
    row,
    total: data.filter(d => d.row === row).reduce((acc, curr) => acc + curr.value, 0)
  }))
  const colTotals = cols.map(col => ({
    col,
    total: data.filter(d => d.col === col).reduce((acc, curr) => acc + curr.value, 0)
  }))
  const grandTotal = data.reduce((acc, curr) => acc + curr.value, 0)

  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Set up dimensions
    const margin = { top: 40, right: 120, bottom: 60, left: 150 }
    const width = 800 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Prepare data for stacked bars
    const stackedData = normalization === 'row'
      ? d3.stack<any>()
        .keys(cols)
        .value((d, key) => {
          const cell = data.find(c => c.row === d._row && c.col === key)
          return cell?.rowPercentage || 0
        })(rows.map(row => ({ 
          _row: row,
          ...Object.fromEntries(cols.map(col => [col, 0]))
        })))
      : d3.stack<any>()
        .keys(rows)
        .value((d, key) => {
          const cell = data.find(c => c.row === key && c.col === d._col)
          return cell?.colPercentage || 0
        })(cols.map(col => ({ 
          _col: col,
          ...Object.fromEntries(rows.map(row => [row, 0]))
        })))

    // Create scales
    if (normalization === 'row') {
      // Horizontal bars (normalización por filas)
      const y = d3.scaleBand()
        .range([0, height])
        .domain(rows)
        .padding(0.1)

      const x = d3.scaleLinear()
        .range([0, width])
        .domain([0, 100])

      // Create color scale
      const color = d3.scaleOrdinal<string>()
        .domain(cols)
        .range(d3.schemeSet2)

      // Add Y axis
      svg.append('g')
        .call(d3.axisLeft(y))

      // Add X axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d => `${d}%`))

      // Create bars
      const bars = svg.append('g')
        .selectAll('g')
        .data(stackedData)
        .enter().append('g')
        .attr('fill', (d, i) => color(cols[i]) || '#ccc')

      bars.selectAll('rect')
        .data(d => d)
        .enter().append('rect')
        .attr('y', (d: any) => y(d.data._row)!)
        .attr('x', d => x(d[0]))
        .attr('width', d => x(d[1]) - x(d[0]))
        .attr('height', y.bandwidth())

      // Add legend
      const legend = svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'start')
        .selectAll('g')
        .data(cols)
        .enter().append('g')
        .attr('transform', (d, i) => `translate(${width + 10},${i * 20 + 10})`)

      legend.append('rect')
        .attr('x', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => color(d))

      legend.append('text')
        .attr('x', 20)
        .attr('y', 7.5)
        .attr('dy', '0.32em')
        .text(d => d)

    } else {
      // Vertical bars (normalización por columnas)
      const x = d3.scaleBand()
        .range([0, width])
        .domain(cols)
        .padding(0.1)

      const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 100])

      // Create color scale
      const color = d3.scaleOrdinal<string>()
        .domain(rows)
        .range(d3.schemeSet2)

      // Add X axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')

      // Add Y axis
      svg.append('g')
        .call(d3.axisLeft(y).ticks(10).tickFormat(d => `${d}%`))

      // Create bars
      const bars = svg.append('g')
        .selectAll('g')
        .data(stackedData)
        .enter().append('g')
        .attr('fill', (d, i) => color(rows[i]) || '#ccc')

      bars.selectAll('rect')
        .data(d => d)
        .enter().append('rect')
        .attr('x', (d: any) => x(d.data._col)!)
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth())

      // Add legend
      const legend = svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'start')
        .selectAll('g')
        .data(rows)
        .enter().append('g')
        .attr('transform', (d, i) => `translate(${width + 10},${i * 20 + 10})`)

      legend.append('rect')
        .attr('x', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => color(d))

      legend.append('text')
        .attr('x', 20)
        .attr('y', 7.5)
        .attr('dy', '0.32em')
        .text(d => d)
    }

  }, [data, rows, cols, normalization])

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Tablas Bivariadas
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Relación entre nivel educativo y satisfacción con la vida
          </p>
        </div>

        <div className="mt-12">
          <div className="bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h3 className="text-lg font-medium text-negro bg-morado-claro p-2 rounded-lg inline-block mb-4">Frecuencias Absolutas</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gris-borde">
                <thead>
                  <tr className="bg-morado-claro">
                    <th className="px-6 py-3 text-left text-xs font-medium text-negro uppercase tracking-wider">
                      Nivel Educativo
                    </th>
                    {cols.map(col => (
                      <th key={col} className="px-6 py-3 text-left text-xs font-medium text-negro uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-negro uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-blanco divide-y divide-gris-borde">
                  {rows.map(row => (
                    <tr key={row}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-negro">
                        {row}
                      </td>
                      {cols.map(col => {
                        const cell = data.find(d => d.row === row && d.col === col)
                        return (
                          <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {cell?.value}
                          </td>
                        )
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-negro">
                        {rowTotals.find(t => t.row === row)?.total}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gris-claro">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-negro">
                      Total
                    </td>
                    {cols.map(col => (
                      <td key={col} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-negro">
                        {colTotals.find(t => t.col === col)?.total}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-negro">
                      {grandTotal}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h3 className="text-lg font-medium text-negro bg-morado-claro p-2 rounded-lg inline-block mb-4">Frecuencias Porcentuales</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gris-borde">
                <thead>
                  <tr className="bg-morado-claro">
                    <th className="px-6 py-3 text-left text-xs font-medium text-negro uppercase tracking-wider">
                      Nivel Educativo
                    </th>
                    {cols.map(col => (
                      <th key={col} className="px-6 py-3 text-left text-xs font-medium text-negro uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-blanco divide-y divide-gris-borde">
                  {rows.map(row => (
                    <tr key={row}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-negro">
                        {row}
                      </td>
                      {cols.map(col => {
                        const cell = data.find(d => d.row === row && d.col === col)
                        return (
                          <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {normalization === 'row' 
                              ? `${cell?.rowPercentage.toFixed(1)}%`
                              : `${cell?.colPercentage.toFixed(1)}%`
                            }
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-negro bg-morado-claro p-2 rounded-lg inline-block">Visualización</h3>
            <div className="mt-4 flex items-center space-x-4">
              <label className="text-sm text-gray-600">Normalización:</label>
              <select
                value={normalization}
                onChange={(e) => setNormalization(e.target.value as 'row' | 'column')}
                className="rounded-md border-gris-borde shadow-sm focus:border-morado-oscuro focus:ring-morado-oscuro p-2"
              >
                <option value="row">Por filas</option>
                <option value="column">Por columnas</option>
              </select>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              El gráfico muestra la distribución porcentual {normalization === 'row' ? 'por nivel educativo' : 'por nivel de satisfacción'}
            </p>
            <div className="mt-4 flex justify-center">
              <svg ref={svgRef}></svg>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <Question
              question="¿Qué porcentaje de personas con educación universitaria están satisfechas con su vida?"
              type="numeric"
              hint="Divide el número de universitarios satisfechos entre el total de universitarios"
              correctAnswer={(189 / (44 + 189)) * 100}
              explanation={`Para encontrar este porcentaje, tomamos el número de universitarios satisfechos (189) y lo dividimos por el total de universitarios (${44 + 189}), luego multiplicamos por 100. Esto nos da aproximadamente ${((189 / (44 + 189)) * 100).toFixed(1)}%.`}
            />

            <Question
              question="¿Es verdad que la mayoría de las personas no satisfechas tienen solo educación primaria?"
              type="multiple-choice"
              options={[
                { text: 'Verdadero', value: true },
                { text: 'Falso', value: false }
              ]}
              explanation={`Esta afirmación es verdadera. De las personas no satisfechas, ${89} tienen educación primaria, ${134} tienen educación secundaria, y ${44} tienen educación universitaria. ${89} representa el ${((89 / (89 + 134 + 44)) * 100).toFixed(1)}% del total de personas no satisfechas.`}
            />
          </div>

          <div className="mt-8 bg-blanco rounded-lg shadow-lg p-6 border border-gris-borde">
            <h3 className="text-lg font-medium text-negro bg-morado-claro p-2 rounded-lg inline-block mb-4">Interpretación</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>La tabla muestra la relación entre el nivel educativo y la satisfacción con la vida</li>
              <li>Se presentan dos tablas:
                <ul className="list-disc pl-5 mt-2">
                  <li>Frecuencias absolutas: número de casos en cada combinación</li>
                  <li>Frecuencias porcentuales: distribución relativa que puede verse por filas o columnas</li>
                </ul>
              </li>
              <li>El gráfico de barras apiladas permite comparar las distribuciones porcentuales:
                <ul className="list-disc pl-5 mt-2">
                  <li>Por filas: muestra cómo se distribuye la satisfacción dentro de cada nivel educativo</li>
                  <li>Por columnas: muestra cómo se distribuye el nivel educativo dentro de cada nivel de satisfacción</li>
                </ul>
              </li>
              <li>Los totales marginales ayudan a entender la distribución general de cada variable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 