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
    <div className="font-sans min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <AppHeader navOpen={navOpen} onOpenNav={() => setNavOpen(true)} />
      {isLesson ? <ReadingProgress /> : null}
      <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
      <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-20 sm:px-6">{children}</main>
    </div>
  )
}
