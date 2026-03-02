import Link from 'next/link'
import { Activity } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background dot-grid">
      {/* Header */}
      <header className="flex items-center gap-2 px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#A78BFA] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Activity className="w-4.5 h-4.5 text-black" />
          </div>
          <span className="text-lg font-bold tracking-tight">FlowTrack</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FlowTrack · Built with ❤️ for lifters
      </footer>
    </div>
  )
}
