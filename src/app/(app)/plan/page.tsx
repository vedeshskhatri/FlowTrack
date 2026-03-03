'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Plus, Trash2, RefreshCw,
  CheckCircle2, SkipForward, Calendar, Copy, X, Dumbbell, Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { ExerciseAutocomplete } from '@/components/ui/ExerciseAutocomplete'
import { createClient } from '@/lib/supabase/client'
import { useWorkouts } from '@/hooks/useWorkouts'
import { formatDate, DAY_LABELS } from '@/lib/utils'
import type { Workout, WorkoutStatus } from '@/types'

const STATUS_CONFIG: Record<WorkoutStatus, { label: string; classes: string }> = {
  planned:       { label: 'Planned',     classes: 'bg-muted text-muted-foreground' },
  'in-progress': { label: 'Active',      classes: 'bg-primary/15 text-primary' },
  completed:     { label: 'Done',        classes: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  skipped:       { label: 'Skipped',     classes: 'bg-muted/40 text-muted-foreground/50' },
}

const STATUS_CYCLE: WorkoutStatus[] = ['planned', 'in-progress', 'completed']

export default function PlanPage() {
  const supabase = createClient()
  const [weekOffset, setWeekOffset] = useState(0)
  const [copySourceDay, setCopySourceDay] = useState<string | null>(null)
  const [copyTargetDays, setCopyTargetDays] = useState<Set<string>>(new Set())
  const [copying, setCopying] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [addingDay, setAddingDay] = useState<string | null>(null)
  const [addForm, setAddForm] = useState({ exercise_name: '', sets: 3, reps: 10, weight_kg: 20 })
  const [addSaving, setAddSaving] = useState(false)

  const weekDays = useMemo(() => {
    const now = new Date()
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((day + 6) % 7) + weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d.toISOString().slice(0, 10)
    })
  }, [weekOffset])

  const { workouts, loading, updateWorkout, refetch } = useWorkouts({
    from: weekDays[0],
    to: weekDays[6],
  })

  const workoutsByDay = useMemo(() => {
    const map: Record<string, Workout[]> = {}
    weekDays.forEach(d => { map[d] = [] })
    workouts.forEach(w => { if (map[w.date]) map[w.date].push(w) })
    return map
  }, [workouts, weekDays])

  const today = new Date().toISOString().slice(0, 10)

  async function cycleStatus(workout: Workout) {
    const curr = STATUS_CYCLE.indexOf(workout.status as WorkoutStatus)
    const next = STATUS_CYCLE[(curr + 1) % STATUS_CYCLE.length]
    await updateWorkout(workout.id, { status: next })
    if (next === 'completed') toast.success('Great work! Workout marked done 💪')
  }

  async function skipWorkout(workout: Workout) {
    await updateWorkout(workout.id, { status: 'skipped' })
    toast('Skipped — no worries, keep going! 💙')
  }

  async function deleteWorkout(id: string) {
    setDeleting(id)
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (error) toast.error('Failed to delete workout')
    else { toast.success('Workout removed'); refetch() }
    setDeleting(null)
  }

  async function addWorkout(day: string) {
    if (!addForm.exercise_name.trim()) { toast.error('Enter an exercise name'); return }
    setAddSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setAddSaving(false); return }
    const maxOrder = Math.max(0, ...(workoutsByDay[day] ?? []).map(w => w.sort_order))
    const { error } = await supabase.from('workouts').insert({
      user_id:       user.id,
      date:          day,
      exercise_name: addForm.exercise_name.trim(),
      sets:          addForm.sets,
      reps:          addForm.reps,
      weight_kg:     addForm.weight_kg,
      status:        'planned' as WorkoutStatus,
      sort_order:    maxOrder + 1,
    })
    if (error) toast.error(error.message)
    else {
      toast.success(`${addForm.exercise_name} added!`)
      setAddingDay(null)
      setAddForm({ exercise_name: '', sets: 3, reps: 10, weight_kg: 20 })
      refetch()
    }
    setAddSaving(false)
  }

  async function deleteAllOnDay(day: string) {
    const ids = (workoutsByDay[day] ?? []).map(w => w.id)
    if (!ids.length) return
    const { error } = await supabase.from('workouts').delete().in('id', ids)
    if (error) toast.error('Failed to clear day')
    else { toast.success('Day cleared'); refetch() }
  }

  async function handleBulkCopy() {
    if (!copySourceDay || copyTargetDays.size === 0) return
    setCopying(true)
    const sourceWorkouts = workoutsByDay[copySourceDay] ?? []
    const user = (await supabase.auth.getUser()).data.user
    if (!user) { setCopying(false); return }

    const rows = [...copyTargetDays].flatMap(targetDay =>
      sourceWorkouts.map(w => ({
        user_id: user.id,
        date: targetDay,
        exercise_name: w.exercise_name,
        sets: w.sets,
        reps: w.reps,
        weight_kg: w.weight_kg,
        notes: w.notes,
        status: 'planned' as WorkoutStatus,
        sort_order: w.sort_order,
      }))
    )

    const { error } = await supabase.from('workouts').insert(rows)
    if (error) toast.error('Failed to copy workouts')
    else {
      toast.success(`Copied to ${copyTargetDays.size} day${copyTargetDays.size > 1 ? 's' : ''}!`)
      refetch()
    }
    setCopySourceDay(null)
    setCopyTargetDays(new Set())
    setCopying(false)
  }

  const weekLabel = (() => {
    if (weekOffset === 0) return 'This Week'
    if (weekOffset === 1) return 'Next Week'
    if (weekOffset === -1) return 'Last Week'
    return `${formatDate(weekDays[0])} – ${formatDate(weekDays[6])}`
  })()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">My Plan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="flex items-center justify-center w-10 h-10 rounded-2xl border border-border hover:bg-muted transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 h-10 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-2xl hover:bg-muted transition-all"
          >
            Today
          </button>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="flex items-center justify-center w-10 h-10 rounded-2xl border border-border hover:bg-muted transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Copy-to-days panel */}
      <AnimatePresence>
        {copySourceDay && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                <Copy className="inline w-4 h-4 mr-1.5 text-primary" />
                Copy <span className="text-primary">{DAY_LABELS[new Date(copySourceDay + 'T12:00:00').getDay()]}&apos;s</span> workouts to:
              </p>
              <button onClick={() => { setCopySourceDay(null); setCopyTargetDays(new Set()) }} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {weekDays.filter(d => d !== copySourceDay).map(d => {
                const label = DAY_LABELS[new Date(d + 'T12:00:00').getDay()].slice(0, 3)
                const checked = copyTargetDays.has(d)
                return (
                  <button
                    key={d}
                    onClick={() => setCopyTargetDays(prev => {
                      const next = new Set(prev)
                      checked ? next.delete(d) : next.add(d)
                      return next
                    })}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      checked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
              <button
                onClick={() => setCopyTargetDays(new Set(weekDays.filter(d => d !== copySourceDay)))}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
              >
                All
              </button>
            </div>
            <Button
              onClick={handleBulkCopy}
              disabled={copyTargetDays.size === 0 || copying}
              className="w-full rounded-xl font-semibold"
              size="sm"
            >
              {copying ? 'Copying…' : `Apply to ${copyTargetDays.size} day${copyTargetDays.size !== 1 ? 's' : ''}`}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day list */}
      <div className="space-y-3">
        {weekDays.map((day, di) => {
          const dayWorkouts = workoutsByDay[day] ?? []
          const isToday = day === today
          const isPast  = day < today
          const done    = dayWorkouts.filter(w => w.status === 'completed').length
          const dayName = DAY_LABELS[new Date(day + 'T12:00:00').getDay()]

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: di * 0.03 }}
              className={`rounded-2xl border bg-card transition-all ${
                isToday ? 'border-primary/40 shadow-sm' : 'border-border'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center gap-3 px-5 py-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 ${
                  isToday ? 'bg-primary text-primary-foreground' :
                  isPast  ? 'bg-muted text-muted-foreground' :
                            'bg-muted/60 text-foreground'
                }`}>
                  {new Date(day + 'T12:00:00').getDate()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${isToday ? 'text-primary' : ''}`}>
                    {dayName}{isToday ? ' · Today' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dayWorkouts.length === 0
                      ? 'Rest day'
                      : `${done}/${dayWorkouts.length} done`}
                  </p>
                </div>

                {/* Day actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setAddingDay(prev => prev === day ? null : day); setAddForm({ exercise_name: '', sets: 3, reps: 10, weight_kg: 20 }) }}
                    title="Add exercise"
                    className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                      addingDay === day ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {dayWorkouts.length > 0 && (
                    <>
                      <button
                        onClick={() => setCopySourceDay(prev => prev === day ? null : day)}
                        title="Copy workouts to other days"
                        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                          copySourceDay === day ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAllOnDay(day)}
                        title="Clear all workouts on this day"
                        className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Inline add-exercise form */}
              <AnimatePresence>
                {addingDay === day && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="px-5 py-4 space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Add Exercise</p>
                      <ExerciseAutocomplete
                        value={addForm.exercise_name}
                        onChange={name => setAddForm(f => ({ ...f, exercise_name: name }))}
                        placeholder="Exercise name…"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Sets</p>
                          <Input
                            type="number" min={1} max={20}
                            value={addForm.sets}
                            onChange={e => setAddForm(f => ({ ...f, sets: parseInt(e.target.value) || 1 }))}
                            className="h-9 text-sm rounded-none border-border"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Reps</p>
                          <Input
                            type="number" min={1} max={100}
                            value={addForm.reps}
                            onChange={e => setAddForm(f => ({ ...f, reps: parseInt(e.target.value) || 1 }))}
                            className="h-9 text-sm rounded-none border-border"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Weight (kg)</p>
                          <Input
                            type="number" min={0} step={0.5}
                            value={addForm.weight_kg}
                            onChange={e => setAddForm(f => ({ ...f, weight_kg: parseFloat(e.target.value) || 0 }))}
                            className="h-9 text-sm rounded-none border-border"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addWorkout(day)}
                          disabled={addSaving || !addForm.exercise_name.trim()}
                          className="flex items-center gap-1.5 bg-foreground text-background px-4 py-2 text-[10px] tracking-[0.15em] uppercase font-bold hover:opacity-80 transition-all disabled:opacity-40"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {addSaving ? 'Saving…' : 'Add'}
                        </button>
                        <button
                          onClick={() => setAddingDay(null)}
                          className="px-4 py-2 text-[10px] tracking-[0.15em] uppercase font-bold text-muted-foreground hover:text-foreground border border-border transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Workout rows */}
              {dayWorkouts.length > 0 && (
                <div className="border-t border-border divide-y divide-border">
                  {loading
                    ? <div className="px-5 py-4"><Skeleton className="h-10 w-full rounded-xl" /></div>
                    : dayWorkouts.map(workout => (
                      <div key={workout.id} className={`flex items-center gap-3 px-5 py-3.5 transition-all ${
                        workout.status === 'skipped' ? 'opacity-40' : ''
                      }`}>
                        {/* Status cycle button */}
                        <button
                          onClick={() => cycleStatus(workout)}
                          title="Tap to cycle status"
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                            workout.status === 'completed'
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : workout.status === 'in-progress'
                              ? 'border-primary text-primary'
                              : 'border-border text-muted-foreground hover:border-primary'
                          }`}
                        >
                          {workout.status === 'completed' && <CheckCircle2 className="w-4 h-4 fill-current" />}
                          {workout.status === 'in-progress' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        </button>

                        {/* Exercise info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${
                            workout.status === 'completed' ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {workout.exercise_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {workout.sets}×{workout.reps} · {workout.weight_kg}kg
                          </p>
                        </div>

                        <Badge className={`text-[10px] font-semibold shrink-0 ${STATUS_CONFIG[workout.status].classes}`}>
                          {STATUS_CONFIG[workout.status].label}
                        </Badge>

                        {/* Skip */}
                        {(workout.status === 'planned' || workout.status === 'in-progress') && (
                          <button
                            onClick={() => skipWorkout(workout)}
                            title="Skip"
                            className="flex items-center justify-center w-8 h-8 rounded-xl text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-all shrink-0"
                          >
                            <SkipForward className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => deleteWorkout(workout.id)}
                          title="Delete"
                          disabled={deleting === workout.id}
                          className="flex items-center justify-center w-8 h-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                        >
                          <Trash2 className={`w-3.5 h-3.5 ${deleting === workout.id ? 'opacity-50' : ''}`} />
                        </button>
                      </div>
                    ))
                  }
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
