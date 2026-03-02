'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, Square, Plus, Minus, Mic, MicOff, ChevronDown,
  ChevronUp, Volume2, Timer, Dumbbell, CheckCircle2, SkipForward,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useTimer } from '@/hooks/useTimer'
import { formatDuration, today, generateSessionId } from '@/lib/utils'
import type { Workout, LiveExercise, LiveSet } from '@/types'

// ─── Build a live session from today's planned workouts ───────────────────────
function buildLiveSession(workouts: Workout[]): LiveExercise[] {
  return workouts
    .filter(w => w.date === today() && (w.status === 'planned' || w.status === 'in-progress'))
    .map(w => ({
      id:               w.id,
      exercise_name:    w.exercise_name,
      target_sets:      w.sets,
      target_reps:      w.reps,
      target_weight_kg: w.weight_kg,
      notes:            w.notes ?? '',
      status:           'pending' as const,
      sets: Array.from({ length: w.sets }, (_, i) => ({
        id:           `${w.id}-${i}`,
        set_number:   i + 1,
        target_reps:  w.reps,
        actual_reps:  null,
        weight_kg:    w.weight_kg,
        started_at:   null,
        completed_at: null,
        status:       'pending' as const,
      })),
    }))
}

export default function LivePage() {
  const supabase = createClient()
  const { workouts, loading, updateWorkout } = useWorkouts({ from: today(), to: today() })

  const sessionTimer = useTimer()
  const setTimer     = useTimer()

  const [session, setSession]   = useState<LiveExercise[]>([])
  const [activeExIdx, setActiveExIdx] = useState(0)
  const [activeSetIdx, setActiveSetIdx] = useState(0)
  const [started, setStarted]   = useState(false)
  const [finished, setFinished] = useState(false)
  const [voiceActive, setVoiceActive] = useState(false)
  const [sessionId] = useState(() => generateSessionId())

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Build session when workouts load
  useEffect(() => {
    if (!loading && workouts.length > 0 && session.length === 0) {
      setSession(buildLiveSession(workouts))
    }
  }, [workouts, loading]) // eslint-disable-line

  const activeEx  = session[activeExIdx]
  const activeSet = activeEx?.sets[activeSetIdx]

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!started) return
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        activeSet?.status === 'active' ? completeSet() : startSet()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, activeSet]) // eslint-disable-line

  function startSession() {
    setStarted(true)
    sessionTimer.start()
    if (session.length > 0) {
      setSession(prev => updateExStatus(prev, 0, 'active'))
    }
  }

  function startSet() {
    if (!activeSet) return
    setTimer.restart()
    setSession(prev => updateSetStatus(prev, activeExIdx, activeSetIdx, 'active', { started_at: new Date().toISOString() }))
  }

  function completeSet() {
    if (!activeSet) return
    setTimer.pause()

    const reps = activeSet.actual_reps ?? activeSet.target_reps

    setSession(prev => {
      const updated = updateSetStatus(prev, activeExIdx, activeSetIdx, 'done', {
        completed_at: new Date().toISOString(),
        actual_reps: reps,
      })

      // Move to next set or exercise
      const ex = updated[activeExIdx]
      const nextSetIdx = activeSetIdx + 1

      if (nextSetIdx < ex.sets.length) {
        setActiveSetIdx(nextSetIdx)
      } else {
        // Exercise complete
        const nextExIdx = activeExIdx + 1
        const withDoneEx = updateExStatus(updated, activeExIdx, 'done')
        if (nextExIdx < updated.length) {
          setActiveExIdx(nextExIdx)
          setActiveSetIdx(0)
          const withNextActive = updateExStatus(withDoneEx, nextExIdx, 'active')
          return withNextActive
        } else {
          // All done!
          setFinished(true)
          sessionTimer.pause()
          triggerConfetti()
          return withDoneEx
        }
      }
      return updated
    })

    // Persist completed set to Supabase exercise_history
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !activeEx) return
      supabase.from('exercise_history').insert({
        user_id:       user.id,
        exercise_name: activeEx.exercise_name,
        date:          today(),
        sets:          1,
        reps:          reps,
        weight_kg:     activeSet.weight_kg,
        estimated_1rm: Math.round(activeSet.weight_kg * (1 + reps / 30)),
      })
    })
  }

  function skipSet() {
    setSession(prev => updateSetStatus(prev, activeExIdx, activeSetIdx, 'skipped'))
    const nextIdx = activeSetIdx + 1
    if (nextIdx < (activeEx?.sets.length ?? 0)) {
      setActiveSetIdx(nextIdx)
    } else {
      finishExercise()
    }
  }

  function finishExercise() {
    const nextExIdx = activeExIdx + 1
    setSession(prev => {
      const withDone = updateExStatus(prev, activeExIdx, 'done')
      if (nextExIdx < prev.length) {
        setActiveExIdx(nextExIdx)
        setActiveSetIdx(0)
        return updateExStatus(withDone, nextExIdx, 'active')
      } else {
        setFinished(true)
        sessionTimer.pause()
        triggerConfetti()
        return withDone
      }
    })
  }

  function adjustReps(delta: number) {
    if (!activeSet) return
    setSession(prev => updateSetStatus(prev, activeExIdx, activeSetIdx, activeSet.status, {
      actual_reps: Math.max(1, (activeSet.actual_reps ?? activeSet.target_reps) + delta),
    }))
  }

  function adjustWeight(value: string) {
    const kg = parseFloat(value)
    if (isNaN(kg)) return
    setSession(prev => updateSetStatus(prev, activeExIdx, activeSetIdx, activeSet.status, { weight_kg: kg }))
  }

  // Voice logging
  function toggleVoice() {
    if (voiceActive) {
      recognitionRef.current?.stop()
      setVoiceActive(false)
      return
    }
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: typeof globalThis.SpeechRecognition; webkitSpeechRecognition?: typeof globalThis.SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: typeof globalThis.SpeechRecognition }).webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error('Voice logging not supported in this browser.')
      return
    }
    const rec = new SpeechRecognition()
    rec.continuous = false
    rec.lang = 'en-US'
    rec.onresult = e => {
      const transcript = e.results[0][0].transcript.toLowerCase()
      toast.info(`Voice: "${transcript}"`)
      // Simple parsing: "8 reps" or "increase weight" etc.
      const repsMatch = transcript.match(/(\d+)\s*rep/)
      if (repsMatch) {
        setSession(prev => updateSetStatus(prev, activeExIdx, activeSetIdx, activeSet?.status ?? 'pending', {
          actual_reps: parseInt(repsMatch[1]),
        }))
        toast.success(`Reps set to ${repsMatch[1]}`)
      }
    }
    rec.onerror = () => setVoiceActive(false)
    rec.onend  = () => setVoiceActive(false)
    rec.start()
    recognitionRef.current = rec
    setVoiceActive(true)
  }

  // Total volume
  const totalVolume = session.flatMap(ex => ex.sets)
    .filter(s => s.status === 'done')
    .reduce((acc, s) => acc + (s.actual_reps ?? 0) * s.weight_kg, 0)

  const completedSets = session.flatMap(ex => ex.sets).filter(s => s.status === 'done').length
  const totalSets     = session.flatMap(ex => ex.sets).length
  const progress      = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  // ── Empty state ──
  if (!loading && workouts.filter(w => w.date === today() && w.status !== 'skipped').length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-bold">No workout planned today</h1>
        <p className="text-sm text-muted-foreground">
          Upload a CSV on the Upload page or add exercises to today&apos;s plan.
        </p>
        <Button asChild className="bg-primary text-primary-foreground mt-2">
          <a href="/upload">Upload CSV</a>
        </Button>
      </div>
    )
  }

  // ── Finished screen ──
  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto px-4 py-20 text-center space-y-6"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-6xl"
        >
          🎉
        </motion.div>
        <div>
          <h1 className="text-3xl font-black gradient-text">Session Complete!</h1>
          <p className="text-muted-foreground mt-2">Outstanding work. Your consistency is building something real.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Duration',   value: formatDuration(sessionTimer.seconds) },
            { label: 'Volume',     value: `${totalVolume.toLocaleString()}kg` },
            { label: 'Sets done',  value: `${completedSets}/${totalSets}` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-3">
              <p className="text-lg font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <Button asChild className="bg-primary text-primary-foreground w-full h-11">
          <a href="/history">View in History</a>
        </Button>
      </motion.div>
    )
  }

  // ── Pre-start screen ──
  if (!started) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Today&apos;s Session</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {session.length} exercises · {session.reduce((s, ex) => s + ex.sets.length, 0)} sets total
          </p>
        </div>

        {/* Exercise preview */}
        <div className="space-y-2">
          {session.map((ex, i) => (
            <div key={ex.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
              <Dumbbell className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ex.exercise_name}</p>
                <p className="text-xs text-muted-foreground">{ex.target_sets}×{ex.target_reps} @ {ex.target_weight_kg}kg</p>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={startSession}
          className="w-full h-14 bg-primary text-primary-foreground text-base font-bold hover:bg-primary/90 glow-cyan gap-3"
        >
          <Play className="w-5 h-5" />
          Start Session
        </Button>
        <p className="text-center text-xs text-muted-foreground">Press <kbd className="bg-muted px-1.5 py-0.5 rounded text-[11px]">Space</kbd> to start/complete sets</p>
      </div>
    )
  }

  // ── Active tracking ──
  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5">
      {/* Session header */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary uppercase tracking-wide">Live</span>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-lg font-bold font-mono">{formatDuration(sessionTimer.seconds)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Volume</p>
              <p className="text-lg font-bold">{totalVolume}kg</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sets</p>
              <p className="text-lg font-bold">{completedSets}/{totalSets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1.5" />

      {/* Active exercise */}
      {activeEx && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEx.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-2xl border border-primary/30 bg-primary/[0.03] p-5 space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
                  Exercise {activeExIdx + 1} of {session.length}
                </p>
                <h2 className="text-xl font-bold">{activeEx.exercise_name}</h2>
                {activeEx.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5 italic">&ldquo;{activeEx.notes}&rdquo;</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Set</p>
                <p className="text-2xl font-black">
                  {activeSetIdx + 1}<span className="text-sm text-muted-foreground font-normal">/{activeEx.target_sets}</span>
                </p>
              </div>
            </div>

            {/* Set timer */}
            {activeSet?.status === 'active' && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5">
                <Timer className="w-4 h-4 text-primary" />
                <span className="font-mono text-primary font-bold">{formatDuration(setTimer.seconds)}</span>
                <span className="text-xs text-primary/70 ml-1">set timer</span>
              </div>
            )}

            {/* Weight */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Weight (kg)</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  onClick={() => adjustWeight(String((activeSet?.weight_kg ?? 0) - 2.5))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  step="0.5"
                  value={activeSet?.weight_kg ?? 0}
                  onChange={e => adjustWeight(e.target.value)}
                  className="text-center text-xl font-bold h-11 border-border"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  onClick={() => adjustWeight(String((activeSet?.weight_kg ?? 0) + 2.5))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Reps */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Reps <span className="text-muted-foreground/60">(target: {activeSet?.target_reps})</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 text-lg"
                  onClick={() => adjustReps(-1)}
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <div className="flex-1 flex items-center justify-center h-14 rounded-lg bg-muted text-3xl font-black">
                  {activeSet?.actual_reps ?? activeSet?.target_reps ?? 0}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 text-lg"
                  onClick={() => adjustReps(1)}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {activeSet?.status !== 'active' ? (
                <Button
                  onClick={startSet}
                  className="flex-1 h-12 bg-primary text-primary-foreground font-semibold gap-2 animate-pulse-ring"
                >
                  <Play className="w-4 h-4" />
                  Start Set
                </Button>
              ) : (
                <Button
                  onClick={completeSet}
                  className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Set
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={skipSet}
                title="Skip set"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button
                variant={voiceActive ? 'default' : 'outline'}
                size="icon"
                className={`h-12 w-12 ${voiceActive ? 'bg-red-500 text-white border-red-500' : ''}`}
                onClick={toggleVoice}
                title="Voice log"
              >
                {voiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Exercise timeline */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">All Exercises</p>
        {session.map((ex, i) => (
          <div
            key={ex.id}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all cursor-pointer ${
              i === activeExIdx
                ? 'border-primary/40 bg-primary/5'
                : ex.status === 'done'
                ? 'border-border bg-muted/20 opacity-50'
                : 'border-border bg-card'
            }`}
            onClick={() => { if (ex.status !== 'done') { setActiveExIdx(i); setActiveSetIdx(0) } }}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              ex.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
              i === activeExIdx    ? 'bg-primary text-primary-foreground' :
                                    'bg-muted text-muted-foreground'
            }`}>
              {ex.status === 'done' ? '✓' : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{ex.exercise_name}</p>
              <p className="text-xs text-muted-foreground">{ex.target_sets}×{ex.target_reps} @ {ex.target_weight_kg}kg</p>
            </div>
            {/* Set dots */}
            <div className="flex gap-1">
              {ex.sets.map(s => (
                <div
                  key={s.id}
                  className={`w-2 h-2 rounded-full ${
                    s.status === 'done'    ? 'bg-emerald-500' :
                    s.status === 'active'  ? 'bg-primary animate-pulse' :
                    s.status === 'skipped' ? 'bg-muted-foreground/30' :
                                             'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Finish early */}
      <Button
        variant="ghost"
        className="w-full text-muted-foreground hover:text-destructive gap-2"
        onClick={() => { setFinished(true); sessionTimer.pause(); triggerConfetti() }}
      >
        <Square className="w-4 h-4" />
        End Session Early
      </Button>
    </div>
  )
}

// ─── Immutable helpers ────────────────────────────────────────────────────────
function updateSetStatus(
  session: LiveExercise[],
  exIdx: number,
  setIdx: number,
  status: LiveSet['status'],
  extra?: Partial<LiveSet>,
): LiveExercise[] {
  return session.map((ex, ei) => ei !== exIdx ? ex : {
    ...ex,
    sets: ex.sets.map((s, si) => si !== setIdx ? s : { ...s, status, ...extra }),
  })
}

function updateExStatus(session: LiveExercise[], exIdx: number, status: LiveExercise['status']): LiveExercise[] {
  return session.map((ex, ei) => ei !== exIdx ? ex : { ...ex, status })
}

function triggerConfetti() {
  const count = 200
  const defaults = { origin: { y: 0.7 }, colors: ['#22D3EE', '#A78BFA', '#34D399', '#FFFFFF'] }
  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
  }
  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2,  { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1,  { spread: 120, startVelocity: 45 })
}
