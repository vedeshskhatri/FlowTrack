'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Moon, Zap, Flame, Battery, BatteryMedium } from 'lucide-react'
import type { Workout } from '@/types'

interface RestCardProps {
  workouts: Workout[]
}

function daysBetween(a: string, b: string) {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)
}

function muscleGroup(name: string): string {
  const n = name.toLowerCase()
  if (/squat|leg press|lunge|calf|hamstring|quad/.test(n)) return 'Legs'
  if (/deadlift|row|pull[- ]?up|lat|back|shrug/.test(n)) return 'Back'
  if (/bench|chest|fly|push[- ]?up|pec/.test(n)) return 'Chest'
  if (/shoulder|press|lateral raise|delt|ohp/.test(n)) return 'Shoulders'
  if (/curl|bicep|tricep|dip|skullcrush/.test(n)) return 'Arms'
  if (/plank|crunch|ab|core|sit[- ]?up/.test(n)) return 'Core'
  return 'Full body'
}

type RecoveryStatus = 'rest' | 'light' | 'ready'

export function RestCard({ workouts }: RestCardProps) {
  const analysis = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const sorted = [...workouts]
      .filter(w => w.status === 'completed' && w.date <= today)
      .sort((a, b) => b.date.localeCompare(a.date))

    if (sorted.length === 0) {
      return {
        status: 'ready' as RecoveryStatus,
        headline: 'Ready to train',
        detail: 'No recent sessions logged. Time to get moving!',
        recentGroups: [],
        streak: 0,
        daysSinceLast: null,
      }
    }

    const lastDate = sorted[0].date
    const daysSinceLast = daysBetween(lastDate, today)

    // Consecutive training days
    let streak = 0
    let prevDate = today
    for (const w of sorted) {
      const gap = daysBetween(w.date, prevDate)
      if (gap <= 1) { streak = Math.max(streak, daysBetween(w.date, today) + 1); prevDate = w.date }
      else break
    }
    // Deduplicate streak to days
    const recentDates = [...new Set(sorted.filter(w => daysBetween(w.date, today) <= 6).map(w => w.date))]
    const consecutiveDays = (() => {
      let c = 0; let last = today
      for (const d of recentDates.sort((a, b) => b.localeCompare(a))) {
        if (daysBetween(d, last) <= 1) { c++; last = d } else break
      }
      return c
    })()

    // Volume over last 2 days
    const recentSets = sorted.filter(w => daysBetween(w.date, today) <= 1).reduce((s, w) => s + w.sets, 0)

    // Muscle groups worked last 48h
    const recentGroups = [...new Set(
      sorted.filter(w => daysBetween(w.date, today) <= 1).map(w => muscleGroup(w.exercise_name))
    )]

    let status: RecoveryStatus
    let headline: string
    let detail: string

    if (daysSinceLast === 0 && consecutiveDays >= 3) {
      status = 'rest'
      headline = '🛌 Full rest recommended'
      detail = `${consecutiveDays} consecutive days training. Your muscles need 24–48 h to rebuild stronger.`
    } else if (daysSinceLast === 0 && recentSets >= 15) {
      status = 'rest'
      headline = 'Take it easy today'
      detail = `High volume session (${recentSets} sets) detected. Rest or do light stretching.`
    } else if (daysSinceLast <= 1 && recentGroups.length > 0) {
      status = 'light'
      headline = 'Light session OK'
      detail = `${recentGroups.join(', ')} worked recently. Train a different muscle group today.`
    } else if (daysSinceLast >= 3) {
      status = 'ready'
      headline = "You're fully recovered"
      detail = `${daysSinceLast} days since last session. You're primed to train hard today!`
    } else {
      status = 'ready'
      headline = 'Ready to train'
      detail = 'Recovery looks good. Hit your planned session!'
    }

    return { status, headline, detail, recentGroups, streak: consecutiveDays, daysSinceLast }
  }, [workouts])

  const palette = {
    rest:  { border: 'border-rose-500/20',    text: 'text-rose-400'    },
    light: { border: 'border-[#C9A84C]/30',   text: 'text-[#C9A84C]'   },
    ready: { border: 'border-[#C9A84C]/20',   text: 'text-[#C9A84C]'   },
  } as const

  // Override ready icon when fully charged
  const { border, text } = palette[analysis.status]
  const StatusIcon =
    analysis.status === 'ready' && (analysis.daysSinceLast ?? 0) >= 2 ? Battery :
    analysis.status === 'ready' ? Zap :
    analysis.status === 'light' ? Flame :
    Moon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`ny-card px-5 py-4 border ${border}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 border border-border flex items-center justify-center shrink-0">
          <StatusIcon className={`w-4 h-4 ${text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-[1px] bg-[#C9A84C]/50" />
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${text}`}>{analysis.headline.replace(/[^a-zA-Z0-9\s,]/g, '').trim()}</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-light">{analysis.detail}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-0 mt-4 pt-3 border-t border-border divide-x divide-border">
        <div className="flex-1 text-center py-1">
          <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>{analysis.streak}</p>
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-[0.18em] mt-0.5">Streak</p>
        </div>
        <div className="flex-1 text-center py-1">
          <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
            {analysis.daysSinceLast === null ? '—' : analysis.daysSinceLast === 0 ? '0d' : `${analysis.daysSinceLast}d`}
          </p>
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-[0.18em] mt-0.5">Last Session</p>
        </div>
        <div className="flex-1 text-center py-1">
          <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
            {analysis.status === 'rest' ? '48h' : analysis.status === 'light' ? '24h' : '0h'}
          </p>
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-[0.18em] mt-0.5">Rest Needed</p>
        </div>
      </div>
    </motion.div>
  )
}
