import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] lg:h-screen max-w-2xl mx-auto px-4 py-6">
      <Skeleton className="h-8 w-32 rounded-xl mb-6" />
      {/* Message bubbles */}
      <div className="flex-1 space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-56 rounded-2xl" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-16 w-72 rounded-2xl" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40 rounded-2xl" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-24 w-80 rounded-2xl" />
        </div>
      </div>
      {/* Input */}
      <Skeleton className="h-14 w-full rounded-2xl mt-4" />
    </div>
  )
}
