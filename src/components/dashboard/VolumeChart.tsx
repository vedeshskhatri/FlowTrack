'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Workout } from '@/types'
import { getLast7Days, formatDate } from '@/lib/utils'

interface VolumeChartProps {
  workouts: Workout[]
  loading?: boolean
}

export function VolumeChart({ workouts, loading }: VolumeChartProps) {
  const days = getLast7Days()

  // Build previous 7 days for comparison
  const prevDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      return d.toISOString().slice(0, 10)
    })
  }, [])

  const data = useMemo(() => {
    return days.map((day, i) => {
      const dayWorkouts = workouts.filter(w => w.date === day && w.status === 'completed')
      const prevDayWorkouts = workouts.filter(w => w.date === prevDays[i])
      const volume = dayWorkouts.reduce((s, w) => s + w.sets * w.reps * w.weight_kg, 0)
      const prevVolume = prevDayWorkouts.reduce((s, w) => s + w.sets * w.reps * w.weight_kg, 0)
      return { date: formatDate(day), volume, prevVolume }
    })
  }, [workouts, days, prevDays])

  const thisWeek  = data.reduce((s, d) => s + d.volume, 0)
  const lastWeek  = data.reduce((s, d) => s + d.prevVolume, 0)
  const delta     = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek * 100).toFixed(1) : null
  const isUp      = delta !== null && parseFloat(delta) > 0
  const isDown    = delta !== null && parseFloat(delta) < 0

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-xl" />
  }

  return (
    <Card className="bg-card border-border card-hover rounded-none">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-[1px] bg-[#C9A84C]/60" />
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Volume This Week</CardTitle>
          </div>
          {delta !== null && (
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 border tracking-wide uppercase ${
              isUp ? 'border-[#C9A84C]/30 text-[#C9A84C]' :
              isDown ? 'border-rose-500/30 text-rose-400' :
              'border-border text-muted-foreground'
            }`}>
              {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : isDown ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
              {Math.abs(parseFloat(delta))}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
          {thisWeek > 0 ? `${(thisWeek / 1000).toFixed(1)}t` : '—'} <span className="text-sm font-normal text-muted-foreground">total volume</span>
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '11px' }}
              labelStyle={{ color: 'var(--foreground)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '10px' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((v: unknown) => [`${v as number}kg`, '']) as any}
            />
            <Line dataKey="prevVolume" stroke="var(--muted-foreground)" strokeWidth={1} dot={false} strokeDasharray="4 4" name="Last week" />
            <Line dataKey="volume" stroke="#C9A84C" strokeWidth={2} dot={{ fill: '#C9A84C', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#E8C870' }} name="This week" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
