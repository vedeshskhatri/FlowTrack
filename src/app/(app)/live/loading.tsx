import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-32 rounded-xl" />
        <Skeleton className="h-6 w-16 rounded-full ml-auto" />
      </div>
      {/* Exercise card skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
