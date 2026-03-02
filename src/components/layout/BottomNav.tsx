'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Zap, MessageSquare, History } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { label: 'Home',    href: '/dashboard', icon: LayoutDashboard },
  { label: 'Plan',    href: '/plan',      icon: CalendarDays },
  { label: 'Live',    href: '/live',      icon: Zap },
  { label: 'Coach',   href: '/ai-coach',  icon: MessageSquare },
  { label: 'History', href: '/history',   icon: History },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border">
      <div className="flex items-center justify-around px-2 pb-safe">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const isLive = label === 'Live'
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[64px] pt-2 pb-1 relative"
            >
              {/* Active pill indicator */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-primary" />
              )}
              <div className={cn(
                'relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200',
                active ? 'bg-primary/10' : 'bg-transparent',
              )}>
                <Icon className={cn(
                  'w-6 h-6 transition-all duration-200',
                  active ? 'text-primary stroke-[2.2]' : 'text-muted-foreground stroke-[1.6]',
                )} />
                {isLive && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary border-2 border-card" />
                )}
              </div>
              <span className={cn(
                'text-[10px] font-semibold tracking-wide transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
