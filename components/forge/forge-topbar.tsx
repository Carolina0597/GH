'use client'

import { useForgeStore, roleLabels, type RoleType } from '@/lib/store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'

export function ForgeTopbar() {
  const { currentRole, setRole } = useForgeStore()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 border-b border-border backdrop-blur-xl flex items-center px-6 gap-4">
      {/* Logo */}
      <div className="text-lg font-bold text-primary tracking-tight">
        Forge <span className="text-muted-foreground font-light">· TH Central</span>
      </div>
      <span className="text-border">›</span>
      <span className="text-sm text-muted-foreground">Modulo de Desempeno</span>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Role selector */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Cambiar rol:</span>
          <Select value={currentRole} onValueChange={(v) => setRole(v as RoleType)}>
            <SelectTrigger className="h-7 w-[180px] text-xs bg-surface-2 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(roleLabels).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notifications placeholder */}
        <button className="relative p-2 rounded-lg hover:bg-surface-2 transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Current role badge */}
        <Badge variant="secondary" className="text-xs px-2.5 py-1 bg-surface-3">
          {roleLabels[currentRole]}
        </Badge>

        {/* Avatar placeholder */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white cursor-pointer">
          US
        </div>
      </div>
    </header>
  )
}
