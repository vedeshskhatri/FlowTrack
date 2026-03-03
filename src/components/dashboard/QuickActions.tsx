'use client'

import Link from 'next/link'
import { Upload, Zap, MessageSquare, CalendarDays, ArrowRight } from 'lucide-react'

const actions = [
  {
    label: 'Upload Plan',
    description: 'Import from CSV',
    Icon: Upload,
    href: '/upload',
  },
  {
    label: 'Live Session',
    description: 'Track reps now',
    Icon: Zap,
    href: '/live',
    highlight: true,
  },
  {
    label: 'AI Coach',
    description: 'Get advice',
    Icon: MessageSquare,
    href: '/ai-coach',
  },
  {
    label: 'My Plan',
    description: 'View schedule',
    Icon: CalendarDays,
    href: '/plan',
  },
]

export function QuickActions() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-4 h-[1px] bg-[#C9A84C]/60" />
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 gap-px bg-border">
        {actions.map(({ label, description, Icon, href, highlight }) => (
          <Link key={href} href={href}>
            <div className={`group p-5 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all duration-200 ${
              highlight
                ? 'bg-[#0A1628] dark:bg-[#0D1829] hover:bg-[#C9A84C] [&:hover_.action-icon]:text-[#0A1628] [&:hover_.action-label]:text-[#0A1628] [&:hover_.action-desc]:text-[#0A1628]/60'
                : 'bg-card hover:bg-muted/40'
            }`}>
              <div className={`w-10 h-10 border flex items-center justify-center shrink-0 transition-colors ${
                highlight ? 'border-white/20 group-hover:border-[#0A1628]/30' : 'border-border group-hover:border-[#C9A84C]/40'
              }`}>
                <Icon className={`w-4.5 h-4.5 action-icon transition-colors ${
                  highlight ? 'text-[#C9A84C] group-hover:text-[#0A1628]' : 'text-muted-foreground group-hover:text-[#C9A84C]'
                }`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold tracking-[0.08em] uppercase leading-tight action-label transition-colors ${
                  highlight ? 'text-white group-hover:text-[#0A1628]' : 'text-foreground'
                }`}>{label}</p>
                <p className={`text-[10px] mt-0.5 action-desc transition-colors ${
                  highlight ? 'text-white/50 group-hover:text-[#0A1628]/60' : 'text-muted-foreground'
                }`}>{description}</p>
              </div>
              <ArrowRight className={`w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 ${
                highlight ? 'text-[#0A1628]' : 'text-[#C9A84C]'
              }`} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
