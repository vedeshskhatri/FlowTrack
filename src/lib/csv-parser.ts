import Papa from 'papaparse'
import type { ParsedExercise } from '@/types'

// Maps common day aliases to standard 3-letter names
const DAY_ALIASES: Record<string, string> = {
  sun: 'Sun', sunday: 'Sun',
  mon: 'Mon', monday: 'Mon',
  tue: 'Tue', tues: 'Tue', tuesday: 'Tue',
  wed: 'Wed', wednesday: 'Wed',
  thu: 'Thu', thur: 'Thu', thurs: 'Thu', thursday: 'Thu',
  fri: 'Fri', friday: 'Fri',
  sat: 'Sat', saturday: 'Sat',
}

/**
 * Parse a CSV file in FlowTrack single-day format:
 *   Order,Exercise,Sets,Reps,Weight,Notes
 *
 * OR multi-day format (one file = whole week):
 *   Order,Day,Exercise,Sets,Reps,Weight,Notes
 *   1,Mon,Bench Press,4,8,80,focus on full ROM
 *   2,Mon,Squat,4,6,100,
 *   1,Wed,Deadlift,3,5,120,
 *   1,Sat,Pull Up,4,8,0,bodyweight
 *
 * The optional `Order` column (1-based) pins each exercise to a fixed position
 * within its day so the workout list never re-shuffles after upload.
 * When `Order` is omitted the CSV row index (1-based) is used as a fallback.
 * When a Day column is present, each exercise has a `day` field (e.g. 'Mon').
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

            const sets   = parseInt(r['sets']   || '0', 10)
            const reps   = parseInt(r['reps']   || '0', 10)
            const weight = parseFloat(r['weight'] || r['weight_kg'] || '0')

            if (isNaN(sets)   || sets   <= 0) throw new Error(`Row ${index + 1}: Invalid sets for "${name}"`)
            if (isNaN(reps)   || reps   <= 0) throw new Error(`Row ${index + 1}: Invalid reps for "${name}"`)
            if (isNaN(weight) || weight <  0) throw new Error(`Row ${index + 1}: Invalid weight for "${name}"`)

            // Normalise day name if present
            const rawDay = (r['day'] || '').trim().toLowerCase()
            const day    = rawDay ? (DAY_ALIASES[rawDay] ?? rawDay) : undefined

            // Use explicit Order column (1-based) if provided; fall back to row index + 1
            const orderRaw  = (r['order'] || '').trim()
            const sortOrder = orderRaw ? parseInt(orderRaw, 10) : index + 1

            return {
              exercise_name: name,
              sets,
              reps,
              weight_kg: weight,
              notes: (r['notes'] || '').trim(),
              sort_order: sortOrder,
              day,
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
 * Includes an Order column so re-importing the file preserves exercise order.
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
    sort_order?: number
  }>,
): string {
  // Group by date so Order resets to 1 for each day (mirrors the upload format)
  const byDate: Record<string, typeof workouts> = {}
  for (const w of workouts) {
    if (!byDate[w.date]) byDate[w.date] = []
    byDate[w.date].push(w)
  }

  const rows = Object.values(byDate).flatMap(group =>
    group
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((w, i) => ({
        Order:    w.sort_order ?? i + 1,
        Date:     w.date,
        Exercise: w.exercise_name,
        Sets:     w.sets,
        Reps:     w.reps,
        Weight:   w.weight_kg,
        Notes:    w.notes || '',
        Status:   w.status,
      }))
  )

  return Papa.unparse(rows)
}

/**
 * Sample CSV — single-day format.
 * The Order column (1, 2, 3…) locks each exercise into its position
 * so the list never re-shuffles after upload.
 */
export const SAMPLE_CSV = `Order,Exercise,Sets,Reps,Weight,Notes
1,Bench Press,4,8,80,focus on full ROM
2,Squat,4,6,100,keep chest up
3,Deadlift,3,5,120,
4,Pull Up,4,8,0,bodyweight
5,Overhead Press,3,10,50,slow eccentric
6,Barbell Row,4,8,70,
7,Leg Press,3,12,150,
8,Cable Row,3,12,60,squeeze at top
`

/**
 * Sample CSV — multi-day / full-week format.
 * Upload once and it auto-splits by day of the week.
 * Order resets to 1 for each day so each day's list stays sorted correctly.
 */
export const SAMPLE_WEEK_CSV = `Order,Day,Exercise,Sets,Reps,Weight,Notes
1,Mon,Bench Press,4,8,80,focus on full ROM
2,Mon,Overhead Press,3,10,50,slow eccentric
3,Mon,Cable Row,3,12,60,squeeze at top
1,Wed,Squat,4,6,100,keep chest up
2,Wed,Leg Press,3,12,150,
3,Wed,Hanging Leg Raise,3,15,0,
1,Fri,Deadlift,3,5,120,
2,Fri,Pull Up,4,8,0,bodyweight
3,Fri,Barbell Row,4,8,70,
`

