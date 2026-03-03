'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: 'Unknown' },
  { text: "Fall in love with the process, and the results will follow.", author: 'Unknown' },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: 'Unknown' },
  { text: "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.", author: 'Rikki Rogers' },
  { text: "It never gets easier, you just get stronger.", author: 'Unknown' },
  { text: "Train insane or remain the same.", author: 'Unknown' },
  { text: "Sweat is just fat crying.", author: 'Unknown' },
  { text: "Push yourself because no one else is going to do it for you.", author: 'Unknown' },
  { text: "Believe in yourself and all that you are. You are capable of more than you know.", author: 'Christian D. Larson' },
  { text: "Take care of your body. It's the only place you have to live.", author: 'Jim Rohn' },
  { text: "Success is usually the culmination of controlling failure.", author: 'Sly Stallone' },
  { text: "No pain, no gain. Shut up and train.", author: 'Unknown' },
  { text: "One hour of training a day. 23 hours to do everything else.", author: 'Unknown' },
  { text: "The groundwork for all happiness is good health.", author: 'Leigh Hunt' },
  { text: "Your health is an investment, not an expense.", author: 'Unknown' },
  { text: "Slow progress is still progress.", author: 'Unknown' },
  { text: "Don't wish for a good body, work for it.", author: 'Unknown' },
  { text: "A one-hour workout is 4% of your day. No excuses.", author: 'Unknown' },
  { text: "The hard days are the best because that's when champions are made.", author: 'Gabby Douglas' },
  { text: "Do something today that your future self will thank you for.", author: 'Sean Patrick Flanery' },
  { text: "Discipline is doing what needs to be done, even when you don't want to.", author: 'Unknown' },
  { text: "Exercise not to punish your body, but to celebrate what it can do.", author: 'Unknown' },
  { text: "Every rep is a vote for the person you want to become.", author: 'Unknown' },
  { text: "Small daily improvements lead to stunning long-term results.", author: 'Unknown' },
  { text: "You don't have to be great to start, but you have to start to be great.", author: 'Zig Ziglar' },
  { text: "Consistency over intensity — every single time.", author: 'Unknown' },
  { text: "The pain you feel today is the strength you'll feel tomorrow.", author: 'Unknown' },
  { text: "Your only competition is who you were yesterday.", author: 'Unknown' },
  { text: "Energy and persistence conquer all things.", author: 'Benjamin Franklin' },
  { text: "Champions aren't born. They're built — one rep at a time.", author: 'Unknown' },
]

// Returns a deterministic quote based on the calendar day — changes daily
function getDailyQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  )
  return QUOTES[dayOfYear % QUOTES.length]
}

// Gradient palettes that cycle every few days for visual freshness
const GRADIENTS = [
  'from-violet-500/20 via-primary/10 to-cyan-500/20',
  'from-emerald-500/20 via-primary/10 to-blue-500/20',
  'from-rose-500/20 via-orange-500/10 to-yellow-500/20',
  'from-cyan-500/20 via-primary/10 to-purple-500/20',
  'from-amber-500/20 via-primary/10 to-emerald-500/20',
]

export function MotivationCard() {
  const quote = useMemo(() => getDailyQuote(), [])
  const gradient = useMemo(() => {
    const idx = Math.floor(Date.now() / 86_400_000 / 2) % GRADIENTS.length
    return GRADIENTS[idx]
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative rounded-2xl border border-border bg-gradient-to-br ${gradient} p-5 overflow-hidden`}
    >
      {/* Decorative glow blob */}
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

      <div className="relative flex items-start gap-3">
        <div className="shrink-0 mt-0.5 w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            Daily Motivation
          </p>
          <p className="text-sm font-medium leading-relaxed text-foreground">
            &ldquo;{quote.text}&rdquo;
          </p>
          {quote.author !== 'Unknown' && (
            <p className="text-xs text-muted-foreground">— {quote.author}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
