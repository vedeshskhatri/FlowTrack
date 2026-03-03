'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  Upload,
  Zap,
  MessageSquare,
  History,
  Settings,
  LogOut,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { label: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Plan',       href: '/plan',        icon: CalendarDays },
  { label: 'Upload',     href: '/upload',      icon: Upload },
  { label: 'Live',       href: '/live',        icon: Zap },
  { label: 'AI Coach',   href: '/ai-coach',    icon: MessageSquare },
  { label: 'History',    href: '/history',     icon: History },
  { label: 'Settings',   href: '/settings',    icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'FT'

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 shrink-0 border-r border-border bg-sidebar fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-[72px] border-b border-border shrink-0">
        <div className="w-6 h-6 border border-foreground/20 flex items-center justify-center shrink-0">
          <Activity className="w-3.5 h-3.5 text-foreground/60" />
        </div>
        <span
          className="font-bold tracking-[0.2em] text-[11px] uppercase text-foreground"
          style={{ fontFamily: 'var(--font-display, sans-serif)' }}
        >
          FlowTrack
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-all duration-200',
                active
                  ? 'text-[#C9A84C] bg-[#C9A84C]/8'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#C9A84C]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn('w-4 h-4 shrink-0 relative z-10', active ? 'text-[#C9A84C]' : 'stroke-[1.5]')} />
              <span className="relative z-10">{label}</span>
              {label === 'Live' && (
                <span className="ml-auto relative z-10 w-1.5 h-1.5 bg-[#C9A84C] block" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 border-t border-border pt-4 space-y-1">
        <ThemeToggle />
        <div className="flex items-center gap-3 px-3 py-3">
          <Avatar className="h-7 w-7 rounded-none">
            <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground rounded-none border border-border">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-muted-foreground flex-1 truncate tracking-wide font-medium">
            {user?.email ?? 'Guest'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none"
            onClick={signOut}
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
