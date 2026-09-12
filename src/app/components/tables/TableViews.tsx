'use client'

export type FrequencyRow = {
  category: string
  value: number
}

export type Cell = {
  row: string
  col: string
  value: number
}

const colors = ['#4b00f9', '#2f7d4b', '#d14a90', '#4a74f5', '#8c7ddc']

export function FrequencyView({
  data,
  editable = false,
  onChange,
}: {
  data: FrequencyRow[]
  editable?: boolean
  onChange?: (index: number, value: number) => void
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[var(--surface-muted)] text-left">
            <tr>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-right">f</th>
              <th className="px-4 py-3 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0
              return (
                <tr key={item.category} className="border-t border-[var(--border)]">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-[var(--text)]">{item.category}</th>
                  <td className="px-4 py-3 text-right">
                    {editable ? (
                      <input
                        type="number"
                        min={0}
                        value={item.value}
                        aria-label={`Frecuencia de ${item.category}`}
                        onChange={(event) => onChange?.(index, Math.max(0, Number(event.target.value)))}
                        className="w-20 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-right"
                      />
                    ) : item.value}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{percentage.toFixed(1)}%</td>
                </tr>
              )
            })}
            <tr className="border-t-2 border-[var(--border-strong)] font-bold">
              <th scope="row" className="px-4 py-3 text-left">Total</th>
              <td className="px-4 py-3 text-right">{total}</td>
              <td className="px-4 py-3 text-right font-mono">{total > 0 ? '100,0%' : '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-3" role="img" aria-label="Barras porcentuales por categoría">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div key={item.category}>
              <div className="mb-1 flex justify-between gap-3 text-xs">
                <span className="text-[var(--text)]">{item.category}</span>
                <span className="font-mono text-[var(--text-muted)]">{percentage.toFixed(1)}%</span>
              </div>
              <div className="h-7 overflow-hidden rounded-md bg-[var(--surface-muted)]">
                <div className="h-full rounded-md" style={{ width: `${percentage}%`, background: colors[index % colors.length] }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function calculateCells(data: Cell[]) {
  const rows = Array.from(new Set(data.map((cell) => cell.row)))
  const cols = Array.from(new Set(data.map((cell) => cell.col)))
  const rowTotal = (row: string) => data.filter((cell) => cell.row === row).reduce((sum, cell) => sum + cell.value, 0)
  const colTotal = (col: string) => data.filter((cell) => cell.col === col).reduce((sum, cell) => sum + cell.value, 0)
  const total = data.reduce((sum, cell) => sum + cell.value, 0)
  return { rows, cols, rowTotal, colTotal, total }
}

export function ContingencyView({
  data,
  normalization,
  editable = false,
  onChange,
  rowLabel = 'Grupo',
}: {
  data: Cell[]
  normalization: 'count' | 'row' | 'column'
  editable?: boolean
  onChange?: (row: string, col: string, value: number) => void
  rowLabel?: string
}) {
  const { rows, cols, rowTotal, colTotal, total } = calculateCells(data)
  const displayed = (cell: Cell) => {
    if (normalization === 'row') return rowTotal(cell.row) ? (cell.value / rowTotal(cell.row)) * 100 : 0
    if (normalization === 'column') return colTotal(cell.col) ? (cell.value / colTotal(cell.col)) * 100 : 0
    return cell.value
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead className="bg-[var(--surface-muted)]">
            <tr>
              <th className="px-4 py-3 text-left">{rowLabel}</th>
              {cols.map((col) => <th key={col} className="px-4 py-3 text-right">{col}</th>)}
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row} className="border-t border-[var(--border)]">
                <th scope="row" className="px-4 py-3 text-left">{row}</th>
                {cols.map((col) => {
                  const cell = data.find((item) => item.row === row && item.col === col) ?? { row, col, value: 0 }
                  return (
                    <td key={col} className="px-4 py-3 text-right font-mono">
                      {editable && normalization === 'count' ? (
                        <input
                          type="number"
                          min={0}
                          value={cell.value}
                          aria-label={`${row}, ${col}`}
                          onChange={(event) => onChange?.(row, col, Math.max(0, Number(event.target.value)))}
                          className="w-20 rounded-lg border border-[var(--border)] px-2 py-1 text-right"
                        />
                      ) : normalization === 'count' ? cell.value : `${displayed(cell).toFixed(1)}%`}
                    </td>
                  )
                })}
                <td className="px-4 py-3 text-right font-bold">{rowTotal(row)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-[var(--border-strong)] font-bold">
              <th className="px-4 py-3 text-left">Total</th>
              {cols.map((col) => <td key={col} className="px-4 py-3 text-right">{colTotal(col)}</td>)}
              <td className="px-4 py-3 text-right">{total}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {normalization !== 'count' ? (
        <div className="space-y-4" role="img" aria-label={`Porcentajes por ${normalization === 'row' ? 'fila' : 'columna'}`}>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
            {(normalization === 'row' ? cols : rows).map((label, index) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm" style={{ background: colors[index % colors.length] }} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
          {(normalization === 'row' ? rows : cols).map((group) => {
            const segments = normalization === 'row'
              ? cols.map((col) => data.find((cell) => cell.row === group && cell.col === col)!)
              : rows.map((row) => data.find((cell) => cell.row === row && cell.col === group)!)
            return (
              <div key={group}>
                <p className="mb-1 text-xs font-medium text-[var(--text)]">{group}</p>
                <div className="flex h-10 overflow-hidden rounded-lg bg-[var(--surface-muted)]">
                  {segments.map((cell, index) => (
                    <div
                      key={`${cell.row}-${cell.col}`}
                      className="flex items-center justify-center overflow-hidden text-[10px] font-bold text-white"
                      style={{ width: `${displayed(cell)}%`, background: colors[index % colors.length] }}
                      title={`${normalization === 'row' ? cell.col : cell.row}: ${displayed(cell).toFixed(1)}%`}
                    >
                      {displayed(cell) >= 12 ? `${displayed(cell).toFixed(0)}%` : ''}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
