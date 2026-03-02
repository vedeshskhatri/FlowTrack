'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { HeroCard } from '@/components/dashboard/HeroCard'
import { StreakCalendar } from '@/components/dashboard/StreakCalendar'
import { VolumeChart } from '@/components/dashboard/VolumeChart'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RestCard } from '@/components/dashboard/RestCard'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()
  const { workouts, loading } = useWorkouts({
    from: (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10) })(),
    to: new Date().toISOString().slice(0, 10),
  })

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero section */}
        <HeroCard workouts={workouts} loading={loading} userName={user?.email} />

        {/* Recovery status */}
        <RestCard workouts={workouts} />

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
