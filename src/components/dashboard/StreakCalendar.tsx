'use client'

import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Workout } from '@/types'
import { formatDate } from '@/lib/utils'

interface StreakCalendarProps {
  workouts: Workout[]
}

export function StreakCalendar({ workouts }: StreakCalendarProps) {
  // Generate last 35 days (5 weeks)
  const days = useMemo(() => {
    return Array.from({ length: 35 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (34 - i))
      return d.toISOString().slice(0, 10)
    })
  }, [])

  const completedDays = useMemo(() => {
    const set = new Set<string>()
    workouts.forEach(w => { if (w.status === 'completed') set.add(w.date) })
    return set
  }, [workouts])

  // Calculate current streak
  const streak = useMemo(() => {
    let count = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      if (completedDays.has(d.toISOString().slice(0, 10))) count++
      else if (i > 0) break
    }
    return count
  }, [completedDays])

  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <Card className="bg-card border-border card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Activity</CardTitle>
          {streak > 0 && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-orange-400">
              <Flame className="w-4 h-4" />
              {streak} day streak
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="text-center text-[10px] text-muted-foreground font-medium">{d}</div>
          ))}
        </div>
        {/* Heat map grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const hasWorkout = completedDays.has(day)
            const isToday   = day === new Date().toISOString().slice(0, 10)
            return (
              <Tooltip key={day}>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      aspect-square rounded-sm cursor-default transition-all duration-150
                      ${hasWorkout
                        ? 'bg-primary/80 glow-cyan'
                        : isToday
                        ? 'bg-muted border border-primary/40'
                        : 'bg-muted/40'}
                      ${isToday && !hasWorkout ? 'ring-1 ring-primary/30' : ''}
                    `}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-medium">{formatDate(day)}</p>
                  <p className="text-muted-foreground">{hasWorkout ? '✓ Completed' : isToday ? 'Today' : 'Rest day'}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
