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
  ChevronRight,
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
        <span className="font-black text-[18px] tracking-tight gradient-text">FlowTrack</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-150',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-2xl bg-primary/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn('w-5 h-5 shrink-0 relative z-10', active ? 'text-primary stroke-[2]' : 'stroke-[1.6]')} />
              <span className="relative z-10">{label}</span>
              {label === 'Live' && (
                <span className="ml-auto relative z-10 w-2 h-2 rounded-full bg-primary block" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-5 space-y-1 border-t border-border pt-4">
        <ThemeToggle />
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground flex-1 truncate font-medium">
            {user?.email ?? 'Guest'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
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
