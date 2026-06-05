'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  useForgeStore, roleLabels, getEncuestasMock, getLanzamientosMock,
  type Encuesta, type LanzamientoEncuesta, type TipoEncuesta, type EstadoEncuesta,
  type ParticipanteLanzamiento
} from '@/lib/store'
import { ForgeCard, PageHeader, StatCard, Badge, EmptyState } from '@/components/forge/forge-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  Plus, Search, FileText, Users, BarChart3, Download, Play, Eye, Edit,
  MoreHorizontal, Calendar, Target, CheckCircle2, Clock, AlertTriangle,
  ClipboardList, TrendingUp, ArrowRight, Copy, Send, ChevronRight,
  ChevronDown, Sparkles, Inbox, History, ClipboardCheck, UserCheck,
  Lock, Star
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { EncuestaEditor } from './encuesta-editor'
import { EncuestaResultados } from './encuesta-resultados'
import { LanzamientoDetail } from './lanzamiento-detail'

// ─── Labels ─────────────────────────────────────────────────────────────────

const tipoEncuestaLabels: Record<TipoEncuesta, string> = {
  lider_colaborador: 'Lider a Colaborador',
  lider_lider: 'Lider a Lider',
  colaborador_lider: 'Colaborador a Lider',
  autoevaluacion: 'Autoevaluacion',
  area_interaccion: 'Area con mayor interaccion',
  transversal: 'Areas transversales',
  prorroga: 'Evaluacion de prorroga',
  '4d_triadas': '4D / Triadas',
}

const estadoColors: Record<EstadoEncuesta, string> = {
  borrador: 'bg-slate-500/20 text-slate-300',
  activa: 'bg-emerald-500/20 text-emerald-300',
  programada: 'bg-blue-500/20 text-blue-300',
  en_curso: 'bg-amber-500/20 text-amber-300',
  cerrada: 'bg-purple-500/20 text-purple-300',
  archivada: 'bg-gray-500/20 text-gray-400',
}

const estadoLabels: Record<EstadoEncuesta, string> = {
  borrador: 'Borrador', activa: 'Activa', programada: 'Programada',
  en_curso: 'En curso', cerrada: 'Cerrada', archivada: 'Archivada',
}

const lanzEstadoColors: Record<string, string> = {
  pendiente: 'bg-slate-500/20 text-slate-300',
  en_curso: 'bg-amber-500/20 text-amber-300',
  cerrado: 'bg-emerald-500/20 text-emerald-300',
  cancelado: 'bg-red-500/20 text-red-300',
}
const lanzEstadoLabels: Record<string, string> = {
  pendiente: 'Pendiente', en_curso: 'En curso', cerrado: 'Cerrado', cancelado: 'Cancelado',
}

const partEstadoColors: Record<string, string> = {
  pendiente: 'bg-slate-500/20 text-slate-300',
  en_progreso: 'bg-amber-500/20 text-amber-300',
  completado: 'bg-emerald-500/20 text-emerald-300',
}
const partEstadoLabels: Record<string, string> = {
  pendiente: 'Pendiente', en_progreso: 'En progreso', completado: 'Completado',
}

// ─── Selector de vista según rol ────────────────────────────────────────────

export function EncuestasModule() {
  const { currentRole, talentos } = useForgeStore()

  const encuestas = useMemo(() => getEncuestasMock(), [])
  const lanzamientos = useMemo(() => getLanzamientosMock(encuestas, talentos), [encuestas, talentos])

  if (currentRole === 'lider') {
    return <EncuestasLider encuestas={encuestas} lanzamientos={lanzamientos} />
  }
  if (currentRole === 'talento') {
    return <EncuestasTalento encuestas={encuestas} lanzamientos={lanzamientos} />
  }
  if (currentRole === 'peopleops') {
    return <EncuestasGH encuestas={encuestas} lanzamientos={lanzamientos} tribuFilter />
  }
  // GH, admin_gestion, admin_tecnico, relaciones
  return <EncuestasGH encuestas={encuestas} lanzamientos={lanzamientos} tribuFilter={false} />
}

// ─── VISTA GH / PEOPLEOPS ────────────────────────────────────────────────────

function EncuestasGH({
  encuestas, lanzamientos, tribuFilter,
}: {
  encuestas: Encuesta[]
  lanzamientos: LanzamientoEncuesta[]
  tribuFilter: boolean
}) {
  const { currentRole, talentos, currentUserTribus } = useForgeStore()
  const permissions = useForgeStore(s => s.getPlanPermissions())

  const [activeTab, setActiveTab] = useState('encuestas')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState<string>('todos')
  const [filterEstado, setFilterEstado] = useState<string>('todos')
  const [filterArea, setFilterArea] = useState<string>('todos')

  const [viewMode, setViewMode] = useState<'list' | 'editor' | 'resultados' | 'lanzamiento'>('list')
  const [selectedEncuesta, setSelectedEncuesta] = useState<Encuesta | null>(null)
  const [selectedLanzamiento, setSelectedLanzamiento] = useState<LanzamientoEncuesta | null>(null)
  const [editingEncuesta, setEditingEncuesta] = useState<Encuesta | null>(null)
  const [showLanzarDialog, setShowLanzarDialog] = useState(false)
  const [encuestaToLanzar, setEncuestaToLanzar] = useState<Encuesta | null>(null)

  // PeopleOps sólo ve encuestas de sus tribus
  const visibleEncuestas = useMemo(() => {
    if (!tribuFilter) return encuestas
    return encuestas.filter(e =>
      !e.aplicaAreas || e.aplicaAreas.some(a => currentUserTribus.includes(a))
    )
  }, [encuestas, tribuFilter, currentUserTribus])

  const filteredEncuestas = useMemo(() => visibleEncuestas.filter(e => {
    if (searchTerm && !e.nombre.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (filterTipo !== 'todos' && e.tipo !== filterTipo) return false
    if (filterEstado !== 'todos' && e.estado !== filterEstado) return false
    return true
  }), [visibleEncuestas, searchTerm, filterTipo, filterEstado])

  const visibleLanzamientos = useMemo(() => {
    if (!tribuFilter) return lanzamientos
    return lanzamientos.filter(l =>
      !l.filtroArea || l.filtroArea.some(a => currentUserTribus.includes(a))
    )
  }, [lanzamientos, tribuFilter, currentUserTribus])

  const filteredLanzamientos = useMemo(() => visibleLanzamientos.filter(l =>
    (!searchTerm || l.nombre.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterArea === 'todos' || l.filtroArea?.includes(filterArea))
  ), [visibleLanzamientos, searchTerm, filterArea])

  const areas = useMemo(() => {
    const s = new Set<string>()
    lanzamientos.forEach(l => l.filtroArea?.forEach(a => s.add(a)))
    return Array.from(s)
  }, [lanzamientos])

  const stats = useMemo(() => ({
    total: visibleEncuestas.length,
    plantillas: visibleEncuestas.filter(e => e.esPlantilla).length,
    activas: visibleEncuestas.filter(e => e.estado === 'activa').length,
    lanzActivos: visibleLanzamientos.filter(l => l.estado === 'en_curso').length,
    pendientesRespuesta: visibleLanzamientos.reduce((acc, l) =>
      acc + l.participantes.filter(p => p.estado !== 'completado').length, 0),
    tasaRespuesta: (() => {
      const total = visibleLanzamientos.reduce((a, l) => a + l.participantes.length, 0)
      const comp = visibleLanzamientos.reduce((a, l) =>
        a + l.participantes.filter(p => p.estado === 'completado').length, 0)
      return total > 0 ? Math.round((comp / total) * 100) : 0
    })(),
  }), [visibleEncuestas, visibleLanzamientos])

  const handleBack = () => {
    setViewMode('list')
    setSelectedEncuesta(null)
    setSelectedLanzamiento(null)
    setEditingEncuesta(null)
    setCreatingTipo(null)
  }

  if (viewMode === 'editor') {
    return <EncuestaEditor encuesta={editingEncuesta} tipoNueva={null} onBack={handleBack} onSave={() => handleBack()} />
  }
  if (viewMode === 'resultados' && selectedEncuesta) {
    return <EncuestaResultados encuesta={selectedEncuesta} lanzamientos={lanzamientos.filter(l => l.encuestaId === selectedEncuesta.id)} onBack={handleBack} onViewLanzamiento={l => { setSelectedLanzamiento(l); setViewMode('lanzamiento') }} />
  }
  if (viewMode === 'lanzamiento' && selectedLanzamiento) {
    return <LanzamientoDetail lanzamiento={selectedLanzamiento} onBack={handleBack} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Evaluaciones y Encuestas"
          description={tribuFilter ? `Vista PeopleOps — tus tribus: ${currentUserTribus.join(', ')}` : 'Gestion global de evaluaciones de desempeno.'}
        />
        {permissions.crear && (
          <Button onClick={() => { setEditingEncuesta(null); setViewMode('editor') }} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Crear encuesta
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total encuestas" value={stats.total} icon={<FileText className="w-5 h-5" />} />
        <StatCard label="Plantillas" value={stats.plantillas} icon={<Copy className="w-5 h-5" />} />
        <StatCard label="Activas" value={stats.activas} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard label="Lanzamientos activos" value={stats.lanzActivos} icon={<Play className="w-5 h-5" />} color="amber" />
        <StatCard label="Pendientes responder" value={stats.pendientesRespuesta} icon={<Clock className="w-5 h-5" />} color="blue" />
        <StatCard label="Tasa respuesta" value={`${stats.tasaRespuesta}%`} icon={<TrendingUp className="w-5 h-5" />} color="purple" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-surface-2 border border-border p-1">
          <TabsTrigger value="encuestas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="w-4 h-4 mr-2" /> Encuestas creadas
          </TabsTrigger>
          <TabsTrigger value="lanzamientos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Play className="w-4 h-4 mr-2" /> Lanzamientos
          </TabsTrigger>
          <TabsTrigger value="metricas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="w-4 h-4 mr-2" /> Metricas
          </TabsTrigger>
          <TabsTrigger value="descargar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Download className="w-4 h-4 mr-2" /> Descargar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encuestas" className="mt-4 space-y-4">
          <ForgeCard className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar encuesta..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-surface-2 border-border" />
              </div>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-[180px] bg-surface-2 border-border"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {Object.entries(tipoEncuestaLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-[150px] bg-surface-2 border-border"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(estadoLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exportar</Button>
            </div>
          </ForgeCard>

          <div className="grid gap-4">
            {filteredEncuestas.map(enc => (
              <EncuestaCard
                key={enc.id} encuesta={enc}
                lanzamientosCount={lanzamientos.filter(l => l.encuestaId === enc.id).length}
                onEdit={() => { setEditingEncuesta(enc); setViewMode('editor') }}
                onViewResultados={() => { setSelectedEncuesta(enc); setViewMode('resultados') }}
                onLanzar={() => { setEncuestaToLanzar(enc); setShowLanzarDialog(true) }}
                canEdit={permissions.editar}
              />
            ))}
            {filteredEncuestas.length === 0 && (
              <ForgeCard className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No se encontraron encuestas.</p>
              </ForgeCard>
            )}
          </div>
        </TabsContent>

        <TabsContent value="lanzamientos" className="mt-4 space-y-4">
          <ForgeCard className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar lanzamiento..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-surface-2 border-border" />
              </div>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="w-[180px] bg-surface-2 border-border"><SelectValue placeholder="Area" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las areas</SelectItem>
                  {areas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
              {permissions.crear && (
                <Button className="bg-primary hover:bg-primary/90" size="sm" onClick={() => setShowLanzarDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />Nuevo lanzamiento
                </Button>
              )}
            </div>
          </ForgeCard>
          <div className="grid gap-4">
            {filteredLanzamientos.map(l => (
              <LanzamientoCard key={l.id} lanzamiento={l} onClick={() => { setSelectedLanzamiento(l); setViewMode('lanzamiento') }} />
            ))}
            {filteredLanzamientos.length === 0 && (
              <ForgeCard className="p-8 text-center">
                <Play className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay lanzamientos registrados.</p>
              </ForgeCard>
            )}
          </div>
        </TabsContent>

        <TabsContent value="metricas" className="mt-4">
          <ForgeCard className="p-6 text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Metricas globales</h3>
            <p className="text-muted-foreground text-sm">Selecciona una encuesta especifica para ver sus metricas detalladas.</p>
          </ForgeCard>
        </TabsContent>

        <TabsContent value="descargar" className="mt-4">
          <ForgeCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Descargar reportes</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: <FileText className="w-8 h-8 text-primary" />, title: 'Reporte de encuestas', desc: 'Listado de todas las encuestas creadas.' },
                { icon: <Users className="w-8 h-8 text-emerald-400" />, title: 'Reporte de respuestas', desc: 'Todas las respuestas de lanzamientos completados.' },
                { icon: <BarChart3 className="w-8 h-8 text-amber-400" />, title: 'Reporte de metricas', desc: 'Estadisticas consolidadas por area y equipo.' },
                { icon: <Target className="w-8 h-8 text-purple-400" />, title: 'Planes de mejora generados', desc: 'Planes creados a partir de evaluaciones.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="p-4 rounded-lg bg-surface-2 border border-border">
                  {icon}
                  <h4 className="font-medium mb-1 mt-2">{title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{desc}</p>
                  <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Descargar Excel</Button>
                </div>
              ))}
            </div>
          </ForgeCard>
        </TabsContent>
      </Tabs>


      {/* Dialog lanzar */}
      <Dialog open={showLanzarDialog} onOpenChange={setShowLanzarDialog}>
        <DialogContent className="max-w-lg bg-surface border-border">
          <DialogHeader><DialogTitle>Lanzar Encuesta</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div><label className="text-sm font-medium mb-1.5 block">Nombre del lanzamiento</label>
                <Input placeholder="Nombre del lanzamiento" className="bg-surface-2 border-border" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium mb-1.5 block">Fecha inicio</label><Input type="date" className="bg-surface-2 border-border" /></div>
                <div><label className="text-sm font-medium mb-1.5 block">Fecha fin</label><Input type="date" className="bg-surface-2 border-border" /></div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-200">Se enviaran notificaciones a todos los participantes.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLanzarDialog(false)}>Cancelar</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowLanzarDialog(false)}>
                <Send className="w-4 h-4 mr-2" />Lanzar encuesta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── VISTA LÍDER ─────────────────────────────────────────────────────────────

function EncuestasLider({
  encuestas, lanzamientos,
}: {
  encuestas: Encuesta[]
  lanzamientos: LanzamientoEncuesta[]
}) {
  const { currentUserId, talentos } = useForgeStore()
  const [activeTab, setActiveTab] = useState('pendientes')
  const [viewMode, setViewMode] = useState<'list' | 'responder' | 'resultados' | 'lanzamiento'>('list')
  const [selectedLanzamiento, setSelectedLanzamiento] = useState<LanzamientoEncuesta | null>(null)
  const [selectedEncuesta, setSelectedEncuesta] = useState<Encuesta | null>(null)
  const [showResponderDialog, setShowResponderDialog] = useState(false)
  const [responderPart, setResponderPart] = useState<ParticipanteLanzamiento | null>(null)

  // Para demo: lider l1 tiene pendientes en lanz2
  const misParticipaciones = useMemo(() =>
    lanzamientos.flatMap(l =>
      l.participantes
        .filter(p => p.evaluadorId === currentUserId || p.talentoId === currentUserId)
        .map(p => ({ ...p, lanzamiento: l }))
    )
  , [lanzamientos, currentUserId])

  // Pendientes: donde el lider es evaluador y no ha completado
  const pendientes = useMemo(() =>
    lanzamientos.flatMap(l =>
      l.participantes
        .filter(p => p.evaluadorId === currentUserId && p.estado !== 'completado')
        .map(p => ({ part: p, lanzamiento: l }))
    )
  , [lanzamientos, currentUserId])

  // Lanzamientos que aplican a equipo del lider (simulado: todos)
  const lanzEquipo = useMemo(() =>
    lanzamientos.filter(l => l.estado === 'cerrado' || l.estado === 'en_curso')
  , [lanzamientos])

  const statsPendientes = pendientes.length
  const statsEnCurso = lanzamientos.filter(l => l.estado === 'en_curso').length
  const statsCerrados = lanzamientos.filter(l => l.estado === 'cerrado').length

  const handleBack = () => { setViewMode('list'); setSelectedLanzamiento(null); setSelectedEncuesta(null) }

  if (viewMode === 'resultados' && selectedEncuesta) {
    return <EncuestaResultados encuesta={selectedEncuesta}
      lanzamientos={lanzamientos.filter(l => l.encuestaId === selectedEncuesta.id)}
      onBack={handleBack} onViewLanzamiento={l => { setSelectedLanzamiento(l); setViewMode('lanzamiento') }} />
  }
  if (viewMode === 'lanzamiento' && selectedLanzamiento) {
    return <LanzamientoDetail lanzamiento={selectedLanzamiento} onBack={handleBack} />
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Mis Evaluaciones" description="Evaluaciones pendientes por completar y resultados de tu equipo." />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Pendientes por completar"
          value={statsPendientes}
          icon={<ClipboardCheck className="w-5 h-5" />}
          color={statsPendientes > 0 ? 'amber' : 'emerald'}
        />
        <StatCard label="Lanzamientos activos" value={statsEnCurso} icon={<Play className="w-5 h-5" />} color="blue" />
        <StatCard label="Evaluaciones cerradas" value={statsCerrados} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
      </div>

      {/* Banner pendientes urgente */}
      {pendientes.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-amber-200">Tienes {pendientes.length} evaluacion{pendientes.length > 1 ? 'es' : ''} pendiente{pendientes.length > 1 ? 's' : ''} por completar</p>
            <p className="text-sm text-amber-300/70">Completa las evaluaciones antes de que venzan los plazos.</p>
          </div>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black" onClick={() => setActiveTab('pendientes')}>
            Ver pendientes
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-surface-2 border border-border p-1">
          <TabsTrigger value="pendientes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Inbox className="w-4 h-4 mr-2" />
            Pendientes {pendientes.length > 0 && <span className="ml-1.5 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendientes.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="equipo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-4 h-4 mr-2" /> Resultados del equipo
          </TabsTrigger>
        </TabsList>

        {/* Tab: Pendientes */}
        <TabsContent value="pendientes" className="mt-4 space-y-4">
          {pendientes.length === 0 ? (
            <ForgeCard className="p-10 text-center">
              <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">¡Todo al dia!</h3>
              <p className="text-muted-foreground text-sm">No tienes evaluaciones pendientes por completar.</p>
            </ForgeCard>
          ) : (
            pendientes.map(({ part, lanzamiento }) => {
              const enc = encuestas.find(e => e.id === lanzamiento.encuestaId)
              const diasRestantes = Math.ceil((new Date(lanzamiento.fechaFin).getTime() - Date.now()) / 86400000)
              return (
                <ForgeCard key={part.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      part.estado === 'en_progreso' ? 'bg-amber-500/20' : 'bg-slate-500/20'
                    )}>
                      <ClipboardList className={cn('w-6 h-6', part.estado === 'en_progreso' ? 'text-amber-400' : 'text-slate-400')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="font-semibold">{lanzamiento.nombre}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{enc?.nombre}</p>
                        </div>
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', partEstadoColors[part.estado])}>
                          {partEstadoLabels[part.estado]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><UserCheck className="w-4 h-4" />Evaluado: {part.talento?.nombre}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Vence: {lanzamiento.fechaFin}</span>
                        <span className={cn('flex items-center gap-1 font-medium', diasRestantes <= 5 ? 'text-red-400' : diasRestantes <= 10 ? 'text-amber-400' : 'text-muted-foreground')}>
                          <Clock className="w-4 h-4" />{diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Vencida'}
                        </span>
                        {enc && <span className="flex items-center gap-1"><FileText className="w-4 h-4" />{enc.preguntas.length} preguntas</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedLanzamiento(lanzamiento); setViewMode('lanzamiento') }}>
                      <Eye className="w-4 h-4 mr-2" />Ver detalle
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => { setResponderPart(part); setShowResponderDialog(true) }}>
                      {part.estado === 'en_progreso' ? <><Play className="w-4 h-4 mr-2" />Continuar</> : <><ClipboardCheck className="w-4 h-4 mr-2" />Iniciar evaluacion</>}
                    </Button>
                  </div>
                </ForgeCard>
              )
            })
          )}
        </TabsContent>

        {/* Tab: Resultados del equipo */}
        <TabsContent value="equipo" className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground px-1">Resultados de evaluaciones donde tu equipo es evaluado.</p>
          {lanzEquipo.length === 0 ? (
            <ForgeCard className="p-8 text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay resultados disponibles aun.</p>
            </ForgeCard>
          ) : (
            lanzEquipo.map(lanz => {
              const enc = encuestas.find(e => e.id === lanz.encuestaId)
              const completados = lanz.participantes.filter(p => p.estado === 'completado')
              const promedio = completados.length > 0
                ? Math.round(completados.reduce((s, p) => s + (p.puntajeTotal ?? 0), 0) / completados.length)
                : null
              const conPlan = lanz.participantes.filter(p => p.requierePlanMejora).length
              const progreso = lanz.participantes.length > 0
                ? Math.round((completados.length / lanz.participantes.length) * 100) : 0

              return (
                <ForgeCard key={lanz.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                      lanz.estado === 'cerrado' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                    )}>
                      <BarChart3 className={cn('w-5 h-5', lanz.estado === 'cerrado' ? 'text-emerald-400' : 'text-amber-400')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="font-semibold">{lanz.nombre}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{enc?.nombre}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {promedio !== null && (
                            <span className={cn('text-xl font-bold', promedio >= 70 ? 'text-emerald-400' : 'text-red-400')}>
                              {promedio}%
                            </span>
                          )}
                          <span className={cn('text-xs px-2 py-0.5 rounded-full', lanzEstadoColors[lanz.estado])}>
                            {lanzEstadoLabels[lanz.estado]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{lanz.fechaInicio} – {lanz.fechaFin}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" />{completados.length}/{lanz.participantes.length} completados</span>
                        {conPlan > 0 && (
                          <span className="flex items-center gap-1 text-amber-400"><AlertTriangle className="w-4 h-4" />{conPlan} requieren plan de mejora</span>
                        )}
                      </div>
                      {lanz.participantes.length > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progreso respuestas</span>
                            <span>{progreso}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                            <div className={cn('h-full rounded-full', progreso === 100 ? 'bg-emerald-500' : 'bg-primary')} style={{ width: `${progreso}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Participantes del equipo */}
                      {lanz.participantes.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Participantes</p>
                          {lanz.participantes.map(p => (
                            <div key={p.id} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-surface-2">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                {p.talento?.visuel || '?'}
                              </div>
                              <span className="flex-1">{p.talento?.nombre}</span>
                              <span className={cn('text-xs px-2 py-0.5 rounded-full', partEstadoColors[p.estado])}>
                                {partEstadoLabels[p.estado]}
                              </span>
                              {p.puntajeTotal !== undefined && (
                                <span className={cn('font-semibold min-w-[40px] text-right', p.puntajeTotal >= 70 ? 'text-emerald-400' : 'text-red-400')}>
                                  {p.puntajeTotal}%
                                </span>
                              )}
                              {p.requierePlanMejora && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">Plan mejora</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedLanzamiento(lanz); setViewMode('lanzamiento') }}>
                      <Eye className="w-4 h-4 mr-2" />Ver lanzamiento
                    </Button>
                    {enc && (
                      <Button variant="outline" size="sm" onClick={() => { setSelectedEncuesta(enc); setViewMode('resultados') }}>
                        <BarChart3 className="w-4 h-4 mr-2" />Ver resultados
                      </Button>
                    )}
                  </div>
                </ForgeCard>
              )
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog responder evaluacion (demo) */}
      <Dialog open={showResponderDialog} onOpenChange={setShowResponderDialog}>
        <DialogContent className="max-w-2xl bg-surface border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Responder evaluacion</DialogTitle>
            <DialogDescription>Evaluando a: {responderPart?.talento?.nombre}</DialogDescription>
          </DialogHeader>
          {responderPart && (() => {
            const lanz = lanzamientos.find(l => l.participantes.some(p => p.id === responderPart.id))
            const enc = encuestas.find(e => e.id === lanz?.encuestaId)
            if (!enc) return null
            return (
              <div className="space-y-4 py-2">
                {enc.preguntas.map((preg, idx) => (
                  <div key={preg.id} className="p-4 rounded-lg bg-surface-2 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium',
                        preg.pilar === 'ser' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                          preg.pilar === 'saber_hacer' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            'bg-green-500/20 text-green-300 border-green-500/30'
                      )}>
                        {preg.pilar === 'ser' ? 'Ser' : preg.pilar === 'saber_hacer' ? 'Saber y Hacer' : 'Especifico'}
                      </span>
                      <span className="text-xs text-muted-foreground">Peso: {preg.pesoPregunta}%</span>
                    </div>
                    <p className="text-sm mb-3 leading-relaxed">{idx + 1}. {preg.texto}</p>
                    {preg.tipoPregunta === 'escala_5' && (
                      <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 4, 5].map(v => (
                          <button key={v} className="w-10 h-10 rounded-lg border border-border bg-surface hover:bg-primary/20 hover:border-primary/50 text-sm font-medium transition-all">
                            {v}
                          </button>
                        ))}
                        <span className="text-xs text-muted-foreground self-center ml-2">1 = Nunca · 5 = Siempre</span>
                      </div>
                    )}
                    {preg.tipoPregunta === 'texto_abierto' && (
                      <textarea className="w-full bg-surface border border-border rounded-lg p-3 text-sm resize-none min-h-[80px] focus:outline-none focus:border-primary/50" placeholder="Escribe tu respuesta..." />
                    )}
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowResponderDialog(false)}>Guardar borrador</Button>
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowResponderDialog(false)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />Enviar evaluacion
                  </Button>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── VISTA TALENTO ────────────────────────────────────────────────────────────

function EncuestasTalento({
  encuestas, lanzamientos,
}: {
  encuestas: Encuesta[]
  lanzamientos: LanzamientoEncuesta[]
}) {
  const { currentUserId } = useForgeStore()
  const [activeTab, setActiveTab] = useState('pendientes')
  const [viewMode, setViewMode] = useState<'list' | 'responder' | 'ver_resultado'>('list')
  const [showResponder, setShowResponder] = useState(false)
  const [selectedPart, setSelectedPart] = useState<(ParticipanteLanzamiento & { lanzamiento: LanzamientoEncuesta }) | null>(null)

  // Participaciones del talento (es evaluado o debe autoevaluarse)
  const misParticipaciones = useMemo(() =>
    lanzamientos.flatMap(l =>
      l.participantes
        .filter(p => p.talentoId === currentUserId)
        .map(p => ({ ...p, lanzamiento: l }))
    )
  , [lanzamientos, currentUserId])

  const pendientes = useMemo(() =>
    misParticipaciones.filter(p => p.estado !== 'completado')
  , [misParticipaciones])

  const completadas = useMemo(() =>
    misParticipaciones.filter(p => p.estado === 'completado')
  , [misParticipaciones])

  if (viewMode === 'responder' && selectedPart) {
    const enc = encuestas.find(e => e.id === selectedPart.lanzamiento.encuestaId)
    if (!enc) return null
    return (
      <ResponderEvaluacion
        encuesta={enc}
        lanzamiento={selectedPart.lanzamiento}
        participacion={selectedPart}
        onBack={() => { setViewMode('list'); setSelectedPart(null) }}
        onSubmit={() => { setViewMode('list'); setSelectedPart(null) }}
      />
    )
  }

  if (viewMode === 'ver_resultado' && selectedPart) {
    const enc = encuestas.find(e => e.id === selectedPart.lanzamiento.encuestaId)
    if (!enc) return null
    return (
      <ResultadoTalento
        encuesta={enc}
        lanzamiento={selectedPart.lanzamiento}
        participacion={selectedPart}
        onBack={() => { setViewMode('list'); setSelectedPart(null) }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Mis Evaluaciones" description="Evaluaciones pendientes por responder e historial de evaluaciones pasadas." />

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Pendientes"
          value={pendientes.length}
          icon={<ClipboardCheck className="w-5 h-5" />}
          color={pendientes.length > 0 ? 'amber' : 'emerald'}
        />
        <StatCard label="Completadas" value={completadas.length} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard
          label="Ultima calificacion"
          value={completadas[completadas.length - 1]?.puntajeTotal ? `${completadas[completadas.length - 1].puntajeTotal}%` : '—'}
          icon={<Star className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {pendientes.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-200 flex-1">
            Tienes <strong>{pendientes.length}</strong> evaluacion{pendientes.length > 1 ? 'es' : ''} pendiente{pendientes.length > 1 ? 's' : ''} por completar.
          </p>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black" onClick={() => setActiveTab('pendientes')}>Ver ahora</Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-surface-2 border border-border p-1">
          <TabsTrigger value="pendientes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Inbox className="w-4 h-4 mr-2" />
            Pendientes {pendientes.length > 0 && <span className="ml-1.5 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendientes.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="historial" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <History className="w-4 h-4 mr-2" /> Historial
          </TabsTrigger>
        </TabsList>

        {/* Pendientes */}
        <TabsContent value="pendientes" className="mt-4 space-y-4">
          {pendientes.length === 0 ? (
            <ForgeCard className="p-10 text-center">
              <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">¡Todo al dia!</h3>
              <p className="text-muted-foreground text-sm">No tienes evaluaciones pendientes por responder.</p>
            </ForgeCard>
          ) : (
            pendientes.map(part => {
              const enc = encuestas.find(e => e.id === part.lanzamiento.encuestaId)
              const diasRestantes = Math.ceil((new Date(part.lanzamiento.fechaFin).getTime() - Date.now()) / 86400000)
              return (
                <ForgeCard key={part.id} className="p-5 border-l-4 border-l-amber-500/60">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <ClipboardCheck className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{part.lanzamiento.nombre}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{enc?.nombre}</p>
                        </div>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full flex-shrink-0', partEstadoColors[part.estado])}>
                          {partEstadoLabels[part.estado]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Vence: {part.lanzamiento.fechaFin}</span>
                        <span className={cn('flex items-center gap-1 font-medium', diasRestantes <= 5 ? 'text-red-400' : 'text-muted-foreground')}>
                          <Clock className="w-4 h-4" />{diasRestantes > 0 ? `${diasRestantes} dias` : 'Vencida'}
                        </span>
                        {enc && <span className="flex items-center gap-1"><FileText className="w-4 h-4" />{enc.preguntas.length} preguntas</span>}
                        <span className="flex items-center gap-1"><Target className="w-4 h-4" />{tipoEncuestaLabels[enc?.tipo as TipoEncuesta] || enc?.tipo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 pt-4 border-t border-border">
                    <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => { setSelectedPart(part as any); setViewMode('responder') }}>
                      {part.estado === 'en_progreso' ? <><Play className="w-4 h-4 mr-2" />Continuar</> : <><ClipboardCheck className="w-4 h-4 mr-2" />Iniciar evaluacion</>}
                    </Button>
                  </div>
                </ForgeCard>
              )
            })
          )}
        </TabsContent>

        {/* Historial */}
        <TabsContent value="historial" className="mt-4 space-y-4">
          {completadas.length === 0 ? (
            <ForgeCard className="p-8 text-center">
              <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay evaluaciones completadas aun.</p>
            </ForgeCard>
          ) : (
            completadas.map(part => {
              const enc = encuestas.find(e => e.id === part.lanzamiento.encuestaId)
              return (
                <ForgeCard key={part.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{part.lanzamiento.nombre}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{enc?.nombre}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {part.puntajeTotal !== undefined && (
                            <span className={cn('text-xl font-bold', part.puntajeTotal >= 70 ? 'text-emerald-400' : 'text-red-400')}>
                              {part.puntajeTotal}%
                            </span>
                          )}
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Completada</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Completada: {part.fechaCompletado || part.lanzamiento.fechaFin}</span>
                        {part.requierePlanMejora && (
                          <span className="flex items-center gap-1 text-amber-400"><AlertTriangle className="w-4 h-4" />Se genero plan de mejora</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedPart(part as any); setViewMode('ver_resultado') }}>
                      <Eye className="w-4 h-4 mr-2" />Ver mis resultados
                    </Button>
                  </div>
                </ForgeCard>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Sub-vistas talento ───────────────────────────────────────────────────────

function ResponderEvaluacion({ encuesta, lanzamiento, participacion, onBack, onSubmit }: {
  encuesta: Encuesta; lanzamiento: LanzamientoEncuesta
  participacion: ParticipanteLanzamiento; onBack: () => void; onSubmit: () => void
}) {
  const [respuestas, setRespuestas] = useState<Record<string, number | string>>({})
  const totalPeso = encuesta.preguntas.reduce((s, p) => s + p.pesoPregunta, 0)

  const pilares = {
    ser: encuesta.preguntas.filter(p => p.pilar === 'ser'),
    saber_hacer: encuesta.preguntas.filter(p => p.pilar === 'saber_hacer'),
    especifico: encuesta.preguntas.filter(p => p.pilar === 'especifico'),
  }

  const pilarLabels = { ser: 'Pilar SER (20%)', saber_hacer: 'Pilar SABER Y HACER (40%)', especifico: 'Pilar ESPECIFICO (40%)' }
  const pilarColors = { ser: 'text-purple-400', saber_hacer: 'text-blue-400', especifico: 'text-green-400' }
  const pilarBg = { ser: 'border-l-purple-500/60', saber_hacer: 'border-l-blue-500/60', especifico: 'border-l-green-500/60' }

  const respondidas = Object.keys(respuestas).length
  const progreso = Math.round((respondidas / encuesta.preguntas.length) * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}><ChevronRight className="w-4 h-4 mr-1 rotate-180" />Volver</Button>
          <div>
            <h1 className="text-xl font-bold">{encuesta.nombre}</h1>
            <p className="text-sm text-muted-foreground">{lanzamiento.nombre} · Vence {lanzamiento.fechaFin}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{respondidas}/{encuesta.preguntas.length} respondidas</p>
          <div className="h-1.5 w-32 rounded-full bg-surface-3 overflow-hidden mt-1">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progreso}%` }} />
          </div>
        </div>
      </div>

      {Object.entries(pilares).map(([pilar, pregs]) => pregs.length === 0 ? null : (
        <ForgeCard key={pilar} className="p-5 space-y-4">
          <h2 className={cn('font-semibold text-base', pilarColors[pilar as keyof typeof pilarColors])}>
            {pilarLabels[pilar as keyof typeof pilarLabels]}
          </h2>
          {pregs.map((preg, idx) => (
            <div key={preg.id} className={cn('p-4 rounded-lg bg-surface-2 border-l-4', pilarBg[pilar as keyof typeof pilarBg])}>
              {preg.objetivoEstrategico && (
                <p className="text-[11px] text-muted-foreground/70 mb-1 uppercase tracking-wide">{preg.objetivoEstrategico}</p>
              )}
              <p className="text-sm leading-relaxed mb-3">{preg.texto}</p>
              {preg.tipoPregunta === 'escala_5' && (
                <div className="flex items-center gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => setRespuestas(r => ({ ...r, [preg.id]: v }))}
                      className={cn('w-10 h-10 rounded-lg border text-sm font-semibold transition-all',
                        respuestas[preg.id] === v
                          ? 'bg-primary border-primary text-white shadow-lg scale-105'
                          : 'border-border bg-surface hover:bg-primary/10 hover:border-primary/40'
                      )}>
                      {v}
                    </button>
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">1 = Nunca · 5 = Siempre</span>
                  <span className="text-xs text-muted-foreground ml-auto">Peso: {preg.pesoPregunta}%</span>
                </div>
              )}
              {preg.tipoPregunta === 'texto_abierto' && (
                <textarea onChange={e => setRespuestas(r => ({ ...r, [preg.id]: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-lg p-3 text-sm resize-none min-h-[90px] focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Escribe tu respuesta aqui..." />
              )}
            </div>
          ))}
        </ForgeCard>
      ))}

      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" onClick={onBack}>Guardar borrador</Button>
        <Button className="bg-primary hover:bg-primary/90" onClick={onSubmit} disabled={respondidas < encuesta.preguntas.filter(p => p.tipoPregunta !== 'texto_abierto').length}>
          <CheckCircle2 className="w-4 h-4 mr-2" />Enviar evaluacion
        </Button>
      </div>
    </div>
  )
}

function ResultadoTalento({ encuesta, lanzamiento, participacion, onBack }: {
  encuesta: Encuesta; lanzamiento: LanzamientoEncuesta
  participacion: ParticipanteLanzamiento; onBack: () => void
}) {
  const puntaje = participacion.puntajeTotal ?? 0

  // Calcular por pilar (simulado)
  const pilarResultados = [
    { label: 'Pilar SER', pct: 20, puntaje: Math.round(puntaje * 0.95 + 2), color: 'bg-purple-500', textColor: 'text-purple-400' },
    { label: 'Pilar SABER Y HACER', pct: 40, puntaje: Math.round(puntaje * 1.02), color: 'bg-blue-500', textColor: 'text-blue-400' },
    { label: 'Pilar ESPECIFICO', pct: 40, puntaje: Math.round(puntaje * 0.98), color: 'bg-green-500', textColor: 'text-green-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}><ChevronRight className="w-4 h-4 mr-1 rotate-180" />Volver</Button>
        <div>
          <h1 className="text-xl font-bold">Resultado de mi evaluacion</h1>
          <p className="text-sm text-muted-foreground">{lanzamiento.nombre}</p>
        </div>
      </div>

      <ForgeCard className="p-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="text-center">
            <div className={cn('text-5xl font-bold mb-1', puntaje >= 70 ? 'text-emerald-400' : 'text-red-400')}>{puntaje}%</div>
            <p className="text-sm text-muted-foreground">Puntaje total</p>
          </div>
          <div className="flex-1 min-w-[200px] space-y-3">
            {pilarResultados.map(p => (
              <div key={p.label} className="flex items-center gap-3">
                <span className={cn('text-sm w-40 flex-shrink-0', p.textColor)}>{p.label}</span>
                <div className="flex-1 h-2.5 rounded-full bg-surface-3 overflow-hidden">
                  <div className={cn('h-full rounded-full', p.color)} style={{ width: `${p.puntaje}%` }} />
                </div>
                <span className="text-sm font-semibold w-12 text-right">{p.puntaje}%</span>
              </div>
            ))}
          </div>
        </div>
      </ForgeCard>

      {participacion.requierePlanMejora && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-200">Se activo un plan de mejora</p>
            <p className="text-sm text-amber-300/70 mt-1">Tu puntaje ({puntaje}%) estuvo por debajo del 60%. Tu lider y Gestion Humana trabajaran contigo en un plan de mejora.</p>
          </div>
        </div>
      )}

      {puntaje >= 70 && !participacion.requierePlanMejora && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-200">¡Excelente desempeno! Tu evaluacion refleja un trabajo consistente y alineado con los objetivos de la organizacion.</p>
        </div>
      )}

      <ForgeCard className="p-5">
        <h3 className="font-semibold mb-3">Informacion de la evaluacion</h3>
        <div className="space-y-2 text-sm">
          {[
            ['Encuesta', encuesta.nombre],
            ['Lanzamiento', lanzamiento.nombre],
            ['Tipo', tipoEncuestaLabels[encuesta.tipo]],
            ['Fecha completada', participacion.fechaCompletado || lanzamiento.fechaFin],
            ['Periodo', `${lanzamiento.fechaInicio} – ${lanzamiento.fechaFin}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1.5 border-b border-border last:border-0">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium text-right max-w-[60%]">{v}</span>
            </div>
          ))}
        </div>
      </ForgeCard>
    </div>
  )
}

// ─── Componentes compartidos ──────────────────────────────────────────────────

function EncuestaCard({ encuesta, lanzamientosCount, onEdit, onViewResultados, onLanzar, canEdit }: {
  encuesta: Encuesta; lanzamientosCount: number
  onEdit: () => void; onViewResultados: () => void; onLanzar: () => void; canEdit: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <ForgeCard className="p-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate">{encuesta.nombre}</h3>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', estadoColors[encuesta.estado])}>{estadoLabels[encuesta.estado]}</span>
                {encuesta.esPlantilla && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">Plantilla</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{encuesta.descripcion}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded-md hover:bg-surface-2"><MoreHorizontal className="w-4 h-4" /></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewResultados}><BarChart3 className="w-4 h-4 mr-2" />Ver resultados</DropdownMenuItem>
                {canEdit && <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" />Editar encuesta</DropdownMenuItem>}
                <DropdownMenuItem><Copy className="w-4 h-4 mr-2" />Duplicar</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLanzar}><Play className="w-4 h-4 mr-2" />Nuevo lanzamiento</DropdownMenuItem>
                <DropdownMenuItem><Download className="w-4 h-4 mr-2" />Exportar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
            <span className="flex items-center gap-1 text-muted-foreground"><ClipboardList className="w-4 h-4" />{encuesta.preguntas.length} preguntas</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Target className="w-4 h-4" />{tipoEncuestaLabels[encuesta.tipo]}</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Play className="w-4 h-4" />{lanzamientosCount} lanzamientos</span>
            {encuesta.aplicaAreas && encuesta.aplicaAreas.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-4 h-4" />{encuesta.aplicaAreas.join(', ')}</span>
            )}
          </div>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {expanded ? 'Ocultar preguntas' : 'Ver preguntas'}
          </button>
          {expanded && (
            <div className="mt-3 p-3 rounded-lg bg-surface-2 space-y-2 max-h-[280px] overflow-y-auto">
              {encuesta.preguntas.map((p, i) => (
                <div key={p.id} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground w-6 flex-shrink-0">{i + 1}.</span>
                  <div className="flex-1">
                    <p>{p.texto}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border">
                        {p.pilar === 'ser' ? 'Ser' : p.pilar === 'saber_hacer' ? 'Saber y Hacer' : 'Especifico'}
                      </span>
                      <span className="text-xs text-muted-foreground">Peso: {p.pesoPregunta}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
        <Button variant="outline" size="sm" onClick={onViewResultados}><BarChart3 className="w-4 h-4 mr-2" />Resultados</Button>
        {canEdit && <Button variant="outline" size="sm" onClick={onEdit}><Edit className="w-4 h-4 mr-2" />Editar</Button>}
        <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={onLanzar}><Play className="w-4 h-4 mr-2" />Lanzar</Button>
      </div>
    </ForgeCard>
  )
}

function LanzamientoCard({ lanzamiento, onClick }: { lanzamiento: LanzamientoEncuesta; onClick: () => void }) {
  const completados = lanzamiento.participantes.filter(p => p.estado === 'completado').length
  const total = lanzamiento.participantes.length
  const progreso = total > 0 ? Math.round((completados / total) * 100) : 0
  return (
    <ForgeCard className="p-4 cursor-pointer hover:border-primary/50 transition-all" onClick={onClick}>
      <div className="flex items-start gap-4">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          lanzamiento.estado === 'en_curso' ? 'bg-amber-500/20' : lanzamiento.estado === 'cerrado' ? 'bg-emerald-500/20' : 'bg-slate-500/20')}>
          <Play className={cn('w-5 h-5', lanzamiento.estado === 'en_curso' ? 'text-amber-400' : lanzamiento.estado === 'cerrado' ? 'text-emerald-400' : 'text-slate-400')} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{lanzamiento.nombre}</h3>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', lanzEstadoColors[lanzamiento.estado])}>{lanzEstadoLabels[lanzamiento.estado]}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{lanzamiento.encuesta?.nombre}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
            <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="w-4 h-4" />{lanzamiento.fechaInicio} – {lanzamiento.fechaFin}</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-4 h-4" />{completados}/{total} completados</span>
          </div>
          {total > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progreso</span><span>{progreso}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div className={cn('h-full rounded-full', progreso === 100 ? 'bg-emerald-500' : 'bg-primary')} style={{ width: `${progreso}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </ForgeCard>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTipoDesc(tipo: string): string {
  const map: Record<string, string> = {
    lider_colaborador: 'El lider evalua a sus colaboradores directos.',
    lider_lider: 'Evaluacion entre lideres del mismo nivel.',
    colaborador_lider: 'El colaborador evalua a su lider.',
    autoevaluacion: 'Autoevaluacion del desempeno propio.',
    area_interaccion: 'Evaluacion entre areas con mayor interaccion.',
    transversal: 'Evaluacion de areas transversales.',
    prorroga: 'Evaluacion vinculada a prorrogas de contrato.',
    '4d_triadas': 'Evaluacion 4D o de triadas.',
  }
  return map[tipo] || ''
}
