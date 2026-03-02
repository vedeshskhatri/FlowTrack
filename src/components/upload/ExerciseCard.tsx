'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Dumbbell, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ParsedExercise } from '@/types'

interface ExerciseCardProps {
  exercise: ParsedExercise
  index: number
}

export function ExerciseCard({ exercise, index }: ExerciseCardProps) {
  const hasSuggestion = exercise.suggested_weight !== undefined
  const diff = hasSuggestion ? exercise.suggested_weight! - exercise.weight_kg : 0
  const isUp = diff > 0
  const isDown = diff < 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-border bg-card p-4 card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Dumbbell className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{exercise.exercise_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {exercise.sets} sets × {exercise.reps} reps
            </p>
          </div>
        </div>

        {/* Weight display */}
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1.5 justify-end">
            {hasSuggestion ? (
              <>
                <span className="text-xs line-through text-muted-foreground">
                  {exercise.weight_kg}kg
                </span>
                <span className={`text-sm font-bold ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-foreground'}`}>
                  {exercise.suggested_weight}kg
                </span>
                {isUp ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  : isDown ? <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  : <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
              </>
            ) : (
              <span className="text-sm font-bold">{exercise.weight_kg}kg</span>
            )}
          </div>
        </div>
      </div>

      {/* AI suggestion reason */}
      {exercise.suggestion_reason && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2">
          <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">{exercise.suggestion_reason}</p>
        </div>
      )}

      {/* Notes */}
      {exercise.notes && (
        <p className="mt-2 text-xs text-muted-foreground pl-1 italic">
          &ldquo;{exercise.notes}&rdquo;
        </p>
      )}
    </motion.div>
  )
}
