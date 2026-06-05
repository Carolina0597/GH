'use client'

import { useForgeStore, moduleLabels, type ModuleId } from '@/lib/store'
import { ForgeTopbar } from './forge-topbar'
import { ForgeSidebar } from './forge-sidebar'
import { LayoutDashboard, ClipboardList, FileText, Target, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNav: { id: ModuleId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',    label: 'Inicio',       icon: <LayoutDashboard className="w-5 h-5"/> },
  { id: 'planes',       label: 'Planes',       icon: <ClipboardList className="w-5 h-5"/> },
  { id: 'evaluaciones', label: 'Evaluaciones', icon: <FileText className="w-5 h-5"/> },
  { id: 'radar',        label: 'Radar',        icon: <Target className="w-5 h-5"/> },
  { id: 'reportes',     label: 'Reportes',     icon: <BarChart3 className="w-5 h-5"/> },
]

export function ForgeLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, currentModule, setModule } = useForgeStore()
  const sideW = sidebarCollapsed ? 64 : 240

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
      <ForgeTopbar />
      <ForgeSidebar />

      {/* Main content */}
      <main
        id="forge-main"
        style={{
          marginTop: 56,
          marginLeft: sideW,
          padding: '32px',
          minHeight: 'calc(100vh - 56px)',
          overflowY: 'auto',
          transition: 'margin-left 0.3s',
          paddingBottom: '80px', // space for mobile nav
        }}
      >
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav
        id="mobile-nav"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 100,
          background: 'hsl(222, 47%, 9%)',
          borderTop: '1px solid hsl(222, 30%, 20%)',
          padding: '8px 0 12px',
        }}
      >
        {mobileNav.map(item => {
          const active = currentModule === item.id
          return (
            <button
              key={item.id}
              onClick={() => setModule(item.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0',
                color: active ? 'hsl(217, 91%, 65%)' : 'hsl(215, 20%, 55%)',
                transition: 'color 0.15s',
              }}
            >
              {item.icon}
              <span style={{ fontSize: '9px', fontWeight: 500 }}>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
