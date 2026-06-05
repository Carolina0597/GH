'use client'
import { ForgeLayout } from '@/components/forge/forge-layout'
import { useForgeStore, moduleLabels, moduleDescriptions, type ModuleId, type Talento } from '@/lib/store'
import { ForgeCard, ForgeCardHeader, PageHeader, StatCard, ProgressBar } from '@/components/forge/forge-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  Construction, Users, ClipboardList, CheckCircle2, AlertTriangle, TrendingUp,
  BarChart3, Search, ChevronRight, Sparkles, Loader2, Calendar, Clock,
  Building, User, Download, Target, Activity, Star
} from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'
import { PlanesModule } from '@/components/planes/planes-module'
import { EncuestasModule } from '@/components/encuestas/encuestas-module'
import { RadarModule } from '@/components/radar/radar-module'

// ─── Placeholder ──────────────────────────────────────────────────────────────
function ModulePlaceholder({ moduleId }: { moduleId: ModuleId }) {
  return (
    <div>
      <PageHeader title={moduleLabels[moduleId]} subtitle={moduleDescriptions[moduleId]} />
      <ForgeCard className="max-w-xl">
        <div className="flex flex-col items-center py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
            <Construction className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="text-base font-semibold mb-1">Módulo próximamente</h2>
          <p className="text-sm text-muted-foreground">En construcción para esta versión.</p>
        </div>
      </ForgeCard>
    </div>
  )
}

// ─── Datos mock HV ────────────────────────────────────────────────────────────
const RADAR_MOCK: Record<string,{competencia:string;score:number}[]> = {
  t1:[{competencia:'Comunicacion',score:4.2},{competencia:'Pensamiento analítico',score:4.5},{competencia:'Trabajo en equipo',score:3.8},{competencia:'Orientacion al cliente',score:4.0},{competencia:'Liderazgo',score:3.2},{competencia:'Adaptabilidad',score:4.3}],
  t2:[{competencia:'Comunicacion',score:3.5},{competencia:'Pensamiento analítico',score:3.2},{competencia:'Trabajo en equipo',score:3.0},{competencia:'Orientacion al cliente',score:3.8},{competencia:'Liderazgo',score:2.8},{competencia:'Adaptabilidad',score:3.5}],
  t3:[{competencia:'Comunicacion',score:4.5},{competencia:'Pensamiento analítico',score:4.8},{competencia:'Trabajo en equipo',score:4.3},{competencia:'Orientacion al cliente',score:4.1},{competencia:'Liderazgo',score:4.0},{competencia:'Adaptabilidad',score:4.6}],
}
const ENC_MOCK: Record<string,{nombre:string;fecha:string;promedio:number;ser:number;saberHacer:number;especifico:number}[]> = {
  t1:[{nombre:'Evaluacion Seguridad Q1 2026',fecha:'2026-03-20',promedio:75,ser:78,saberHacer:74,especifico:73},{nombre:'Evaluacion Q3 2025',fecha:'2025-09-15',promedio:68,ser:72,saberHacer:66,especifico:67}],
  t2:[{nombre:'Evaluacion Seguridad Q1 2026',fecha:'2026-03-22',promedio:58,ser:60,saberHacer:56,especifico:58}],
  t3:[{nombre:'Evaluacion Seguridad Q1 2026',fecha:'2026-03-18',promedio:88,ser:90,saberHacer:87,especifico:87}],
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardModule() {
  const { talentos, lideres, planes } = useForgeStore()
  const [tab, setTab] = useState('resumen')
  const [filterVP, setFilterVP] = useState('todos')
  const [filterArea, setFilterArea] = useState('todos')
  const [filterLider, setFilterLider] = useState('todos')
  const [search, setSearch] = useState('')
  const [selectedTalento, setSelectedTalento] = useState<Talento|null>(null)

  const vps = useMemo(() => [...new Set(talentos.map(t=>t.vicepresidencia))],[talentos])
  const areas = useMemo(() => [...new Set(talentos.map(t=>t.area))],[talentos])
  const planesActivos = planes.filter(p=>['activo','en_progreso','en_riesgo','ampliado'].includes(p.estado))
  const enRiesgo = planes.filter(p=>p.estado==='en_riesgo'||p.criticidad==='alta')
  const cerradosOk = planes.filter(p=>p.estado==='cerrado_superado')
  const promAvance = planesActivos.length ? Math.round(planesActivos.reduce((s,p)=>s+p.avance,0)/planesActivos.length) : 0

  const filteredTalentos = useMemo(()=>talentos.filter(t=>{
    if(filterVP!=='todos'&&t.vicepresidencia!==filterVP)return false
    if(filterArea!=='todos'&&t.area!==filterArea)return false
    if(filterLider!=='todos'&&t.liderId!==filterLider)return false
    if(search&&!t.nombre.toLowerCase().includes(search.toLowerCase())&&!t.cargo.toLowerCase().includes(search.toLowerCase()))return false
    return true
  }),[talentos,filterVP,filterArea,filterLider,search])

  const porArea = useMemo(()=>{
    const m:Record<string,{n:number;activos:number;riesgo:number}>={}
    talentos.forEach(t=>{
      if(!m[t.area])m[t.area]={n:0,activos:0,riesgo:0}
      m[t.area].n++
      const tp=planes.filter(p=>p.talentoId===t.id&&['activo','en_progreso','en_riesgo','ampliado'].includes(p.estado))
      m[t.area].activos+=tp.length
      m[t.area].riesgo+=tp.filter(p=>p.estado==='en_riesgo').length
    })
    return m
  },[talentos,planes])

  if(selectedTalento) return <TalentoHV talento={selectedTalento} onBack={()=>setSelectedTalento(null)}/>

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Visión general del módulo de desempeño · Sistecredito"/>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total talentos"    value={talentos.length}       icon={<Users className="w-5 h-5"/>} color="blue"/>
        <StatCard label="Planes activos"    value={planesActivos.length}  icon={<ClipboardList className="w-5 h-5"/>}/>
        <StatCard label="En riesgo"         value={enRiesgo.length}       icon={<AlertTriangle className="w-5 h-5"/>} color="amber"/>
        <StatCard label="Cerrados OK"       value={cerradosOk.length}     icon={<CheckCircle2 className="w-5 h-5"/>} color="emerald"/>
        <StatCard label="Avance promedio"   value={`${promAvance}%`}      icon={<TrendingUp className="w-5 h-5"/>} color="purple"/>
        <StatCard label="Evaluaciones"      value={5}                     icon={<BarChart3 className="w-5 h-5"/>} color="blue"/>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-surface-2 border border-border p-1">
          <TabsTrigger value="resumen" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Activity className="w-4 h-4 mr-2"/>Resumen
          </TabsTrigger>
          <TabsTrigger value="equipos" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2"/>Equipos y talentos
          </TabsTrigger>
        </TabsList>

        {/* RESUMEN */}
        <TabsContent value="resumen" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <ForgeCard className="p-5">
              <ForgeCardHeader title="Planes por área"/>
              <div className="space-y-3">
                {Object.entries(porArea).map(([area,d])=>(
                  <div key={area} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24 flex-shrink-0 truncate">{area}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all"
                        style={{width:`${Math.min((d.activos/Math.max(...Object.values(porArea).map(x=>x.activos),1))*100,100)}%`}}/>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-medium w-4 text-right">{d.activos}</span>
                      {d.riesgo>0&&<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300">{d.riesgo} riesgo</span>}
                    </div>
                  </div>
                ))}
              </div>
            </ForgeCard>

            <ForgeCard className="p-5">
              <ForgeCardHeader title="Estados de planes"/>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {l:'Activos',     n:planes.filter(p=>p.estado==='activo').length,       c:'bg-blue-500/15 text-blue-400'},
                  {l:'En progreso', n:planes.filter(p=>p.estado==='en_progreso').length,   c:'bg-blue-500/15 text-blue-400'},
                  {l:'En riesgo',   n:planes.filter(p=>p.estado==='en_riesgo').length,     c:'bg-red-500/15 text-red-400'},
                  {l:'Ampliados',   n:planes.filter(p=>p.estado==='ampliado').length,      c:'bg-purple-500/15 text-purple-400'},
                  {l:'Cerrado ✓',   n:planes.filter(p=>p.estado==='cerrado_superado').length,   c:'bg-emerald-500/15 text-emerald-400'},
                  {l:'Cerrado ✗',   n:planes.filter(p=>p.estado==='cerrado_no_superado').length, c:'bg-red-500/15 text-red-400'},
                ].map(({l,n,c})=>(
                  <div key={l} className={cn('rounded-xl p-3 text-center',c.split(' ')[0])}>
                    <div className={cn('text-2xl font-bold',c.split(' ')[1])}>{n}</div>
                    <div className="text-[11px] mt-1 opacity-80">{l}</div>
                  </div>
                ))}
              </div>
            </ForgeCard>

            <ForgeCard className="p-5">
              <ForgeCardHeader title="Actividad reciente"/>
              <div className="space-y-3">
                {[
                  {c:'bg-red-500',     t:'Plan en riesgo – Juan Ramos',            s:'Bajo avance en actividades',         time:'Hace 2 días'},
                  {c:'bg-emerald-500', t:'Actividad cumplida – Valentina Flórez',  s:'Liderazgo técnico completado',       time:'Hace 3 días'},
                  {c:'bg-blue-500',    t:'Evaluación cerrada – Seguridad Q1',      s:'3/3 participantes completaron',      time:'Hace 5 días'},
                  {c:'bg-amber-500',   t:'Seguimiento pendiente – Nicolás Pérez',  s:'Plan próximo a vencer',              time:'Hace 1 semana'},
                  {c:'bg-purple-500',  t:'Plan creado – Carlos Méndez',            s:'Desarrollo por ascenso',             time:'Hace 1 semana'},
                ].map(({c,t,s,time})=>(
                  <div key={t} className="flex items-start gap-3">
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0',c)}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{t}</p>
                      <p className="text-xs text-muted-foreground">{s}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>
                  </div>
                ))}
              </div>
            </ForgeCard>

            <ForgeCard className="p-5">
              <ForgeCardHeader title="Distribución por área"/>
              <div className="space-y-3">
                {Object.entries(porArea).map(([area,d])=>(
                  <div key={area} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-muted-foreground"/>
                      <span className="text-sm">{area}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{d.n} talentos</span>
                      {d.activos>0&&<span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">{d.activos} planes</span>}
                    </div>
                  </div>
                ))}
              </div>
            </ForgeCard>
          </div>
        </TabsContent>

        {/* EQUIPOS */}
        <TabsContent value="equipos" className="mt-4 space-y-4">
          <ForgeCard className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                <Input placeholder="Buscar talento o cargo..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-10 bg-surface-2 border-border"/>
              </div>
              <Select value={filterVP} onValueChange={setFilterVP}>
                <SelectTrigger className="w-[160px] bg-surface-2 border-border"><SelectValue placeholder="VP"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las VP</SelectItem>
                  {vps.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="w-[140px] bg-surface-2 border-border"><SelectValue placeholder="Área"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las áreas</SelectItem>
                  {areas.map(a=><SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterLider} onValueChange={setFilterLider}>
                <SelectTrigger className="w-[160px] bg-surface-2 border-border"><SelectValue placeholder="Líder"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los líderes</SelectItem>
                  {lideres.map(l=><SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">{filteredTalentos.length} talentos</span>
            </div>
          </ForgeCard>

          {lideres.map(lider=>{
            const equipo=filteredTalentos.filter(t=>t.liderId===lider.id)
            if(!equipo.length)return null
            return (
              <div key={lider.id}>
                <div className="flex items-center gap-3 mb-3 px-1">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                    {lider.nombre.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{lider.nombre}</p>
                    <p className="text-xs text-muted-foreground">{lider.cargo} · {lider.area}</p>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">{equipo.length} talentos</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {equipo.map(t=><TalentoCard key={t.id} talento={t} planes={planes} onClick={()=>setSelectedTalento(t)}/>)}
                </div>
              </div>
            )
          })}
          {filteredTalentos.length===0&&(
            <ForgeCard className="p-10 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3"/>
              <p className="text-muted-foreground text-sm">No se encontraron talentos.</p>
            </ForgeCard>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TalentoCard({talento,planes,onClick}:{talento:Talento;planes:any[];onClick:()=>void}){
  const activos=planes.filter(p=>p.talentoId===talento.id&&['activo','en_progreso','en_riesgo','ampliado'].includes(p.estado))
  const enRiesgo=activos.some(p=>p.estado==='en_riesgo')
  const radar=RADAR_MOCK[talento.id]
  const promRadar=radar?Math.round((radar.reduce((s,c)=>s+c.score,0)/radar.length)*20):null
  return(
    <div onClick={onClick} className={cn('p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50 bg-card',enRiesgo?'border-red-500/40':'border-border')}>
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0',enRiesgo?'bg-red-500/20 text-red-400':'bg-primary/20 text-primary')}>
          {talento.visuel}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{talento.nombre}</p>
          <p className="text-xs text-muted-foreground truncate">{talento.cargo}</p>
        </div>
        {enRiesgo&&<AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0"/>}
      </div>
      <p className="text-xs text-muted-foreground mb-2">{talento.area} · {talento.equipo}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {activos.length>0&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">{activos.length} plan{activos.length>1?'es':''}</span>}
        {promRadar!==null&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">Radar {promRadar}%</span>}
        <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-0.5">Ver HV<ChevronRight className="w-3 h-3"/></span>
      </div>
    </div>
  )
}

function TalentoHV({talento,onBack}:{talento:Talento;onBack:()=>void}){
  const {lideres,planes}=useForgeStore()
  const lider=lideres.find(l=>l.id===talento.liderId)
  const tp=planes.filter(p=>p.talentoId===talento.id)
  const radar=RADAR_MOCK[talento.id]||[]
  const encResults=ENC_MOCK[talento.id]||[]
  const promRadar=radar.length?(radar.reduce((s,c)=>s+c.score,0)/radar.length).toFixed(1):null
  const ultima=encResults[0]

  const [showIA,setShowIA]=useState(false)
  const [iaLoading,setIaLoading]=useState(false)
  const [iaResult,setIaResult]=useState<string|null>(null)

  const handleIA=useCallback(async()=>{
    setShowIA(true);setIaLoading(true);setIaResult(null)
    try{
      const res=await fetch('/api/ai/generate-plan',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({prompt:`Eres experto en gestión de talento humano. Analiza estos datos del colaborador y genera un análisis ejecutivo claro:

Colaborador: ${talento.nombre} | Cargo: ${talento.cargo} | Área: ${talento.area}
Radar de competencias: ${radar.map(r=>`${r.competencia}: ${r.score}/5`).join(', ')||'Sin datos'}
Evaluaciones: ${encResults.map(e=>`${e.nombre} (${e.fecha}): ${e.promedio}% [Ser:${e.ser}% SH:${e.saberHacer}% Esp:${e.especifico}%]`).join(' | ')||'Sin evaluaciones'}
Planes: ${tp.map(p=>`${p.tipo} ${p.estado} avance:${p.avance}%`).join(', ')||'Sin planes'}

Entrega: 1)Resumen ejecutivo 2)Fortalezas principales 3)Áreas de mejora 4)Recomendaciones concretas 5)Alerta de riesgo si aplica`})
      })
      const data=await res.json()
      setIaResult(data.content?.map((c:any)=>c.text||'').join('')||'No se pudo generar el análisis.')
    }catch{
      setIaResult('Error al conectar con IA. Verifica la configuración.')
    }finally{setIaLoading(false)}
  },[talento,radar,encResults,tp])

  return(
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}><ChevronRight className="w-4 h-4 mr-1 rotate-180"/>Dashboard</Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">{talento.nombre}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2"/>Exportar HV</Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90" onClick={handleIA}>
            <Sparkles className="w-4 h-4 mr-2"/>Análisis IA
          </Button>
        </div>
      </div>

      <ForgeCard className="p-6">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-xl font-bold text-primary flex-shrink-0">{talento.visuel}</div>
          <div className="flex-1 min-w-[200px]">
            <h2 className="text-2xl font-bold">{talento.nombre}</h2>
            <p className="text-muted-foreground">{talento.cargo}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Building className="w-4 h-4"/>{talento.area}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4"/>{talento.equipo}</span>
              {lider&&<span className="flex items-center gap-1"><User className="w-4 h-4"/>Líder: {lider.nombre}</span>}
            </div>
          </div>
          <div className="flex gap-6 flex-shrink-0">
            {promRadar&&<div className="text-center"><div className="text-2xl font-bold text-purple-400">{promRadar}</div><div className="text-xs text-muted-foreground">Radar</div></div>}
            {ultima&&<div className="text-center"><div className={cn('text-2xl font-bold',ultima.promedio>=70?'text-emerald-400':'text-amber-400')}>{ultima.promedio}%</div><div className="text-xs text-muted-foreground">Última eval.</div></div>}
            <div className="text-center"><div className="text-2xl font-bold text-blue-400">{tp.length}</div><div className="text-xs text-muted-foreground">Planes</div></div>
          </div>
        </div>
      </ForgeCard>

      <div className="grid lg:grid-cols-2 gap-4">
        <ForgeCard className="p-5">
          <ForgeCardHeader title="Radar de competencias"/>
          {radar.length===0?<p className="text-sm text-muted-foreground py-6 text-center">Sin datos de radar.</p>:(
            <div className="space-y-3">
              {radar.map(({competencia,score})=>{
                const pct=(score/5)*100
                const col=pct>=80?'bg-emerald-500':pct>=60?'bg-blue-500':pct>=40?'bg-amber-500':'bg-red-500'
                const tcol=pct>=80?'text-emerald-400':pct>=60?'text-blue-400':pct>=40?'text-amber-400':'text-red-400'
                return(
                  <div key={competencia} className="flex items-center gap-3">
                    <span className="text-sm w-40 flex-shrink-0 truncate">{competencia}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                      <div className={cn('h-full rounded-full',col)} style={{width:`${pct}%`}}/>
                    </div>
                    <span className={cn('text-sm font-bold w-8 text-right',tcol)}>{score.toFixed(1)}</span>
                  </div>
                )
              })}
              <div className="pt-2 border-t border-border text-xs text-muted-foreground flex justify-between">
                <span>Promedio</span><span className="font-semibold text-purple-400">{promRadar} / 5.0</span>
              </div>
            </div>
          )}
        </ForgeCard>

        <ForgeCard className="p-5">
          <ForgeCardHeader title="Resultados de evaluaciones"/>
          {encResults.length===0?<p className="text-sm text-muted-foreground py-6 text-center">Sin evaluaciones.</p>:(
            <div className="space-y-4">
              {encResults.map((ev,i)=>(
                <div key={i} className="p-3 rounded-lg bg-surface-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium leading-tight">{ev.nombre}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Calendar className="w-3 h-3"/>{ev.fecha}</p>
                    </div>
                    <span className={cn('text-lg font-bold',ev.promedio>=70?'text-emerald-400':ev.promedio>=60?'text-amber-400':'text-red-400')}>{ev.promedio}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[{l:'Ser',v:ev.ser,c:'text-purple-400'},{l:'Saber/Hacer',v:ev.saberHacer,c:'text-blue-400'},{l:'Específico',v:ev.especifico,c:'text-emerald-400'}].map(({l,v,c})=>(
                      <div key={l} className="bg-surface-3 rounded-lg p-2">
                        <div className={cn('text-sm font-bold',c)}>{v}%</div>
                        <div className="text-[10px] text-muted-foreground">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ForgeCard>

        <ForgeCard className="p-5">
          <ForgeCardHeader title="Planes de mejora y desarrollo"/>
          {tp.length===0?<p className="text-sm text-muted-foreground py-6 text-center">Sin planes.</p>:(
            <div className="space-y-3">
              {tp.map(p=>(
                <div key={p.id} className="p-3 rounded-lg bg-surface-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold',p.tipo==='mejora'?'bg-amber-500/20 text-amber-300':'bg-emerald-500/20 text-emerald-300')}>
                        {p.tipo==='mejora'?'Mejora':'Desarrollo'}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/>{p.fechaInicio} → {p.fechaFinInicial}</p>
                    </div>
                    <span className="text-base font-bold text-primary">{p.avance}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                    <div className={cn('h-full rounded-full',p.estado==='en_riesgo'?'bg-red-500':p.tipo==='desarrollo'?'bg-emerald-500':'bg-primary')} style={{width:`${p.avance}%`}}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ForgeCard>

        <ForgeCard className="p-5">
          <ForgeCardHeader title="Información del perfil"/>
          <div className="space-y-1 text-sm">
            {[['Nombre',talento.nombre],['Cargo',talento.cargo],['Área',talento.area],['Equipo',talento.equipo],['VP',talento.vicepresidencia],['Líder',lider?.nombre||'N/A'],['Email',talento.email]].map(([k,v])=>(
              <div key={k} className="flex justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-right max-w-[55%] truncate">{v}</span>
              </div>
            ))}
          </div>
        </ForgeCard>
      </div>

      <Dialog open={showIA} onOpenChange={setShowIA}>
        <DialogContent className="max-w-2xl bg-surface border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary"/>Análisis IA — {talento.nombre}</DialogTitle>
          </DialogHeader>
          {iaLoading?(
            <div className="flex flex-col items-center py-16 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin"/>
              <p className="text-muted-foreground text-sm">Analizando datos de desempeño...</p>
            </div>
          ):iaResult?(
            <div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 mb-4 text-xs text-muted-foreground">
                Basado en: {radar.length} competencias · {encResults.length} evaluaciones · {tp.length} planes
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{iaResult}</div>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={()=>navigator.clipboard?.writeText(iaResult||'')}>Copiar</Button>
                <Button variant="outline" size="sm" onClick={()=>setShowIA(false)}>Cerrar</Button>
              </div>
            </div>
          ):null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Page() {
  const {currentModule}=useForgeStore()
  const content=(()=>{
    if(currentModule==='dashboard')   return <DashboardModule/>
    if(currentModule==='planes')      return <PlanesModule/>
    if(currentModule==='evaluaciones')return <EncuestasModule/>
    if(currentModule==='radar')       return <RadarModule/>
    return <ModulePlaceholder moduleId={currentModule}/>
  })()
  return <ForgeLayout>{content}</ForgeLayout>
}
