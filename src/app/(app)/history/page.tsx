'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, Filter, Calendar, Dumbbell, TrendingUp,
  FileSpreadsheet, ChevronDown, CheckCircle2, Clock, SkipForward, Share2,
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar, Legend,
} from 'recharts'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useWorkouts } from '@/hooks/useWorkouts'
import { BodyWeightWidget } from '@/components/dashboard/BodyWeightWidget'
import { workoutsToCsv } from '@/lib/csv-parser'
import { estimate1RM, formatVolume } from '@/lib/utils'
import type { Workout, WorkoutStatus } from '@/types'

const STATUS_ICONS: Record<WorkoutStatus, React.ReactNode> = {
  completed:    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  'in-progress': <Clock className="w-3.5 h-3.5 text-primary" />,
  planned:      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />,
  skipped:      <SkipForward className="w-3.5 h-3.5 text-muted-foreground/50" />,
}

export default function HistoryPage() {
  const [range, setRange]     = useState('30')
  const [exercise, setExercise] = useState('all')

  const { from, to } = useMemo(() => {
    const t = new Date()
    const f = new Date()
    f.setDate(f.getDate() - parseInt(range))
    return { from: f.toISOString().slice(0, 10), to: t.toISOString().slice(0, 10) }
  }, [range])

  const { workouts, loading } = useWorkouts({ from, to })

  /* ── Unique exercises for filter ── */
  const exercises = useMemo(() => {
    const set = new Set(workouts.map(w => w.exercise_name))
    return Array.from(set).sort()
  }, [workouts])

  /* ── Filtered workouts ── */
  const filtered = useMemo(() => {
    if (exercise === 'all') return workouts
    return workouts.filter(w => w.exercise_name === exercise)
  }, [workouts, exercise])

  /* ── Volume by day chart data ── */
  const volumeData = useMemo(() => {
    const map: Record<string, number> = {}
    filtered.filter(w => w.status === 'completed').forEach(w => {
      map[w.date] = (map[w.date] ?? 0) + w.sets * w.reps * w.weight_kg
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, volume]) => ({ date: format(new Date(date + 'T12:00:00'), 'MMM d'), volume: Math.round(volume) }))
  }, [filtered])

  /* ── 1RM progression ── */
  const oneRMData = useMemo(() => {
    if (exercise === 'all') return []
    return filtered
      .filter(w => w.status === 'completed')
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(w => ({
        date: format(new Date(w.date + 'T12:00:00'), 'MMM d'),
        '1RM': estimate1RM(w.weight_kg, w.reps),
        weight: w.weight_kg,
      }))
  }, [filtered, exercise])

  /* ── Summary stats ── */
  const stats = useMemo(() => {
    const completed = filtered.filter(w => w.status === 'completed')
    const totalVol  = completed.reduce((s, w) => s + w.sets * w.reps * w.weight_kg, 0)
    const sessions  = new Set(completed.map(w => w.date)).size
    return { totalVol, sessions, exercises: new Set(completed.map(w => w.exercise_name)).size }
  }, [filtered])

  /* ── Export CSV ── */
  function exportCsv() {
    const csv = workoutsToCsv(filtered)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `flowtrack-history-${from}-${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported!')
  }

  /* ── Export PDF ── */
  async function exportPdf() {
    const jsPDF = (await import('jspdf')).default
    const autoTable = (await import('jspdf-autotable')).default
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('FlowTrack — Workout History', 14, 22)
    doc.setFontSize(10)
    doc.text(`Period: ${from} to ${to}`, 14, 30)

    autoTable(doc, {
      startY: 36,
      head: [['Date', 'Exercise', 'Sets', 'Reps', 'Weight (kg)', 'Status']],
      body: filtered.map(w => [w.date, w.exercise_name, w.sets, w.reps, w.weight_kg, w.status]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 211, 238] },
    })

    doc.save(`flowtrack-history-${from}-${to}.pdf`)
    toast.success('PDF exported!')
  }

  /* ── Share stats as PNG ── */
  async function shareStats() {
    const canvas = document.createElement('canvas')
    const W = 600, H = 300
    canvas.width = W * 2; canvas.height = H * 2  // retina
    const ctx = canvas.getContext('2d')!
    ctx.scale(2, 2)

    // Background
    ctx.fillStyle = '#0A1628'
    ctx.fillRect(0, 0, W, H)

    // Gold accent top bar
    const grad = ctx.createLinearGradient(0, 0, W, 0)
    grad.addColorStop(0, '#C9A84C')
    grad.addColorStop(0.6, '#E8C870')
    grad.addColorStop(1, 'rgba(201,168,76,0.3)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, 2)

    // Mountain silhouette
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.moveTo(0, H)
    ctx.lineTo(120, H * 0.4)
    ctx.lineTo(220, H * 0.65)
    ctx.lineTo(320, H * 0.15)
    ctx.lineTo(420, H * 0.55)
    ctx.lineTo(540, H * 0.3)
    ctx.lineTo(W, H * 0.45)
    ctx.lineTo(W, H)
    ctx.closePath()
    ctx.fill()

    // Branding
    ctx.fillStyle = '#C9A84C'
    ctx.font = 'bold 10px sans-serif'
    ctx.letterSpacing = '4px'
    ctx.fillText('FLOWTRACK', 30, 38)

    // Period label
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font = '10px sans-serif'
    ctx.fillText(`Last ${range} days · ${from} to ${to}`, 30, 56)

    // Stats
    const statItems = [
      { label: 'VOLUME', value: `${Math.round(stats.totalVol / 1000)}K kg` },
      { label: 'SESSIONS', value: String(stats.sessions) },
      { label: 'EXERCISES', value: String(stats.exercises) },
    ]
    statItems.forEach(({ label, value }, i) => {
      const x = 30 + i * 185
      ctx.fillStyle = '#F5F3EF'
      ctx.font = `bold 36px sans-serif`
      ctx.fillText(value, x, 140)
      ctx.fillStyle = '#C9A84C'
      ctx.font = 'bold 9px sans-serif'
      ctx.fillText(label, x, 162)
    })

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(30, 175)
    ctx.lineTo(W - 30, 175)
    ctx.stroke()

    // Footer text
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.font = '10px sans-serif'
    ctx.fillText('Track your ascent at FlowTrack', 30, 198)

    // Logo mark (right)
    ctx.fillStyle = 'rgba(201,168,76,0.15)'
    ctx.beginPath()
    ctx.arc(W - 45, H / 2, 30, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(201,168,76,0.5)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = '#C9A84C'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('FT', W - 45, H / 2 + 5)
    ctx.textAlign = 'left'

    const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), 'image/png'))
    const file = new File([blob], 'flowtrack-stats.png', { type: 'image/png' })

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'FlowTrack Weekly Stats', text: `My last ${range}-day workout summary` })
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'flowtrack-stats.png'; a.click()
      URL.revokeObjectURL(url)
      toast.success('Stats card saved!')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">History & Insights</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your progress over time</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={exercise} onValueChange={setExercise}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue placeholder="All exercises" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All exercises</SelectItem>
              {exercises.map(ex => (
                <SelectItem key={ex} value={ex}>{ex}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={exportCsv}>
            <FileSpreadsheet className="w-3.5 h-3.5" />
            CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={exportPdf}>
            <Download className="w-3.5 h-3.5" />
            PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={shareStats}>
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Volume',   value: formatVolume(stats.totalVol), icon: TrendingUp },
          { label: 'Sessions',       value: stats.sessions.toString(),    icon: Calendar },
          { label: 'Exercises',      value: stats.exercises.toString(),   icon: Dumbbell },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 text-center card-hover">
            <Icon className="w-4 h-4 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Volume chart */}
      {loading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : volumeData.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Volume Over Time</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={volumeData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((v: unknown) => [`${(v as number) ?? 0}kg`, 'Volume']) as any}
              />
              <Bar dataKey="volume" fill="#22D3EE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {/* 1RM progression for selected exercise */}
      {exercise !== 'all' && oneRMData.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            Estimated 1RM — {exercise}
          </h2>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={oneRMData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((v: unknown, name: unknown) => [`${(v as number) ?? 0}kg`, name ?? '']) as any}
              />
              <Line dataKey="1RM" stroke="#A78BFA" strokeWidth={2} dot={{ fill: '#A78BFA', r: 3 }} name="Est. 1RM" />
              <Line dataKey="weight" stroke="#22D3EE" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="Working weight" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Body weight trend */}
      <BodyWeightWidget />

      {/* Workout log */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Workout Log</h2>
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Dumbbell className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No workouts in this period</p>
            </div>
          ) : (
            filtered.map((workout, i) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 ${
                  workout.status === 'skipped' ? 'opacity-40' : ''
                }`}
              >
                <div className="shrink-0">{STATUS_ICONS[workout.status]}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${workout.status === 'completed' ? '' : 'text-muted-foreground'}`}>
                    {workout.exercise_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {workout.date} · {workout.sets}×{workout.reps} @ {workout.weight_kg}kg
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium">{workout.sets * workout.reps * workout.weight_kg}kg</p>
                  <p className="text-[10px] text-muted-foreground">volume</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
