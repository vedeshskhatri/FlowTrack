'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to an error tracking service in production
    console.error('[FlowTrack] Unhandled error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-[#0A0A0A] text-white">
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div className="space-y-5 max-w-sm">
            <div className="text-6xl font-black leading-none bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Oops
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold">Something went wrong</h1>
              <p className="text-sm text-zinc-400">
                An unexpected error occurred. Your workout data is safe.
              </p>
              {error.digest && (
                <p className="text-xs text-zinc-600 font-mono">ID: {error.digest}</p>
              )}
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-cyan-400 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
