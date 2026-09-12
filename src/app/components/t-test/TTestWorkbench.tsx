'use client'

import type { ReactNode } from 'react'
import TTestHistogramCompare, { type TTestGroup } from '@/app/components/t-test/TTestHistogramCompare'
import TTestResultsPanel, { type TTestResults } from '@/app/components/t-test/TTestResultsPanel'

type Props = {
  groupA: TTestGroup
  groupB: TTestGroup
  results: TTestResults
  controls?: ReactNode
  meanControls?: {
    groupA: ReactNode
    groupB: ReactNode
  }
}

export default function TTestWorkbench({ groupA, groupB, results, controls, meanControls }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      {controls ? (
        <div className="flex flex-wrap items-end gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)]/50 px-3 py-3 sm:gap-4 sm:px-4">
          {controls}
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(200px,260px)]">
        <div className="min-w-0 border-b border-[var(--border)] p-3 sm:p-4 lg:border-b-0 lg:border-r">
          <TTestHistogramCompare groupA={groupA} groupB={groupB} meanControls={meanControls} compact />
        </div>
        <div className="p-3 sm:p-4">
          <TTestResultsPanel results={results} />
        </div>
      </div>
    </section>
  )
}
