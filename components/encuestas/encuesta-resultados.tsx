'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { type Encuesta, type LanzamientoEncuesta, type TipoEncuesta } from '@/lib/store'
import { ForgeCard, PageHeader, Badge, StatCard } from '@/components/forge/forge-ui'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ChevronLeft, BarChart3, Users, Target, TrendingUp, TrendingDown,
  CheckCircle2, Clock, AlertTriangle, Download, Play, Calendar,
  ArrowRight, ChevronDown, ChevronRight, User, FileText, Sparkles,
  Filter, Eye
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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

interface EncuestaResultadosProps {
  encuesta: Encuesta
  lanzamientos: LanzamientoEncuesta[]
  onBack: () => void
  onViewLanzamiento: (lanzamiento: LanzamientoEncuesta) => void
}

export function EncuestaResultados({ encuesta, lanzamientos, onBack, onViewLanzamiento }: EncuestaResultadosProps) {
  const [activeTab, setActiveTab] = useState('resumen')
  const [selectedLanzamiento, setSelectedLanzamiento] = useState<string>('todos')
  
  // Calcular metricas globales
  const stats = useMemo(() => {
    const totalLanzamientos = lanzamientos.length
    const lanzamientosActivos = lanzamientos.filter(l => l.estado === 'en_curso').length
    const lanzamientosCerrados = lanzamientos.filter(l => l.estado === 'cerrado').length
    
    let totalParticipantes = 0
    let participantesCompletados = 0
    let sumaPuntajes = 0
    let countPuntajes = 0
    let requierenPlan = 0
    
    lanzamientos.forEach(l => {
      totalParticipantes += l.participantes.length
      l.participantes.forEach(p => {
        if (p.estado === 'completado') {
          participantesCompletados++
          if (p.puntajeTotal) {
            sumaPuntajes += p.puntajeTotal
            countPuntajes++
          }
          if (p.requierePlanMejora && !p.planMejoraCreado) {
            requierenPlan++
          }
        }
      })
    })
    
    const tasaRespuesta = totalParticipantes > 0 ? Math.round((participantesCompletados / totalParticipantes) * 100) : 0
    const promedioGeneral = countPuntajes > 0 ? Math.round(sumaPuntajes / countPuntajes) : 0
    
    return { 
      totalLanzamientos, 
      lanzamientosActivos, 
      lanzamientosCerrados,
      totalParticipantes, 
      participantesCompletados, 
      tasaRespuesta, 
      promedioGeneral,
      requierenPlan 
    }
  }, [lanzamientos])
  
  // Calcular promedios por pilar
  const promediosPorPilar = useMemo(() => {
    const pilares = {
      ser: { total: 0, count: 0 },
      saber_hacer: { total: 0, count: 0 },
      especifico: { total: 0, count: 0 },
    }
    
    lanzamientos.forEach(l => {
      l.participantes.forEach(p => {
        if (p.estado === 'completado' && p.respuestas) {
          p.respuestas.forEach(r => {
            const pregunta = encuesta.preguntas.find(pr => pr.id === r.preguntaId)
            if (pregunta && typeof r.valor === 'number') {
              pilares[pregunta.pilar].total += r.valor
              pilares[pregunta.pilar].count++
            }
          })
        }
      })
    })
    
    return {
      ser: pilares.ser.count > 0 ? (pilares.ser.total / pilares.ser.count).toFixed(1) : '-',
      saber_hacer: pilares.saber_hacer.count > 0 ? (pilares.saber_hacer.total / pilares.saber_hacer.count).toFixed(1) : '-',
      especifico: pilares.especifico.count > 0 ? (pilares.especifico.total / pilares.especifico.count).toFixed(1) : '-',
    }
  }, [lanzamientos, encuesta])
  
  // Filtrar lanzamientos
  const filteredLanzamientos = useMemo(() => {
    if (selectedLanzamiento === 'todos') return lanzamientos
    return lanzamientos.filter(l => l.id === selectedLanzamiento)
  }, [lanzamientos, selectedLanzamiento])
  
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
              <h1 className="text-xl font-bold">{encuesta.nombre}</h1>
              <Badge className="bg-primary/20 text-primary">{tipoEncuestaLabels[encuesta.tipo]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{encuesta.descripcion}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedLanzamiento} onValueChange={setSelectedLanzamiento}>
            <SelectTrigger className="w-[200px] bg-surface-2 border-border">
              <SelectValue placeholder="Filtrar lanzamiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los lanzamientos</SelectItem>
              {lanzamientos.map(l => (
                <SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard label="Lanzamientos" value={stats.totalLanzamientos} icon={<Play className="w-5 h-5" />} />
        <StatCard label="Activos" value={stats.lanzamientosActivos} icon={<Clock className="w-5 h-5" />} color="amber" />
        <StatCard label="Cerrados" value={stats.lanzamientosCerrados} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard label="Participantes" value={stats.totalParticipantes} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Completados" value={stats.participantesCompletados} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard label="Tasa respuesta" value={`${stats.tasaRespuesta}%`} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
        <StatCard label="Promedio" value={`${stats.promedioGeneral}%`} icon={<Target className="w-5 h-5" />} color="purple" />
        <StatCard label="Requieren plan" value={stats.requierenPlan} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-surface-2 border border-border p-1">
          <TabsTrigger value="resumen" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="w-4 h-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="lanzamientos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Play className="w-4 h-4 mr-2" />
            Lanzamientos
          </TabsTrigger>
          <TabsTrigger value="participantes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-4 h-4 mr-2" />
            Participantes
          </TabsTrigger>
          <TabsTrigger value="preguntas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="w-4 h-4 mr-2" />
            Por pregunta
          </TabsTrigger>
        </TabsList>
        
        {/* Tab: Resumen */}
        <TabsContent value="resumen" className="mt-4 space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Promedios por pilar */}
            <ForgeCard className="p-4">
              <h3 className="font-semibold mb-4">Promedio por pilar</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span>Ser (Cultura)</span>
                    </div>
                    <span className="font-medium">{promediosPorPilar.ser}/5</span>
                  </div>
                  <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-purple-500 transition-all"
                      style={{ width: `${promediosPorPilar.ser !== '-' ? (parseFloat(promediosPorPilar.ser) / 5) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Saber y Hacer</span>
                    </div>
                    <span className="font-medium">{promediosPorPilar.saber_hacer}/5</span>
                  </div>
                  <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${promediosPorPilar.saber_hacer !== '-' ? (parseFloat(promediosPorPilar.saber_hacer) / 5) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>Especifico del area</span>
                    </div>
                    <span className="font-medium">{promediosPorPilar.especifico}/5</span>
                  </div>
                  <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${promediosPorPilar.especifico !== '-' ? (parseFloat(promediosPorPilar.especifico) / 5) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </ForgeCard>
            
            {/* Distribucion de puntajes */}
            <ForgeCard className="p-4">
              <h3 className="font-semibold mb-4">Distribucion de puntajes</h3>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { rango: '90-100%', color: 'bg-emerald-500', label: 'Excelente' },
                  { rango: '70-89%', color: 'bg-blue-500', label: 'Bueno' },
                  { rango: '60-69%', color: 'bg-amber-500', label: 'Regular' },
                  { rango: '50-59%', color: 'bg-orange-500', label: 'Bajo' },
                  { rango: '0-49%', color: 'bg-red-500', label: 'Critico' },
                ].map((item) => {
                  const count = lanzamientos.reduce((acc, l) => 
                    acc + l.participantes.filter(p => {
                      if (!p.puntajeTotal) return false
                      if (item.rango === '90-100%') return p.puntajeTotal >= 90
                      if (item.rango === '70-89%') return p.puntajeTotal >= 70 && p.puntajeTotal < 90
                      if (item.rango === '60-69%') return p.puntajeTotal >= 60 && p.puntajeTotal < 70
                      if (item.rango === '50-59%') return p.puntajeTotal >= 50 && p.puntajeTotal < 60
                      return p.puntajeTotal < 50
                    }).length
                  , 0)
                  
                  return (
                    <div key={item.rango} className="text-center">
                      <div className={cn("w-12 h-12 rounded-lg mx-auto flex items-center justify-center text-lg font-bold mb-2", item.color)}>
                        {count}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.rango}</p>
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    </div>
                  )
                })}
              </div>
            </ForgeCard>
          </div>
          
          {/* Alertas y acciones */}
          {stats.requierenPlan > 0 && (
            <ForgeCard className="p-4 border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-300">Planes de mejora pendientes</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Hay {stats.requierenPlan} colaboradores que requieren plan de mejora basado en sus resultados de evaluacion.
                  </p>
                  <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600 text-black">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Crear planes con IA
                  </Button>
                </div>
              </div>
            </ForgeCard>
          )}
        </TabsContent>
        
        {/* Tab: Lanzamientos */}
        <TabsContent value="lanzamientos" className="mt-4 space-y-4">
          {filteredLanzamientos.length === 0 ? (
            <ForgeCard className="p-8 text-center">
              <Play className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay lanzamientos para esta encuesta.</p>
              <Button className="mt-4">
                <Play className="w-4 h-4 mr-2" />
                Crear primer lanzamiento
              </Button>
            </ForgeCard>
          ) : (
            filteredLanzamientos.map(lanzamiento => (
              <LanzamientoSummaryCard 
                key={lanzamiento.id}
                lanzamiento={lanzamiento}
                onClick={() => onViewLanzamiento(lanzamiento)}
              />
            ))
          )}
        </TabsContent>
        
        {/* Tab: Participantes */}
        <TabsContent value="participantes" className="mt-4">
          <ForgeCard className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Participante</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Evaluador</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Lanzamiento</th>
                    <th className="text-center py-3 px-2 text-muted-foreground font-medium">Estado</th>
                    <th className="text-center py-3 px-2 text-muted-foreground font-medium">Puntaje</th>
                    <th className="text-center py-3 px-2 text-muted-foreground font-medium">Plan mejora</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLanzamientos.flatMap(l => 
                    l.participantes.map(p => (
                      <tr key={`${l.id}-${p.id}`} className="border-b border-border/50 hover:bg-surface-2/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{p.talento.nombre}</p>
                              <p className="text-xs text-muted-foreground">{p.talento.cargo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {p.evaluador ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center">
                                <User className="w-3 h-3" />
                              </div>
                              <span className="text-sm">{p.evaluador.nombre}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm">{l.nombre}</span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge className={cn(
                            "text-[10px]",
                            p.estado === 'completado' ? 'bg-emerald-500/20 text-emerald-300' :
                            p.estado === 'en_progreso' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-slate-500/20 text-slate-300'
                          )}>
                            {p.estado === 'completado' ? 'Completado' : p.estado === 'en_progreso' ? 'En progreso' : 'Pendiente'}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          {p.puntajeTotal ? (
                            <span className={cn(
                              "font-medium",
                              p.puntajeTotal >= 80 ? 'text-emerald-400' :
                              p.puntajeTotal >= 60 ? 'text-amber-400' : 'text-red-400'
                            )}>
                              {p.puntajeTotal}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {p.requierePlanMejora ? (
                            p.planMejoraCreado ? (
                              <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">Creado</Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-300 text-[10px]">Requerido</Badge>
                            )
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ForgeCard>
        </TabsContent>
        
        {/* Tab: Por pregunta */}
        <TabsContent value="preguntas" className="mt-4 space-y-4">
          {encuesta.preguntas.map((pregunta, idx) => (
            <PreguntaResultCard 
              key={pregunta.id}
              pregunta={pregunta}
              index={idx}
              lanzamientos={filteredLanzamientos}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componente: Card resumen de lanzamiento
function LanzamientoSummaryCard({ 
  lanzamiento, 
  onClick 
}: { 
  lanzamiento: LanzamientoEncuesta
  onClick: () => void
}) {
  const completados = lanzamiento.participantes.filter(p => p.estado === 'completado').length
  const total = lanzamiento.participantes.length
  const progreso = total > 0 ? Math.round((completados / total) * 100) : 0
  const promedio = lanzamiento.participantes.reduce((acc, p) => acc + (p.puntajeTotal || 0), 0) / (completados || 1)
  
  const estadoColors: Record<string, string> = {
    pendiente: 'bg-slate-500/20 text-slate-300',
    en_curso: 'bg-amber-500/20 text-amber-300',
    cerrado: 'bg-emerald-500/20 text-emerald-300',
    cancelado: 'bg-red-500/20 text-red-300',
  }
  
  return (
    <ForgeCard className="p-4 cursor-pointer hover:border-primary/50 transition-all" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            lanzamiento.estado === 'en_curso' ? 'bg-amber-500/20' :
            lanzamiento.estado === 'cerrado' ? 'bg-emerald-500/20' : 'bg-slate-500/20'
          )}>
            <Play className={cn(
              "w-6 h-6",
              lanzamiento.estado === 'en_curso' ? 'text-amber-400' :
              lanzamiento.estado === 'cerrado' ? 'text-emerald-400' : 'text-slate-400'
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{lanzamiento.nombre}</h3>
              <Badge className={estadoColors[lanzamiento.estado]}>
                {lanzamiento.estado === 'en_curso' ? 'En curso' :
                 lanzamiento.estado === 'cerrado' ? 'Cerrado' :
                 lanzamiento.estado === 'pendiente' ? 'Pendiente' : 'Cancelado'}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{lanzamiento.fechaInicio} - {lanzamiento.fechaFin}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{completados}/{total} completados</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold">{Math.round(promedio)}%</div>
          <p className="text-xs text-muted-foreground">Promedio</p>
        </div>
      </div>
      
      {/* Barra de progreso */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Progreso de respuestas</span>
          <span className="font-medium">{progreso}%</span>
        </div>
        <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all",
              progreso === 100 ? 'bg-emerald-500' : 'bg-primary'
            )}
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-end mt-4 pt-4 border-t border-border">
        <span className="text-sm text-primary flex items-center gap-1">
          Ver detalle <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </ForgeCard>
  )
}

// Componente: Card de resultados por pregunta
function PreguntaResultCard({ 
  pregunta, 
  index,
  lanzamientos 
}: { 
  pregunta: Encuesta['preguntas'][0]
  index: number
  lanzamientos: LanzamientoEncuesta[]
}) {
  const [expanded, setExpanded] = useState(false)
  
  // Calcular promedio para esta pregunta
  const stats = useMemo(() => {
    let total = 0
    let count = 0
    const distribution = [0, 0, 0, 0, 0] // Para valores 1-5
    
    lanzamientos.forEach(l => {
      l.participantes.forEach(p => {
        const respuesta = p.respuestas.find(r => r.preguntaId === pregunta.id)
        if (respuesta && typeof respuesta.valor === 'number') {
          total += respuesta.valor
          count++
          if (respuesta.valor >= 1 && respuesta.valor <= 5) {
            distribution[respuesta.valor - 1]++
          }
        }
      })
    })
    
    const promedio = count > 0 ? (total / count).toFixed(2) : '-'
    
    return { promedio, count, distribution }
  }, [lanzamientos, pregunta.id])
  
  const pilarColors = {
    ser: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    saber_hacer: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    especifico: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  }
  
  return (
    <ForgeCard className="p-4">
      <div 
        className="flex items-start gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium">
          {index + 1}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge className={cn("text-[10px]", pilarColors[pregunta.pilar])}>
              {pregunta.pilar === 'ser' ? 'Ser' : pregunta.pilar === 'saber_hacer' ? 'Saber y Hacer' : 'Especifico'}
            </Badge>
            <span className="text-xs text-muted-foreground">Peso: {pregunta.pesoPregunta}%</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{stats.count} respuestas</span>
          </div>
          <p className="text-sm">{pregunta.texto}</p>
          {pregunta.objetivoEstrategico && (
            <p className="text-xs text-muted-foreground mt-1">
              Objetivo: {pregunta.objetivoEstrategico}
            </p>
          )}
        </div>
        
        <div className="text-right">
          <div className={cn(
            "text-xl font-bold",
            stats.promedio !== '-' && parseFloat(stats.promedio) >= 4 ? 'text-emerald-400' :
            stats.promedio !== '-' && parseFloat(stats.promedio) >= 3 ? 'text-amber-400' : 'text-red-400'
          )}>
            {stats.promedio}
          </div>
          <p className="text-xs text-muted-foreground">Promedio</p>
        </div>
        
        {expanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-5 gap-2">
            {[5, 4, 3, 2, 1].map((valor) => {
              const count = stats.distribution[valor - 1]
              const percentage = stats.count > 0 ? Math.round((count / stats.count) * 100) : 0
              
              return (
                <div key={valor} className="text-center">
                  <div className={cn(
                    "w-10 h-10 rounded-lg mx-auto flex items-center justify-center text-sm font-bold mb-1",
                    valor === 5 ? 'bg-emerald-500/20 text-emerald-300' :
                    valor === 4 ? 'bg-blue-500/20 text-blue-300' :
                    valor === 3 ? 'bg-amber-500/20 text-amber-300' :
                    valor === 2 ? 'bg-orange-500/20 text-orange-300' :
                    'bg-red-500/20 text-red-300'
                  )}>
                    {valor}
                  </div>
                  <div className="h-16 w-full flex items-end justify-center mb-1">
                    <div 
                      className={cn(
                        "w-6 rounded-t transition-all",
                        valor === 5 ? 'bg-emerald-500' :
                        valor === 4 ? 'bg-blue-500' :
                        valor === 3 ? 'bg-amber-500' :
                        valor === 2 ? 'bg-orange-500' : 'bg-red-500'
                      )}
                      style={{ height: `${percentage}%`, minHeight: count > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{count} ({percentage}%)</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </ForgeCard>
  )
}
