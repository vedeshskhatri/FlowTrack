'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, ChevronRight, Calendar, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Workout } from '@/types'
import { formatDate, today } from '@/lib/utils'

interface HeroCardProps {
  workouts: Workout[]
  loading?: boolean
  userName?: string
}

const GREETINGS = ['Let\'s flow,', 'Ready to crush it,', 'Time to move,', 'Stay consistent,']

export function HeroCard({ workouts, loading, userName }: HeroCardProps) {
  const hour  = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const tagline  = GREETINGS[new Date().getDay() % GREETINGS.length]

  const todayWorkouts  = workouts.filter(w => w.date === today())
  const nextWorkout    = workouts.find(w => w.date >= today() && w.status === 'planned')
  const inProgress     = workouts.find(w => w.status === 'in-progress')

  if (loading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="ny-card px-6 py-7"
    >
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{greeting}</p>
      <h1 className="text-3xl font-black leading-tight mb-1">
        {tagline}{' '}
        <span className="gradient-text">{userName ? userName.split('@')[0] : 'athlete'}</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        {formatDate(today())} &middot;{' '}
        {todayWorkouts.length > 0
          ? `${todayWorkouts.filter(w => w.status === 'completed').length} of ${todayWorkouts.length} done today`
          : 'Nothing planned today'}
      </p>

      {inProgress ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 rounded-2xl bg-primary/10 border border-primary/20 px-4 py-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">In progress: {inProgress.exercise_name}</span>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-2xl shrink-0" size="sm">
            <Link href="/live">
              <Zap className="w-3.5 h-3.5" />
              Continue
            </Link>
          </Button>
        </div>
      ) : nextWorkout ? (
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-2xl border border-border bg-muted/40 px-4 py-3.5">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Next · {formatDate(nextWorkout.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">{nextWorkout.exercise_name}</span>
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {nextWorkout.sets}×{nextWorkout.reps} @ {nextWorkout.weight_kg}kg
              </Badge>
            </div>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 rounded-2xl shrink-0" size="sm">
            <Link href="/live">
              <Zap className="w-3.5 h-3.5" />
              Start
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground flex-1">
            No workouts planned. Upload a CSV to get started!
          </p>
          <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-2xl shrink-0">
            <Link href="/upload">
              Upload
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      )}
    </motion.div>
  )
}
