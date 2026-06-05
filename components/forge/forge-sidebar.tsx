'use client'

import { cn } from '@/lib/utils'
import { useForgeStore, moduleLabels, type ModuleId } from '@/lib/store'
import { 
  LayoutDashboard, 
  ClipboardList, 
  FileText, 
  Target, 
  GraduationCap, 
  Clock, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const moduleIcons: Record<ModuleId, React.ReactNode> = {
  'dashboard': <LayoutDashboard className="w-5 h-5" />,
  'planes': <ClipboardList className="w-5 h-5" />,
  'evaluaciones': <FileText className="w-5 h-5" />,
  'radar': <Target className="w-5 h-5" />,
  'formacion': <GraduationCap className="w-5 h-5" />,
  'prorrogas': <Clock className="w-5 h-5" />,
  'reportes': <BarChart3 className="w-5 h-5" />,
  'admin': <Settings className="w-5 h-5" />,
}

export function ForgeSidebar() {
  const { currentModule, setModule, sidebarCollapsed, toggleSidebar, getAccessibleModules, getFilteredPlans } = useForgeStore()
  const accessibleModules = getAccessibleModules()
  const planes = getFilteredPlans()
  
  // Contar planes activos (no cerrados)
  const planesActivos = planes.filter(p => !p.estado.startsWith('cerrado') && p.estado !== 'archivado' && p.estado !== 'borrador').length

  return (
    <aside 
      className={cn(
        "fixed top-14 left-0 bottom-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Collapse button */}
      <div className="p-2 flex justify-end border-b border-sidebar-border">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-surface-2 transition-colors text-muted-foreground"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Section label */}
      {!sidebarCollapsed && (
        <div className="px-6 pt-4 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Desempeno
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {accessibleModules.map((moduleId) => {
          const isActive = currentModule === moduleId
          const showBadge = moduleId === 'planes' && planesActivos > 0
          
          return (
            <button
              key={moduleId}
              onClick={() => setModule(moduleId)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <span className={cn(isActive && "text-primary")}>
                {moduleIcons[moduleId]}
              </span>
              {!sidebarCollapsed && (
                <>
                  <span className="text-[13px] font-medium truncate flex-1">
                    {moduleLabels[moduleId]}
                  </span>
                  {showBadge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary/20 text-primary">
                      {planesActivos}
                    </span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center">
            Modulo de Desempeno v1.0
          </p>
        </div>
      )}
    </aside>
  )
}
