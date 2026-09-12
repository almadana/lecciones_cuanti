'use client'

export type ChiCell = {
  row: string
  col: string
  value: number
}

export type ChiCellResult = ChiCell & {
  expected: number
  residual: number
  contribution: number
}

export function calculateChiSquare(data: ChiCell[]) {
  const rows = Array.from(new Set(data.map((cell) => cell.row)))
  const cols = Array.from(new Set(data.map((cell) => cell.col)))
  const rowTotal = (row: string) => data.filter((cell) => cell.row === row).reduce((sum, cell) => sum + cell.value, 0)
  const colTotal = (col: string) => data.filter((cell) => cell.col === col).reduce((sum, cell) => sum + cell.value, 0)
  const total = data.reduce((sum, cell) => sum + cell.value, 0)
  const cells: ChiCellResult[] = data.map((cell) => {
    const expected = total > 0 ? (rowTotal(cell.row) * colTotal(cell.col)) / total : 0
    const difference = cell.value - expected
    return {
      ...cell,
      expected,
      residual: expected > 0 ? difference / Math.sqrt(expected) : 0,
      contribution: expected > 0 ? difference ** 2 / expected : 0,
    }
  })
  const chiSquare = cells.reduce((sum, cell) => sum + cell.contribution, 0)
  return { rows, cols, rowTotal, colTotal, total, cells, chiSquare, degreesOfFreedom: (rows.length - 1) * (cols.length - 1) }
}

export default function ChiSquareTable({
  data,
  mode,
  editable = false,
  onChange,
}: {
  data: ChiCell[]
  mode: 'observed' | 'expected' | 'residual' | 'contribution'
  editable?: boolean
  onChange?: (row: string, col: string, value: number) => void
}) {
  const result = calculateChiSquare(data)
  const displayed = (cell: ChiCellResult) => {
    if (mode === 'expected') return cell.expected.toFixed(1)
    if (mode === 'residual') return `${cell.residual > 0 ? '+' : ''}${cell.residual.toFixed(2)}`
    if (mode === 'contribution') return cell.contribution.toFixed(2)
    return String(cell.value)
  }
  const background = (cell: ChiCellResult) => {
    if (mode !== 'residual' && mode !== 'contribution') return undefined
    const intensity = mode === 'residual'
      ? Math.min(0.28, Math.abs(cell.residual) * 0.07)
      : Math.min(0.28, cell.contribution * 0.035)
    if (mode === 'contribution') return `rgba(75, 0, 249, ${intensity})`
    return cell.residual >= 0
      ? `rgba(47, 125, 75, ${intensity})`
      : `rgba(209, 74, 144, ${intensity})`
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead className="bg-[var(--surface-muted)]">
          <tr>
            <th className="px-4 py-3 text-left">Respuesta</th>
            {result.cols.map((col) => <th key={col} className="px-4 py-3 text-right">{col}</th>)}
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row) => (
            <tr key={row} className="border-t border-[var(--border)]">
              <th scope="row" className="px-4 py-3 text-left font-medium">{row}</th>
              {result.cols.map((col) => {
                const cell = result.cells.find((item) => item.row === row && item.col === col)!
                return (
                  <td key={col} className="px-4 py-3 text-right font-mono" style={{ background: background(cell) }}>
                    {editable && mode === 'observed' ? (
                      <input
                        type="number"
                        min={0}
                        value={cell.value}
                        aria-label={`${row}, ${col}`}
                        onChange={(event) => onChange?.(row, col, Math.max(0, Number(event.target.value)))}
                        className="w-20 rounded-lg border border-[var(--border)] bg-white/80 px-2 py-1 text-right"
                      />
                    ) : displayed(cell)}
                  </td>
                )
              })}
              <td className="px-4 py-3 text-right font-bold">{result.rowTotal(row)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-[var(--border-strong)] font-bold">
            <th className="px-4 py-3 text-left">Total</th>
            {result.cols.map((col) => <td key={col} className="px-4 py-3 text-right">{result.colTotal(col)}</td>)}
            <td className="px-4 py-3 text-right">{result.total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
