'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Route-level error boundary for the authenticated app segment.
 * Shown when a page inside (app)/ throws during render or a Server Action fails.
 */
export default function AppError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[FlowTrack] Page error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="space-y-5 max-w-sm">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            {error.message?.includes('fetch') || error.message?.includes('network')
              ? 'Network error — check your connection and try again.'
              : 'An unexpected error occurred on this page.'}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/50 font-mono">ref: {error.digest}</p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold">
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
