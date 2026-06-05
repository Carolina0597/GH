'use client'

import { useState, useMemo } from 'react'
import { useForgeStore, getEncuestasMock, getLanzamientosMock, type Talento } from '@/lib/store'
import { ForgeCard, ForgeCardHeader, PageHeader, StatCard } from '@/components/forge/forge-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Target, Plus, Search, Users, BarChart3, History, ChevronRight,
  Calendar, CheckCircle2, Clock, AlertTriangle, Sparkles, Eye,
  ClipboardCheck, Play, Download, UserCheck, TrendingUp, Star,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { EncuestaEditor } from '@/components/encuestas/encuesta-editor'

// ─── Competencias base del MVP ────────────────────────────────────────────────
export const COMPETENCIAS_BASE = [
  'Comunicacion asertiva',
  'Trabajo en equipo',
  'Orientacion al cliente',
  'Pensamiento analitico',
  'Adaptabilidad',
  'Liderazgo',
  'Innovacion',
  'Gestion del tiempo',
]

// ─── Histórico 2025 mock ──────────────────────────────────────────────────────
export const HISTORICO_2025: Record<string,{
  fecha:string; evaluador:string; cargo:string
  items:{competencia:string; puntaje:number; nivel:string; observacion?:string}[]
}[]> = {
  t1:[
    {fecha:'2025-03-15',evaluador:'María López',cargo:'Backend Developer',items:[
      {competencia:'Comunicacion asertiva',  puntaje:3.8,nivel:'Intermedio'},
      {competencia:'Trabajo en equipo',       puntaje:3.5,nivel:'Intermedio'},
      {competencia:'Orientacion al cliente',  puntaje:3.7,nivel:'Intermedio'},
      {competencia:'Pensamiento analitico',   puntaje:4.0,nivel:'Avanzado'},
      {competencia:'Adaptabilidad',           puntaje:4.0,nivel:'Avanzado'},
      {competencia:'Liderazgo',               puntaje:2.9,nivel:'Básico'},
      {competencia:'Innovacion',              puntaje:3.5,nivel:'Intermedio'},
      {competencia:'Gestion del tiempo',      puntaje:3.9,nivel:'Intermedio'},
    ]},
    {fecha:'2025-09-20',evaluador:'María López',cargo:'Backend Developer',items:[
      {competencia:'Comunicacion asertiva',  puntaje:4.0,nivel:'Avanzado'},
      {competencia:'Trabajo en equipo',       puntaje:3.7,nivel:'Intermedio'},
      {competencia:'Orientacion al cliente',  puntaje:3.9,nivel:'Intermedio'},
      {competencia:'Pensamiento analitico',   puntaje:4.3,nivel:'Avanzado'},
      {competencia:'Adaptabilidad',           puntaje:4.2,nivel:'Avanzado'},
      {competencia:'Liderazgo',               puntaje:3.0,nivel:'Básico'},
      {competencia:'Innovacion',              puntaje:3.8,nivel:'Intermedio'},
      {competencia:'Gestion del tiempo',      puntaje:4.1,nivel:'Avanzado'},
    ]},
  ],
  t2:[
    {fecha:'2025-03-18',evaluador:'María López',cargo:'Frontend Developer',items:[
      {competencia:'Comunicacion asertiva',  puntaje:3.2,nivel:'Intermedio'},
      {competencia:'Trabajo en equipo',       puntaje:2.7,nivel:'Básico'},
      {competencia:'Orientacion al cliente',  puntaje:3.5,nivel:'Intermedio'},
      {competencia:'Pensamiento analitico',   puntaje:2.9,nivel:'Básico'},
      {competencia:'Adaptabilidad',           puntaje:3.2,nivel:'Intermedio'},
      {competencia:'Liderazgo',               puntaje:2.5,nivel:'Básico'},
      {competencia:'Innovacion',              puntaje:2.8,nivel:'Básico'},
      {competencia:'Gestion del tiempo',      puntaje:2.6,nivel:'Básico'},
    ]},
    {fecha:'2025-09-22',evaluador:'María López',cargo:'Frontend Developer',items:[
      {competencia:'Comunicacion asertiva',  puntaje:3.4,nivel:'Intermedio'},
      {competencia:'Trabajo en equipo',       puntaje:2.9,nivel:'Básico'},
      {competencia:'Orientacion al cliente',  puntaje:3.7,nivel:'Intermedio'},
      {competencia:'Pensamiento analitico',   puntaje:3.0,nivel:'Básico'},
      {competencia:'Adaptabilidad',           puntaje:3.4,nivel:'Intermedio'},
      {competencia:'Liderazgo',               puntaje:2.7,nivel:'Básico'},
      {competencia:'Innovacion',              puntaje:3.0,nivel:'Básico'},
      {competencia:'Gestion del tiempo',      puntaje:2.9,nivel:'Básico'},
    ]},
  ],
  t3:[
    {fecha:'2025-04-10',evaluador:'María López',cargo:'Senior Developer',items:[
      {competencia:'Comunicacion asertiva',  puntaje:4.3,nivel:'Avanzado'},
      {competencia:'Trabajo en equipo',       puntaje:4.1,nivel:'Avanzado'},
      {competencia:'Orientacion al cliente',  puntaje:3.9,nivel:'Intermedio'},
      {competencia:'Pensamiento analitico',   puntaje:4.6,nivel:'Experto'},
      {competencia:'Adaptabilidad',           puntaje:4.4,nivel:'Avanzado'},
      {competencia:'Liderazgo',               puntaje:3.7,nivel:'Intermedio'},
      {competencia:'Innovacion',              puntaje:4.2,nivel:'Avanzado'},
      {competencia:'Gestion del tiempo',      puntaje:4.3,nivel:'Avanzado'},
    ]},
  ],
}

const NIVEL_COLORS: Record<string,string> = {
  'Básico':    'bg-red-500/15 text-red-400 border-red-500/30',
  'Intermedio':'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Avanzado':  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Experto':   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
}

// ─── Promedio de una evaluación ───────────────────────────────────────────────
export const promEval = (items:{puntaje:number}[]) =>
  items.length ? Math.round((items.reduce((s,i)=>s+i.puntaje,0)/items.length)*20) : 0

// ─── Gráfica de araña SVG ─────────────────────────────────────────────────────
export function GraficaArana({ items, anterior }: {
  items: {competencia:string;puntaje:number}[]
  anterior?: {competencia:string;puntaje:number}[]
}) {
  const n    = items.length
  const cx   = 160
  const cy   = 160
  const r    = 120
  const levels = [1,2,3,4,5]

  const angle = (i:number) => (i/n)*2*Math.PI - Math.PI/2

  const pt = (i:number, val:number) => {
    const a = angle(i)
    const rv = (val/5)*r
    return { x: cx + rv*Math.cos(a), y: cy + rv*Math.sin(a) }
  }

  const polyPath = (data:{puntaje:number}[]) =>
    data.map((d,i)=>{ const p=pt(i,d.puntaje); return `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(' ')+'Z'

  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-xs mx-auto">
      {/* Grid círculos */}
      {levels.map(l=>(
        <circle key={l} cx={cx} cy={cy} r={(l/5)*r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      ))}
      {/* Grid líneas */}
      {items.map((_,i)=>{
        const a=angle(i)
        return <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)}
          stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      })}
      {/* Nivel labels */}
      {[1,3,5].map(l=>(
        <text key={l} x={cx+3} y={cy-(l/5)*r+4} fontSize="8" fill="rgba(255,255,255,0.3)">{l}</text>
      ))}
      {/* Anterior (si hay) */}
      {anterior && (
        <path d={polyPath(anterior)} fill="rgba(124,92,252,0.12)" stroke="rgba(124,92,252,0.5)"
          strokeWidth="1.5" strokeDasharray="4,2"/>
      )}
      {/* Actual */}
      <path d={polyPath(items)} fill="rgba(79,127,255,0.2)" stroke="rgba(79,127,255,0.9)" strokeWidth="2"/>
      {/* Puntos */}
      {items.map((d,i)=>{
        const p=pt(i,d.puntaje)
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#4f7fff" stroke="rgba(15,17,23,0.8)" strokeWidth="1.5"/>
      })}
      {/* Labels */}
      {items.map((d,i)=>{
        const a=angle(i)
        const lx=cx+(r+22)*Math.cos(a)
        const ly=cy+(r+22)*Math.sin(a)
        const words=d.competencia.split(' ')
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fontSize="8.5" fill="rgba(232,236,245,0.8)" fontWeight="500">
            {words.length===1 ? (
              <tspan>{words[0]}</tspan>
            ) : (
              words.map((w,wi)=>(
                <tspan key={wi} x={lx} dy={wi===0?`${-(words.length-1)*6}`:12}>{w}</tspan>
              ))
            )}
          </text>
        )
      })}
      {/* Leyenda */}
      {anterior && (
        <g transform={`translate(${cx-60},${cy+r+28})`}>
          <line x1="0" y1="4" x2="16" y2="4" stroke="#4f7fff" strokeWidth="2"/>
          <text x="20" y="8" fontSize="8" fill="rgba(232,236,245,0.7)">Actual</text>
          <line x1="50" y1="4" x2="66" y2="4" stroke="#7c5cfc" strokeWidth="1.5" strokeDasharray="4,2"/>
          <text x="70" y="8" fontSize="8" fill="rgba(232,236,245,0.7)">Anterior</text>
        </g>
      )}
    </svg>
  )
}

// ─── Módulo principal ─────────────────────────────────────────────────────────
export function RadarModule() {
  const { currentRole } = useForgeStore()
  if (currentRole==='talento') return <RadarTalento/>
  if (currentRole==='lider')   return <RadarLider/>
  return <RadarGH/>
}

// ─── Vista GH / PeopleOps ─────────────────────────────────────────────────────
function RadarGH() {
  const { talentos } = useForgeStore()
  const [tab,setTab]                     = useState('historico')
  const [search,setSearch]               = useState('')
  const [filterArea,setFilterArea]       = useState('todos')
  const [selectedTalento,setSelectedTalento] = useState<Talento|null>(null)
  const [showCrear,setShowCrear]         = useState(false)

  const areas   = useMemo(()=>[...new Set(talentos.map(t=>t.area))],[talentos])
  const filtros  = useMemo(()=>talentos.filter(t=>{
    if(filterArea!=='todos'&&t.area!==filterArea)return false
    if(search&&!t.nombre.toLowerCase().includes(search.toLowerCase()))return false
    return true
  }),[talentos,filterArea,search])

  const evaluados = Object.keys(HISTORICO_2025).length
  const total     = talentos.length
  const sinHist   = talentos.filter(t=>!HISTORICO_2025[t.id]).length

  if(showCrear) return <EncuestaEditor encuesta={null} tipoNueva={null} onBack={()=>setShowCrear(false)} onSave={()=>setShowCrear(false)}/>
  if(selectedTalento) return <DetalleHistorico talento={selectedTalento} onBack={()=>setSelectedTalento(null)}/>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Radar de Competencias" subtitle="Evaluación y seguimiento de competencias del talento · MVP 1"/>
        <Button className="bg-primary hover:bg-primary/90" onClick={()=>setShowCrear(true)}>
          <Plus className="w-4 h-4 mr-2"/>Crear encuesta de competencias
        </Button>
      </div>

      {/* Banner MVP */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30">
        <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"/>
        <div className="flex-1">
          <p className="font-medium text-sm">MVP 1 activo — Fecha estimada producción: 3 de julio</p>
          <p className="text-xs text-muted-foreground mt-1">
            Encuestas con IA · Asignación líder→talento · Histórico 2025 cargado · Diligenciamiento en Forge · Integración Directorio Activo
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total talentos"    value={total}      icon={<Users className="w-5 h-5"/>} color="blue"/>
        <StatCard label="Con histórico 2025" value={evaluados}  icon={<History className="w-5 h-5"/>} color="emerald"/>
        <StatCard label="Sin evaluación"    value={sinHist}    icon={<AlertTriangle className="w-5 h-5"/>} color="amber"/>
        <StatCard label="Directorio Activo" value="Integrado"  icon={<CheckCircle2 className="w-5 h-5"/>} color="emerald"/>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-surface-2 border border-border p-1">
          <TabsTrigger value="historico"    className="data-[state=active]:bg-primary data-[state=active]:text-white"><History className="w-4 h-4 mr-2"/>Histórico de talentos</TabsTrigger>
          <TabsTrigger value="asignaciones" className="data-[state=active]:bg-primary data-[state=active]:text-white"><UserCheck className="w-4 h-4 mr-2"/>Asignaciones activas</TabsTrigger>
        </TabsList>

        {/* Histórico */}
        <TabsContent value="historico" className="mt-4 space-y-4">
          <ForgeCard className="p-4">
            <div className="flex flex-wrap gap-3">
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
            {filtros.map(t=>{
              const hist=HISTORICO_2025[t.id]
              const ultima=hist?.[hist.length-1]
              const prom=ultima?promEval(ultima.items):null
              const anterior=hist?.[hist.length-2]
              const promAnt=anterior?promEval(anterior.items):null
              const delta=prom!==null&&promAnt!==null?prom-promAnt:null
              return (
                <div key={t.id} onClick={()=>setSelectedTalento(t)}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 cursor-pointer bg-card transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{t.visuel}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{t.nombre}</p>
                      <p className="text-xs text-muted-foreground">{t.cargo} · {t.area}</p>
                    </div>
                    {prom!==null&&(
                      <div className="text-right">
                        <p className={cn('text-lg font-bold',prom>=70?'text-emerald-400':prom>=50?'text-amber-400':'text-red-400')}>{prom}%</p>
                        {delta!==null&&<p className={cn('text-[10px] flex items-center justify-end gap-0.5',delta>=0?'text-emerald-400':'text-red-400')}>
                          {delta>=0?<ArrowUpRight className="w-3 h-3"/>:<ArrowDownRight className="w-3 h-3"/>}{Math.abs(delta)}%
                        </p>}
                      </div>
                    )}
                  </div>
                  {ultima&&(
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {ultima.items.slice(0,3).map(i=>(
                          <span key={i.competencia} className={cn('text-[9px] px-1.5 py-0.5 rounded border',NIVEL_COLORS[i.nivel]||'')}>
                            {i.competencia.split(' ')[0]} {i.puntaje}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{hist?`${hist.length} eval.`:'Sin histórico'}</span>
                    {ultima&&<span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{ultima.fecha}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* Asignaciones */}
        <TabsContent value="asignaciones" className="mt-4">
          <ForgeCard className="p-5 space-y-3">
            <ForgeCardHeader title="Asignaciones activas" subtitle="Encuestas de radar asignadas por líderes a sus talentos"/>
            {[
              {lider:'María López',  talento:'Juan Ramos',      encuesta:'Radar competencias Q2',    estado:'pendiente',   fecha:'2026-06-15'},
              {lider:'María López',  talento:'Ana García',      encuesta:'Radar competencias Q2',    estado:'completado',  fecha:'2026-06-10'},
              {lider:'Laura Roldán', talento:'Valentina Flórez',encuesta:'Radar Diseño Q2',          estado:'en_progreso', fecha:'2026-06-20'},
              {lider:'María López',  talento:'Carlos Méndez',   encuesta:'Radar Senior Devs',        estado:'pendiente',   fecha:'2026-06-18'},
            ].map((a,i)=>(
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-surface-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{a.talento}</p>
                  <p className="text-xs text-muted-foreground">{a.encuesta} · Por {a.lider}</p>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                  <Calendar className="w-3 h-3"/>Vence {a.fecha}
                </span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full flex-shrink-0',
                  a.estado==='completado'?'bg-emerald-500/20 text-emerald-300':
                  a.estado==='en_progreso'?'bg-amber-500/20 text-amber-300':'bg-slate-500/20 text-slate-300')}>
                  {a.estado==='completado'?'Completado':a.estado==='en_progreso'?'En progreso':'Pendiente'}
                </span>
              </div>
            ))}
          </ForgeCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Detalle histórico de un talento ─────────────────────────────────────────
export function DetalleHistorico({talento,onBack}:{talento:Talento;onBack:()=>void}){
  const hist=HISTORICO_2025[talento.id]||[]
  const [selIdx,setSelIdx]=useState(hist.length>0?hist.length-1:0)
  const ev=hist[selIdx]
  const ant=selIdx>0?hist[selIdx-1]:undefined

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
          <div className="ml-auto flex gap-5">
            <div className="text-center"><div className="text-xl font-bold text-blue-400">{hist.length}</div><div className="text-xs text-muted-foreground">Evaluaciones</div></div>
            {ev&&<div className="text-center">
              <div className={cn('text-xl font-bold',promEval(ev.items)>=70?'text-emerald-400':'text-amber-400')}>{promEval(ev.items)}%</div>
              <div className="text-xs text-muted-foreground">Última eval.</div>
            </div>}
          </div>
        </div>
      </ForgeCard>

      {hist.length===0?(
        <ForgeCard className="p-10 text-center">
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-3"/>
          <p className="text-muted-foreground text-sm">No hay histórico de evaluaciones para este talento.</p>
        </ForgeCard>
      ):(
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Selector */}
          <div className="space-y-3">
            <ForgeCard className="p-4">
              <h3 className="font-semibold text-sm mb-3">Evaluaciones ({hist.length})</h3>
              <div className="space-y-2">
                {hist.map((ev,i)=>{
                  const p=promEval(ev.items)
                  return (
                    <button key={i} onClick={()=>setSelIdx(i)}
                      className={cn('w-full text-left p-3 rounded-lg border transition-all',
                        selIdx===i?'border-primary/60 bg-primary/8':'border-border hover:border-border/80 bg-surface-2')}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">{ev.fecha}</p>
                        <span className={cn('text-sm font-bold',p>=70?'text-emerald-400':p>=50?'text-amber-400':'text-red-400')}>{p}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Por: {ev.evaluador}</p>
                    </button>
                  )
                })}
              </div>
            </ForgeCard>

            {/* Leyenda niveles */}
            <ForgeCard className="p-4">
              <h3 className="font-semibold text-sm mb-2">Niveles</h3>
              {['Básico','Intermedio','Avanzado','Experto'].map(n=>(
                <div key={n} className={cn('flex items-center gap-2 text-xs px-2 py-1 rounded-lg mb-1 border',NIVEL_COLORS[n]||'')}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"/>
                  {n}
                </div>
              ))}
            </ForgeCard>
          </div>

          {/* Gráfica + detalle */}
          {ev&&(
            <div className="lg:col-span-2 space-y-4">
              <ForgeCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Gráfica de competencias — {ev.fecha}</h3>
                  {ant&&<span className="text-xs text-muted-foreground">Línea punteada = evaluación anterior</span>}
                </div>
                <GraficaArana items={ev.items} anterior={ant?.items}/>
              </ForgeCard>

              <ForgeCard className="p-5">
                <h3 className="font-semibold mb-3">Detalle por competencia</h3>
                <div className="space-y-3">
                  {ev.items.map(item=>{
                    const antItem=ant?.items.find(x=>x.competencia===item.competencia)
                    const delta=antItem?item.puntaje-antItem.puntaje:null
                    return (
                      <div key={item.competencia} className="flex items-center gap-3">
                        <span className="text-sm w-44 flex-shrink-0">{item.competencia}</span>
                        <div className="flex-1 h-2.5 rounded-full bg-surface-3 overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all',
                            item.puntaje>=4?'bg-emerald-500':item.puntaje>=3?'bg-blue-500':item.puntaje>=2?'bg-amber-500':'bg-red-500')}
                            style={{width:`${(item.puntaje/5)*100}%`}}/>
                        </div>
                        <span className="text-sm font-bold w-8 text-right">{item.puntaje}</span>
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full border w-24 text-center flex-shrink-0',NIVEL_COLORS[item.nivel]||'')}>{item.nivel}</span>
                        {delta!==null&&<span className={cn('text-[10px] w-10 text-right flex-shrink-0',delta>0?'text-emerald-400':delta<0?'text-red-400':'text-muted-foreground')}>
                          {delta>0?'+':''}{delta.toFixed(1)}
                        </span>}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Promedio general</span>
                  <span className={cn('text-lg font-bold',promEval(ev.items)>=70?'text-emerald-400':'text-amber-400')}>{promEval(ev.items)}%</span>
                </div>
              </ForgeCard>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Vista Líder ──────────────────────────────────────────────────────────────
function RadarLider() {
  const {talentos,currentUserId}=useForgeStore()
  const equipo=talentos.filter(t=>t.liderId===currentUserId)
  const [sel,setSel]=useState<Talento|null>(null)
  const [tab,setTab]=useState('equipo')

  if(sel) return <DetalleHistorico talento={sel} onBack={()=>setSel(null)}/>

  return (
    <div className="space-y-6">
      <PageHeader title="Radar de Competencias" subtitle="Competencias de tu equipo e historial de evaluaciones"/>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Mi equipo"        value={equipo.length}                                    icon={<Users className="w-5 h-5"/>} color="blue"/>
        <StatCard label="Con histórico"    value={equipo.filter(t=>HISTORICO_2025[t.id]).length}    icon={<History className="w-5 h-5"/>} color="emerald"/>
        <StatCard label="Sin evaluación"   value={equipo.filter(t=>!HISTORICO_2025[t.id]).length}   icon={<Clock className="w-5 h-5"/>} color="amber"/>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-surface-2 border border-border p-1">
          <TabsTrigger value="equipo"      className="data-[state=active]:bg-primary data-[state=active]:text-white"><Users className="w-4 h-4 mr-2"/>Mi equipo</TabsTrigger>
          <TabsTrigger value="pendientes"  className="data-[state=active]:bg-primary data-[state=active]:text-white"><ClipboardCheck className="w-4 h-4 mr-2"/>Pendientes de evaluar</TabsTrigger>
        </TabsList>

        <TabsContent value="equipo" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {equipo.map(t=>{
              const hist=HISTORICO_2025[t.id]
              const ultima=hist?.[hist.length-1]
              const prom=ultima?promEval(ultima.items):null
              return (
                <div key={t.id} onClick={()=>setSel(t)}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 cursor-pointer bg-card transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{t.visuel}</div>
                    <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{t.nombre}</p><p className="text-xs text-muted-foreground">{t.cargo}</p></div>
                    {prom!==null&&<span className={cn('text-sm font-bold',prom>=70?'text-emerald-400':prom>=50?'text-amber-400':'text-red-400')}>{prom}%</span>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{hist?`${hist.length} eval.`:'Sin histórico'}</span>
                    <span className="flex items-center gap-0.5">Ver radar<ChevronRight className="w-3 h-3"/></span>
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="pendientes" className="mt-4">
          <ForgeCard className="p-5">
            {equipo.filter(t=>!HISTORICO_2025[t.id]).length===0?(
              <div className="text-center py-8"><CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-3"/><p className="text-sm text-muted-foreground">Todo el equipo tiene evaluaciones asignadas.</p></div>
            ):(
              <div className="space-y-2">
                {equipo.filter(t=>!HISTORICO_2025[t.id]).map(t=>(
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{t.visuel}</div>
                    <div className="flex-1"><p className="text-sm font-medium">{t.nombre}</p><p className="text-xs text-muted-foreground">{t.cargo}</p></div>
                    <Button size="sm" variant="outline">Asignar encuesta</Button>
                  </div>
                ))}
              </div>
            )}
          </ForgeCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Vista Talento ────────────────────────────────────────────────────────────
function RadarTalento() {
  const {currentUserId,talentos}=useForgeStore()
  const yo=talentos.find(t=>t.id===currentUserId)||talentos[0]
  const hist=HISTORICO_2025[yo.id]||[]
  const ultima=hist[hist.length-1]
  const anterior=hist[hist.length-2]

  return (
    <div className="space-y-6">
      <PageHeader title="Mi Radar de Competencias" subtitle="Tu historial de evaluaciones de competencias"/>
      {hist.length===0?(
        <ForgeCard className="p-10 text-center">
          <Target className="w-14 h-14 mx-auto text-muted-foreground mb-4"/>
          <h3 className="font-semibold mb-2">Sin evaluaciones aún</h3>
          <p className="text-sm text-muted-foreground">Tu líder aún no ha asignado una evaluación de competencias.</p>
        </ForgeCard>
      ):(
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Evaluaciones"     value={hist.length}       icon={<History className="w-5 h-5"/>} color="blue"/>
            <StatCard label="Última evaluación" value={ultima?.fecha||'—'} icon={<Calendar className="w-5 h-5"/>}/>
            <StatCard label="Promedio actual"  value={ultima?`${promEval(ultima.items)}%`:'—'} icon={<Star className="w-5 h-5"/>} color="purple"/>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <ForgeCard className="p-5">
              <h3 className="font-semibold mb-4">Gráfica de competencias</h3>
              {ultima && <GraficaArana items={ultima.items} anterior={anterior?.items}/>}
              {anterior&&<p className="text-xs text-muted-foreground text-center mt-2">Línea punteada = evaluación anterior ({anterior.fecha})</p>}
            </ForgeCard>

            <ForgeCard className="p-5">
              <h3 className="font-semibold mb-3">Detalle — {ultima?.fecha}</h3>
              <div className="space-y-3">
                {ultima?.items.map(item=>(
                  <div key={item.competencia} className="flex items-center gap-3">
                    <span className="text-sm w-40 flex-shrink-0">{item.competencia}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                      <div className={cn('h-full rounded-full',item.puntaje>=4?'bg-emerald-500':item.puntaje>=3?'bg-blue-500':item.puntaje>=2?'bg-amber-500':'bg-red-500')}
                        style={{width:`${(item.puntaje/5)*100}%`}}/>
                    </div>
                    <span className="text-sm font-bold w-6 text-right">{item.puntaje}</span>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border w-22 text-center flex-shrink-0',NIVEL_COLORS[item.nivel]||'')}>{item.nivel}</span>
                  </div>
                ))}
              </div>
            </ForgeCard>
          </div>
        </>
      )}
    </div>
  )
}
