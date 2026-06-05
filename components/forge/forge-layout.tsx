'use client'

import { useForgeStore } from '@/lib/store'
import { ForgeTopbar } from './forge-topbar'
import { ForgeSidebar } from './forge-sidebar'
import { cn } from '@/lib/utils'

interface ForgeLayoutProps {
  children: React.ReactNode
}

export function ForgeLayout({ children }: ForgeLayoutProps) {
  const { sidebarCollapsed } = useForgeStore()
  
  return (
    <div className="min-h-screen bg-background">
      <ForgeTopbar />
      <div className="flex pt-14">
        <ForgeSidebar />
        <main className={cn(
          "flex-1 p-8 min-h-[calc(100vh-56px)] transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-60"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}
