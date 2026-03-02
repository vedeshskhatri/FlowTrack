import type { ExerciseHistory, ParsedExercise } from '@/types'
import { estimate1RM } from './utils'

/**
 * Progressive overload suggestion engine.
 *
 * Algorithm:
 * 1. Look at the last 3 sessions for the exercise.
 * 2. If the user hit all reps on the last 2 sessions → increase weight 5-7.5%.
 * 3. If the user hit all reps only once → maintain current weight.
 * 4. If the user missed reps → reduce weight 5%.
 * 5. Adjust output for cycle phase if applicable.
 */
export function suggestLoad(
  exercise: ParsedExercise,
  history: ExerciseHistory[],
  cyclePhase: string = 'none',
): { suggestedWeight: number; reason: string } {
  const relevantHistory = history
    .filter(h => h.exercise_name.toLowerCase() === exercise.exercise_name.toLowerCase())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  if (relevantHistory.length === 0) {
    // First time — use uploaded weight as-is
    return {
      suggestedWeight: exercise.weight_kg,
      reason: 'First session — starting with your suggested weight.',
    }
  }

  const lastSession = relevantHistory[0]
  const prevWeight = lastSession.weight_kg
  const targetVolume = exercise.sets * exercise.reps * prevWeight

  // Check if player consistently completed all reps
  const completedAll = relevantHistory.slice(0, 2).every(
    h => h.reps >= exercise.reps && h.sets >= exercise.sets,
  )

  const completedOnce = relevantHistory.length >= 1 &&
    relevantHistory[0].reps >= exercise.reps

  // Luteal phase (women) — reduce intensity by 10%
  if (cyclePhase === 'luteal') {
    const reduced = Math.round(prevWeight * 0.9 * 2) / 2
    return {
      suggestedWeight: reduced,
      reason: `Luteal phase active — reduced to ${reduced}kg (90% intensity) for recovery.`,
    }
  }

  if (completedAll) {
    // Progressive overload — increase 5-7.5%
    const increase = prevWeight < 50 ? 0.05 : 0.075
    const newWeight = Math.round(prevWeight * (1 + increase) * 2) / 2 // round to nearest 0.5kg
    return {
      suggestedWeight: newWeight,
      reason: `Based on your last ${relevantHistory.length} sessions, you're ready to increase. +${Math.round(increase * 100)}% → ${newWeight}kg`,
    }
  }

  if (completedOnce) {
    return {
      suggestedWeight: prevWeight,
      reason: `Maintain ${prevWeight}kg — aim to complete all sets/reps before increasing.`,
    }
  }

  // Missed reps — slight deload
  const deload = Math.round(prevWeight * 0.95 * 2) / 2
  return {
    suggestedWeight: deload,
    reason: `Slight deload to ${deload}kg — focus on form and full reps.`,
  }
}

/**
 * Apply load suggestions to a full list of parsed exercises.
 */
export function applyProgressiveOverload(
  exercises: ParsedExercise[],
  history: ExerciseHistory[],
  cyclePhase: string = 'none',
): ParsedExercise[] {
  return exercises.map(ex => {
    const { suggestedWeight, reason } = suggestLoad(ex, history, cyclePhase)
    return {
      ...ex,
      suggested_weight: suggestedWeight,
      suggestion_reason: reason,
    }
  })
}

/**
 * Calculate weekly volume (sets × reps × weight) for a list of exercises.
 */
export function calculateVolume(exercises: { sets: number; reps: number; weight_kg: number }[]): number {
  return exercises.reduce((acc, ex) => acc + ex.sets * ex.reps * ex.weight_kg, 0)
}

/**
 * Get estimated 1RM for named exercise from history.
 */
export function getEstimated1RM(exerciseName: string, history: ExerciseHistory[]): number | null {
  const relevant = history
    .filter(h => h.exercise_name.toLowerCase() === exerciseName.toLowerCase())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  if (relevant.length === 0) return null

  const best = relevant.reduce((max, h) => {
    const rm = estimate1RM(h.weight_kg, h.reps)
    return rm > max ? rm : max
  }, 0)

  return best
}
