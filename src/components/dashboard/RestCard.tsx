'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Moon, Zap, Flame, Battery } from 'lucide-react'
import type { Workout, UserPreferences } from '@/types'

interface RestCardProps {
  workouts: Workout[]
  profile?: Partial<UserPreferences> | null
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

interface ComputeParams {
  recentSets: number
  consecutiveDays: number
  daysSinceLast: number | null
  age: number
  gender: string
  bodyWeightKg: number
  experienceLevel: string
  goal: string
  cyclePhase: string
}

/**
 * Science-informed recovery estimate.
 *
 * Factors applied:
 *  - Training volume (primary fatigue driver)
 *  - Consecutive training days (systemic fatigue accumulation)
 *  - Age         — satellite cell proliferation slows after 35; >50 = 50% longer recovery
 *  - Gender      — higher type-I fibre ratio in females → ~8% faster baseline recovery
 *  - Experience  — advanced athletes clear lactate faster, have better mitochondrial density
 *  - Goal        — strength/hypertrophy impose higher CNS + mechanical load than endurance
 *  - Cycle phase — progesterone in luteal phase elevates core temp, impairs glycogen resynthesis
 *  - Body mass   — greater absolute mechanical load on connective tissue
 *
 * Returns hours, rounded to nearest 4 h, capped at 96 h.
 */
function computeRestHours(p: ComputeParams): number {
  if (p.daysSinceLast === null || p.daysSinceLast > 3) return 0

  // 1. Volume → base rest
  let base: number
  if      (p.recentSets >= 30) base = 72
  else if (p.recentSets >= 22) base = 56
  else if (p.recentSets >= 15) base = 48
  else if (p.recentSets >= 8)  base = 32
  else if (p.recentSets > 0)   base = 20
  else                          base = 0

  // 2. Consecutive days → systemic fatigue
  if      (p.consecutiveDays >= 5) base += 24
  else if (p.consecutiveDays >= 4) base += 16
  else if (p.consecutiveDays >= 3) base += 8

  // 3. Compounding multiplier from bio-profile
  let mult = 1.0

  // Age
  if      (p.age >= 55) mult *= 1.50
  else if (p.age >= 50) mult *= 1.35
  else if (p.age >= 45) mult *= 1.20
  else if (p.age >= 40) mult *= 1.15
  else if (p.age >= 35) mult *= 1.07
  else if (p.age <= 22) mult *= 0.88

  // Gender
  if (p.gender === 'female') mult *= 0.92

  // Experience
  if      (p.experienceLevel === 'beginner')    mult *= 1.25
  else if (p.experienceLevel === 'advanced')    mult *= 0.82

  // Training goal — strength = heavy CNS load, endurance = higher lactate tolerance
  if      (p.goal === 'strength')    mult *= 1.20
  else if (p.goal === 'hypertrophy') mult *= 1.10
  else if (p.goal === 'endurance')   mult *= 0.85
  else if (p.goal === 'weight-loss') mult *= 0.90

  // Cycle phase — luteal: elevated progesterone impairs glycogen resynthesis
  if      (p.cyclePhase === 'luteal')    mult *= 1.15
  else if (p.cyclePhase === 'menstrual') mult *= 1.20

  // Absolute body mass → more load on connective tissue
  if      (p.bodyWeightKg > 110) base += 10
  else if (p.bodyWeightKg > 90)  base += 6
  else if (p.bodyWeightKg > 80)  base += 3

  // Round to nearest 4 h for clean UX
  return Math.min(96, Math.max(0, Math.round((base * mult) / 4) * 4))
}

type RecoveryStatus = 'rest' | 'light' | 'ready'

export function RestCard({ workouts, profile }: RestCardProps) {
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
        recentGroups: [] as string[],
        streak: 0,
        daysSinceLast: null,
        restHours: 0,
        hasProfile: false,
      }
    }

    const lastDate = sorted[0].date
    const daysSinceLast = daysBetween(lastDate, today)

    // Consecutive training days (last 7 days)
    const recentDates = [...new Set(sorted.filter(w => daysBetween(w.date, today) <= 6).map(w => w.date))]
    const consecutiveDays = (() => {
      let c = 0; let last = today
      for (const d of recentDates.sort((a, b) => b.localeCompare(a))) {
        if (daysBetween(d, last) <= 1) { c++; last = d } else break
      }
      return c
    })()

    const recentSets = sorted.filter(w => daysBetween(w.date, today) <= 1).reduce((s, w) => s + w.sets, 0)
    const recentGroups = [...new Set(
      sorted.filter(w => daysBetween(w.date, today) <= 1).map(w => muscleGroup(w.exercise_name))
    )]

    const hasProfile = !!(profile?.age || profile?.body_weight_kg || profile?.experience_level)

    // Calibrated rest estimate
    const restHours = computeRestHours({
      recentSets,
      consecutiveDays,
      daysSinceLast,
      age:             profile?.age              ?? 28,
      gender:          profile?.gender            ?? 'other',
      bodyWeightKg:    profile?.body_weight_kg    ?? 70,
      experienceLevel: profile?.experience_level  ?? 'intermediate',
      goal:            profile?.goal              ?? 'general',
      cyclePhase:      profile?.cycle_phase       ?? 'none',
    })

    let status: RecoveryStatus
    let headline: string
    let detail: string

    if (restHours >= 36) {
      status = 'rest'
      headline = 'Full rest recommended'
      detail = recentSets >= 15
        ? `High volume session (${recentSets} sets) detected. Your calibrated recovery window is ${restHours}h.`
        : `${consecutiveDays} consecutive training days. Systemic fatigue is high — rest is the work right now.`
    } else if (restHours >= 12) {
      status = 'light'
      headline = 'Light session OK'
      detail = `${recentGroups.join(', ')} worked recently. Target a different muscle group. ~${restHours}h to full recovery.`
    } else if (daysSinceLast >= 3 || restHours === 0) {
      status = 'ready'
      headline = "You're fully recovered"
      detail = `${daysSinceLast !== null ? `${daysSinceLast}d` : 'Several days'} since last session. You're primed — go hit it!`
    } else {
      status = 'ready'
      headline = 'Recovery on track'
      detail = `~${restHours}h remaining in your recovery window. You're cleared for today's session.`
    }

    return { status, headline, detail, recentGroups, streak: consecutiveDays, daysSinceLast, restHours, hasProfile }
  }, [workouts, profile])

  const palette = {
    rest:  { border: 'border-rose-500/20',    text: 'text-rose-400'    },
    light: { border: 'border-[#C9A84C]/30',   text: 'text-[#C9A84C]'   },
    ready: { border: 'border-[#C9A84C]/20',   text: 'text-[#C9A84C]'   },
  } as const

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
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${text}`}>{analysis.headline}</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-light">{analysis.detail}</p>
          {!analysis.hasProfile && (
            <p className="text-[10px] text-muted-foreground/50 mt-1.5 tracking-wide">
              ↗ Add your profile in Settings for a personalised estimate.
            </p>
          )}
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
            {analysis.restHours === 0 ? '0h' : `${analysis.restHours}h`}
          </p>
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-[0.18em] mt-0.5">Rest Needed</p>
        </div>
      </div>
    </motion.div>
  )
}
