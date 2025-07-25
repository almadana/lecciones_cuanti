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

// Datos iniciales de ejemplo
const initialData = [
  { row: 'Primaria', col: 'No satisfecho', value: 89 },
  { row: 'Primaria', col: 'Satisfecho', value: 287 },
  { row: 'Secundaria', col: 'No satisfecho', value: 134 },
  { row: 'Secundaria', col: 'Satisfecho', value: 456 },
  { row: 'Universidad', col: 'No satisfecho', value: 44 },
  { row: 'Universidad', col: 'Satisfecho', value: 189 },
]

export default function BivariateTables() {
  const [rawData, setRawData] = useState(initialData)
  const [data, setData] = useState<CellData[]>(calculatePercentages(initialData))
  const [normalization, setNormalization] = useState<'row' | 'column'>('row')
  const [newRow, setNewRow] = useState('')
  const [newCol, setNewCol] = useState('')
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

  const updateCellValue = (row: string, col: string, value: number) => {
    const newRawData = rawData.map(cell => 
      cell.row === row && cell.col === col
        ? { ...cell, value }
        : cell
    )
    setRawData(newRawData)
    setData(calculatePercentages(newRawData))
  }

  const addRow = () => {
    if (!newRow.trim() || rows.includes(newRow.trim())) return
    const rowToAdd = newRow.trim()
    const newRawData = [
      ...rawData,
      ...cols.map(col => ({ row: rowToAdd, col, value: 0 }))
    ]
    setRawData(newRawData)
    setData(calculatePercentages(newRawData))
    setNewRow('')
  }

  const addColumn = () => {
    if (!newCol.trim() || cols.includes(newCol.trim())) return
    const colToAdd = newCol.trim()
    const newRawData = [
      ...rawData,
      ...rows.map(row => ({ row, col: colToAdd, value: 0 }))
    ]
    setRawData(newRawData)
    setData(calculatePercentages(newRawData))
    setNewCol('')
  }

  const removeRow = (rowToRemove: string) => {
    const newRawData = rawData.filter(cell => cell.row !== rowToRemove)
    setRawData(newRawData)
    setData(calculatePercentages(newRawData))
  }

  const removeColumn = (colToRemove: string) => {
    const newRawData = rawData.filter(cell => cell.col !== colToRemove)
    setRawData(newRawData)
    setData(calculatePercentages(newRawData))
  }

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
          <h1 className="text-3xl font-bold text-gray-900">
            Editor Avanzado de Tablas Bivariadas
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Crea y modifica tablas bivariadas añadiendo o eliminando categorías
          </p>
        </div>

        <div className="mt-12">
          {/* Controles para añadir filas y columnas */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gestión de Categorías</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Añadir/Eliminar Filas (Nivel Educativo)</h4>
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newRow}
                    onChange={(e) => setNewRow(e.target.value)}
                    placeholder="Nuevo nivel educativo"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    onClick={addRow}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Añadir
                  </button>
                </div>
                <div className="space-y-2">
                  {rows.map(row => (
                    <div key={row} className="flex justify-between items-center">
                      <span>{row}</span>
                      <button
                        onClick={() => removeRow(row)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Añadir/Eliminar Columnas (Satisfacción)</h4>
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newCol}
                    onChange={(e) => setNewCol(e.target.value)}
                    placeholder="Nuevo nivel de satisfacción"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    onClick={addColumn}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Añadir
                  </button>
                </div>
                <div className="space-y-2">
                  {cols.map(col => (
                    <div key={col} className="flex justify-between items-center">
                      <span>{col}</span>
                      <button
                        onClick={() => removeColumn(col)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de frecuencias absolutas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Frecuencias Absolutas</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nivel Educativo
                    </th>
                    {cols.map(col => (
                      <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map(row => (
                    <tr key={row}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row}
                      </td>
                      {cols.map(col => {
                        const cell = data.find(d => d.row === row && d.col === col)
                        return (
                          <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <input
                              type="number"
                              value={cell?.value || 0}
                              onChange={(e) => updateCellValue(row, col, parseInt(e.target.value) || 0)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              min="0"
                            />
                          </td>
                        )
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rowTotals.find(t => t.row === row)?.total}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total
                    </td>
                    {cols.map(col => (
                      <td key={col} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {colTotals.find(t => t.col === col)?.total}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {grandTotal}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de frecuencias porcentuales */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Frecuencias Porcentuales</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nivel Educativo
                    </th>
                    {cols.map(col => (
                      <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map(row => (
                    <tr key={row}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row}
                      </td>
                      {cols.map(col => {
                        const cell = data.find(d => d.row === row && d.col === col)
                        return (
                          <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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

          {/* Visualización */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Visualización</h3>
            <div className="mt-4 flex items-center space-x-4">
              <label className="text-sm text-gray-600">Normalización:</label>
              <select
                value={normalization}
                onChange={(e) => setNormalization(e.target.value as 'row' | 'column')}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="row">Por filas</option>
                <option value="column">Por columnas</option>
              </select>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              El gráfico muestra la distribución porcentual {normalization === 'row' ? 'por nivel educativo' : 'por nivel de satisfacción'}
            </p>
            <div className="mt-4 flex justify-center">
              <svg ref={svgRef}></svg>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Instrucciones</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Puedes añadir nuevas categorías tanto para niveles educativos como para niveles de satisfacción</li>
              <li>Para eliminar una categoría, usa el botón "Eliminar" junto a ella</li>
              <li>Modifica las frecuencias en la tabla de valores absolutos</li>
              <li>Los porcentajes y la visualización se actualizarán automáticamente</li>
              <li>Cambia entre normalización por filas o columnas para ver diferentes perspectivas de los datos</li>
              <li>La visualización se adapta automáticamente:
                <ul className="list-disc pl-5 mt-2">
                  <li>Barras horizontales cuando se normaliza por filas</li>
                  <li>Barras verticales cuando se normaliza por columnas</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 