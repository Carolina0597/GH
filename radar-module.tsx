'use client'

import { useState, useMemo } from 'react'
import { useForgeStore, getEncuestasMock, getLanzamientosMock, type Talento } from '@/lib/store'
import { ForgeCard, ForgeCardHeader, PageHeader, StatCard } from '@/components/forge/forge-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  Target, Plus, Search, Users, BarChart3, History, ChevronRight,
  Calendar, CheckCircle2, Clock, AlertTriangle, Sparkles, Eye,
  ClipboardCheck, Play, Download, UserCheck, TrendingUp, Star
} from 'lucide-react'
import { EncuestaEditor } from '@/components/encuestas/encuesta-editor'

// ─── Mock histórico 2025 ──────────────────────────────────────────────────────

const HISTORICO_2025: Record<string, {
  fecha: string; evaluador: string; competencias: { nombre: string; puntaje: number; nivel: string }[]
}[]> = {
  t1: [
    { fecha: '2025-03-15', evaluador: 'María López', competencias: [
      {nombre:'Comunicacion',puntaje:3.8,nivel:'Intermedio'},{nombre:'Pensamiento analítico',puntaje:4.0,nivel:'Avanzado'},
      {nombre:'Trabajo en equipo',puntaje:3.5,nivel:'Intermedio'},{nombre:'Orientacion al cliente',puntaje:3.7,nivel:'Intermedio'},
      {nombre:'Liderazgo',puntaje:2.9,nivel:'Básico'},{nombre:'Adaptabilidad',puntaje:4.0,nivel:'Avanzado'},
    ]},
    { fecha: '2025-09-20', evaluador: 'María López', competencias: [
      {nombre:'Comunicacion',puntaje:4.0,nivel:'Avanzado'},{nombre:'Pensamiento analítico',puntaje:4.3,nivel:'Avanzado'},
      {nombre:'Trabajo en equipo',puntaje:3.7,nivel:'Intermedio'},{nombre:'Orientacion al cliente',puntaje:3.9,nivel:'Intermedio'},
      {nombre:'Liderazgo',puntaje:3.0,nivel:'Básico'},{nombre:'Adaptabilidad',puntaje:4.2,nivel:'Avanzado'},
    ]},
  ],
  t2: [
    { fecha: '2025-03-18', evaluador: 'María López', competencias: [
      {nombre:'Comunicacion',puntaje:3.2,nivel:'Intermedio'},{nombre:'Pensamiento analítico',puntaje:2.9,nivel:'Básico'},
      {nombre:'Trabajo en equipo',puntaje:2.7,nivel:'Básico'},{nombre:'Orientacion al cliente',puntaje:3.5,nivel:'Intermedio'},
      {nombre:'Liderazgo',puntaje:2.5,nivel:'Básico'},{nombre:'Adaptabilidad',puntaje:3.2,nivel:'Intermedio'},
    ]},
    { fecha: '2025-09-22', evaluador: 'María López', competencias: [
      {nombre:'Comunicacion',puntaje:3.4,nivel:'Intermedio'},{nombre:'Pensamiento analítico',puntaje:3.0,nivel:'Básico'},
      {nombre:'Trabajo en equipo',puntaje:2.9,nivel:'Básico'},{nombre:'Orientacion al cliente',puntaje:3.7,nivel:'Intermedio'},
      {nombre:'Liderazgo',puntaje:2.7,nivel:'Básico'},{nombre:'Adaptabilidad',puntaje:3.4,nivel:'Intermedio'},
    ]},
  ],
  t3: [
    { fecha: '2025-04-10', evaluador: 'María López', competencias: [
      {nombre:'Comunicacion',puntaje:4.3,nivel:'Avanzado'},{nombre:'Pensamiento analítico',puntaje:4.6,nivel:'Experto'},
      {nombre:'Trabajo en equipo',puntaje:4.1,nivel:'Avanzado'},{nombre:'Orientacion al cliente',puntaje:3.9,nivel:'Intermedio'},
      {nombre:'Liderazgo',puntaje:3.7,nivel:'Intermedio'},{nombre:'Adaptabilidad',puntaje:4.4,nivel:'Avanzado'},
    ]},
  ],
}

const NIVELES = ['Básico','Intermedio','Avanzado','Experto']
const NIVEL_COLOR: Record<string,string> = {
  'Básico':    'bg-red-500/15 text-red-400',
  'Intermedio':'bg-amber-500/15 text-amber-400',
  'Avanzado':  'bg-blue-500/15 text-blue-400',
  'Experto':   'bg-emerald-500/15 text-emerald-400',
}

// ─── Vista según rol ──────────────────────────────────────────────────────────

export function RadarModule() {
  const { currentRole } = useForgeStore()
  if (currentRole === 'talento') return <RadarTalento />
  if (currentRole === 'lider')   return <RadarLider />
  return <RadarGH />
}

// ─── GH / PeopleOps ───────────────────────────────────────────────────────────

function RadarGH() {
  const { talentos, lideres } = useForgeStore()
  const [tab, setTab] = useState('encuestas')
  const [search, setSearch] = useState('')
  const [filterArea, setFilterArea] = useState('todos')
  const [selectedTalento, setSelectedTalento] = useState<Talento|null>(null)
  const [showCrearEncuesta, setShowCrearEncuesta] = useState(false)

  const areas = useMemo(()=>[...new Set(talentos.map(t=>t.area))],[talentos])
  const filteredTalentos = useMemo(()=>talentos.filter(t=>{
    if(filterArea!=='todos'&&t.area!==filterArea)return false
    if(search&&!t.nombre.toLowerCase().includes(search.toLowerCase()))return false
    return true
  }),[talentos,filterArea,search])

  // Encuestas de radar (tipo radar_competencias si existiera, aquí usamos las de competencias)
  const encuestasRadar = useMemo(()=>getEncuestasMock(),[])

  if (showCrearEncuesta) {
    return (
      <EncuestaEditor
        encuesta={null}
        tipoNueva={'lider_colaborador'}
        onBack={()=>setShowCrearEncuesta(false)}
        onSave={()=>setShowCrearEncuesta(false)}
      />
    )
  }

  if (selectedTalento) {
    return <RadarHistoricoTalento talento={selectedTalento} onBack={()=>setSelectedTalento(null)} />
  }

  const totalEvaluados = Object.keys(HISTORICO_2025).length
  const encActivas = encuestasRadar.filter(e=>e.estado==='activa').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Radar de Competencias" subtitle="Evalúa, consulta y gestiona las competencias del talento · MVP 1"/>
        <Button className="bg-primary hover:bg-primary/90" onClick={()=>setShowCrearEncuesta(true)}>
          <Plus className="w-4 h-4 mr-2"/>Crear encuesta de competencias
        </Button>
      </div>

      {/* Banner MVP */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30">
        <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"/>
        <div>
          <p className="font-medium text-sm">MVP 1 activo — Radar de Competencias</p>
          <p className="text-xs text-muted-foreground mt-1">
            Incluye: generación de encuestas con IA, asignación líder → talento, histórico 2025 cargado, 
            diligenciamiento en plataforma y visualización por talento y líder.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Talentos evaluados"  value={totalEvaluados}  icon={<Users className="w-5 h-5"/>} color="blue"/>
        <StatCard label="Encuestas activas"   value={encActivas}      icon={<Target className="w-5 h-5"/>} color="emerald"/>
        <StatCard label="Histórico 2025"      value="Cargado"         icon={<History className="w-5 h-5"/>} color="purple"/>
        <StatCard label="Integracion DA"      value="Activa"          icon={<CheckCircle2 className="w-5 h-5"/>} color="emerald"/>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-surface-2 border border-border p-1">
          <TabsTrigger value="encuestas" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Target className="w-4 h-4 mr-2"/>Encuestas
          </TabsTrigger>
          <TabsTrigger value="historico" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <History className="w-4 h-4 mr-2"/>Histórico talentos
          </TabsTrigger>
          <TabsTrigger value="asignaciones" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <UserCheck className="w-4 h-4 mr-2"/>Asignaciones
          </TabsTrigger>
        </TabsList>

        {/* Encuestas */}
        <TabsContent value="encuestas" className="mt-4 space-y-4">
          {encuestasRadar.map(enc=>(
            <ForgeCard key={enc.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-primary"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm">{enc.nombre}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{enc.descripcion}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 flex-shrink-0">Activa</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ClipboardCheck className="w-3.5 h-3.5"/>{enc.preguntas.length} preguntas</span>
                    {enc.aplicaAreas&&<span className="flex items-center gap-1"><Users className="w-3.5 h-3.5"/>{enc.aplicaAreas.join(', ')}</span>}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-2"/>Ver encuesta</Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90"><Play className="w-4 h-4 mr-2"/>Asignar / Lanzar</Button>
              </div>
            </ForgeCard>
          ))}
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="historico" className="mt-4 space-y-4">
          <ForgeCard className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                <Input placeholder="Buscar talento..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-10 bg-surface-2 border-border"/>
              </div>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="w-[160px] bg-surface-2 border-border"><SelectValue placeholder="Área"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las áreas</SelectItem>
                  {areas.map(a=><SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </ForgeCard>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTalentos.map(t=>{
              const hist=HISTORICO_2025[t.id]
              const ultima=hist?.[hist.length-1]
              const promedio=ultima?Math.round((ultima.competencias.reduce((s,c)=>s+c.puntaje,0)/ultima.competencias.length)*20):null
              return (
                <div key={t.id} onClick={()=>setSelectedTalento(t)}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 cursor-pointer bg-card transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{t.visuel}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{t.nombre}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.cargo}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {hist?(
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">{hist.length} evaluación{hist.length>1?'es':''}</span>
                      ):(
                        <span className="text-xs px-2 py-0.5 rounded-full bg-surface-3 text-muted-foreground">Sin histórico</span>
                      )}
                    </div>
                    {promedio!==null&&<span className={cn('text-sm font-bold',promedio>=70?'text-emerald-400':promedio>=50?'text-amber-400':'text-red-400')}>{promedio}%</span>}
                  </div>
                  {ultima&&<p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="w-3 h-3"/>Última: {ultima.fecha}</p>}
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* Asignaciones */}
        <TabsContent value="asignaciones" className="mt-4">
          <ForgeCard className="p-5">
            <ForgeCardHeader title="Asignaciones activas" subtitle="Encuestas asignadas de líder a talento"/>
            <div className="space-y-3">
              {[
                {lider:'María López', talento:'Juan Ramos',     encuesta:'Encuesta Seguridad',    estado:'pendiente',  fecha:'2026-06-15'},
                {lider:'María López', talento:'Ana García',     encuesta:'Encuesta Seguridad',    estado:'completado', fecha:'2026-06-10'},
                {lider:'Laura Roldán',talento:'Valentina Flórez',encuesta:'Evaluacion L-C',       estado:'en_progreso',fecha:'2026-06-20'},
              ].map((a,i)=>(
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-surface-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.talento}</p>
                    <p className="text-xs text-muted-foreground">{a.encuesta} · Asignado por {a.lider}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3"/>Vence {a.fecha}</span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full',
                    a.estado==='completado'?'bg-emerald-500/20 text-emerald-300':
                    a.estado==='en_progreso'?'bg-amber-500/20 text-amber-300':'bg-slate-500/20 text-slate-300')}>
                    {a.estado==='completado'?'Completado':a.estado==='en_progreso'?'En progreso':'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </ForgeCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Vista Líder ──────────────────────────────────────────────────────────────

function RadarLider() {
  const { talentos, currentUserId } = useForgeStore()
  const miEquipo = talentos.filter(t=>t.liderId===currentUserId)
  const [selectedTalento, setSelectedTalento] = useState<Talento|null>(null)
  const [tab, setTab] = useState('equipo')

  if (selectedTalento) return <RadarHistoricoTalento talento={selectedTalento} onBack={()=>setSelectedTalento(null)}/>

  return (
    <div className="space-y-6">
      <PageHeader title="Radar de Competencias" subtitle="Competencias de tu equipo e historial de evaluaciones"/>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Miembros del equipo" value={miEquipo.length} icon={<Users className="w-5 h-5"/>} color="blue"/>
        <StatCard label="Con histórico 2025"  value={miEquipo.filter(t=>HISTORICO_2025[t.id]).length} icon={<History className="w-5 h-5"/>} color="emerald"/>
        <StatCard label="Pendientes asignar"  value={miEquipo.filter(t=>!HISTORICO_2025[t.id]).length} icon={<Clock className="w-5 h-5"/>} color="amber"/>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-surface-2 border border-border p-1">
          <TabsTrigger value="equipo" className="data-[state=active]:bg-primary data-[state=active]:text-white"><Users className="w-4 h-4 mr-2"/>Mi equipo</TabsTrigger>
          <TabsTrigger value="pendientes" className="data-[state=active]:bg-primary data-[state=active]:text-white"><ClipboardCheck className="w-4 h-4 mr-2"/>Pendientes</TabsTrigger>
        </TabsList>

        <TabsContent value="equipo" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {miEquipo.map(t=>{
              const hist=HISTORICO_2025[t.id]
              const ultima=hist?.[hist.length-1]
              const prom=ultima?Math.round((ultima.competencias.reduce((s,c)=>s+c.puntaje,0)/ultima.competencias.length)*20):null
              return (
                <div key={t.id} onClick={()=>setSelectedTalento(t)}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 cursor-pointer bg-card transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{t.visuel}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{t.nombre}</p>
                      <p className="text-xs text-muted-foreground">{t.cargo}</p>
                    </div>
                    {prom!==null&&<span className={cn('text-sm font-bold',prom>=70?'text-emerald-400':prom>=50?'text-amber-400':'text-red-400')}>{prom}%</span>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{hist?`${hist.length} eval.`:'Sin histórico'}</span>
                    <span className="flex items-center gap-1">Ver detalle<ChevronRight className="w-3 h-3"/></span>
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="pendientes" className="mt-4">
          <ForgeCard className="p-5">
            <p className="text-sm text-muted-foreground mb-4">Talentos de tu equipo sin evaluación de radar asignada.</p>
            {miEquipo.filter(t=>!HISTORICO_2025[t.id]).length===0?(
              <div className="text-center py-8"><CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-3"/><p className="text-sm text-muted-foreground">Todo el equipo tiene evaluaciones asignadas.</p></div>
            ):(
              miEquipo.filter(t=>!HISTORICO_2025[t.id]).map(t=>(
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{t.visuel}</div>
                  <div className="flex-1"><p className="text-sm font-medium">{t.nombre}</p><p className="text-xs text-muted-foreground">{t.cargo}</p></div>
                  <Button size="sm" variant="outline">Asignar encuesta</Button>
                </div>
              ))
            )}
          </ForgeCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Vista Talento ────────────────────────────────────────────────────────────

function RadarTalento() {
  const { currentUserId, talentos } = useForgeStore()
  const yo = talentos.find(t=>t.id===currentUserId) || talentos[0]
  const hist = HISTORICO_2025[yo.id] || []
  const ultima = hist[hist.length-1]

  return (
    <div className="space-y-6">
      <PageHeader title="Mi Radar de Competencias" subtitle="Consulta tu histórico de evaluaciones de competencias"/>

      {hist.length===0?(
        <ForgeCard className="p-10 text-center">
          <Target className="w-14 h-14 mx-auto text-muted-foreground mb-4"/>
          <h3 className="font-semibold mb-2">Sin evaluaciones aún</h3>
          <p className="text-sm text-muted-foreground">Tu líder aún no ha asignado una evaluación de competencias.</p>
        </ForgeCard>
      ):(
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Evaluaciones" value={hist.length} icon={<History className="w-5 h-5"/>} color="blue"/>
            <StatCard label="Última evaluación" value={ultima?.fecha||'—'} icon={<Calendar className="w-5 h-5"/>}/>
            <StatCard label="Promedio general" value={ultima?`${Math.round((ultima.competencias.reduce((s,c)=>s+c.puntaje,0)/ultima.competencias.length)*20)}%`:'—'} icon={<Star className="w-5 h-5"/>} color="purple"/>
          </div>

          {hist.map((ev,i)=>(
            <ForgeCard key={i} className="p-5">
              <ForgeCardHeader title={`Evaluación ${ev.fecha}`} subtitle={`Por: ${ev.evaluador}`}/>
              <div className="space-y-3">
                {ev.competencias.map(comp=>(
                  <div key={comp.nombre} className="flex items-center gap-3">
                    <span className="text-sm w-40 flex-shrink-0">{comp.nombre}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                      <div className={cn('h-full rounded-full',comp.puntaje>=4?'bg-emerald-500':comp.puntaje>=3?'bg-blue-500':comp.puntaje>=2?'bg-amber-500':'bg-red-500')}
                        style={{width:`${(comp.puntaje/5)*100}%`}}/>
                    </div>
                    <span className="text-sm font-bold w-8 text-right">{comp.puntaje}</span>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full w-24 text-center',NIVEL_COLOR[comp.nivel]||'')}>{comp.nivel}</span>
                  </div>
                ))}
              </div>
            </ForgeCard>
          ))}
        </>
      )}
    </div>
  )
}

// ─── Histórico detalle de talento ────────────────────────────────────────────

function RadarHistoricoTalento({ talento, onBack }: { talento: Talento; onBack: () => void }) {
  const hist = HISTORICO_2025[talento.id] || []
  const ultima = hist[hist.length-1]
  const [selectedEval, setSelectedEval] = useState(hist.length>0?hist.length-1:0)
  const ev = hist[selectedEval]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}><ChevronRight className="w-4 h-4 mr-1 rotate-180"/>Radar</Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{talento.nombre}</span>
      </div>

      <ForgeCard className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-base font-bold text-primary">{talento.visuel}</div>
          <div>
            <h2 className="text-lg font-bold">{talento.nombre}</h2>
            <p className="text-sm text-muted-foreground">{talento.cargo} · {talento.area}</p>
          </div>
          <div className="ml-auto flex gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{hist.length}</div>
              <div className="text-xs text-muted-foreground">Evaluaciones</div>
            </div>
            {ultima&&<div className="text-center">
              <div className={cn('text-xl font-bold',Math.round((ultima.competencias.reduce((s,c)=>s+c.puntaje,0)/ultima.competencias.length)*20)>=70?'text-emerald-400':'text-amber-400')}>
                {Math.round((ultima.competencias.reduce((s,c)=>s+c.puntaje,0)/ultima.competencias.length)*20)}%
              </div>
              <div className="text-xs text-muted-foreground">Última eval.</div>
            </div>}
          </div>
        </div>
      </ForgeCard>

      {hist.length===0?(
        <ForgeCard className="p-8 text-center">
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-3"/>
          <p className="text-muted-foreground text-sm">No hay histórico de evaluaciones para este talento.</p>
        </ForgeCard>
      ):(
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Selector evaluaciones */}
          <ForgeCard className="p-4">
            <h3 className="font-semibold text-sm mb-3">Evaluaciones ({hist.length})</h3>
            <div className="space-y-2">
              {hist.map((ev,i)=>(
                <button key={i} onClick={()=>setSelectedEval(i)}
                  className={cn('w-full text-left p-3 rounded-lg border transition-all text-sm',
                    selectedEval===i?'border-primary/60 bg-primary/8':'border-border hover:border-border/80 bg-surface-2')}>
                  <p className="font-medium">{ev.fecha}</p>
                  <p className="text-xs text-muted-foreground">Por: {ev.evaluador}</p>
                  <p className={cn('text-xs font-semibold mt-1',
                    Math.round((ev.competencias.reduce((s,c)=>s+c.puntaje,0)/ev.competencias.length)*20)>=70?'text-emerald-400':'text-amber-400')}>
                    {Math.round((ev.competencias.reduce((s,c)=>s+c.puntaje,0)/ev.competencias.length)*20)}%
                  </p>
                </button>
              ))}
            </div>
          </ForgeCard>

          {/* Detalle */}
          {ev&&(
            <ForgeCard className="p-5 lg:col-span-2">
              <ForgeCardHeader title={`Evaluación ${ev.fecha}`} subtitle={`Evaluador: ${ev.evaluador}`}/>
              <div className="space-y-3">
                {ev.competencias.map(comp=>(
                  <div key={comp.nombre} className="flex items-center gap-3">
                    <span className="text-sm w-44 flex-shrink-0">{comp.nombre}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-surface-3 overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all',
                        comp.puntaje>=4?'bg-emerald-500':comp.puntaje>=3?'bg-blue-500':comp.puntaje>=2?'bg-amber-500':'bg-red-500')}
                        style={{width:`${(comp.puntaje/5)*100}%`}}/>
                    </div>
                    <span className="text-sm font-bold w-8 text-right">{comp.puntaje}</span>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full w-24 text-center flex-shrink-0',NIVEL_COLOR[comp.nivel]||'')}>{comp.nivel}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Promedio general</span>
                <span className={cn('text-lg font-bold',
                  Math.round((ev.competencias.reduce((s,c)=>s+c.puntaje,0)/ev.competencias.length)*20)>=70?'text-emerald-400':'text-amber-400')}>
                  {Math.round((ev.competencias.reduce((s,c)=>s+c.puntaje,0)/ev.competencias.length)*20)}%
                </span>
              </div>
            </ForgeCard>
          )}
        </div>
      )}
    </div>
  )
}
