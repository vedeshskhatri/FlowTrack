import Link from 'next/link'
import { Activity, Zap, Brain, BarChart3, Upload, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FEATURES = [
  { icon: Upload,    title: 'Upload & Go',         desc: 'Drop your CSV, get AI-powered load suggestions in seconds.' },
  { icon: Zap,       title: 'Live Tracking',        desc: 'Real-time set/rep counter with voice logging and timers.' },
  { icon: Brain,     title: 'AI Coach',             desc: 'Personalised advice powered by your own data.' },
  { icon: BarChart3, title: 'Progress Insights',    desc: 'Volume trends, 1RM estimates, progressive overload.' },
  { icon: Shield,    title: 'Full Data Ownership',  desc: 'Export everything as CSV or PDF anytime. No lock-in.' },
  { icon: Activity,  title: 'Cycle-Aware Planning', desc: 'Smart load adjustments for hormonal cycle phases.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background dot-grid">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#A78BFA] flex items-center justify-center">
            <Activity className="w-5 h-5 text-black" />
          </div>
          <span className="text-lg font-bold">FlowTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild><Link href="/login">Sign in</Link></Button>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/signup">Get started free</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs text-primary font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Free forever · No paywall · Full data ownership
        </div>

        <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.1]">
          The workout app<br />
          <span className="gradient-text">Reddit wished existed</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload your plan, track sets live, get AI coaching, and watch your strength grow.
          Minimal, beautiful, and completely yours.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 h-12 text-base glow-cyan"
          >
            <Link href="/signup">Start tracking free</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 text-base px-8">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-6 card-hover space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center space-y-4">
        <h2 className="text-3xl font-bold">Ready to level up?</h2>
        <p className="text-muted-foreground">Join thousands of athletes who train smarter with FlowTrack.</p>
        <Button
          asChild
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-10 h-12"
        >
          <Link href="/signup">Create your free account</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FlowTrack · Built for lifters, by lifters
      </footer>
    </div>
  )
}

