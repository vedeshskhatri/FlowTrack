'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Mail, Lock, Chrome, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const supabase = createClient()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

    if (error) toast.error(error.message)
    else setDone(true)

    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3
  const STRENGTH_LABELS = ['', 'Weak', 'Good', 'Strong']
  const STRENGTH_COLORS = ['', 'bg-rose-400', 'bg-[#C9A84C]', 'bg-[#C9A84C]']
  const STRENGTH_TEXT   = ['', 'text-rose-400', 'text-[#C9A84C]', 'text-[#C9A84C]']

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-[1px] bg-[#C9A84C]" />
          <span className="text-[#C9A84C] text-[10px] font-bold tracking-[0.25em] uppercase">Confirmed</span>
        </div>
        <div className="w-8 h-8 border border-[#C9A84C]/40 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
        </div>
        <h1
          className="font-bold uppercase text-foreground"
          style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display, sans-serif)' }}
        >
          Check Your Inbox
        </h1>
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          We sent a confirmation link to <strong className="text-foreground font-semibold">{email}</strong>. Click the link to activate your account.
        </p>
        <Link
          href="/login"
          className="inline-block text-[10px] text-[#C9A84C] hover:text-[#E8C870] tracking-[0.2em] uppercase font-bold transition-colors mt-2"
        >
          ↩ Back to sign in
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-[1px] bg-[#C9A84C]" />
          <span className="text-[#C9A84C] text-[10px] font-bold tracking-[0.25em] uppercase">Register</span>
        </div>
        <h1
          className="font-bold uppercase text-foreground leading-tight mb-1"
          style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display, sans-serif)', letterSpacing: '-0.01em' }}
        >
          Begin Your Ascent
        </h1>
        <p className="text-muted-foreground text-sm font-light">Free forever · No credit card required</p>
      </div>

      <div className="space-y-5">
        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-border hover:border-foreground/40 py-3 text-xs tracking-[0.12em] uppercase font-semibold text-foreground transition-all duration-200 disabled:opacity-50"
        >
          <Chrome className="w-4 h-4" />
          Continue with Google
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-medium">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-9 rounded-none border-border focus:border-[#C9A84C] focus:ring-[#C9A84C]/20 h-10 text-sm"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                className="pl-9 pr-10 rounded-none border-border focus:border-[#C9A84C] focus:ring-[#C9A84C]/20 h-10 text-sm"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {/* Strength indicator */}
            {password.length > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex gap-0.5 flex-1">
                  {[1, 2, 3].map(level => (
                    <div
                      key={level}
                      className={`h-0.5 flex-1 transition-all duration-300 ${
                        strength >= level ? STRENGTH_COLORS[strength] : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wide ${STRENGTH_TEXT[strength]}`}>
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-foreground text-background text-xs tracking-[0.18em] uppercase font-bold hover:opacity-85 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-[10px] text-muted-foreground leading-relaxed tracking-wide">
          By registering you agree to our{' '}
          <span className="underline cursor-pointer hover:text-foreground transition-colors">Terms of Service</span>
          {' '}and{' '}
          <span className="underline cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>.
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-[11px] text-muted-foreground tracking-wide">
          Already have an account?{' '}
          <Link href="/login" className="text-[#C9A84C] hover:text-[#E8C870] font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
