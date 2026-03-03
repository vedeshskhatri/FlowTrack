'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { estimate1RM } from '@/lib/utils'
import type { Workout } from '@/types'

interface OverloadCardProps {
  workouts: Workout[]
}

interface Suggestion {
  exercise: string
  currentWeight: number
  suggestedWeight: number
  reason: string
  readyAt: string
}

function muscleTag(name: string): string {
  const n = name.toLowerCase()
  if (/squat|leg press|lunge|hamstring|quad/.test(n)) return 'Legs'
  if (/deadlift|row|pull[- ]?up|lat|back/.test(n)) return 'Back'
  if (/bench|chest|fly|pec/.test(n)) return 'Chest'
  if (/shoulder|delt|ohp|lateral/.test(n)) return 'Shoulders'
  if (/curl|bicep|tricep|dip/.test(n)) return 'Arms'
  if (/plank|crunch|ab|core/.test(n)) return 'Core'
  return 'Compound'
}

export function OverloadCard({ workouts }: OverloadCardProps) {
  const suggestions = useMemo((): Suggestion[] => {
    const completed = workouts.filter(w => w.status === 'completed')
    if (completed.length === 0) return []

    // Group by exercise, get last 3 sessions per exercise
    const byExercise: Record<string, Workout[]> = {}
    for (const w of completed) {
      if (!byExercise[w.exercise_name]) byExercise[w.exercise_name] = []
      byExercise[w.exercise_name].push(w)
    }

    const results: Suggestion[] = []

    for (const [name, sessions] of Object.entries(byExercise)) {
      const sorted = sessions.sort((a, b) => b.date.localeCompare(a.date))
      if (sorted.length < 2) continue // need history to suggest

      const last    = sorted[0]
      const prev    = sorted[1]

      // Check if the last 2 sessions hit all reps and maintained/increased weight
      const hitAllLast = last.reps >= prev.reps && last.weight_kg >= prev.weight_kg
      const hitAllPrev = sorted[2] ? prev.reps >= sorted[2].reps : true

      if (hitAllLast && hitAllPrev) {
        const inc = last.weight_kg < 50 ? 2.5 : 5
        const next = Math.round((last.weight_kg + inc) * 2) / 2
        results.push({
          exercise: name,
          currentWeight: last.weight_kg,
          suggestedWeight: next,
          reason: `Hit all reps at ${last.weight_kg}kg last ${sorted.slice(0, 2).length} sessions`,
          readyAt: last.date,
        })
      }
    }

    // Sort by most recent readiness, cap at 5
    return results
      .sort((a, b) => b.readyAt.localeCompare(a.readyAt))
      .slice(0, 5)
  }, [workouts])

  if (suggestions.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="ny-card px-5 py-4 border border-[#C9A84C]/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-[1px] bg-[#C9A84C]/50" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A84C]">Progressive Overload</p>
        </div>
        <TrendingUp className="w-3.5 h-3.5 text-[#C9A84C]" />
      </div>

      <p className="text-xs text-muted-foreground font-light mb-4 leading-relaxed">
        Based on your recent sessions, you're ready to increase load on {suggestions.length} exercise{suggestions.length > 1 ? 's' : ''}.
      </p>

      <div className="space-y-2">
        {suggestions.map((s) => (
          <div
            key={s.exercise}
            className="flex items-center justify-between py-2.5 px-3 border border-border hover:border-[#C9A84C]/30 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  {muscleTag(s.exercise)}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{s.exercise}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-light">{s.reason}</p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs text-muted-foreground">{s.currentWeight}kg</span>
                <ArrowRight className="w-3 h-3 text-[#C9A84C]" />
                <span
                  className="text-sm font-bold text-[#C9A84C]"
                  style={{ fontFamily: 'var(--font-display, sans-serif)' }}
                >
                  {s.suggestedWeight}kg
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <Link
          href="/plan"
          className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C9A84C] hover:text-[#E8C870] transition-colors flex items-center gap-1.5"
        >
          View training plan <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  )
}
