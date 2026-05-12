'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [p, setP] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrollable = el.scrollHeight - el.clientHeight
      if (scrollable <= 0) {
        setP(100)
        return
      }
      setP(Math.min(100, Math.max(0, (100 * el.scrollTop) / scrollable)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-14 z-40 h-[3px] bg-[var(--surface-muted)]"
      aria-hidden
    >
      <div
        className="h-full rounded-r-full bg-[var(--accent)] transition-[width] duration-150 ease-out"
        style={{ width: `${p}%` }}
      />
    </div>
  )
}
