'use client'

export type TTestResults = {
  meanDiff: number
  tStat: number
  pValue: number
  df: number
}

type Props = {
  results: TTestResults
}

export default function TTestResultsPanel({ results }: Props) {
  const { meanDiff, tStat, pValue, df } = results
  const significant = pValue < 0.05

  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        Prueba t (dos colas)
      </p>

      <div
        className={`rounded-xl border px-4 py-3 text-center ${
          significant
            ? 'border-[var(--danger)] bg-[var(--danger-soft)]'
            : 'border-[var(--success)] bg-[var(--success-soft)]'
        }`}
      >
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Valor p</p>
        <p className="font-mono text-3xl font-bold tabular-nums text-[var(--text)]">
          {pValue.toFixed(4)}
        </p>
        <p className={`mt-1 text-sm font-bold ${significant ? 'text-[#7f1235]' : 'text-[#14532d]'}`}>
          {significant ? 'Rechazar H₀ (α = 0,05)' : 'No rechazar H₀ (α = 0,05)'}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <dt className="text-[var(--text-muted)]">Δ medias</dt>
          <dd className="font-mono font-semibold tabular-nums text-[var(--text)]">
            {meanDiff >= 0 ? '+' : ''}
            {meanDiff.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">t</dt>
          <dd className="font-mono font-semibold tabular-nums text-[var(--text)]">
            {tStat.toFixed(3)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[var(--text-muted)]">gl</dt>
          <dd className="font-mono tabular-nums text-[var(--text)]">{df}</dd>
        </div>
      </dl>

      <p className="text-[10px] leading-snug text-[var(--text-muted)]">
        H₀: mismas medias · H₁: medias distintas
      </p>
    </div>
  )
}
