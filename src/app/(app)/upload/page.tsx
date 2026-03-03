'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Loader2, Trash2, Download, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DropZone } from '@/components/upload/DropZone'
import { ExerciseCard } from '@/components/upload/ExerciseCard'
import { parseCsvFile, SAMPLE_CSV, SAMPLE_WEEK_CSV } from '@/lib/csv-parser'
import { applyProgressiveOverload } from '@/lib/progressive-overload'
import { createClient } from '@/lib/supabase/client'
import { today } from '@/lib/utils'
import type { ParsedExercise, ExerciseHistory } from '@/types'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_TO_NUM: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
}

function nextOccurrence(dayName: string): string {
  const target = DAY_TO_NUM[dayName] ?? 0
  const now = new Date()
  const diff = (target - now.getDay() + 7) % 7
  const d = new Date(now)
  d.setDate(now.getDate() + diff)
  return d.toISOString().split('T')[0]
}

function formatDateLabel(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function downloadCsv(content: string, name: string) {
  const blob = new Blob([content], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name; a.click()
  URL.revokeObjectURL(url)
}

function getNext7Days() {
  const days: { label: string; date: string }[] = []
  const base = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    days.push({ label: i === 0 ? 'Today' : DAY_LABELS[d.getDay()], date: iso })
  }
  return days
}

export default function UploadPage() {
  const supabase = createClient()
  const [parsing,   setParsing]   = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [exercises, setExercises] = useState<ParsedExercise[]>([])
  const [filename,  setFilename]  = useState('')
  const next7 = useMemo(() => getNext7Days(), [])
  const [selectedDays, setSelectedDays] = useState<Set<string>>(() => new Set([today()]))
  const [dayDateMap,   setDayDateMap]   = useState<Record<string, string>>({})
  const [collapsed,    setCollapsed]    = useState<Record<string, boolean>>({})

  const isMultiDay = exercises.some(e => !!e.day)

  const dayGroups = useMemo(() => {
    if (!isMultiDay) return []
    const order: string[] = []
    const map: Record<string, ParsedExercise[]> = {}
    exercises.forEach(ex => {
      const d = ex.day!
      if (!map[d]) { map[d] = []; order.push(d) }
      map[d].push(ex)
    })
    return order.map(dayName => ({
      dayName,
      date: dayDateMap[dayName] ?? nextOccurrence(dayName),
      exercises: map[dayName],
    }))
  }, [exercises, isMultiDay, dayDateMap])

  function toggleDay(date: string) {
    setSelectedDays(prev => {
      const next = new Set(prev)
      next.has(date) ? next.delete(date) : next.add(date)
      return next
    })
  }

  function toggleAllDays() {
    setSelectedDays(prev =>
      prev.size === next7.length ? new Set([today()]) : new Set(next7.map(d => d.date))
    )
  }

  function setGroupDate(dayName: string, date: string) {
    setDayDateMap(prev => ({ ...prev, [dayName]: date }))
  }

  async function handleFile(file: File) {
    setParsing(true)
    setFilename(file.name)
    setDayDateMap({})
    setCollapsed({})

    try {
      const parsed = await parseCsvFile(file)

      const { data: { user } } = await supabase.auth.getUser()
      let history: ExerciseHistory[] = []
      let cyclePhase = 'none'

      if (user) {
        const [{ data: histData }, { data: prefData }] = await Promise.all([
          supabase
            .from('exercise_history')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(100),
          supabase
            .from('user_preferences')
            .select('cycle_phase')
            .eq('user_id', user.id)
            .single(),
        ])
        history = histData ?? []
        cyclePhase = prefData?.cycle_phase ?? 'none'
      }

      const withSuggestions = applyProgressiveOverload(parsed, history, cyclePhase)
      setExercises(withSuggestions)
      const multi = withSuggestions.some(e => !!e.day)
      if (multi) {
        const days = [...new Set(withSuggestions.map(e => e.day).filter(Boolean))]
        toast.success(`Parsed ${withSuggestions.length} exercises across ${days.length} day(s)`)
      } else {
        toast.success(`Parsed ${withSuggestions.length} exercises`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse CSV')
    } finally {
      setParsing(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Please sign in first')

      let rows: object[]
      if (isMultiDay) {
        rows = dayGroups.flatMap(group =>
          group.exercises.map(ex => ({
            user_id:       user.id,
            date:          group.date,
            exercise_name: ex.exercise_name,
            sets:          ex.sets,
            reps:          ex.reps,
            weight_kg:     ex.suggested_weight ?? ex.weight_kg,
            notes:         ex.notes || null,
            status:        'planned' as const,
            sort_order:    ex.sort_order,
          }))
        )
      } else {
        if (selectedDays.size === 0) {
          toast.error('Select at least one day')
          setSaving(false)
          return
        }
        rows = [...selectedDays].flatMap(date =>
          exercises.map(ex => ({
            user_id:       user.id,
            date,
            exercise_name: ex.exercise_name,
            sets:          ex.sets,
            reps:          ex.reps,
            weight_kg:     ex.suggested_weight ?? ex.weight_kg,
            notes:         ex.notes || null,
            status:        'planned' as const,
            sort_order:    ex.sort_order,
          }))
        )
      }

      const { error } = await supabase.from('workouts').insert(rows)
      if (error) throw error

      const daysCount = isMultiDay ? dayGroups.length : selectedDays.size
      toast.success(`${exercises.length} exercises saved to ${daysCount} day(s)!`)
      setExercises([])
      setFilename('')
      setSelectedDays(new Set([today()]))
      setDayDateMap({})
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save workouts')
    } finally {
      setSaving(false)
    }
  }

  const totalDays = isMultiDay ? dayGroups.length : selectedDays.size

  return (
    <TooltipProvider>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Upload Workout Plan</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Single-day or full-week CSV — AI load suggestions included.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs"
              onClick={() => downloadCsv(SAMPLE_CSV, 'flowtrack-single-day.csv')}>
              <Download className="w-3.5 h-3.5" />Single-day
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs"
              onClick={() => downloadCsv(SAMPLE_WEEK_CSV, 'flowtrack-full-week.csv')}>
              <Download className="w-3.5 h-3.5" />Full week
            </Button>
          </div>
        </div>

        {/* Format hint */}
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Two CSV formats supported</p>
          <p><span className="font-mono text-primary">Order,Exercise,Sets,Reps,Weight,Notes</span> — single day, pick dates below</p>
          <p><span className="font-mono text-primary">Order,Day,Exercise,Sets,Reps,Weight,Notes</span> — full week (Mon/Tue…), auto-maps to upcoming dates</p>
          <p className="text-muted-foreground/70">The <span className="font-mono">Order</span> column (1, 2, 3…) locks exercise positions so they never re-shuffle. It&apos;s optional — row order is used as fallback.</p>
        </div>

        {/* Drop zone */}
        <DropZone onFile={handleFile} loading={parsing} />

        {/* Exercise preview */}
        <AnimatePresence>
          {exercises.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {exercises.length} exercises{isMultiDay ? ` across ${dayGroups.length} days` : ' ready'}
                  </h2>
                  <p className="text-xs text-muted-foreground">{filename}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground"
                  onClick={() => { setExercises([]); setFilename('') }}>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />Clear
                </Button>
              </div>

              {/* Multi-day grouped view */}
              {isMultiDay ? (
                <div className="space-y-4">
                  {dayGroups.map(group => {
                    const isCollapsed = collapsed[group.dayName]
                    return (
                      <div key={group.dayName} className="rounded-2xl border border-border bg-card overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-primary">{group.dayName}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold">{group.exercises.length} exercise{group.exercises.length !== 1 ? 's' : ''}</p>
                              <p className="text-xs text-muted-foreground">{formatDateLabel(group.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="date" value={group.date}
                              onChange={e => setGroupDate(group.dayName, e.target.value)}
                              className="text-xs bg-background border border-border rounded-lg px-2 py-1 text-foreground cursor-pointer" />
                            <button onClick={() => setCollapsed(p => ({ ...p, [group.dayName]: !p[group.dayName] }))}
                              className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
                              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        {!isCollapsed && (
                          <div className="p-4 space-y-3">
                            {group.exercises.map((ex, i) => (
                              <ExerciseCard key={`${group.dayName}-${ex.exercise_name}-${i}`} exercise={ex} index={i} />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Single-day flat view */
                <>
                  <div className="space-y-3">
                    {exercises.map((ex, i) => (
                      <ExerciseCard key={`${ex.exercise_name}-${i}`} exercise={ex} index={i} />
                    ))}
                  </div>

                  <div className="ny-card px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold">Save to which days?</p>
                      <button onClick={toggleAllDays} className="text-xs font-semibold text-primary">
                        {selectedDays.size === next7.length ? 'Clear all' : 'All 7 days'}
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {next7.map(({ label, date }) => {
                        const active = selectedDays.has(date)
                        return (
                          <button key={date} onClick={() => toggleDay(date)}
                            className={`px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all ${
                              active ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
                            }`}>
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Save */}
              <Button
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold text-base"
                onClick={handleSave}
                disabled={saving || (!isMultiDay && selectedDays.size === 0)}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-5 h-5" />}
                {saving ? 'Saving…' : `Save to ${totalDays} day${totalDays !== 1 ? 's' : ''}`}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
