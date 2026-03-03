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
      <div className="flex items-center justify-around px-1 pb-safe">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const isLive = label === 'Live'
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 min-w-[52px] min-h-[60px] pt-2 pb-1 relative"
            >
              {/* Active bar — gold top indicator */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#C9A84C]" />
              )}
              <div className={cn(
                'relative flex items-center justify-center w-10 h-10 transition-all duration-200',
                active ? 'bg-[#C9A84C]/10' : 'bg-transparent',
              )}>
                <Icon className={cn(
                  'w-5 h-5 transition-all duration-200',
                  active ? 'text-[#C9A84C]' : 'text-muted-foreground stroke-[1.5]',
                )} />
                {isLive && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#C9A84C] border-2 border-card" />
                )}
              </div>
              <span className={cn(
                'text-[9px] font-semibold tracking-[0.1em] uppercase transition-colors',
                active ? 'text-[#C9A84C]' : 'text-muted-foreground',
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
