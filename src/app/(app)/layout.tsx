import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { MobileHeader } from '@/components/layout/MobileHeader'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile top header */}
      <MobileHeader />

      {/* Main content */}
      <main className="lg:pl-64">
        {/* top padding for mobile header, bottom padding for bottom nav */}
        <div className="pt-16 lg:pt-0 pb-24 lg:pb-0 min-h-screen">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
