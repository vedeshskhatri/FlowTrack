'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'FlowTrack',
  '/plan':       'My Plan',
  '/upload':     'Upload CSV',
  '/live':       'Live Session',
  '/ai-coach':   'AI Coach',
  '/history':    'History',
  '/settings':   'Settings',
}

export function MobileHeader() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'FlowTrack'
  const isHome = pathname === '/dashboard'

  return (
    <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-16 bg-card border-b border-border flex items-center px-5 gap-3">
      {isHome ? (
        <>
          <span
            className="font-bold tracking-[0.2em] text-[11px] uppercase text-foreground"
            style={{ fontFamily: 'var(--font-display, sans-serif)' }}
          >
            FlowTrack
          </span>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle compact />
            <Link href="/settings" className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </>
      ) : (
        <>
          <h1
            className="flex-1 text-[11px] font-semibold tracking-[0.15em] uppercase text-foreground"
            style={{ fontFamily: 'var(--font-display, sans-serif)' }}
          >
            {title}
          </h1>
          <div className="flex items-center gap-1">
            <ThemeToggle compact />
            <Link href="/settings" className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </header>
  )
}
