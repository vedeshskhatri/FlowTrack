import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
      <div className="space-y-6 max-w-sm">
        {/* Large 404 */}
        <div className="relative select-none">
          <span
            className="text-[8rem] font-black leading-none tracking-tight gradient-text"
            aria-hidden="true"
          >
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="text-muted-foreground text-sm">
            The page you&apos;re looking for doesn&apos;t exist, or you may have followed a broken link.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-cyan-400 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
