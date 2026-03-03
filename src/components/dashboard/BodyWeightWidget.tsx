'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts'
import { format } from 'date-fns'
import { Scale, TrendingDown, TrendingUp, Minus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import type { WeightLog } from '@/types'

interface ChartPoint {
  date: string
  label: string
  weight: number
}

export function BodyWeightWidget() {
  const supabase = createClient()
  const [logs, setLogs] = useState<WeightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [todayWeight, setTodayWeight] = useState('')
  const [saving, setSaving] = useState(false)
  const [units, setUnits] = useState<'kg' | 'lbs'>('kg')

  const today = new Date().toISOString().slice(0, 10)
  const todayLog = logs.find(l => l.date === today)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Fetch units preference
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('units')
        .eq('user_id', user.id)
        .single()
      if (prefs?.units) setUnits(prefs.units as 'kg' | 'lbs')

      // Fetch last 90 days of weight logs
      const from = new Date()
      from.setDate(from.getDate() - 90)
      const { data } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', from.toISOString().slice(0, 10))
        .order('date', { ascending: true })

      setLogs(data ?? [])
      if (data && data.length > 0) {
        const latest = data[data.length - 1]
        const display = units === 'lbs'
          ? Math.round(latest.weight_kg * 2.205 * 10) / 10
          : latest.weight_kg
        setTodayWeight(String(display))
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line

  async function logWeight() {
    const w = parseFloat(todayWeight)
    if (isNaN(w) || w <= 0) { toast.error('Enter a valid weight'); return }

    const kg = units === 'lbs' ? Math.round((w / 2.205) * 10) / 10 : w

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Not authenticated'); return }

    setSaving(true)
    const { error } = await supabase.from('weight_logs').upsert(
      { user_id: user.id, date: today, weight_kg: kg },
      { onConflict: 'user_id,date' }
    )

    if (error) { toast.error(error.message) }
    else {
      toast.success(`Weight logged: ${w}${units}`)
      setLogs(prev => {
        const filtered = prev.filter(l => l.date !== today)
        return [...filtered, { id: crypto.randomUUID(), user_id: user.id, date: today, weight_kg: kg, notes: null, created_at: new Date().toISOString() }]
          .sort((a, b) => a.date.localeCompare(b.date))
      })
    }
    setSaving(false)
  }

  // Chart data
  const chartData: ChartPoint[] = logs.map(l => ({
    date: l.date,
    label: format(new Date(l.date + 'T12:00:00'), 'MMM d'),
    weight: units === 'lbs' ? Math.round(l.weight_kg * 2.205 * 10) / 10 : l.weight_kg,
  }))

  // Stats
  const weights = logs.map(l => l.weight_kg)
  const latest  = weights[weights.length - 1] ?? null
  const first   = weights[0] ?? null
  const change  = latest !== null && first !== null ? +(latest - first).toFixed(1) : null
  const dispLatest = latest ? (units === 'lbs' ? Math.round(latest * 2.205 * 10) / 10 : latest) : null

  const TrendIcon = change === null ? Minus : change < 0 ? TrendingDown : TrendingUp
  const trendColor = change === null ? 'text-muted-foreground' : change < 0 ? 'text-emerald-400' : 'text-rose-400'

  const yDomain = chartData.length > 0
    ? [Math.floor(Math.min(...chartData.map(d => d.weight)) - 2), Math.ceil(Math.max(...chartData.map(d => d.weight)) + 2)]
    : ['auto', 'auto']

  if (loading) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="ny-card px-5 py-4 border border-border space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-[1px] bg-[#C9A84C]/50" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A84C]">Body Weight Trend</p>
        </div>
        <Scale className="w-3.5 h-3.5 text-[#C9A84C]" />
      </div>

      {/* Log today's weight */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Input
            type="number"
            step="0.1"
            placeholder={`Today's weight (${units})`}
            value={todayWeight}
            onChange={e => setTodayWeight(e.target.value)}
            className="rounded-none border-border focus:border-[#C9A84C] h-9 text-sm pr-10"
            onKeyDown={e => e.key === 'Enter' && logWeight()}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold uppercase">
            {units}
          </span>
        </div>
        <button
          onClick={logWeight}
          disabled={saving}
          className="h-9 px-4 bg-foreground text-background text-[10px] tracking-[0.15em] uppercase font-bold hover:opacity-80 transition-all disabled:opacity-40 flex items-center gap-1.5"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Log'}
        </button>
        {todayLog && (
          <span className="text-[10px] text-[#C9A84C] font-bold tracking-wide whitespace-nowrap">✓ Logged</span>
        )}
      </div>

      {/* Stats row */}
      {dispLatest !== null && (
        <div className="flex items-center gap-4 border-t border-border pt-3">
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.18em] font-semibold">Current</p>
            <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
              {dispLatest}<span className="text-xs font-normal text-muted-foreground ml-0.5">{units}</span>
            </p>
          </div>
          {change !== null && (
            <div className="flex items-center gap-1.5">
              <TrendIcon className={`w-4 h-4 ${trendColor}`} />
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.18em] font-semibold">90d Change</p>
                <p className={`text-sm font-bold ${trendColor}`}>
                  {change > 0 ? '+' : ''}{units === 'lbs' ? Math.round(change * 2.205 * 10) / 10 : change}{units}
                </p>
              </div>
            </div>
          )}
          <div className="ml-auto text-right">
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.18em] font-semibold">Entries</p>
            <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>{logs.length}</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                domain={yDomain as [number, number]}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 0,
                  fontSize: 11,
                  color: 'hsl(var(--foreground))',
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((v: unknown) => [`${(v as number) ?? 0}${units}`, 'Weight']) as any}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#C9A84C"
                strokeWidth={1.5}
                dot={{ r: 2.5, fill: '#C9A84C', strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length === 0 && (
        <p className="text-[10px] text-muted-foreground font-light text-center py-4 tracking-wide">
          Log your daily weight to see the trend here.
        </p>
      )}
    </motion.div>
  )
}
