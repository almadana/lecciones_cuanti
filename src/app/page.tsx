import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { curriculum } from '@/app/data/curriculum'

export default function Home() {
  return (
    <div>
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[var(--content-wide)] px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Métodos y técnicas cuantitativas</p>
          <h1 className="mt-5 max-w-4xl text-4xl leading-tight text-[var(--text)] sm:text-6xl">
            Aprender estadística es aprender a hacer mejores preguntas.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl">
            Cada lección es una investigación breve: primero predecís, después mirás los datos y recién entonces aparece la herramienta estadística que necesitás.
          </p>
          <Link
            href={curriculum[0].href}
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            Empezar el recorrido
            <ArrowRightIcon className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--content-wide)] px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="recorrido">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Recorrido</p>
          <h2 id="recorrido" className="mt-3 text-3xl text-[var(--text)] sm:text-4xl">Una idea por vez</h2>
          <p className="mt-4 text-[var(--text-muted)]">Podés seguir el orden propuesto o entrar por la pregunta que te interese.</p>
        </div>

        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {curriculum.map((lesson, index) => (
            <li key={lesson.id}>
              <Link
                href={lesson.href}
                className="group flex h-full gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-card)] sm:p-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] font-display text-sm font-bold text-[var(--accent)]">
                  {String(index).padStart(2, '0')}
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{lesson.title}</span>
                  <span className="mt-2 block font-display text-lg font-semibold leading-snug text-[var(--text)] group-hover:text-[var(--accent)]">{lesson.question}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-[var(--text-muted)]">{lesson.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
