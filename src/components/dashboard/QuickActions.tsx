'use client'

import Link from 'next/link'
import { Upload, Zap, MessageSquare, CalendarDays } from 'lucide-react'

const actions = [
  {
    label: 'Upload Plan',
    description: 'Import from CSV',
    Icon: Upload,
    href: '/upload',
    color: 'text-cyan-500 dark:text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    label: 'Live Session',
    description: 'Track reps now',
    Icon: Zap,
    href: '/live',
    color: 'text-violet-500 dark:text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    label: 'AI Coach',
    description: 'Get advice',
    Icon: MessageSquare,
    href: '/ai-coach',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'My Plan',
    description: 'View schedule',
    Icon: CalendarDays,
    href: '/plan',
    color: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-500/10',
  },
]

export function QuickActions() {
  return (
    <div>
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ label, description, Icon, href, color, bg }) => (
          <Link key={href} href={href}>
            <div className="ny-card p-5 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all">
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
