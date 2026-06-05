'use client'

import { useState, useMemo } from 'react'
import { useForgeStore, type Plan, type PlanType, type PlanStatus, type Criticidad, type EjePrincipal, planStatusLabels, planStatusColors, criticidadLabels, criticidadColors, ejeLabels, ejeColors, roleLabels } from '@/lib/store'
import { ForgeCard, ForgeCardHeader, PageHeader, StatCard, ProgressBar, ForgeBadge, EmptyState } from '@/components/forge/forge-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Plus, Search, Download, AlertTriangle, Clock, CheckCircle2, 
  XCircle, TrendingUp, Calendar, User, Target, Eye, Edit, MoreHorizontal, 
  ArrowUpRight, BarChart3, FileText
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { PlanWizard } from './plan-wizard'
import { PlanDetail } from './plan-detail'
import { PlanesMetricas } from './planes-metricas'

// Solo 4 tabs: Activos, Cerrados, Metricas, Descargar
const tabLabels: Record<string, string> = {
  activos: 'Planes activos',
  cerrados: 'Cerrados',
  metricas: 'Metricas',
  descargar: 'Descargar',
}

export function PlanesModule() {
  const { currentRole, getFilteredPlans, getPlanPermissions, talentos, lideres } = useForgeStore()
  const permissions = getPlanPermissions()
  const planes = getFilteredPlans()
  
  const [activeTab, setActiveTab] = useState('activos')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [showExplainer, setShowExplainer] = useState(true)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState<'todos' | 'mejora' | 'desarrollo'>('todos')
  const [filterEstado, setFilterEstado] = useState<string>('todos')
  const [filterEje, setFilterEje] = useState<string>('todos')
  
  // Filtrar planes segun tab y filtros
  const filteredPlans = useMemo(() => {
    let result = planes
    
    // Filtro por tab
    if (activeTab === 'activos') {
      result = result.filter(p => ['activo', 'en_progreso', 'ampliado', 'en_riesgo', 'borrador'].includes(p.estado))
    } else if (activeTab === 'cerrados') {
      result = result.filter(p => p.estado.startsWith('cerrado') || p.estado === 'archivado')
    }
    
    // Filtro por tipo
    if (filterTipo !== 'todos') {
      result = result.filter(p => p.tipo === filterTipo)
    }
    
    // Filtro por estado - ahora funciona con todos los estados
    if (filterEstado !== 'todos') {
      result = result.filter(p => p.estado === filterEstado)
    }
    
    // Filtro por eje
    if (filterEje !== 'todos') {
      result = result.filter(p => p.ejes?.includes(filterEje as EjePrincipal) || p.ejePrincipal === filterEje)
    }
    
    // Busqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(p => 
        p.talento.nombre.toLowerCase().includes(term) ||
        p.lider.nombre.toLowerCase().includes(term) ||
        p.subtipo.toLowerCase().includes(term)
      )
    }
    
    return result
  }, [planes, activeTab, filterTipo, filterEstado, filterEje, searchTerm])
  
  // Metricas rapidas
  const metricas = useMemo(() => {
    const activos = planes.filter(p => ['activo', 'en_progreso', 'ampliado'].includes(p.estado))
    const enRiesgo = planes.filter(p => p.estado === 'en_riesgo' || p.criticidad === 'critica')
    const cerradosSuperados = planes.filter(p => p.estado === 'cerrado_superado')
    const cerradosNoSuperados = planes.filter(p => p.estado === 'cerrado_no_superado')
    const borradores = planes.filter(p => p.estado === 'borrador')
    const mejora = planes.filter(p => p.tipo === 'mejora')
    const desarrollo = planes.filter(p => p.tipo === 'desarrollo')
    
    return {
      total: planes.length,
      activos: activos.length,
      enRiesgo: enRiesgo.length,
      cerradosSuperados: cerradosSuperados.length,
      cerradosNoSuperados: cerradosNoSuperados.length,
      borradores: borradores.length,
      mejora: mejora.length,
      desarrollo: desarrollo.length,
      avancePromedio: activos.length > 0 ? Math.round(activos.reduce((acc, p) => acc + p.avance, 0) / activos.length) : 0,
    }
  }, [planes])

  // Si se selecciono un plan, mostrar el detalle
  if (selectedPlanId) {
    const plan = planes.find(p => p.id === selectedPlanId)
    if (plan) {
      return (
        <PlanDetail 
          plan={plan} 
          onBack={() => setSelectedPlanId(null)} 
          onEdit={() => {
            setEditingPlan(plan)
            setSelectedPlanType(plan.tipo)
            setSelectedPlanId(null)
          }}
        />
      )
    }
  }
  
  // Si se esta creando o editando un plan, mostrar el wizard
  if (selectedPlanType) {
    return (
      <PlanWizard 
        tipo={selectedPlanType}
        planToEdit={editingPlan}
        onCancel={() => {
          setSelectedPlanType(null)
          setEditingPlan(null)
          setShowCreateDialog(false)
        }}
        onComplete={() => {
          setSelectedPlanType(null)
          setEditingPlan(null)
          setShowCreateDialog(false)
        }}
      />
    )
  }

  // Estados disponibles para filtrar
  const estadosDisponibles = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'activo', label: 'Activo' },
    { value: 'en_progreso', label: 'En progreso' },
    { value: 'borrador', label: 'Borrador' },
    { value: 'en_riesgo', label: 'En riesgo' },
    { value: 'ampliado', label: 'Ampliado' },
    { value: 'cerrado_superado', label: 'Cerrado superado' },
    { value: 'cerrado_no_superado', label: 'Cerrado no superado' },
  ]

  return (
    <div>
      <PageHeader 
        title="Planes de Mejora y Desarrollo"
        subtitle="Gestion centralizada de planes de mejora y desarrollo para el talento."
        actions={
          permissions.crear && (
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Crear plan
            </Button>
          )
        }
      />

      {/* Explicador colapsable */}
      {showExplainer && (
        <ForgeCard className="mb-6 relative">
          <button 
            onClick={() => setShowExplainer(false)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          >
            <XCircle className="w-4 h-4" />
          </button>
          <ForgeCardHeader title="Diferencia entre plan de mejora y plan de desarrollo" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="font-semibold text-amber-400">Plan de mejora</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Se usa cuando el desempeno, comportamiento o resultado esta por debajo de lo esperado.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['Bajo cumplimiento', 'Comportamientos a corregir', 'Prorroga de contrato'].map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{tag}</span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Plan de desarrollo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Se usa para potenciar habilidades, fortalecer competencias o preparar crecimiento profesional.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['Potencial de liderazgo', 'Ascenso', 'Especializacion'].map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </ForgeCard>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Planes activos" value={metricas.activos} color="primary" meta={`${metricas.mejora} mejora / ${metricas.desarrollo} desarrollo`} />
        <StatCard label="En riesgo" value={metricas.enRiesgo} color="warning" />
        <StatCard label="Cerrados superados" value={metricas.cerradosSuperados} color="success" />
        <StatCard label="Cerrados no superados" value={metricas.cerradosNoSuperados} color="accent" />
        <StatCard label="Avance promedio" value={`${metricas.avancePromedio}%`} color="primary" />
      </div>

      {/* Tabs - Solo 4: Activos, Cerrados, Metricas, Descargar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="activos">Planes activos</TabsTrigger>
            <TabsTrigger value="cerrados">Cerrados</TabsTrigger>
            <TabsTrigger value="metricas">Metricas</TabsTrigger>
            <TabsTrigger value="descargar">Descargar</TabsTrigger>
          </TabsList>
        </div>

        {/* Filtros - Solo para tabs de listado */}
        {(activeTab === 'activos' || activeTab === 'cerrados') && (
          <ForgeCard className="mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por talento, lider..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <Select value={filterTipo} onValueChange={(v) => setFilterTipo(v as typeof filterTipo)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="mejora">Mejora</SelectItem>
                  <SelectItem value="desarrollo">Desarrollo</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosDisponibles.map(e => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterEje} onValueChange={setFilterEje}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Ejes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los ejes</SelectItem>
                  <SelectItem value="ser">Ser</SelectItem>
                  <SelectItem value="saber">Saber</SelectItem>
                  <SelectItem value="hacer">Hacer</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>
          </ForgeCard>
        )}

        <TabsContent value="activos">
          {filteredPlans.length === 0 ? (
            <EmptyState 
              icon={<FileText className="w-12 h-12" />}
              title="No hay planes activos"
              description="Crea un nuevo plan para comenzar el seguimiento."
            />
          ) : (
            <div className="space-y-3">
              {filteredPlans.map(plan => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  onView={() => setSelectedPlanId(plan.id)}
                  onEdit={() => {
                    setEditingPlan(plan)
                    setSelectedPlanType(plan.tipo)
                  }}
                  permissions={permissions}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cerrados">
          {filteredPlans.length === 0 ? (
            <EmptyState 
              icon={<CheckCircle2 className="w-12 h-12" />}
              title="No hay planes cerrados"
              description="Los planes cerrados apareceran aqui."
            />
          ) : (
            <div className="space-y-3">
              {filteredPlans.map(plan => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  onView={() => setSelectedPlanId(plan.id)}
                  onEdit={() => {
                    setEditingPlan(plan)
                    setSelectedPlanType(plan.tipo)
                  }}
                  permissions={permissions}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="metricas">
          <PlanesMetricas planes={planes} />
        </TabsContent>

        <TabsContent value="descargar">
          <ForgeCard>
            <ForgeCardHeader title="Descargar reportes" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="p-4 rounded-lg bg-surface-2 border border-border hover:border-primary/50 transition-colors text-left">
                <Download className="w-6 h-6 text-primary mb-2" />
                <h3 className="font-medium mb-1">Listado de planes activos</h3>
                <p className="text-xs text-muted-foreground">Excel con todos los planes activos y su estado actual</p>
              </button>
              <button className="p-4 rounded-lg bg-surface-2 border border-border hover:border-primary/50 transition-colors text-left">
                <Download className="w-6 h-6 text-primary mb-2" />
                <h3 className="font-medium mb-1">Historico de planes</h3>
                <p className="text-xs text-muted-foreground">Excel con todos los planes cerrados y su resultado</p>
              </button>
              <button className="p-4 rounded-lg bg-surface-2 border border-border hover:border-primary/50 transition-colors text-left">
                <Download className="w-6 h-6 text-primary mb-2" />
                <h3 className="font-medium mb-1">Reporte de cumplimiento</h3>
                <p className="text-xs text-muted-foreground">Metricas de cumplimiento por area y lider</p>
              </button>
            </div>
          </ForgeCard>
        </TabsContent>
      </Tabs>

      {/* Dialog para seleccionar tipo de plan */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Que tipo de plan quieres crear?</DialogTitle>
            <DialogDescription>
              Selecciona el tipo de plan segun la situacion del talento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-4 py-4">
            <div 
              onClick={() => {
                setSelectedPlanType('mejora')
                setShowCreateDialog(false)
              }}
              className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 hover:border-amber-500 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="font-semibold text-amber-400">Plan de mejora</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Para acompanar situaciones donde el desempeno, comportamiento o resultado esta por debajo de lo esperado.
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {['Bajo cumplimiento', 'Prorroga contrato', 'Comportamientos'].map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{tag}</span>
                ))}
              </div>
              <div className="w-full py-2 px-4 border border-amber-500/50 text-amber-300 rounded-md text-center text-sm font-medium hover:bg-amber-500/20">
                Crear plan de mejora
              </div>
            </div>
            
            <div 
              onClick={() => {
                setSelectedPlanType('desarrollo')
                setShowCreateDialog(false)
              }}
              className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 hover:border-emerald-500 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Plan de desarrollo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Para potenciar habilidades, fortalecer competencias o preparar crecimiento profesional.
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {['Liderazgo', 'Ascenso', 'Especializacion'].map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">{tag}</span>
                ))}
              </div>
              <div className="w-full py-2 px-4 border border-emerald-500/50 text-emerald-300 rounded-md text-center text-sm font-medium hover:bg-emerald-500/20">
                Crear plan de desarrollo
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente PlanCard
interface PlanCardProps {
  plan: Plan
  onView: () => void
  onEdit: () => void
  permissions: { ver: boolean; crear: boolean; editar: boolean; cerrar: boolean }
}

function PlanCard({ plan, onView, onEdit, permissions }: PlanCardProps) {
  const actividadesPendientes = plan.actividades.filter(a => a.estado === 'pendiente' || a.estado === 'en_progreso').length
  
  return (
    <ForgeCard className="hover:border-primary/30 transition-colors cursor-pointer" onClick={onView}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-white shrink-0">
          {plan.talento.avatar}
        </div>
        
        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{plan.talento.nombre}</h3>
            <ForgeBadge color={plan.tipo === 'mejora' ? 'yellow' : 'green'}>
              {plan.tipo === 'mejora' ? 'Mejora' : 'Desarrollo'}
            </ForgeBadge>
            <ForgeBadge color={planStatusColors[plan.estado]}>
              {planStatusLabels[plan.estado]}
            </ForgeBadge>
            <ForgeBadge color={criticidadColors[plan.criticidad]}>
              {criticidadLabels[plan.criticidad]}
            </ForgeBadge>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {plan.lider.nombre}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {plan.fechaInicio} - {plan.fechaFinInicial}
            </span>
            {actividadesPendientes > 0 && (
              <span className="flex items-center gap-1 text-amber-400">
                <Target className="w-3 h-3" />
                {actividadesPendientes} actividades pendientes
              </span>
            )}
          </div>
          
          {/* Ejes */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-muted-foreground">Ejes:</span>
            {(plan.ejes || [plan.ejePrincipal]).map(eje => (
              <span 
                key={eje} 
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full',
                  eje === 'ser' ? 'bg-purple-500/20 text-purple-300' :
                  eje === 'saber' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-emerald-500/20 text-emerald-300'
                )}
              >
                {ejeLabels[eje]}
              </span>
            ))}
          </div>
          
          {/* Barra de progreso */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar value={plan.avance} max={100} />
            </div>
            <span className="text-sm font-medium w-12 text-right">{plan.avance}%</span>
          </div>
        </div>
        
        {/* Acciones */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye className="w-4 h-4" />
          </Button>
          {permissions.editar && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-md hover:bg-accent inline-flex items-center justify-center">
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="w-4 h-4 mr-2" />
                Ver detalle
              </DropdownMenuItem>
              {permissions.editar && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar plan
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </ForgeCard>
  )
}
