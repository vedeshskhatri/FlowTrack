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

// Gradient palettes kept for potential future use
const _GRADIENTS = [
  'from-violet-500/20 via-primary/10 to-cyan-500/20',
]

export function MotivationCard() {
  const quote = useMemo(() => getDailyQuote(), [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative border border-border bg-card overflow-hidden"
    >
      {/* Gold top bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#C9A84C]/60 via-[#E8C870]/40 to-transparent" />

      <div className="relative p-5 flex items-start gap-4">
        <div className="shrink-0 w-7 h-7 border border-[#C9A84C]/30 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-[1px] bg-[#C9A84C]/60" />
            <p className="text-[#C9A84C] text-[9px] font-bold uppercase tracking-[0.25em]">
              Daily Dispatch
            </p>
          </div>
          <p className="text-sm font-light leading-relaxed text-foreground italic">
            &ldquo;{quote.text}&rdquo;
          </p>
          {quote.author !== 'Unknown' && (
            <p className="text-[10px] text-muted-foreground tracking-wide font-medium">— {quote.author}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
