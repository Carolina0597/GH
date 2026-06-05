'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { type LanzamientoEncuesta, type ParticipanteLanzamiento } from '@/lib/store'
import { ForgeCard, PageHeader, Badge, StatCard } from '@/components/forge/forge-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  ChevronLeft, Users, Target, TrendingUp, CheckCircle2, Clock, AlertTriangle,
  Download, Calendar, User, Mail, Send, Bell, Play, Eye, Edit, Sparkles,
  FileText, ArrowRight, Plus, RefreshCw, Trash2, MoreHorizontal, Filter,
  ChevronDown, ChevronRight, ExternalLink, MessageSquare
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

interface LanzamientoDetailProps {
  lanzamiento: LanzamientoEncuesta
  onBack: () => void
}

export function LanzamientoDetail({ lanzamiento, onBack }: LanzamientoDetailProps) {
  const [activeTab, setActiveTab] = useState('participantes')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('todos')
  const [selectedParticipante, setSelectedParticipante] = useState<ParticipanteLanzamiento | null>(null)
  const [showRespuestasDialog, setShowRespuestasDialog] = useState(false)
  const [showCrearPlanDialog, setShowCrearPlanDialog] = useState(false)
  
  // Stats
  const stats = useMemo(() => {
    const total = lanzamiento.participantes.length
    const completados = lanzamiento.participantes.filter(p => p.estado === 'completado').length
    const enProgreso = lanzamiento.participantes.filter(p => p.estado === 'en_progreso').length
    const pendientes = lanzamiento.participantes.filter(p => p.estado === 'pendiente').length
    const tasaRespuesta = total > 0 ? Math.round((completados / total) * 100) : 0
    const promedioGeneral = lanzamiento.participantes.filter(p => p.puntajeTotal).reduce((acc, p) => acc + (p.puntajeTotal || 0), 0) / (completados || 1)
    const requierenPlan = lanzamiento.participantes.filter(p => p.requierePlanMejora && !p.planMejoraCreado).length
    const planesCreados = lanzamiento.participantes.filter(p => p.planMejoraCreado).length
    
    return { total, completados, enProgreso, pendientes, tasaRespuesta, promedioGeneral, requierenPlan, planesCreados }
  }, [lanzamiento])
  
  // Filtrar participantes
  const filteredParticipantes = useMemo(() => {
    return lanzamiento.participantes.filter(p => {
      if (searchTerm && !p.talento.nombre.toLowerCase().includes(searchTerm.toLowerCase())) return false
      if (filterEstado !== 'todos' && p.estado !== filterEstado) return false
      return true
    })
  }, [lanzamiento.participantes, searchTerm, filterEstado])
  
  // Estado del lanzamiento
  const estadoColors: Record<string, string> = {
    pendiente: 'bg-slate-500/20 text-slate-300',
    en_curso: 'bg-amber-500/20 text-amber-300',
    cerrado: 'bg-emerald-500/20 text-emerald-300',
    cancelado: 'bg-red-500/20 text-red-300',
  }
  
  const handleViewRespuestas = (participante: ParticipanteLanzamiento) => {
    setSelectedParticipante(participante)
    setShowRespuestasDialog(true)
  }
  
  const handleCrearPlan = (participante: ParticipanteLanzamiento) => {
    setSelectedParticipante(participante)
    setShowCrearPlanDialog(true)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{lanzamiento.nombre}</h1>
              <Badge className={estadoColors[lanzamiento.estado]}>
                {lanzamiento.estado === 'en_curso' ? 'En curso' :
                 lanzamiento.estado === 'cerrado' ? 'Cerrado' :
                 lanzamiento.estado === 'pendiente' ? 'Pendiente' : 'Cancelado'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {lanzamiento.fechaInicio} - {lanzamiento.fechaFin}
              {lanzamiento.encuesta && (
                <>
                  <span className="mx-2">•</span>
                  <FileText className="w-4 h-4" />
                  {lanzamiento.encuesta.nombre}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lanzamiento.estado === 'en_curso' && (
            <Button variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Enviar recordatorio
            </Button>
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Editar lanzamiento
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Plus className="w-4 h-4 mr-2" />
                Agregar participantes
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="w-4 h-4 mr-2" />
                Extender fecha limite
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {lanzamiento.estado === 'en_curso' && (
                <DropdownMenuItem>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Cerrar lanzamiento
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-400">
                <Trash2 className="w-4 h-4 mr-2" />
                Cancelar lanzamiento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard label="Total participantes" value={stats.total} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Completados" value={stats.completados} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard label="En progreso" value={stats.enProgreso} icon={<Clock className="w-5 h-5" />} color="amber" />
        <StatCard label="Pendientes" value={stats.pendientes} icon={<Clock className="w-5 h-5" />} color="slate" />
        <StatCard label="Tasa respuesta" value={`${stats.tasaRespuesta}%`} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
        <StatCard label="Promedio" value={`${Math.round(stats.promedioGeneral)}%`} icon={<Target className="w-5 h-5" />} color="purple" />
        <StatCard label="Requieren plan" value={stats.requierenPlan} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
        <StatCard label="Planes creados" value={stats.planesCreados} icon={<FileText className="w-5 h-5" />} color="emerald" />
      </div>
      
      {/* Progreso general */}
      <ForgeCard className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Progreso del lanzamiento</h3>
          <span className="text-sm font-medium">{stats.tasaRespuesta}% completado</span>
        </div>
        <div className="h-4 rounded-full bg-surface-2 overflow-hidden flex">
          {stats.completados > 0 && (
            <div 
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${(stats.completados / stats.total) * 100}%` }}
            />
          )}
          {stats.enProgreso > 0 && (
            <div 
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${(stats.enProgreso / stats.total) * 100}%` }}
            />
          )}
          {stats.pendientes > 0 && (
            <div 
              className="h-full bg-slate-500 transition-all"
              style={{ width: `${(stats.pendientes / stats.total) * 100}%` }}
            />
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Completados ({stats.completados})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">En progreso ({stats.enProgreso})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-muted-foreground">Pendientes ({stats.pendientes})</span>
          </div>
        </div>
      </ForgeCard>
      
      {/* Alerta si hay planes pendientes */}
      {stats.requierenPlan > 0 && (
        <ForgeCard className="p-4 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-300">Accion requerida</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Hay {stats.requierenPlan} colaboradores que requieren un plan de mejora basado en sus resultados.
              </p>
            </div>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
              <Sparkles className="w-4 h-4 mr-2" />
              Crear planes con IA
            </Button>
          </div>
        </ForgeCard>
      )}
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-surface-2 border border-border p-1">
          <TabsTrigger value="participantes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-4 h-4 mr-2" />
            Participantes
          </TabsTrigger>
          <TabsTrigger value="recordatorios" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bell className="w-4 h-4 mr-2" />
            Recordatorios
          </TabsTrigger>
          <TabsTrigger value="configuracion" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Edit className="w-4 h-4 mr-2" />
            Configuracion
          </TabsTrigger>
        </TabsList>
        
        {/* Tab: Participantes */}
        <TabsContent value="participantes" className="mt-4 space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar participante..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-surface-2 border-border"
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[150px] bg-surface-2 border-border">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="en_progreso">En progreso</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Enviar a pendientes
            </Button>
          </div>
          
          {/* Lista de participantes */}
          <ForgeCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2/50">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Participante</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Evaluador</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Estado</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Fecha inicio</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Fecha fin</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Puntaje</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Plan mejora</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipantes.map(participante => (
                    <ParticipanteRow 
                      key={participante.id}
                      participante={participante}
                      onViewRespuestas={() => handleViewRespuestas(participante)}
                      onCrearPlan={() => handleCrearPlan(participante)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredParticipantes.length === 0 && (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay participantes que coincidan con los filtros.</p>
              </div>
            )}
          </ForgeCard>
        </TabsContent>
        
        {/* Tab: Recordatorios */}
        <TabsContent value="recordatorios" className="mt-4 space-y-4">
          <ForgeCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recordatorios programados</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar recordatorio
              </Button>
            </div>
            
            <div className="space-y-3">
              {lanzamiento.recordatorios.map((recordatorio, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    recordatorio.enviado 
                      ? "bg-emerald-500/5 border-emerald-500/30" 
                      : "bg-surface-2 border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      recordatorio.enviado ? "bg-emerald-500/20" : "bg-amber-500/20"
                    )}>
                      {recordatorio.enviado ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {recordatorio.enviado ? 'Recordatorio enviado' : 'Recordatorio programado'}
                      </p>
                      <p className="text-sm text-muted-foreground">Fecha: {recordatorio.fecha}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!recordatorio.enviado && (
                      <Button variant="outline" size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar ahora
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {lanzamiento.recordatorios.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay recordatorios configurados.</p>
                </div>
              )}
            </div>
          </ForgeCard>
        </TabsContent>
        
        {/* Tab: Configuracion */}
        <TabsContent value="configuracion" className="mt-4 space-y-4">
          <ForgeCard className="p-4">
            <h3 className="font-semibold mb-4">Configuracion del lanzamiento</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nombre del lanzamiento</label>
                <Input value={lanzamiento.nombre} className="bg-surface-2 border-border" readOnly />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Estado</label>
                <Input value={lanzamiento.estado} className="bg-surface-2 border-border" readOnly />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Fecha de inicio</label>
                <Input value={lanzamiento.fechaInicio} className="bg-surface-2 border-border" readOnly />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Fecha de fin</label>
                <Input value={lanzamiento.fechaFin} className="bg-surface-2 border-border" readOnly />
              </div>
            </div>
            
            <h4 className="font-medium mt-6 mb-3">Filtros aplicados</h4>
            <div className="flex flex-wrap gap-2">
              {lanzamiento.filtroArea?.map(area => (
                <Badge key={area} className="bg-blue-500/20 text-blue-300">Area: {area}</Badge>
              ))}
              {lanzamiento.filtroEquipo?.map(equipo => (
                <Badge key={equipo} className="bg-purple-500/20 text-purple-300">Equipo: {equipo}</Badge>
              ))}
              {lanzamiento.filtroVP?.map(vp => (
                <Badge key={vp} className="bg-emerald-500/20 text-emerald-300">VP: {vp}</Badge>
              ))}
              {!lanzamiento.filtroArea?.length && !lanzamiento.filtroEquipo?.length && !lanzamiento.filtroVP?.length && (
                <span className="text-muted-foreground text-sm">Sin filtros aplicados (toda la organizacion)</span>
              )}
            </div>
          </ForgeCard>
        </TabsContent>
      </Tabs>
      
      {/* Dialog: Ver respuestas */}
      <Dialog open={showRespuestasDialog} onOpenChange={setShowRespuestasDialog}>
        <DialogContent className="max-w-2xl bg-surface border-border max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Respuestas de {selectedParticipante?.talento.nombre}</DialogTitle>
            <DialogDescription>
              Detalle de las respuestas en la evaluacion
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {selectedParticipante && lanzamiento.encuesta && (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Puntaje total</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      (selectedParticipante.puntajeTotal || 0) >= 80 ? 'text-emerald-400' :
                      (selectedParticipante.puntajeTotal || 0) >= 60 ? 'text-amber-400' : 'text-red-400'
                    )}>
                      {selectedParticipante.puntajeTotal || 0}%
                    </p>
                  </div>
                  {selectedParticipante.requierePlanMejora && !selectedParticipante.planMejoraCreado && (
                    <Badge className="bg-red-500/20 text-red-300">Requiere plan de mejora</Badge>
                  )}
                </div>
                
                {lanzamiento.encuesta.preguntas.map((pregunta, idx) => {
                  const respuesta = selectedParticipante.respuestas.find(r => r.preguntaId === pregunta.id)
                  return (
                    <div key={pregunta.id} className="p-3 rounded-lg bg-surface-2 border border-border">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm">{pregunta.texto}</p>
                          <div className="mt-2">
                            {respuesta ? (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-sm">Respuesta:</span>
                                {typeof respuesta.valor === 'number' ? (
                                  <div className="flex items-center gap-2">
                                    <Badge className={cn(
                                      "font-medium",
                                      respuesta.valor >= 4 ? 'bg-emerald-500/20 text-emerald-300' :
                                      respuesta.valor >= 3 ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                                    )}>
                                      {respuesta.valor}/5
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      ({pregunta.escalaCalificacion?.find(e => e.valor === respuesta.valor)?.porcentaje || 0}%)
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm">{String(respuesta.valor)}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm italic">Sin respuesta</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog: Crear plan de mejora */}
      <Dialog open={showCrearPlanDialog} onOpenChange={setShowCrearPlanDialog}>
        <DialogContent className="max-w-lg bg-surface border-border">
          <DialogHeader>
            <DialogTitle>Crear plan de mejora</DialogTitle>
            <DialogDescription>
              Se creara un plan de mejora para {selectedParticipante?.talento.nombre} basado en los resultados de la evaluacion.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">Generar con IA</p>
                  <p className="text-sm text-muted-foreground">
                    La IA analizara las respuestas y generara una propuesta de plan de mejora con actividades sugeridas.
                  </p>
                </div>
              </div>
            </div>
            
            {selectedParticipante && (
              <div className="p-3 rounded-lg bg-surface-2">
                <p className="text-sm text-muted-foreground mb-1">Puntaje obtenido</p>
                <p className="text-lg font-bold text-red-400">{selectedParticipante.puntajeTotal || 0}%</p>
              </div>
            )}
            
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCrearPlanDialog(false)}>
                Cancelar
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Sparkles className="w-4 h-4 mr-2" />
                Generar plan con IA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente: Fila de participante
function ParticipanteRow({ 
  participante,
  onViewRespuestas,
  onCrearPlan,
}: { 
  participante: ParticipanteLanzamiento
  onViewRespuestas: () => void
  onCrearPlan: () => void
}) {
  const estadoColors = {
    completado: 'bg-emerald-500/20 text-emerald-300',
    en_progreso: 'bg-amber-500/20 text-amber-300',
    pendiente: 'bg-slate-500/20 text-slate-300',
  }
  
  const estadoLabels = {
    completado: 'Completado',
    en_progreso: 'En progreso',
    pendiente: 'Pendiente',
  }
  
  return (
    <tr className="border-b border-border/50 hover:bg-surface-2/50">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{participante.talento.nombre}</p>
            <p className="text-xs text-muted-foreground">{participante.talento.cargo}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        {participante.evaluador ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center">
              <User className="w-3 h-3" />
            </div>
            <span className="text-sm">{participante.evaluador.nombre}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="py-3 px-4 text-center">
        <Badge className={cn("text-[10px]", estadoColors[participante.estado])}>
          {estadoLabels[participante.estado]}
        </Badge>
      </td>
      <td className="py-3 px-4 text-center text-sm">
        {participante.fechaInicio || '-'}
      </td>
      <td className="py-3 px-4 text-center text-sm">
        {participante.fechaCompletado || '-'}
      </td>
      <td className="py-3 px-4 text-center">
        {participante.puntajeTotal ? (
          <span className={cn(
            "font-medium",
            participante.puntajeTotal >= 80 ? 'text-emerald-400' :
            participante.puntajeTotal >= 60 ? 'text-amber-400' : 'text-red-400'
          )}>
            {participante.puntajeTotal}%
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="py-3 px-4 text-center">
        {participante.requierePlanMejora ? (
          participante.planMejoraCreado ? (
            <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">Creado</Badge>
          ) : (
            <Badge className="bg-red-500/20 text-red-300 text-[10px]">Requerido</Badge>
          )
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {participante.estado === 'completado' && (
            <Button variant="ghost" size="sm" onClick={onViewRespuestas}>
              <Eye className="w-4 h-4" />
            </Button>
          )}
          {participante.requierePlanMejora && !participante.planMejoraCreado && (
            <Button variant="ghost" size="sm" onClick={onCrearPlan} className="text-amber-400">
              <Sparkles className="w-4 h-4" />
            </Button>
          )}
          {participante.estado === 'pendiente' && (
            <Button variant="ghost" size="sm">
              <Mail className="w-4 h-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
