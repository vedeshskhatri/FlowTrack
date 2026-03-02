'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Workout } from '@/types'
import { today } from '@/lib/utils'

export function useWorkouts(dateRange?: { from: string; to: string }) {
  const supabase = createClient()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  const from = dateRange?.from ?? (() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10)
  })()
  const to = dateRange?.to ?? today()

  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) setError(error.message)
    else setWorkouts(data ?? [])
    setLoading(false)
  }, [from, to]) // eslint-disable-line

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('workouts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts' }, () => {
        fetchWorkouts()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchWorkouts]) // eslint-disable-line

  const createWorkout = useCallback(async (workout: Omit<Workout, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('workouts')
      .insert({ ...workout, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return data as Workout
  }, []) // eslint-disable-line

  const updateWorkout = useCallback(async (id: string, updates: Partial<Workout>) => {
    const { error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', id)

    if (error) throw error
  }, []) // eslint-disable-line

  const deleteWorkout = useCallback(async (id: string) => {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (error) throw error
  }, []) // eslint-disable-line

  return { workouts, loading, error, refetch: fetchWorkouts, createWorkout, updateWorkout, deleteWorkout }
}
