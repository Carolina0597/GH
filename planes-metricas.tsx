'use client'

import { useForgeStore } from '@/lib/store'
import { ForgeTopbar } from './forge-topbar'
import { ForgeSidebar } from './forge-sidebar'

export function ForgeLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useForgeStore()
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ForgeTopbar />
      <div className="flex flex-1" style={{ paddingTop: '56px' }}>
        <ForgeSidebar />
        <main
          className="flex-1 overflow-y-auto p-8 transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? '64px' : '240px' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
