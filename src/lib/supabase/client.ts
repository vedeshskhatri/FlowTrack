import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in browser / Client Components.
 * Call this inside components — do NOT cache the return value at module level.
 *
 * Fallback placeholder values are used during SSR/prerendering so the build
 * does not crash when environment variables are not yet injected (e.g. first
 * Vercel deployment before env vars are configured). The real values from
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are always used
 * in actual browser sessions.
 */
export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321'
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

  return createBrowserClient(url, key)
}
