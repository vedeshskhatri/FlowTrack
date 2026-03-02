import { Skeleton } from '@/components/ui/skeleton'

/**
 * Global loading state shown during top-level page navigations.
 * Each route group also has its own more granular loading.tsx.
 */
export default function Loading() {
  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <Skeleton className="h-10 w-48 rounded-xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <Skeleton className="h-52 w-full rounded-2xl" />
    </div>
  )
}
