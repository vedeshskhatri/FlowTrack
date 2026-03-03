import Link from 'next/link'
import { Activity } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-2 px-8 py-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-6 h-6 border border-foreground/20 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-foreground/60" />
          </div>
          <span
            className="font-bold tracking-[0.2em] text-[11px] uppercase text-foreground"
            style={{ fontFamily: 'var(--font-display, sans-serif)' }}
          >
            FlowTrack
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase">
          © {new Date().getFullYear()} FlowTrack · Built for athletes
        </p>
      </footer>
    </div>
  )
}
