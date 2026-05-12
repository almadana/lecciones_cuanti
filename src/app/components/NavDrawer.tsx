'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect } from 'react'
import { curriculum } from '@/app/data/curriculum'

type Props = {
  open: boolean
  onClose: () => void
}

export default function NavDrawer({ open, onClose }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        className={`nav-drawer-backdrop fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        id="course-nav-drawer"
        className={`fixed right-0 top-0 z-50 flex h-full w-[min(100vw-3rem,20rem)] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <span
            className="text-sm font-semibold tracking-wide text-[var(--text)]"
            style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
          >
            Contenidos
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
            aria-label="Cerrar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="space-y-1">
            {curriculum.map((mod) => {
              const activeMod = pathname === mod.href || mod.subLessons.some((s) => s.href === pathname)
              return (
                <li key={mod.id}>
                  <Link
                    href={mod.href}
                    onClick={onClose}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === mod.href && mod.subLessons.length === 0
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                        : activeMod
                          ? 'text-[var(--text)]'
                          : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {mod.title}
                  </Link>
                  {mod.subLessons.length > 0 && (
                    <ul className="ml-2 mt-1 space-y-0.5 border-l border-[var(--border)] pl-3">
                      {mod.subLessons.map((sub) => {
                        const active = pathname === sub.href
                        return (
                          <li key={sub.id}>
                            <Link
                              href={sub.href}
                              onClick={onClose}
                              className={`block rounded-md py-1.5 pr-2 text-xs transition-colors ${
                                active
                                  ? 'font-medium text-[var(--accent-strong)]'
                                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                              }`}
                            >
                              {sub.title}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}
