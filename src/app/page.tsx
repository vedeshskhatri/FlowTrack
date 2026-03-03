import Link from 'next/link'
import { Activity, Zap, Brain, BarChart3, Upload, Shield, ArrowRight, TrendingUp, Users, Clock } from 'lucide-react'

const FEATURES = [
  { icon: Upload,    label: '01', title: 'UPLOAD & DEPLOY',    desc: 'Import your training CSV. AI-powered load suggestions surface instantly — no configuration required.' },
  { icon: Zap,       label: '02', title: 'LIVE TRACKING',      desc: 'Real-time set and rep counting with voice logging and precision rest timers. Every second tracked.' },
  { icon: Brain,     label: '03', title: 'AI INTELLIGENCE',    desc: 'Personalised coaching derived from your own performance data. Advice that evolves with you.' },
  { icon: BarChart3, label: '04', title: 'PROGRESS ANALYTICS', desc: 'Volume curves, 1RM projections, and progressive overload metrics rendered with editorial clarity.' },
  { icon: Shield,    label: '05', title: 'FULL OWNERSHIP',     desc: 'Export everything as CSV or PDF at any moment. Your data, your archive, your terms.' },
  { icon: Activity,  label: '06', title: 'ADAPTIVE PLANNING',  desc: 'Smart load calibration factoring hormonal cycles and recovery windows into every session.' },
]

const STATS = [
  { value: '100%', label: 'FREE FOREVER' },
  { value: '6+',   label: 'SMART FEATURES' },
  { value: '0',    label: 'ADS OR PAYWALLS' },
  { value: '∞',    label: 'DATA OWNERSHIP' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <header className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-6 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 border border-white/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold tracking-[0.2em] text-sm uppercase">FlowTrack</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-white/70 hover:text-white text-xs tracking-[0.15em] uppercase font-medium transition-colors">Features</Link>
          <Link href="#stats"    className="text-white/70 hover:text-white text-xs tracking-[0.15em] uppercase font-medium transition-colors">About</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-white/80 hover:text-white text-xs tracking-[0.15em] uppercase font-semibold transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="border border-white/60 text-white hover:bg-white hover:text-[#0A1628] px-5 py-2 text-xs tracking-[0.15em] uppercase font-semibold transition-all duration-300"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {/* Mountain background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80')`,
          }}
        />
        {/* Multi-stop navy overlay for editorial contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/70 to-[#0A1628]/30" />
        {/* Top atmospheric haze */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/50 to-transparent h-1/3" />

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-8 pb-28 md:pb-36">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-[1px] bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase font-semibold">Elite Workout Intelligence</span>
          </div>

          {/* Main title */}
          <h1
            className="text-white leading-[0.88] mb-8 font-bold uppercase tracking-[-0.01em]"
            style={{ fontSize: 'clamp(4rem, 11vw, 10rem)', fontFamily: 'var(--font-display, sans-serif)' }}
          >
            ELEVATE<br />
            <span
              className="block"
              style={{
                background: 'linear-gradient(135deg, #C9A84C 0%, #E8C870 50%, #A8893C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              YOUR
            </span>
            TRAINING
          </h1>

          <div className="flex flex-col sm:flex-row items-start gap-8">
            <p className="text-white/65 text-base leading-relaxed max-w-sm font-light">
              The workout platform built for athletes who refuse to plateau. Upload, track, analyse — with zero friction.
            </p>
            <div className="flex items-center gap-4 shrink-0 sm:ml-auto">
              <Link
                href="/signup"
                className="group flex items-center gap-3 bg-[#C9A84C] text-[#0A1628] px-7 py-4 text-xs tracking-[0.18em] uppercase font-bold hover:bg-[#E8C870] transition-all duration-300"
              >
                Begin Your Ascent
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="text-white/70 hover:text-white border border-white/25 hover:border-white/60 px-7 py-4 text-xs tracking-[0.18em] uppercase font-semibold transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
            <div className="w-[1px] h-12 bg-white/50 animate-pulse" />
            <span className="text-white/60 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          </div>
        </div>

        {/* Diagonal cut at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-background"
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}
        />
      </section>

      {/* ── Stats band ─────────────────────────────────────────────────────── */}
      <section id="stats" className="bg-[#0A1628] dark:bg-[#080E1A] py-16 relative">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/10">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center justify-center py-8 px-6 gap-2">
                <span
                  className="font-bold text-[#C9A84C] leading-none"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontFamily: 'var(--font-display, sans-serif)' }}
                >
                  {value}
                </span>
                <span className="text-white/40 text-[10px] tracking-[0.25em] uppercase font-semibold text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Diagonal cut bottom */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-background"
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 30%, 0 100%)' }}
        />
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-32 max-w-[1400px] mx-auto px-8">
        {/* Section header */}
        <div className="flex items-start justify-between mb-20 flex-col md:flex-row gap-8">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[1px] bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-[10px] tracking-[0.3em] uppercase font-bold">Capabilities</span>
            </div>
            <h2
              className="font-bold uppercase text-foreground leading-[0.9]"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: 'var(--font-display, sans-serif)', letterSpacing: '-0.01em' }}
            >
              THE COMPLETE<br />SYSTEM
            </h2>
          </div>
          <p className="text-muted-foreground max-w-xs leading-relaxed text-sm font-light md:text-right md:self-end">
            Six precision-engineered features form a complete performance intelligence ecosystem.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {FEATURES.map(({ icon: Icon, label, title, desc }) => (
            <div
              key={title}
              className="group bg-background hover:bg-[#0A1628] dark:hover:bg-[#0D1829] p-8 flex flex-col gap-6 transition-all duration-400 cursor-default"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#C9A84C] text-[10px] tracking-[0.3em] uppercase font-bold">{label}</span>
                <div className="w-8 h-8 border border-border group-hover:border-[#C9A84C]/40 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-[#C9A84C] transition-colors" />
                </div>
              </div>
              <div>
                <h3
                  className="font-bold uppercase text-foreground group-hover:text-white mb-3 leading-tight tracking-wide transition-colors"
                  style={{ fontSize: '0.875rem', letterSpacing: '0.08em', fontFamily: 'var(--font-display, sans-serif)' }}
                >
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light group-hover:text-white/60 transition-colors">
                  {desc}
                </p>
              </div>
              <div className="mt-auto w-0 group-hover:w-8 h-[1px] bg-[#C9A84C] transition-all duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Manifesto / CTA ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0A1628] dark:bg-[#060C18]">
        {/* Diagonal top cut */}
        <div className="absolute top-0 inset-x-0 h-20 bg-background"
          style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
        />

        <div className="max-w-[1400px] mx-auto px-8 py-40 text-center relative z-10">
          {/* Decorative mountain silhouette via CSS */}
          <div className="absolute inset-x-0 bottom-0 opacity-5">
            <svg viewBox="0 0 1440 300" className="w-full" preserveAspectRatio="none">
              <path d="M0,300 L240,80 L480,180 L720,20 L960,160 L1200,60 L1440,140 L1440,300 Z" fill="white" />
            </svg>
          </div>

          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-[1px] bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-[10px] tracking-[0.3em] uppercase font-bold">Begin</span>
            <div className="w-12 h-[1px] bg-[#C9A84C]" />
          </div>

          <h2
            className="text-white font-bold uppercase leading-[0.88] mb-8"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', fontFamily: 'var(--font-display, sans-serif)', letterSpacing: '-0.01em' }}
          >
            READY TO<br />
            <span style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #E8C870 60%, #A8893C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              SUMMIT
            </span>
          </h2>

          <p className="text-white/50 text-base font-light max-w-md mx-auto mb-12 leading-relaxed">
            Join athletes who train with precision, track with clarity, and grow with intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-3 bg-[#C9A84C] text-[#0A1628] px-10 py-4 text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#E8C870] transition-all duration-300"
            >
              Create Free Account
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="text-white/60 hover:text-white border border-white/20 hover:border-white/50 px-10 py-4 text-xs tracking-[0.2em] uppercase font-semibold transition-all duration-300"
            >
              Already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[#060C18] border-t border-white/5 py-10">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border border-white/20 flex items-center justify-center">
              <Activity className="w-3 h-3 text-white/40" />
            </div>
            <span className="text-white/40 text-[10px] tracking-[0.2em] uppercase font-semibold">FlowTrack</span>
          </div>
          <p className="text-white/25 text-[10px] tracking-[0.15em] uppercase">
            © {new Date().getFullYear()} FlowTrack · Built for athletes, by athletes
          </p>
          <div className="flex items-center gap-6">
            <Link href="/login"  className="text-white/30 hover:text-white/60 text-[10px] tracking-[0.15em] uppercase transition-colors">Sign In</Link>
            <Link href="/signup" className="text-white/30 hover:text-white/60 text-[10px] tracking-[0.15em] uppercase transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
