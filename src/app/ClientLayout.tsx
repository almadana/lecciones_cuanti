'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import AppHeader from '@/app/components/AppHeader'
import NavDrawer from '@/app/components/NavDrawer'
import ReadingProgress from '@/app/components/ReadingProgress'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [navOpen, setNavOpen] = useState(false)
  const pathname = usePathname()
  const isLesson = pathname?.startsWith('/lessons')

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [navOpen])

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <a
        href="#main-content"
        className="fixed left-4 top-2 z-[60] -translate-y-20 rounded-full bg-[var(--text)] px-4 py-2 text-sm text-white transition-transform focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <AppHeader navOpen={navOpen} onOpenNav={() => setNavOpen(true)} />
      {isLesson ? <ReadingProgress /> : null}
      <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
      <main id="main-content" className="pb-20 pt-14">{children}</main>
    </div>
  )
}
