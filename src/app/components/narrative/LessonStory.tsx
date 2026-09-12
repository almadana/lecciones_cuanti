'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import NarrativeSection from './NarrativeSection'

type LessonStoryProps = {
  eyebrow: string
  title: string
  lead: string
  children: ReactNode
}

export function LessonStory({ eyebrow, title, lead, children }: LessonStoryProps) {
  return (
    <article className="lesson-story">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[var(--content-reading)] px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">{eyebrow}</p>
          <h1 className="mt-4 text-4xl leading-tight text-[var(--text)] sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl">{lead}</p>
        </div>
      </header>
      <div className="mx-auto max-w-[var(--content-wide)] px-4 sm:px-6">{children}</div>
    </article>
  )
}

type StoryBeatProps = {
  number?: string
  label: string
  title: string
  children: ReactNode
  visual?: ReactNode
  id?: string
  layout?: 'split' | 'stacked'
}

export function StoryBeat({ number, label, title, children, visual, id, layout = 'split' }: StoryBeatProps) {
  const sectionLayout =
    layout === 'stacked'
      ? 'min-h-[60vh] border-b border-[var(--border)] py-16 sm:py-24'
      : 'grid min-h-[70vh] content-center gap-8 border-b border-[var(--border)] py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12 lg:py-24'

  return (
    <NarrativeSection id={id} className={sectionLayout}>
      <div className={layout === 'stacked' ? 'max-w-3xl' : 'max-w-xl'}>
        <p className="text-xs font-bold uppercase tracking-[0.17em] text-[var(--accent)]">
          {number ? `${number} · ` : ''}{label}
        </p>
        <h2 className="mt-3 text-3xl leading-tight text-[var(--text)] sm:text-4xl">{title}</h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">{children}</div>
      </div>
      {visual ? (
        <div className={`min-w-0 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-6 ${layout === 'stacked' ? 'mt-8 w-full' : ''}`}>
          {visual}
        </div>
      ) : null}
    </NarrativeSection>
  )
}

type PredictionPromptProps = {
  question: string
  options: string[]
  reveal: ReactNode
}

export function PredictionPrompt({ question, options, reveal }: PredictionPromptProps) {
  const [answer, setAnswer] = useState<string>()

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--accent-soft)] p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Tu predicción</p>
      <p className="mt-2 font-display text-lg font-semibold leading-snug text-[var(--text)]">{question}</p>
      <div className="mt-4 grid gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            aria-pressed={answer === option}
            onClick={() => setAnswer(option)}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
              answer === option
                ? 'border-[var(--accent)] bg-[var(--surface)] text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {answer ? <div className="mt-5 border-t border-[var(--border)] pt-4 text-sm leading-relaxed text-[var(--text-muted)]" role="status">{reveal}</div> : null}
    </div>
  )
}

export function StoryConclusion({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-[var(--radius-card)] border border-[var(--success)] bg-[var(--success-soft)] p-6 text-[var(--text)] sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.17em] text-[var(--success)]">Conclusión</p>
      <div className="mt-3 text-lg leading-relaxed">{children}</div>
    </aside>
  )
}

export function TransferTask({ question, children }: { question: string; children?: ReactNode }) {
  return (
    <section className="rounded-[var(--radius-card)] bg-[var(--text)] p-6 text-white sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.17em] text-[var(--color-verde-claro)]">Llevátelo a otra situación</p>
      <h2 className="mt-3 text-2xl leading-snug text-white">{question}</h2>
      {children ? <div className="mt-4 text-white/75">{children}</div> : null}
    </section>
  )
}

export function DataAttribution({ children }: { children: ReactNode }) {
  return (
    <footer className="mt-10 border-t border-[var(--border)] pt-5 text-xs leading-relaxed text-[var(--text-muted)]">
      <strong className="text-[var(--text)]">Datos y procedencia.</strong> {children}
    </footer>
  )
}
