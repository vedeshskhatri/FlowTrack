'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DropZone } from '@/components/upload/DropZone'
import { ExerciseCard } from '@/components/upload/ExerciseCard'
import { parseCsvFile } from '@/lib/csv-parser'
import { applyProgressiveOverload } from '@/lib/progressive-overload'
import { createClient } from '@/lib/supabase/client'
import { today } from '@/lib/utils'
import type { ParsedExercise, ExerciseHistory } from '@/types'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
  const [parsing,  setParsing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [exercises, setExercises] = useState<ParsedExercise[]>([])
  const [filename,  setFilename]  = useState('')
  const next7 = useMemo(() => getNext7Days(), [])
  const [selectedDays, setSelectedDays] = useState<Set<string>>(() => new Set([today()]))

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

  async function handleFile(file: File) {
    setParsing(true)
    setFilename(file.name)

    try {
      const parsed = await parseCsvFile(file)

      // Fetch exercise history for progressive overload
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
      toast.success(`Parsed ${parsed.length} exercises!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse CSV')
    } finally {
      setParsing(false)
    }
  }

  async function handleSave() {
    if (selectedDays.size === 0) {
      toast.error('Select at least one day')
      return
    }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Please sign in first')

      const rows = [...selectedDays].flatMap(date =>
        exercises.map(ex => ({
          user_id:       user.id,
          date,
          exercise_name: ex.exercise_name,
          sets:          ex.sets,
          reps:          ex.reps,
          weight_kg:     ex.suggested_weight ?? ex.weight_kg,
          notes:         ex.notes || null,
          status:        'planned' as const,
        }))
      )

      const { error } = await supabase.from('workouts').insert(rows)
      if (error) throw error

      toast.success(`${exercises.length} exercises saved to ${selectedDays.size} day(s)!`)
      setExercises([])
      setFilename('')
      setSelectedDays(new Set([today()]))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save workouts')
    } finally {
      setSaving(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Upload Workout Plan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Import your CSV and get AI-powered load suggestions based on your history.
          </p>
        </div>

        {/* Drop zone */}
        <DropZone onFile={handleFile} loading={parsing} />

        {/* Exercise cards */}
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
                  <h2 className="font-semibold">{exercises.length} exercises ready</h2>
                  <p className="text-xs text-muted-foreground">{filename}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => { setExercises([]); setFilename('') }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Clear
                </Button>
              </div>

              <div className="space-y-3">
                {exercises.map((ex, i) => (
                  <ExerciseCard key={`${ex.exercise_name}-${i}`} exercise={ex} index={i} />
                ))}
              </div>

              {/* Day selector */}
              <div className="ny-card px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold">Save to which days?</p>
                  <button
                    onClick={toggleAllDays}
                    className="text-xs font-semibold text-primary"
                  >
                    {selectedDays.size === next7.length ? 'Clear all' : 'All 7 days'}
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {next7.map(({ label, date }) => {
                    const active = selectedDays.has(date)
                    return (
                      <button
                        key={date}
                        onClick={() => toggleDay(date)}
                        className={`px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all ${
                          active
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Save button */}
              <Button
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold text-base"
                onClick={handleSave}
                disabled={saving || selectedDays.size === 0}
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CalendarDays className="w-5 h-5" />}
                {saving
                  ? 'Saving…'
                  : selectedDays.size > 1
                    ? `Save to ${selectedDays.size} days`
                    : 'Save to plan'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
