'use client'

import { useState, useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { HeroCard } from '@/components/dashboard/HeroCard'
import { StreakCalendar } from '@/components/dashboard/StreakCalendar'
import { VolumeChart } from '@/components/dashboard/VolumeChart'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RestCard } from '@/components/dashboard/RestCard'
import { MotivationCard } from '@/components/dashboard/MotivationCard'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import type { UserPreferences } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const { workouts, loading } = useWorkouts({
    from: (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10) })(),
    to: new Date().toISOString().slice(0, 10),
  })
  const [profile, setProfile] = useState<Partial<UserPreferences> | null>(null)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('user_preferences')
      .select('age,gender,height_cm,body_weight_kg,experience_level,goal,cycle_phase,units')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [user])

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero section */}
        <HeroCard workouts={workouts} loading={loading} userName={user?.email} />

        {/* Daily motivation */}
        <MotivationCard />

        {/* Recovery status */}
        <RestCard workouts={workouts} profile={profile} />

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StreakCalendar workouts={workouts} />
          <VolumeChart workouts={workouts} loading={loading} />
        </div>

        {/* Quick actions */}
        <QuickActions />
      </div>
    </TooltipProvider>
  )
}
