// ─── FlowTrack Types ─────────────────────────────────────────────────────────

export type WorkoutStatus = 'planned' | 'in-progress' | 'completed' | 'skipped'
export type Unit = 'kg' | 'lbs'
export type CyclePhase = 'follicular' | 'ovulatory' | 'luteal' | 'menstrual' | 'none'
export type GoalType = 'strength' | 'hypertrophy' | 'endurance' | 'weight-loss' | 'general'

export interface Workout {
  id: string
  user_id: string
  date: string               // ISO date string YYYY-MM-DD
  exercise_name: string
  sets: number
  reps: number
  weight_kg: number
  notes: string | null
  start_time: string | null  // ISO timestamp
  end_time: string | null    // ISO timestamp
  status: WorkoutStatus
  session_id: string | null  // Groups exercises in same session
  created_at: string
  updated_at: string
}

export interface ExerciseHistory {
  id: string
  user_id: string
  exercise_name: string
  date: string
  sets: number
  reps: number
  weight_kg: number
  volume_kg: number          // sets × reps × weight
  estimated_1rm: number | null
  created_at: string
}

export interface AiChatHistory {
  id: string
  user_id: string
  query: string
  response: string
  context: string | null     // JSON of relevant workout data sent as context
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  cycle_phase: CyclePhase
  units: Unit
  goal: GoalType
  openai_key: string | null  // encrypted in practice
  show_nutrition: boolean
  onboarding_completed: boolean
  theme: 'dark' | 'light' | 'system'
  created_at: string
  updated_at: string
}

// ─── UI / App Types ───────────────────────────────────────────────────────────

export interface ParsedExercise {
  exercise_name: string
  sets: number
  reps: number
  weight_kg: number
  notes: string
  suggested_weight?: number  // from progressive overload engine
  suggestion_reason?: string
}

export interface WeeklyVolume {
  date: string
  volume: number
  label: string
}

export interface NavItem {
  label: string
  href: string
  icon: string
}

export interface LiveSet {
  id: string
  set_number: number
  target_reps: number
  actual_reps: number | null
  weight_kg: number
  started_at: string | null
  completed_at: string | null
  status: 'pending' | 'active' | 'done' | 'skipped'
}

export interface LiveExercise {
  id: string
  exercise_name: string
  target_sets: number
  target_reps: number
  target_weight_kg: number
  sets: LiveSet[]
  status: 'pending' | 'active' | 'done'
  notes: string
}
