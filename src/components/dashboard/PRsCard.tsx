'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame } from 'lucide-react'
import { estimate1RM, formatDate } from '@/lib/utils'
import type { Workout } from '@/types'

interface PRsCardProps {
  workouts: Workout[]
}

interface PR {
  exercise: string
  type: '1RM' | 'Volume' | 'Weight'
  value: number
  unit: string
  date: string
  isNew: boolean // set in last 7 days
}

export function PRsCard({ workouts }: PRsCardProps) {
  const { prs, newCount } = useMemo(() => {
    const completed = workouts.filter(w => w.status === 'completed')
    if (completed.length === 0) return { prs: [], newCount: 0 }

    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)
    const cutoff = sevenDaysAgo.toISOString().slice(0, 10)

    // Track best per exercise
    const best1RM: Record<string, { value: number; date: string }> = {}
    const bestWeight: Record<string, { value: number; date: string }> = {}

    for (const w of completed) {
      const rm = estimate1RM(w.weight_kg, w.reps)
      if (!best1RM[w.exercise_name] || rm > best1RM[w.exercise_name].value) {
        best1RM[w.exercise_name] = { value: rm, date: w.date }
      }
      if (!bestWeight[w.exercise_name] || w.weight_kg > bestWeight[w.exercise_name].value) {
        bestWeight[w.exercise_name] = { value: w.weight_kg, date: w.date }
      }
    }

    const prs: PR[] = []

    for (const [exercise, data] of Object.entries(best1RM)) {
      prs.push({
        exercise,
        type: '1RM',
        value: data.value,
        unit: 'kg',
        date: data.date,
        isNew: data.date >= cutoff,
      })
    }

    // Sort: new PRs first, then by date, cap at 6
    const sorted = prs
      .sort((a, b) => {
        if (a.isNew && !b.isNew) return -1
        if (!a.isNew && b.isNew) return 1
        return b.date.localeCompare(a.date)
      })
      .slice(0, 6)

    return { prs: sorted, newCount: sorted.filter(p => p.isNew).length }
  }, [workouts])

  if (prs.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="ny-card px-5 py-4 border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-[1px] bg-[#C9A84C]/50" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A84C]">Personal Records</p>
        </div>
        <div className="flex items-center gap-1.5">
          {newCount > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-rose-400">
              <Flame className="w-3 h-3" /> {newCount} new
            </span>
          )}
          <Trophy className="w-3.5 h-3.5 text-[#C9A84C]" />
        </div>
      </div>

      <div className="space-y-1">
        {prs.map((pr) => (
          <div
            key={`${pr.exercise}-${pr.type}`}
            className={`flex items-center justify-between py-2 px-3 border transition-colors ${
              pr.isNew
                ? 'border-[#C9A84C]/30 bg-[#C9A84C]/5'
                : 'border-transparent hover:border-border'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Est. {pr.type}
                </span>
                {pr.isNew && (
                  <span className="text-[8px] font-bold uppercase tracking-wider text-rose-400 bg-rose-400/10 px-1.5 py-0.5">
                    NEW PR
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-foreground truncate">{pr.exercise}</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p
                className="text-base font-bold text-foreground"
                style={{ fontFamily: 'var(--font-display, sans-serif)' }}
              >
                {pr.value}<span className="text-xs font-normal text-muted-foreground ml-0.5">{pr.unit}</span>
              </p>
              <p className="text-[9px] text-muted-foreground">{formatDate(pr.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
