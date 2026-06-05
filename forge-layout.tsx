'use client'

import { useForgeStore } from '@/lib/store'
import { ForgeTopbar } from './forge-topbar'
import { ForgeSidebar } from './forge-sidebar'

export function ForgeLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useForgeStore()
  const sideW = sidebarCollapsed ? 64 : 240

  return (
    <div style={{ minHeight:'100vh', background:'hsl(var(--background))' }}>
      <ForgeTopbar />
      <ForgeSidebar />
      <main style={{
        marginTop: 56,
        marginLeft: sideW,
        padding: '32px',
        minHeight: 'calc(100vh - 56px)',
        overflowY: 'auto',
        transition: 'margin-left 0.3s',
      }}>
        {children}
      </main>
    </div>
  )
}
