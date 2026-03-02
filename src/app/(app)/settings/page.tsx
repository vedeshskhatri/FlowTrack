'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import type { UserPreferences, CyclePhase, GoalType, Unit } from '@/types'

const DEFAULT_PREFS: Partial<UserPreferences> = {
  units: 'kg',
  goal: 'general',
  cycle_phase: 'none',
  show_nutrition: false,
  openai_key: '',
  onboarding_completed: true,
}

export default function SettingsPage() {
  const supabase = createClient()
  const [prefs,   setPrefs]   = useState<Partial<UserPreferences>>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [userId,  setUserId]  = useState<string | null>(null)
  const [email,   setEmail]   = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      setEmail(user.email ?? '')

      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) setPrefs(data)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line

  async function handleSave() {
    if (!userId) { toast.error('Please sign in first'); return }
    setSaving(true)
    const { error } = await supabase
      .from('user_preferences')
      .upsert({ ...prefs, user_id: userId }, { onConflict: 'user_id' })

    if (error) toast.error(error.message)
    else toast.success('Settings saved!')
    setSaving(false)
  }

  function update<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    setPrefs(p => ({ ...p, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Personalise your FlowTrack experience</p>
      </div>

      {/* Account */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <p className="text-sm font-medium mt-0.5">{email || 'Not signed in'}</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Training preferences */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Training</h2>
        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Weight Units</Label>
              <Select
                value={prefs.units ?? 'kg'}
                onValueChange={v => update('units', v as Unit)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Training Goal</Label>
              <Select
                value={prefs.goal ?? 'general'}
                onValueChange={v => update('goal', v as GoalType)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="weight-loss">Weight Loss</SelectItem>
                  <SelectItem value="general">General Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Cycle-Aware Planning</Label>
            <p className="text-xs text-muted-foreground">Optimise load intensity based on your hormonal cycle phase</p>
            <Select
              value={prefs.cycle_phase ?? 'none'}
              onValueChange={v => update('cycle_phase', v as CyclePhase)}
            >
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Disabled</SelectItem>
                <SelectItem value="follicular">Follicular (Days 1–13)</SelectItem>
                <SelectItem value="ovulatory">Ovulatory (Day 14)</SelectItem>
                <SelectItem value="luteal">Luteal (Days 15–28)</SelectItem>
                <SelectItem value="menstrual">Menstrual (Days 1–5)</SelectItem>
              </SelectContent>
            </Select>
            {prefs.cycle_phase === 'luteal' && (
              <p className="text-xs text-amber-400 mt-1">
                ⚡ Luteal phase active — loads will be auto-reduced 10% by the planning engine.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Nutrition Quick-Log</Label>
              <p className="text-xs text-muted-foreground">Show calories & protein fields in live sessions</p>
            </div>
            <Switch
              checked={prefs.show_nutrition ?? false}
              onCheckedChange={v => update('show_nutrition', v)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* AI Coach */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AI Coach</h2>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>AI API Key (OpenRouter or OpenAI)</Label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get a key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="sk-or-v1-… or sk-…"
                value={prefs.openai_key ?? ''}
                onChange={e => update('openai_key', e.target.value)}
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Accepts OpenRouter keys (<code>sk-or-v1-…</code>) or OpenAI keys (<code>sk-…</code>).
              Stored in Supabase — only you can see it. Leave blank to use the server default key.
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Wearables (preview) */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Wearable Sync</h2>
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 opacity-60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Apple Health</p>
              <p className="text-xs text-muted-foreground">Sync heart rate & activity</p>
            </div>
            <Button variant="outline" size="sm" disabled>Coming soon</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Google Fit</p>
              <p className="text-xs text-muted-foreground">Sync steps & calories</p>
            </div>
            <Button variant="outline" size="sm" disabled>Coming soon</Button>
          </div>
        </div>
      </section>

      {/* Save */}
      <Button
        onClick={handleSave}
        className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
        disabled={saving}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'Saving…' : 'Save Settings'}
      </Button>
    </div>
  )
}
