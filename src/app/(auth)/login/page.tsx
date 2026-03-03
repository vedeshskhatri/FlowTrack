'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Mail, Lock, Chrome } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  /* ── Email / password sign-in ── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  /* ── Magic link ── */
  async function handleMagicLink() {
    if (!email) { toast.error('Enter your email first'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) toast.error(error.message)
    else { setMagicSent(true); toast.success('Magic link sent! Check your inbox.') }
    setLoading(false)
  }

  /* ── Google OAuth ── */
  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
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
          <span className="text-[#C9A84C] text-[10px] font-bold tracking-[0.25em] uppercase">Access</span>
        </div>
        <h1
          className="font-bold uppercase text-foreground leading-tight mb-1"
          style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display, sans-serif)', letterSpacing: '-0.01em' }}
        >
          Welcome Back
        </h1>
        <p className="text-muted-foreground text-sm font-light">Sign in to your FlowTrack account</p>
      </div>

      {magicSent ? (
        <div className="border border-[#C9A84C]/30 bg-[#C9A84C]/5 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-[1px] bg-[#C9A84C]" />
            <Mail className="w-4 h-4 text-[#C9A84C]" />
          </div>
          <p className="font-semibold text-sm tracking-wide">Check your inbox</p>
          <p className="text-xs text-muted-foreground leading-relaxed font-light">
            We sent a magic link to <strong className="text-foreground font-semibold">{email}</strong>. It expires in 1 hour.
          </p>
          <button
            onClick={() => setMagicSent(false)}
            className="text-[10px] text-muted-foreground hover:text-foreground tracking-[0.15em] uppercase font-semibold transition-colors mt-1"
          >
            Try another method
          </button>
        </div>
      ) : (
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

          {/* Email / password form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="••••••••"
                  className="pl-9 pr-10 rounded-none border-border focus:border-[#C9A84C] focus:ring-[#C9A84C]/20 h-10 text-sm"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-foreground text-background text-xs tracking-[0.18em] uppercase font-bold hover:opacity-85 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          {/* Magic link */}
          <button
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full py-2 text-[10px] text-muted-foreground hover:text-foreground tracking-[0.15em] uppercase font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Mail className="w-3 h-3" />
            Send magic link instead
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-[11px] text-muted-foreground tracking-wide">
          New here?{' '}
          <Link href="/signup" className="text-[#C9A84C] hover:text-[#E8C870] font-semibold transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
