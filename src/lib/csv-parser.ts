import Papa from 'papaparse'
import type { ParsedExercise } from '@/types'

/**
 * Parse a CSV file in the FlowTrack format:
 * Exercise,Sets,Reps,Weight,Notes
 *
 * Returns a list of ParsedExercise objects or throws if the format is invalid.
 */
export function parseCsvFile(file: File): Promise<ParsedExercise[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase(),
      complete: (results) => {
        try {
          const exercises = results.data.map((row: unknown, index: number) => {
            const r = row as Record<string, string>
            const name = (r['exercise'] || r['exercise_name'] || '').trim()
            if (!name) throw new Error(`Row ${index + 1}: Exercise name is required`)

            const sets = parseInt(r['sets'] || '0', 10)
            const reps = parseInt(r['reps'] || '0', 10)
            const weight = parseFloat(r['weight'] || r['weight_kg'] || '0')

            if (isNaN(sets) || sets <= 0) throw new Error(`Row ${index + 1}: Invalid sets for "${name}"`)
            if (isNaN(reps) || reps <= 0) throw new Error(`Row ${index + 1}: Invalid reps for "${name}"`)
            if (isNaN(weight) || weight < 0) throw new Error(`Row ${index + 1}: Invalid weight for "${name}"`)

            return {
              exercise_name: name,
              sets,
              reps,
              weight_kg: weight,
              notes: (r['notes'] || '').trim(),
            } satisfies ParsedExercise
          })

          resolve(exercises)
        } catch (err) {
          reject(err)
        }
      },
      error: (err) => reject(new Error(err.message)),
    })
  })
}

/**
 * Convert workouts to CSV string for export.
 */
export function workoutsToCsv(
  workouts: Array<{
    date: string
    exercise_name: string
    sets: number
    reps: number
    weight_kg: number
    notes: string | null
    status: string
  }>,
): string {
  const rows = workouts.map(w => ({
    Date: w.date,
    Exercise: w.exercise_name,
    Sets: w.sets,
    Reps: w.reps,
    Weight: w.weight_kg,
    Notes: w.notes || '',
    Status: w.status,
  }))

  return Papa.unparse(rows)
}

/**
 * Sample CSV content for the onboarding flow.
 */
export const SAMPLE_CSV = `Exercise,Sets,Reps,Weight,Notes
Bench Press,4,8,80,focus on full ROM
Squat,4,6,100,keep chest up
Deadlift,3,5,120,
Pull Up,4,8,0,bodyweight
Overhead Press,3,10,50,slow eccentric
Barbell Row,4,8,70,
Leg Press,3,12,150,
Cable Row,3,12,60,squeeze at top
`
