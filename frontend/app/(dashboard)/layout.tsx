import { Sidebar } from '@/components/Sidebar'
import { TopNav } from '@/components/TopNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
          {children}
        </main>
      </div>
    </div>
  )
}
