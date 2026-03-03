'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, ChevronRight, Calendar, Dumbbell, ArrowRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Workout } from '@/types'
import { formatDate, today } from '@/lib/utils'

interface HeroCardProps {
  workouts: Workout[]
  loading?: boolean
  userName?: string
}

const GREETINGS = ['Ready to ascend,', 'Stay the course,', 'Summit awaits,', 'Keep climbing,']

/** Derive average session duration in minutes from timed workouts */
function avgSessionMin(workouts: Workout[]): number | null {
  // Group completed workouts by date+session_id
  const sessions: Record<string, { min: number; max: number }> = {}
  for (const w of workouts) {
    if (w.status !== 'completed' || !w.start_time || !w.end_time) continue
    const key = w.session_id ?? w.date
    const s = new Date(w.start_time).getTime()
    const e = new Date(w.end_time).getTime()
    if (!sessions[key]) sessions[key] = { min: s, max: e }
    else {
      sessions[key].min = Math.min(sessions[key].min, s)
      sessions[key].max = Math.max(sessions[key].max, e)
    }
  }
  const durations = Object.values(sessions)
    .map(s => (s.max - s.min) / 60000)
    .filter(d => d > 0 && d < 300) // sanity: 0–300 min
  if (!durations.length) return null
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
}

export function HeroCard({ workouts, loading, userName }: HeroCardProps) {
  const hour     = new Date().getHours()
  const period   = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
  const tagline  = GREETINGS[new Date().getDay() % GREETINGS.length]

  const todayWorkouts = workouts.filter(w => w.date === today())
  const nextWorkout   = workouts.find(w => w.date >= today() && w.status === 'planned')
  const inProgress    = workouts.find(w => w.status === 'in-progress')
  const avgMin        = avgSessionMin(workouts)

  if (loading) {
    return <Skeleton className="h-48 w-full" style={{ borderRadius: 0 }} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-[#0A1628] dark:bg-[#0D1829] overflow-hidden"
    >
      {/* Decorative mountain silhouette */}
      <div className="absolute bottom-0 inset-x-0 opacity-[0.07] pointer-events-none">
        <svg viewBox="0 0 800 120" className="w-full" preserveAspectRatio="none">
          <path d="M0,120 L150,30 L280,80 L400,10 L520,60 L670,20 L800,50 L800,120 Z" fill="white" />
        </svg>
      </div>

      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#C9A84C] via-[#E8C870] to-[#C9A84C]/30" />

      <div className="relative z-10 px-6 py-7">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-[1px] bg-[#C9A84C]" />
          <span className="text-[#C9A84C] text-[10px] tracking-[0.25em] uppercase font-bold">
            Good {period}
          </span>
        </div>

        <h1
          className="text-white font-bold leading-tight mb-1 uppercase"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontFamily: 'var(--font-display, sans-serif)', letterSpacing: '-0.01em' }}
        >
          {tagline}{' '}
          <span style={{
            background: 'linear-gradient(135deg, #C9A84C 0%, #E8C870 60%, #A8893C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {userName ? userName.split('@')[0] : 'Athlete'}
          </span>
        </h1>
        <p className="text-white/40 text-xs tracking-wide mb-6 font-light">
          {formatDate(today())} &middot;{' '}
          {todayWorkouts.length > 0
            ? `${todayWorkouts.filter(w => w.status === 'completed').length} of ${todayWorkouts.length} sessions complete`
            : 'No sessions planned today'}
        </p>

        {/* Status block */}
        {inProgress ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-3">
              <span className="w-1.5 h-1.5 bg-[#C9A84C] animate-pulse" />
              <span className="text-[#C9A84C] text-xs font-semibold tracking-wide uppercase">In Progress — {inProgress.exercise_name}</span>
            </div>
            <Link
              href="/live"
              className="flex items-center gap-2 bg-[#C9A84C] text-[#0A1628] px-4 py-3 text-[10px] tracking-[0.15em] uppercase font-bold hover:bg-[#E8C870] transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              Continue
            </Link>
          </div>
        ) : nextWorkout ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 border border-white/10 bg-white/5 px-4 py-3.5">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3 h-3 text-white/40" />
                <span className="text-white/40 text-[10px] tracking-wide uppercase font-medium">Next · {formatDate(nextWorkout.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span className="text-white text-sm font-semibold">{nextWorkout.exercise_name}</span>
                <span className="ml-auto text-white/40 text-[10px] font-mono tracking-wider">
                  {nextWorkout.sets}×{nextWorkout.reps} @ {nextWorkout.weight_kg}kg
                </span>
              </div>
            </div>
            <Link
              href="/live"
              className="flex items-center gap-2 bg-[#C9A84C] text-[#0A1628] px-4 py-3.5 text-[10px] tracking-[0.15em] uppercase font-bold hover:bg-[#E8C870] transition-all shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              Start
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-white/40 text-xs flex-1 font-light tracking-wide">
              No sessions planned. Upload a programme to begin your ascent.
            </p>
            <Link
              href="/upload"
              className="flex items-center gap-1.5 border border-white/20 text-white/70 hover:text-white hover:border-white/50 px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase font-semibold transition-all shrink-0"
            >
              Upload
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Mini stats row */}
        {avgMin !== null && (
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/10">
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-semibold">Avg Session</p>
              <p className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
                {avgMin}<span className="text-[10px] font-normal text-white/40 ml-0.5">min</span>
              </p>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-semibold">Sessions</p>
              <p className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
                {new Set(workouts.filter(w => w.status === 'completed').map(w => w.date)).size}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
