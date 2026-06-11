'use client'

import { useState, useMemo } from 'react'
import { useForgeStore, type Plan, type Seguimiento, planStatusLabels, planStatusColors, criticidadLabels, criticidadColors, ejeLabels, ejeColors, type ActividadEstado, type RoleType } from '@/lib/store'
import { ForgeCard, ForgeCardHeader, PageHeader, ProgressBar, ForgeBadge, EmptyState } from '@/components/forge/forge-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { 
  ChevronLeft, Plus, Download, Edit, Clock, Calendar, User, Building, 
  Target, FileText, MessageSquare, GraduationCap, History, AlertTriangle,
  CheckCircle2, XCircle, Sparkles, Upload, ClipboardCheck, ArrowUpRight,
  MoreHorizontal, Lightbulb, TrendingUp
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

interface PlanDetailProps {
  plan: Plan
  onBack: () => void
  onEdit?: () => void
}

const actividadEstadoLabels: Record<ActividadEstado, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  cumplido: 'Cumplido',
  no_cumplido: 'No cumplido',
  en_riesgo: 'En riesgo',
}

const actividadEstadoColors: Record<ActividadEstado, 'green' | 'red' | 'yellow' | 'blue' | 'gray'> = {
  pendiente: 'gray',
  en_progreso: 'blue',
  cumplido: 'green',
  no_cumplido: 'red',
  en_riesgo: 'yellow',
}

export function PlanDetail({ plan, onBack, onEdit }: PlanDetailProps) {
  const { currentRole, getPlanPermissions, updatePlan, addSeguimiento, addComentarioTalento, addNotification } = useForgeStore()
  const permissions = getPlanPermissions()
  
  const [activeTab, setActiveTab] = useState('resumen')
  const [showSeguimientoDialog, setShowSeguimientoDialog] = useState(false)
  const [showAmpliarDialog, setShowAmpliarDialog] = useState(false)
  const [showCerrarDialog, setShowCerrarDialog] = useState(false)
  const [showComentarioDialog, setShowComentarioDialog] = useState(false)
  
  // Form states
  const [seguimientoForm, setSeguimientoForm] = useState({
    tipo: 'general' as 'general' | 'actividad',
    actividadId: '',
    observacion: '',
    acuerdos: '',
    avance: 0,
    proximaFecha: '',
  })
  
  const [ampliarForm, setAmpliarForm] = useState({
    nuevaFecha: '',
    motivo: '',
    riesgo: '',
    comentarios: '',
  })
  
  const [cerrarForm, setCerrarForm] = useState({
    resultado: 'superado' as 'superado' | 'no_superado',
    resumenFinal: '',
    cumplimientoMeta: 'si' as 'si' | 'parcial' | 'no',
    criterioCumplido: 'si' as 'si' | 'parcial' | 'no',
    recomendacionPosterior: 'Sin accion',
    comentariosFinales: '',
  })
  
  const [comentarioForm, setComentarioForm] = useState({
    texto: '',
    relacionadoCon: 'plan' as 'plan' | 'actividad' | 'seguimiento',
    actividadId: '',
  })
  
  const diasRestantes = useMemo(() => {
    const fechaFin = new Date(plan.fechaFinInicial)
    const hoy = new Date()
    return Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  }, [plan.fechaFinInicial])
  
  const actividadesPorEje = useMemo(() => ({
    ser: plan.actividades.filter(a => a.eje === 'ser'),
    saber: plan.actividades.filter(a => a.eje === 'saber'),
    hacer: plan.actividades.filter(a => a.eje === 'hacer'),
  }), [plan.actividades])
  
  const handleAddSeguimiento = () => {
    const newSeguimiento: Seguimiento = {
      id: `s${Date.now()}`,
      semana: plan.seguimientos.length + 1,
      fecha: new Date().toISOString().split('T')[0],
      tipo: seguimientoForm.tipo,
      actividadId: seguimientoForm.actividadId || undefined,
      observacionGeneral: seguimientoForm.observacion,
      acuerdos: seguimientoForm.acuerdos,
      avanceEstimado: seguimientoForm.avance,
      responsable: plan.lider.nombre,
      okLider: true,
      okTalento: false,
      proximaFecha: seguimientoForm.proximaFecha,
      evidencias: [],
    }
    
    addSeguimiento(plan.id, newSeguimiento)
    updatePlan(plan.id, { avance: seguimientoForm.avance })
    
    addNotification({
      id: `n${Date.now()}`,
      tipo: 'seguimiento',
      titulo: 'Seguimiento registrado',
      mensaje: `Se registro un nuevo seguimiento en tu plan.`,
      fecha: new Date().toISOString().split('T')[0],
      leida: false,
      rol: 'talento',
      planId: plan.id,
      talentoId: plan.talentoId,
    })
    
    setShowSeguimientoDialog(false)
    setSeguimientoForm({ tipo: 'general', actividadId: '', observacion: '', acuerdos: '', avance: plan.avance, proximaFecha: '' })
  }
  
  const handleAmpliar = () => {
    updatePlan(plan.id, {
      estado: 'ampliado',
      fechaFinInicial: ampliarForm.nuevaFecha,
      ampliaciones: [...plan.ampliaciones, {
        id: `amp${Date.now()}`,
        fecha: new Date().toISOString().split('T')[0],
        nuevaFecha: ampliarForm.nuevaFecha,
        motivo: ampliarForm.motivo,
        riesgo: ampliarForm.riesgo,
        comentarios: ampliarForm.comentarios,
      }],
      historial: [...plan.historial, {
        id: `h${Date.now()}`,
        fecha: new Date().toISOString().split('T')[0],
        accion: 'Plan ampliado',
        autor: plan.lider.nombre,
        detalles: `Nueva fecha: ${ampliarForm.nuevaFecha}. Motivo: ${ampliarForm.motivo}`,
      }],
    })
    
    setShowAmpliarDialog(false)
  }
  
  const handleCerrar = () => {
    updatePlan(plan.id, {
      estado: cerrarForm.resultado === 'superado' ? 'cerrado_superado' : 'cerrado_no_superado',
      fechaCierreReal: new Date().toISOString().split('T')[0],
      avance: 100,
      cierreInfo: {
        resultado: cerrarForm.resultado,
        fechaCierre: new Date().toISOString().split('T')[0],
        resumenFinal: cerrarForm.resumenFinal,
        cumplimientoMeta: cerrarForm.cumplimientoMeta,
        criterioCumplido: cerrarForm.criterioCumplido,
        recomendacionPosterior: cerrarForm.recomendacionPosterior,
        comentariosFinales: cerrarForm.comentariosFinales,
      },
      historial: [...plan.historial, {
        id: `h${Date.now()}`,
        fecha: new Date().toISOString().split('T')[0],
        accion: `Plan cerrado - ${cerrarForm.resultado === 'superado' ? 'Superado' : 'No superado'}`,
        autor: plan.lider.nombre,
        detalles: cerrarForm.resumenFinal,
      }],
    })
    
    setShowCerrarDialog(false)
  }
  
  const handleAddComentario = () => {
    addComentarioTalento(plan.id, {
      id: `ct${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      texto: comentarioForm.texto,
      relacionadoCon: comentarioForm.relacionadoCon,
      actividadId: comentarioForm.actividadId || undefined,
    })
    
    addNotification({
      id: `n${Date.now()}`,
      tipo: 'comentario',
      titulo: 'Nuevo comentario del talento',
      mensaje: `${plan.talento.nombre} dejo un comentario en su plan.`,
      fecha: new Date().toISOString().split('T')[0],
      leida: false,
      rol: 'lider',
      planId: plan.id,
      talentoId: plan.talentoId,
    })
    
    setShowComentarioDialog(false)
    setComentarioForm({ texto: '', relacionadoCon: 'plan', actividadId: '' })
  }
  
  const isClosed = plan.estado.startsWith('cerrado')

  return (
    <div>
      <PageHeader 
        title={`Plan de ${plan.tipo}`}
        subtitle={plan.subtipo}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Volver
            </Button>
            
            {permissions.descargar && (
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Descargar
              </Button>
            )}
            
            {!isClosed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2">
                    Acciones
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {permissions.seguimiento && (
                    <DropdownMenuItem onClick={() => setShowSeguimientoDialog(true)}>
                      <ClipboardCheck className="w-4 h-4 mr-2" />
                      Registrar seguimiento
                    </DropdownMenuItem>
                  )}
                  {permissions.comentar && (
                    <DropdownMenuItem onClick={() => setShowComentarioDialog(true)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Agregar comentario
                    </DropdownMenuItem>
                  )}
                  {permissions.editar && onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar plan
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {permissions.ampliar && (
                    <DropdownMenuItem onClick={() => setShowAmpliarDialog(true)}>
                      <Clock className="w-4 h-4 mr-2" />
                      Ampliar plan
                    </DropdownMenuItem>
                  )}
                  {permissions.cerrar && (
                    <DropdownMenuItem onClick={() => setShowCerrarDialog(true)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Cerrar plan
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />
      
      {/* Header Card */}
      <ForgeCard className="mb-6">
        <div className="flex flex-wrap items-start gap-6">
          {/* Avatar y talento */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold shrink-0",
              plan.tipo === 'mejora' ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
            )}>
              {plan.talento.visuel}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{plan.talento.nombre}</h3>
              <p className="text-sm text-muted-foreground">{plan.talento.cargo}</p>
              <p className="text-xs text-muted-foreground">{plan.talento.area} / {plan.talento.equipo}</p>
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <ForgeBadge variant={plan.tipo === 'mejora' ? 'yellow' : 'green'}>
              {plan.tipo === 'mejora' ? 'Mejora' : 'Desarrollo'}
            </ForgeBadge>
            <ForgeBadge variant={planStatusColors[plan.estado]}>
              {planStatusLabels[plan.estado]}
            </ForgeBadge>
            <ForgeBadge variant={criticidadColors[plan.criticidad]}>
              {criticidadLabels[plan.criticidad]}
            </ForgeBadge>
            <span className={cn("px-2 py-0.5 rounded text-[11px] font-medium border", ejeColors[plan.ejePrincipal])}>
              {ejeLabels[plan.ejePrincipal]}
            </span>
          </div>
          
          {/* Metricas */}
          <div className="flex-1 flex flex-wrap gap-6 justify-end">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{plan.avance}%</div>
              <div className="text-xs text-muted-foreground">Avance</div>
              <ProgressBar value={plan.avance} color={plan.avance >= 75 ? 'success' : plan.avance >= 50 ? 'primary' : 'warning'} className="w-20 mt-1" />
            </div>
            <div className="text-center">
              <div className={cn("text-2xl font-bold", diasRestantes <= 7 ? "text-warning" : diasRestantes <= 0 ? "text-destructive" : "text-foreground")}>
                {diasRestantes > 0 ? diasRestantes : Math.abs(diasRestantes)}
              </div>
              <div className="text-xs text-muted-foreground">
                {diasRestantes > 0 ? 'Dias restantes' : 'Dias vencido'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{plan.actividades.length}</div>
              <div className="text-xs text-muted-foreground">Actividades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{plan.seguimientos.length}</div>
              <div className="text-xs text-muted-foreground">Seguimientos</div>
            </div>
          </div>
        </div>
        
        {/* Info adicional */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            Lider: {plan.lider.nombre}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {plan.fechaInicio} - {plan.fechaFinInicial}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Origen: {plan.origen}
          </span>
          {plan.solicitudForPlus && plan.solicitudForPlus.estado !== 'no_solicitada' && (
            <span className="flex items-center gap-1 text-purple-400">
              <GraduationCap className="w-4 h-4" />
              For+: {plan.solicitudForPlus.estado}
            </span>
          )}
        </div>
      </ForgeCard>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-surface-2 p-1 mb-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="actividades">Actividades ({plan.actividades.length})</TabsTrigger>
          <TabsTrigger value="seguimientos">Seguimientos ({plan.seguimientos.length})</TabsTrigger>
          <TabsTrigger value="evidencias">Evidencias</TabsTrigger>
          {plan.solicitudForPlus && <TabsTrigger value="forplus">Formacion For+</TabsTrigger>}
          <TabsTrigger value="comentarios">Comentarios ({plan.comentariosTalento.length})</TabsTrigger>
          <TabsTrigger value="historico">Historico</TabsTrigger>
        </TabsList>
        
        {/* Tab: Resumen */}
        <TabsContent value="resumen">
          <div className="grid md:grid-cols-2 gap-6">
            <ForgeCard>
              <ForgeCardHeader title="Motivo y contexto" />
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Hallazgos / Motivo</Label>
                  <p className="text-sm mt-1">{plan.hallazgos}</p>
                </div>
                {plan.dondeNace && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Donde nace la necesidad</Label>
                    <p className="text-sm mt-1">{plan.dondeNace}</p>
                  </div>
                )}
                {plan.impactoObservado && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Impacto observado</Label>
                    <p className="text-sm mt-1">{plan.impactoObservado}</p>
                  </div>
                )}
                {plan.beneficioEsperado && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Beneficio esperado</Label>
                    <p className="text-sm mt-1">{plan.beneficioEsperado}</p>
                  </div>
                )}
              </div>
            </ForgeCard>
            
            <ForgeCard>
              <ForgeCardHeader title="Meta y criterio de cierre" />
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Meta trazada</Label>
                  <p className="text-sm mt-1">{plan.metaTrazada}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Objetivo SMART</Label>
                  <p className="text-sm mt-1">{plan.objetivoSmart}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Criterio de cierre</Label>
                  <p className="text-sm mt-1">{plan.criterioCierre}</p>
                </div>
                {plan.riesgosSinMejora && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Riesgos si no hay mejora</Label>
                    <p className="text-sm mt-1 text-warning">{plan.riesgosSinMejora}</p>
                  </div>
                )}
              </div>
            </ForgeCard>
            
            {plan.indicadores.length > 0 && (
              <ForgeCard className="md:col-span-2">
                <ForgeCardHeader title="Indicadores" />
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-2 font-medium text-muted-foreground">Indicador</th>
                        <th className="pb-2 font-medium text-muted-foreground">Meta</th>
                        <th className="pb-2 font-medium text-muted-foreground">Unidad</th>
                        <th className="pb-2 font-medium text-muted-foreground">Fecha objetivo</th>
                        <th className="pb-2 font-medium text-muted-foreground">Responsable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.indicadores.map((ind, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2">{ind.nombre}</td>
                          <td className="py-2 font-medium text-primary">{ind.meta}</td>
                          <td className="py-2">{ind.unidad}</td>
                          <td className="py-2">{ind.fechaObjetivo}</td>
                          <td className="py-2">{ind.responsable}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ForgeCard>
            )}
            
            {plan.cierreInfo && (
              <ForgeCard className={cn("md:col-span-2", plan.cierreInfo.resultado === 'superado' ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30")}>
                <ForgeCardHeader title={`Cierre del plan - ${plan.cierreInfo.resultado === 'superado' ? 'Superado' : 'No superado'}`} />
                <div className="space-y-3">
                  <p className="text-sm">{plan.cierreInfo.resumenFinal}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>Cumplimiento de meta: <strong>{plan.cierreInfo.cumplimientoMeta}</strong></span>
                    <span>Criterio cumplido: <strong>{plan.cierreInfo.criterioCumplido}</strong></span>
                    <span>Recomendacion: <strong>{plan.cierreInfo.recomendacionPosterior}</strong></span>
                  </div>
                  {plan.cierreInfo.comentariosFinales && (
                    <p className="text-sm text-muted-foreground">{plan.cierreInfo.comentariosFinales}</p>
                  )}
                </div>
              </ForgeCard>
            )}
          </div>
        </TabsContent>
        
        {/* Tab: Actividades */}
        <TabsContent value="actividades">
          {plan.actividades.length === 0 ? (
            <ForgeCard>
              <EmptyState 
                icon="🎯"
                title="No hay actividades registradas"
                description="Las actividades del plan apareceran aqui."
              />
            </ForgeCard>
          ) : (
            <div className="space-y-6">
              {(['ser', 'saber', 'hacer'] as const).map(eje => {
                const actividades = actividadesPorEje[eje]
                if (actividades.length === 0) return null
                
                return (
                  <div key={eje}>
                    <div className={cn("flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg border w-fit", ejeColors[eje])}>
                      <span className="text-sm font-medium">{ejeLabels[eje]}</span>
                      <span className="text-xs">({actividades.length})</span>
                    </div>
                    
                    <div className="space-y-3">
                      {actividades.map((actividad, i) => (
                        <ForgeCard key={actividad.id}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{actividad.tema}</span>
                              <ForgeBadge variant={actividadEstadoColors[actividad.estado]}>
                                {actividadEstadoLabels[actividad.estado]}
                              </ForgeBadge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Vence: {actividad.fechaCompromiso}
                            </span>
                          </div>
                          
                          <p className="text-sm mb-3">{actividad.compromiso}</p>
                          
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>Indicador: <strong className="text-foreground">{actividad.indicador}</strong></span>
                            <span>Evidencia: {actividad.evidenciaEsperada}</span>
                            <span>Responsable: {actividad.responsable}</span>
                          </div>
                          
                          {actividad.comentarios.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <span className="text-xs font-medium text-muted-foreground">Comentarios ({actividad.comentarios.length})</span>
                            </div>
                          )}
                        </ForgeCard>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
        
        {/* Tab: Seguimientos */}
        <TabsContent value="seguimientos">
          {permissions.seguimiento && !isClosed && (
            <div className="mb-4">
              <Button onClick={() => setShowSeguimientoDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Registrar seguimiento
              </Button>
            </div>
          )}
          
          {plan.seguimientos.length === 0 ? (
            <ForgeCard>
              <EmptyState 
                icon="📋"
                title="No hay seguimientos registrados"
                description="Los seguimientos del plan apareceran aqui."
                action={permissions.seguimiento && !isClosed && (
                  <Button onClick={() => setShowSeguimientoDialog(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Registrar primer seguimiento
                  </Button>
                )}
              />
            </ForgeCard>
          ) : (
            <div className="space-y-4">
              {plan.seguimientos.map((seg, i) => (
                <ForgeCard key={seg.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                        {seg.semana}
                      </div>
                      <div>
                        <span className="font-medium">Semana {seg.semana}</span>
                        <span className="text-xs text-muted-foreground ml-2">{seg.fecha}</span>
                      </div>
                      <ForgeBadge variant={seg.tipo === 'general' ? 'blue' : 'purple'}>
                        {seg.tipo === 'general' ? 'General' : 'Por actividad'}
                      </ForgeBadge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">{seg.avanceEstimado}%</span>
                      {seg.okLider && seg.okTalento && (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{seg.observacionGeneral}</p>
                  
                  {seg.acuerdos && (
                    <div className="p-3 bg-surface-2 rounded-lg mb-3">
                      <span className="text-xs font-medium text-muted-foreground">Acuerdos / Proximos pasos:</span>
                      <p className="text-sm mt-1">{seg.acuerdos}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Responsable: {seg.responsable}</span>
                    <span>Proxima fecha: {seg.proximaFecha}</span>
                    <span className="flex items-center gap-1">
                      OK Lider: {seg.okLider ? <CheckCircle2 className="w-3 h-3 text-success" /> : <XCircle className="w-3 h-3 text-muted-foreground" />}
                    </span>
                    <span className="flex items-center gap-1">
                      OK Talento: {seg.okTalento ? <CheckCircle2 className="w-3 h-3 text-success" /> : <XCircle className="w-3 h-3 text-muted-foreground" />}
                    </span>
                  </div>
                </ForgeCard>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Tab: Evidencias */}
        <TabsContent value="evidencias">
          <ForgeCard>
            <ForgeCardHeader 
              title="Evidencias del plan" 
              action={permissions.adjuntar && !isClosed && (
                <Button size="sm" variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Cargar evidencia
                </Button>
              )}
            />
            <EmptyState 
              icon="📎"
              title="No hay evidencias cargadas"
              description="Las evidencias del plan apareceran aqui."
            />
          </ForgeCard>
        </TabsContent>
        
        {/* Tab: For+ */}
        {plan.solicitudForPlus && (
          <TabsContent value="forplus">
            <ForgeCard>
              <ForgeCardHeader 
                title="Solicitud de formacion For+" 
                action={
                  <ForgeBadge variant={plan.solicitudForPlus.estado === 'completada' ? 'green' : plan.solicitudForPlus.estado === 'cancelada' ? 'red' : 'purple'}>
                    {plan.solicitudForPlus.estado}
                  </ForgeBadge>
                }
              />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Competencia asociada</Label>
                    <p className="text-sm mt-1 font-medium">{plan.solicitudForPlus.competencia}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tipo de formacion</Label>
                    <p className="text-sm mt-1">{plan.solicitudForPlus.tipo}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Prioridad</Label>
                    <p className="text-sm mt-1">{plan.solicitudForPlus.prioridad}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Justificacion</Label>
                    <p className="text-sm mt-1">{plan.solicitudForPlus.justificacion}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Fecha sugerida</Label>
                    <p className="text-sm mt-1">{plan.solicitudForPlus.fechaSugerida}</p>
                  </div>
                  {plan.solicitudForPlus.comentarios && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Comentarios para For+</Label>
                      <p className="text-sm mt-1">{plan.solicitudForPlus.comentarios}</p>
                    </div>
                  )}
                </div>
              </div>
            </ForgeCard>
          </TabsContent>
        )}
        
        {/* Tab: Comentarios */}
        <TabsContent value="comentarios">
          {permissions.comentar && !isClosed && (
            <div className="mb-4">
              <Button onClick={() => setShowComentarioDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Agregar comentario
              </Button>
            </div>
          )}
          
          {plan.comentariosTalento.length === 0 ? (
            <ForgeCard>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 p-3 bg-surface-2 rounded-lg">
                <Lightbulb className="w-4 h-4 text-primary" />
                Puedes dejar una observacion sobre tu avance, una dificultad o una evidencia del compromiso trabajado.
              </div>
              <EmptyState 
                icon="💬"
                title="No hay comentarios del talento"
                description="Los comentarios apareceran aqui."
              />
            </ForgeCard>
          ) : (
            <div className="space-y-3">
              {plan.comentariosTalento.map(com => (
                <ForgeCard key={com.id}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        {plan.talento.visuel}
                      </div>
                      <span className="font-medium text-sm">{plan.talento.nombre}</span>
                      <ForgeBadge variant="gray">{com.relacionadoCon}</ForgeBadge>
                    </div>
                    <span className="text-xs text-muted-foreground">{com.fecha}</span>
                  </div>
                  <p className="text-sm">{com.texto}</p>
                </ForgeCard>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Tab: Historico */}
        <TabsContent value="historico">
          <ForgeCard>
            <ForgeCardHeader title="Historial del plan" />
            {plan.historial.length === 0 ? (
              <EmptyState 
                icon="📜"
                title="No hay registros en el historial"
                description="Las acciones del plan se registraran aqui."
              />
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {plan.historial.map((h, i) => (
                    <div key={h.id} className="relative pl-10">
                      <div className="absolute left-2 w-5 h-5 rounded-full bg-surface-2 border-2 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="p-3 bg-surface-2 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{h.accion}</span>
                          <span className="text-xs text-muted-foreground">{h.fecha}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{h.detalles}</p>
                        <span className="text-xs text-muted-foreground">Por: {h.autor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {plan.ampliaciones.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-medium mb-4">Ampliaciones del plan</h4>
                <div className="space-y-3">
                  {plan.ampliaciones.map(amp => (
                    <div key={amp.id} className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-sm">Ampliacion - {amp.fecha}</span>
                        <span className="text-xs">Nueva fecha: {amp.nuevaFecha}</span>
                      </div>
                      <p className="text-sm">{amp.motivo}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ForgeCard>
        </TabsContent>
      </Tabs>
      
      {/* Dialog: Registrar seguimiento */}
      <Dialog open={showSeguimientoDialog} onOpenChange={setShowSeguimientoDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar seguimiento</DialogTitle>
            <DialogDescription>
              Puedes registrar seguimiento general o de una actividad especifica.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de seguimiento</Label>
              <Select value={seguimientoForm.tipo} onValueChange={(v) => setSeguimientoForm(p => ({ ...p, tipo: v as typeof seguimientoForm.tipo }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General del plan</SelectItem>
                  <SelectItem value="actividad">Por actividad especifica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {seguimientoForm.tipo === 'actividad' && (
              <div className="space-y-2">
                <Label>Actividad</Label>
                <Select value={seguimientoForm.actividadId} onValueChange={(v) => setSeguimientoForm(p => ({ ...p, actividadId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    {plan.actividades.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.tema} - {a.compromiso.slice(0, 50)}...</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Observacion *</Label>
              <Textarea 
                value={seguimientoForm.observacion}
                onChange={(e) => setSeguimientoForm(p => ({ ...p, observacion: e.target.value }))}
                placeholder="Describe las observaciones del seguimiento..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Acuerdos / Proximos pasos</Label>
              <Textarea 
                value={seguimientoForm.acuerdos}
                onChange={(e) => setSeguimientoForm(p => ({ ...p, acuerdos: e.target.value }))}
                placeholder="Define los acuerdos y proximos pasos..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Avance estimado</Label>
                <Select 
                  value={String(seguimientoForm.avance)} 
                  onValueChange={(v) => setSeguimientoForm(p => ({ ...p, avance: Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50, 75, 90, 100].map(v => (
                      <SelectItem key={v} value={String(v)}>{v}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Proxima fecha</Label>
                <Input 
                  type="date"
                  value={seguimientoForm.proximaFecha}
                  onChange={(e) => setSeguimientoForm(p => ({ ...p, proximaFecha: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSeguimientoDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddSeguimiento} disabled={!seguimientoForm.observacion}>Guardar seguimiento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog: Ampliar plan */}
      <Dialog open={showAmpliarDialog} onOpenChange={setShowAmpliarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ampliar plan</DialogTitle>
            <DialogDescription>
              Extiende la fecha de cierre del plan con justificacion.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nueva fecha de cierre *</Label>
              <Input 
                type="date"
                value={ampliarForm.nuevaFecha}
                onChange={(e) => setAmpliarForm(p => ({ ...p, nuevaFecha: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Motivo de ampliacion *</Label>
              <Textarea 
                value={ampliarForm.motivo}
                onChange={(e) => setAmpliarForm(p => ({ ...p, motivo: e.target.value }))}
                placeholder="Explica el motivo para ampliar el plan..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Riesgo asociado</Label>
              <Input 
                value={ampliarForm.riesgo}
                onChange={(e) => setAmpliarForm(p => ({ ...p, riesgo: e.target.value }))}
                placeholder="Ej: Medio, Alto..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Comentarios para GH / PeopleOps</Label>
              <Textarea 
                value={ampliarForm.comentarios}
                onChange={(e) => setAmpliarForm(p => ({ ...p, comentarios: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAmpliarDialog(false)}>Cancelar</Button>
            <Button onClick={handleAmpliar} disabled={!ampliarForm.nuevaFecha || !ampliarForm.motivo}>Ampliar plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog: Cerrar plan */}
      <Dialog open={showCerrarDialog} onOpenChange={setShowCerrarDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cerrar plan</DialogTitle>
            <DialogDescription>
              Define el resultado final del plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resultado final *</Label>
              <Select value={cerrarForm.resultado} onValueChange={(v) => setCerrarForm(p => ({ ...p, resultado: v as typeof cerrarForm.resultado }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superado">Cerrado - Superado</SelectItem>
                  <SelectItem value="no_superado">Cerrado - No superado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Resumen final *</Label>
              <Textarea 
                value={cerrarForm.resumenFinal}
                onChange={(e) => setCerrarForm(p => ({ ...p, resumenFinal: e.target.value }))}
                placeholder="Resume el resultado del plan..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cumplimiento de meta</Label>
                <Select value={cerrarForm.cumplimientoMeta} onValueChange={(v) => setCerrarForm(p => ({ ...p, cumplimientoMeta: v as typeof cerrarForm.cumplimientoMeta }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="si">Si</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Criterio cumplido</Label>
                <Select value={cerrarForm.criterioCumplido} onValueChange={(v) => setCerrarForm(p => ({ ...p, criterioCumplido: v as typeof cerrarForm.criterioCumplido }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="si">Si</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Recomendacion posterior</Label>
              <Select value={cerrarForm.recomendacionPosterior} onValueChange={(v) => setCerrarForm(p => ({ ...p, recomendacionPosterior: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sin accion">Sin accion</SelectItem>
                  <SelectItem value="Continuar seguimiento">Continuar seguimiento</SelectItem>
                  <SelectItem value="Crear nuevo plan">Crear nuevo plan</SelectItem>
                  <SelectItem value="Escalar con Relaciones Laborales">Escalar con Relaciones Laborales</SelectItem>
                      <SelectItem value="Escalar con Recursos Humanos">Escalar con Recursos Humanos</SelectItem>
                  <SelectItem value="Escalar a Relaciones Laborales">Escalar a Relaciones Laborales</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Comentarios finales</Label>
              <Textarea 
                value={cerrarForm.comentariosFinales}
                onChange={(e) => setCerrarForm(p => ({ ...p, comentariosFinales: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCerrarDialog(false)}>Cancelar</Button>
            <Button onClick={handleCerrar} disabled={!cerrarForm.resumenFinal}>Cerrar plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog: Agregar comentario */}
      <Dialog open={showComentarioDialog} onOpenChange={setShowComentarioDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar comentario</DialogTitle>
            <DialogDescription>
              Puedes dejar una observacion sobre tu avance, una dificultad o una evidencia del compromiso trabajado.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Relacionado con</Label>
              <Select value={comentarioForm.relacionadoCon} onValueChange={(v) => setComentarioForm(p => ({ ...p, relacionadoCon: v as typeof comentarioForm.relacionadoCon }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plan">Plan general</SelectItem>
                  <SelectItem value="actividad">Actividad especifica</SelectItem>
                  <SelectItem value="seguimiento">Seguimiento especifico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {comentarioForm.relacionadoCon === 'actividad' && (
              <div className="space-y-2">
                <Label>Actividad</Label>
                <Select value={comentarioForm.actividadId} onValueChange={(v) => setComentarioForm(p => ({ ...p, actividadId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    {plan.actividades.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.tema}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Comentario *</Label>
              <Textarea 
                value={comentarioForm.texto}
                onChange={(e) => setComentarioForm(p => ({ ...p, texto: e.target.value }))}
                placeholder="Escribe tu comentario..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComentarioDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddComentario} disabled={!comentarioForm.texto}>Agregar comentario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
