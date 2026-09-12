'use client'

import Link from 'next/link'
import { Bars3Icon, HomeIcon } from '@heroicons/react/24/outline'

type Props = {
  onOpenNav: () => void
  navOpen: boolean
}

export default function AppHeader({ onOpenNav, navOpen }: Props) {
  return (
    <header className="app-header-fixed fixed left-0 right-0 top-0 z-40 h-14 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[var(--content-wide)] items-center justify-between gap-4 px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
          aria-label="Inicio"
        >
          <HomeIcon className="h-6 w-6 shrink-0" />
        </Link>
        <div className="min-w-0">
          <Link
            href="/"
            className="block truncate font-display text-sm font-semibold tracking-tight text-[var(--text)] sm:text-base"
          >
            Lecciones Cuanti
          </Link>
          <p className="truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
            Métodos y técnicas cuantitativas
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenNav}
        className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text)] shadow-sm transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
        aria-expanded={navOpen}
        aria-controls="course-nav-drawer"
        aria-label="Abrir índice de lecciones"
      >
        <Bars3Icon className="h-5 w-5" />
        <span className="hidden sm:inline">Índice</span>
      </button>
      </div>
    </header>
  )
}
