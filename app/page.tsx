'use client'
import { ForgeLayout } from '@/components/forge/forge-layout'
import { useForgeStore, moduleLabels, moduleDescriptions, type ModuleId, type Talento, type Lider } from '@/lib/store'
import { ForgeCard, ForgeCardHeader, PageHeader, StatCard, ForgeBadge, ProgressBar } from '@/components/forge/forge-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  Construction, Users, ClipboardList, CheckCircle2, AlertTriangle, TrendingUp,
  BarChart3, Search, ChevronRight, Sparkles, X, Loader2, Calendar, Target,
  Activity, Star, ArrowUpRight, Building, User, Download, Eye,
  Award, Clock, MapPin
} from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'
import { PlanesModule } from '@/components/planes/planes-module'
import { EncuestasModule } from '@/components/encuestas/encuestas-module'

// ─── Placeholder ─────────────────────────────────────────────────────────────

function ModulePlaceholder({ moduleId }: { moduleId: ModuleId }) {
  const { currentRole } = useForgeStore()
  return (
    <div>
      <PageHeader title={moduleLabels[moduleId]} subtitle={moduleDescriptions[moduleId]} />
      <ForgeCard className="max-w-2xl">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-6">
            <Construction className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Vista en construcción</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">Proximo modulo para rol: <span className="font-medium text-primary">{currentRole}</span></p>
          <Button disabled variant="secondary">Proximamente</Button>
        </div>
      </ForgeCard>
    </div>
  )
}

// ─── Datos mock para radar / resultados ──────────────────────────────────────

const RADAR_MOCK: Record<string, { competencia: string; score: number; max: number }[]> = {
  t1: [
    { competencia: 'Comunicacion', score: 4.2, max: 5 },
    { competencia: 'Pensamiento analitico', score: 4.5, max: 5 },
    { competencia: 'Trabajo en equipo', score: 3.8, max: 5 },
    { competencia: 'Orientacion al cliente', score: 4.0, max: 5 },
    { competencia: 'Liderazgo', score: 3.2, max: 5 },
    { competencia: 'Adaptabilidad', score: 4.3, max: 5 },
  ],
  t2: [
    { competencia: 'Comunicacion', score: 3.5, max: 5 },
    { competencia: 'Pensamiento analitico', score: 3.2, max: 5 },
    { competencia: 'Trabajo en equipo', score: 3.0, max: 5 },
    { competencia: 'Orientacion al cliente', score: 3.8, max: 5 },
    { competencia: 'Liderazgo', score: 2.8, max: 5 },
    { competencia: 'Adaptabilidad', score: 3.5, max: 5 },
  ],
  t3: [
    { competencia: 'Comunicacion', score: 4.5, max: 5 },
    { competencia: 'Pensamiento analitico', score: 4.8, max: 5 },
    { competencia: 'Trabajo en equipo', score: 4.3, max: 5 },
    { competencia: 'Orientacion al cliente', score: 4.1, max: 5 },
    { competencia: 'Liderazgo', score: 4.0, max: 5 },
    { competencia: 'Adaptabilidad', score: 4.6, max: 5 },
  ],
}

const ENC_RESULTADOS_MOCK: Record<string, { nombre: string; fecha: string; promedio: number; ser: number; saberHacer: number; especifico: number }[]> = {
  t1: [
    { nombre: 'Evaluacion Seguridad Q1 2026', fecha: '2026-03-20', promedio: 75, ser: 78, saberHacer: 74, especifico: 73 },
    { nombre: 'Evaluacion Seguridad Q3 2025', fecha: '2025-09-15', promedio: 68, ser: 72, saberHacer: 66, especifico: 67 },
  ],
  t2: [
    { nombre: 'Evaluacion Seguridad Q1 2026', fecha: '2026-03-22', promedio: 58, ser: 60, saberHacer: 56, especifico: 58 },
    { nombre: 'Evaluacion Q3 2025', fecha: '2025-09-18', promedio: 62, ser: 65, saberHacer: 60, especifico: 61 },
  ],
  t3: [
    { nombre: 'Evaluacion Seguridad Q1 2026', fecha: '2026-03-18', promedio: 88, ser: 90, saberHacer: 87, especifico: 87 },
  ],
}

const PLANES_MOCK: Record<string, { tipo: string; estado: string; avance: number; cierre: string }[]> = {
  t2: [{ tipo: 'Mejora', estado: 'en_riesgo', avance: 45, cierre: '2026-06-30' }],
  t5: [{ tipo: 'Mejora', estado: 'ampliado', avance: 65, cierre: '2026-05-15' }],
  t6: [{ tipo: 'Desarrollo', estado: 'activo', avance: 70, cierre: '2026-07-31' }],
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardModule() {
  const { talentos, lideres, planes, currentRole } = useForgeStore()
  const [activeTab, setActiveTab] = useState('resumen')
  const [filterVP, setFilterVP] = useState('todos')
  const [filterArea, setFilterArea] = useState('todos')
  const [filterLider, setFilterLider] = useState('todos')
  const [search, setSearch] = useState('')
  const [selectedTalento, setSelectedTalento] = useState<Talento | null>(null)

  const vps = useMemo(() => [...new Set(talentos.map(t => t.vicepresidencia))], [talentos])
  const areas = useMemo(() => [...new Set(talentos.map(t => t.area))], [talentos])

  const filteredTalentos = useMemo(() => talentos.filter(t => {
    if (filterVP !== 'todos' && t.vicepresidencia !== filterVP) return false
    if (filterArea !== 'todos' && t.area !== filterArea) return false
    if (filterLider !== 'todos' && t.liderId !== filterLider) return false
    if (search && !t.nombre.toLowerCase().includes(search.toLowerCase()) && !t.cargo.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [talentos, filterVP, filterArea, filterLider, search])

  // KPIs globales
  const planesActivos = planes.filter(p => ['activo','en_progreso','en_riesgo','ampliado'].includes(p.estado))
  const planesRiesgo = planes.filter(p => p.estado === 'en_riesgo' || p.criticidad === 'alta')
  const planesCerradosOk = planes.filter(p => p.estado === 'cerrado_superado')
  const promAvance = planesActivos.length ? Math.round(planesActivos.reduce((s,p) => s + p.avance, 0) / planesActivos.length) : 0

  // Agrupar por area
  const porArea = useMemo(() => {
    const mapa: Record<string, { talentos: number; planesActivos: number; riesgo: number }> = {}
    talentos.forEach(t => {
      if (!mapa[t.area]) mapa[t.area] = { talentos: 0, planesActivos: 0, riesgo: 0 }
      mapa[t.area].talentos++
      const tp = planes.filter(p => p.talentoId === t.id && ['activo','en_progreso','en_riesgo','ampliado'].includes(p.estado))
      mapa[t.area].planesActivos += tp.length
      mapa[t.area].riesgo += tp.filter(p => p.estado === 'en_riesgo').length
    })
    return mapa
  }, [talentos, planes])

  // Agrupar por VP
  const porVP = useMemo(() => {
    const mapa: Record<string, { talentos: number }> = {}
    talentos.forEach(t => {
      if (!mapa[t.vicepresidencia]) mapa[t.vicepresidencia] = { talentos: 0 }
      mapa[t.vicepresidencia].talentos++
    })
    return mapa
  }, [talentos])

  if (selectedTalento) {
    return <TalentoHV talento={selectedTalento} onBack={() => setSelectedTalento(null)} />
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Vision general del modulo de desempeno · Sistecredito" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatCard label="Total talentos" value={talentos.length} icon={<Users className="w-5 h-5" />} color="blue" />
        <StatCard label="Planes activos" value={planesActivos.length} icon={<ClipboardList className="w-5 h-5" />} color="primary" />
        <StatCard label="En riesgo" value={planesRiesgo.length} icon={<AlertTriangle className="w-5 h-5" />} color="amber" />
        <StatCard label="Cerrados OK" value={planesCerradosOk.length} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard label="Avance promedio" value={`${promAvance}%`} icon={<TrendingUp className="w-5 h-5" />} color="purple" />
        <StatCard label="Evaluaciones" value={5} icon={<BarChart3 className="w-5 h-5" />} color="blue" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-surface-2 border border-border p-1">
          <TabsTrigger value="resumen" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="w-4 h-4 mr-2" />Resumen
          </TabsTrigger>
          <TabsTrigger value="equipos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-4 h-4 mr-2" />Equipos y talentos
          </TabsTrigger>
        </TabsList>

        {/* ── RESUMEN ── */}
        <TabsContent value="resumen" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Por area */}
            <ForgeCard className="p-5">
              <ForgeCardHeader title="Planes por area" />
              <div className="space-y-3">
                {Object.entries(porArea).map(([area, data]) => (
                  <div key={area} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-28 flex-shrink-0 truncate">{area}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                      <div className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min((data.planesActivos / Math.max(...Object.values(porArea).map(d => d.planesActivos), 1)) * 100, 100)}%` }} />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-medium w-4">{data.planesActivos}</span>
                      {data.riesgo > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300">{data.riesgo} en riesgo</span>}
                    </div>
                  </div>
                ))}
              </div>
            </ForgeCard>

            {/* Por VP */}
            <ForgeCard className="p-5">
              <ForgeCardHeader title="Distribucion por VP" />
              <div className="space-y-3">
                {Object.entries(porVP).map(([vp, data]) => (
                  <div key={vp} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground flex-1 truncate">{vp}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {talentos.filter(t => t.vicepresidencia === vp).slice(0, 5).map(t => (
                          <div key={t.id} className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] font-bold text-primary">
                            {t.visuel}
                          </div>
                        ))}
                        {data.talentos > 5 && <div className="w-7 h-7 rounded-full bg-surface-3 border-2 border-card flex items-center justify-center text-[10px] text-muted-foreground">+{data.talentos - 5}</div>}
                      </div>
                      <span className="text-sm font-medium">{data.talentos}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ForgeCard>

            {/* Estados de planes */}
            <ForgeCard className="p-5">
              <ForgeCardHeader title="Estados de planes" />
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Activos', n: planes.filter(p => p.estado === 'activo').length, color: 'bg-blue-500/20 text-blue-400' },
                  { label: 'En progreso', n: planes.filter(p => p.estado === 'en_progreso').length, color: 'bg-blue-500/20 text-blue-400' },
                  { label: 'En riesgo', n: planes.filter(p => p.estado === 'en_riesgo').length, color: 'bg-red-500/20 text-red-400' },
                  { label: 'Ampliados', n: planes.filter(p => p.estado === 'ampliado').length, color: 'bg-purple-500/20 text-purple-400' },
                  { label: 'Cerrado OK', n: planes.filter(p => p.estado === 'cerrado_superado').length, color: 'bg-emerald-500/20 text-emerald-400' },
                  { label: 'Cerrado NOK', n: planes.filter(p => p.estado === 'cerrado_no_superado').length, color: 'bg-red-500/20 text-red-400' },
                ].map(({ label, n, color }) => (
                  <div key={label} className={cn('rounded-xl p-3 text-center', color.split(' ')[0])}>
                    <div className={cn('text-2xl font-bold', color.split(' ')[1])}>{n}</div>
                    <div className="text-[11px] mt-1 opacity-80">{label}</div>
                  </div>
                ))}
              </div>
            </ForgeCard>

            {/* Actividad reciente */}
            <ForgeCard className="p-5">
              <ForgeCardHeader title="Actividad reciente" />
              <div className="space-y-3">
                {[
                  { color: 'bg-red-500', text: 'Plan en riesgo – Juan Ramos', time: 'Hace 2 días', sub: 'Bajo avance en actividades' },
                  { color: 'bg-emerald-500', text: 'Actividad cumplida – Valentina Flórez', time: 'Hace 3 días', sub: 'Liderazgo técnico completado' },
                  { color: 'bg-blue-500', text: 'Evaluacion cerrada – Seguridad Q1', time: 'Hace 5 días', sub: '3/3 participantes completaron' },
                  { color: 'bg-amber-500', text: 'Seguimiento pendiente – Nicolás Pérez', time: 'Hace 1 semana', sub: 'Plan próximo a vencer' },
                  { color: 'bg-purple-500', text: 'Plan creado – Carlos Méndez', time: 'Hace 1 semana', sub: 'Desarrollo por ascenso' },
                ].map(({ color, text, time, sub }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{text}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>
                  </div>
                ))}
              </div>
            </ForgeCard>
          </div>
        </TabsContent>

        {/* ── EQUIPOS Y TALENTOS ── */}
        <TabsContent value="equipos" className="mt-4 space-y-4">
          {/* Filtros */}
          <ForgeCard className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar talento o cargo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-surface-2 border-border" />
              </div>
              <Select value={filterVP} onValueChange={setFilterVP}>
                <SelectTrigger className="w-[180px] bg-surface-2 border-border"><SelectValue placeholder="Vicepresidencia" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las VP</SelectItem>
                  {vps.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="w-[160px] bg-surface-2 border-border"><SelectValue placeholder="Area" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las areas</SelectItem>
                  {areas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterLider} onValueChange={setFilterLider}>
                <SelectTrigger className="w-[180px] bg-surface-2 border-border"><SelectValue placeholder="Lider" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los lideres</SelectItem>
                  {lideres.map(l => <SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">{filteredTalentos.length} talentos</span>
            </div>
          </ForgeCard>

          {/* Agrupacion por lider */}
          {filterLider === 'todos' ? (
            <div className="space-y-6">
              {lideres.map(lider => {
                const equipo = filteredTalentos.filter(t => t.liderId === lider.id)
                if (equipo.length === 0) return null
                return (
                  <div key={lider.id}>
                    <div className="flex items-center gap-3 mb-3 px-1">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                        {lider.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{lider.nombre}</p>
                        <p className="text-xs text-muted-foreground">{lider.cargo} · {lider.area}</p>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">{equipo.length} talentos</span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {equipo.map(t => <TalentoCard key={t.id} talento={t} planes={planes} onClick={() => setSelectedTalento(t)} />)}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredTalentos.map(t => <TalentoCard key={t.id} talento={t} planes={planes} onClick={() => setSelectedTalento(t)} />)}
            </div>
          )}

          {filteredTalentos.length === 0 && (
            <ForgeCard className="p-10 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No se encontraron talentos con los filtros aplicados.</p>
            </ForgeCard>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Card de talento ──────────────────────────────────────────────────────────

function TalentoCard({ talento, planes, onClick }: { talento: Talento; planes: any[]; onClick: () => void }) {
  const tp = planes.filter(p => p.talentoId === talento.id)
  const activos = tp.filter(p => ['activo','en_progreso','en_riesgo','ampliado'].includes(p.estado))
  const enRiesgo = tp.some(p => p.estado === 'en_riesgo')
  const radar = RADAR_MOCK[talento.id]
  const promRadar = radar ? Math.round((radar.reduce((s, c) => s + c.score, 0) / radar.length) * 20) : null

  return (
    <div onClick={onClick}
      className={cn(
        'p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm bg-card',
        enRiesgo ? 'border-red-500/40' : 'border-border'
      )}>
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0',
          enRiesgo ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary')}>
          {talento.visuel}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{talento.nombre}</p>
          <p className="text-xs text-muted-foreground truncate">{talento.cargo}</p>
        </div>
        {enRiesgo && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
      </div>
      <p className="text-xs text-muted-foreground mb-2">{talento.area} · {talento.equipo}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {activos.length > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">{activos.length} plan{activos.length > 1 ? 'es' : ''}</span>
        )}
        {promRadar !== null && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">Radar: {promRadar}%</span>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-0.5">
          Ver HV <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  )
}

// ─── HV del talento ───────────────────────────────────────────────────────────

function TalentoHV({ talento, onBack }: { talento: Talento; onBack: () => void }) {
  const { lideres, planes } = useForgeStore()
  const lider = lideres.find(l => l.id === talento.liderId)
  const planesDelTalento = planes.filter(p => p.talentoId === talento.id)
  const radar = RADAR_MOCK[talento.id] || []
  const encResultados = ENC_RESULTADOS_MOCK[talento.id] || []
  const promRadar = radar.length ? (radar.reduce((s, c) => s + c.score, 0) / radar.length).toFixed(1) : null
  const ultimaEval = encResultados[0]

  const [showIA, setShowIA] = useState(false)
  const [iaLoading, setIaLoading] = useState(false)
  const [iaResult, setIaResult] = useState<string | null>(null)

  const handleIA = useCallback(async () => {
    setShowIA(true)
    setIaLoading(true)
    setIaResult(null)

    const contexto = {
      nombre: talento.nombre,
      cargo: talento.cargo,
      area: talento.area,
      radar: radar.map(r => `${r.competencia}: ${r.score}/${r.max}`).join(', '),
      evaluaciones: encResultados.map(e => `${e.nombre} (${e.fecha}): ${e.promedio}% [Ser: ${e.ser}%, Saber/Hacer: ${e.saberHacer}%, Especifico: ${e.especifico}%]`).join(' | '),
      planes: planesDelTalento.map(p => `${p.tipo} - ${p.estado} - avance ${p.avance}%`).join(', ') || 'Sin planes activos',
    }

    try {
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Eres un experto en gestión de talento humano. Analiza los siguientes datos de desempeño del colaborador y genera un análisis ejecutivo claro, estructurado y accionable:

Colaborador: ${contexto.nombre}
Cargo: ${contexto.cargo} | Área: ${contexto.area}

Radar de competencias: ${contexto.radar}
Evaluaciones de desempeño: ${contexto.evaluaciones}
Planes de mejora/desarrollo: ${contexto.planes}

Entrega:
1. Resumen ejecutivo (2-3 oraciones)
2. Fortalezas principales (con datos)
3. Áreas de mejora prioritarias (con datos)
4. Recomendaciones concretas (3-5 acciones)
5. Riesgo de retención / alerta (si aplica)

Sé directo y usa los datos reales proporcionados.`,
        }),
      })
      const data = await res.json()
      const texto = data.content?.map((c: any) => c.text || '').join('') || data.resultado || 'No se pudo generar el análisis.'
      setIaResult(texto)
    } catch {
      setIaResult('Error al conectar con el servicio de IA. Verifica la configuración de la API.')
    } finally {
      setIaLoading(false)
    }
  }, [talento, radar, encResultados, planesDelTalento])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}><ChevronRight className="w-4 h-4 mr-1 rotate-180" />Dashboard</Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">{talento.nombre}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exportar HV</Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90" onClick={handleIA}>
            <Sparkles className="w-4 h-4 mr-2" />Análisis IA
          </Button>
        </div>
      </div>

      {/* Perfil */}
      <ForgeCard className="p-6">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-xl font-bold text-primary flex-shrink-0">
            {talento.visuel}
          </div>
          <div className="flex-1 min-w-[200px]">
            <h2 className="text-2xl font-bold">{talento.nombre}</h2>
            <p className="text-muted-foreground">{talento.cargo}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Building className="w-4 h-4" />{talento.area}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{talento.vicepresidencia}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" />{talento.equipo}</span>
              {lider && <span className="flex items-center gap-1"><User className="w-4 h-4" />Lider: {lider.nombre}</span>}
            </div>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            {promRadar && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{promRadar}</div>
                <div className="text-xs text-muted-foreground">Radar prom.</div>
              </div>
            )}
            {ultimaEval && (
              <div className="text-center">
                <div className={cn('text-2xl font-bold', ultimaEval.promedio >= 70 ? 'text-emerald-400' : 'text-amber-400')}>
                  {ultimaEval.promedio}%
                </div>
                <div className="text-xs text-muted-foreground">Ultima eval.</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{planesDelTalento.length}</div>
              <div className="text-xs text-muted-foreground">Planes</div>
            </div>
          </div>
        </div>
      </ForgeCard>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Radar de competencias */}
        <ForgeCard className="p-5">
          <ForgeCardHeader title="Radar de competencias" />
          {radar.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">Sin datos de radar aun.</div>
          ) : (
            <div className="space-y-3">
              {radar.map(({ competencia, score, max }) => {
                const pct = (score / max) * 100
                const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'
                const textColor = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-blue-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400'
                return (
                  <div key={competencia} className="flex items-center gap-3">
                    <span className="text-sm w-40 flex-shrink-0 truncate">{competencia}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                      <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={cn('text-sm font-bold w-8 text-right', textColor)}>{score.toFixed(1)}</span>
                  </div>
                )
              })}
              <div className="pt-2 border-t border-border text-xs text-muted-foreground flex justify-between">
                <span>Promedio general</span>
                <span className="font-semibold text-purple-400">{promRadar} / 5.0</span>
              </div>
            </div>
          )}
        </ForgeCard>

        {/* Resultados evaluaciones */}
        <ForgeCard className="p-5">
          <ForgeCardHeader title="Resultados de evaluaciones" />
          {encResultados.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">Sin evaluaciones registradas.</div>
          ) : (
            <div className="space-y-4">
              {encResultados.map((ev, i) => (
                <div key={i} className="p-3 rounded-lg bg-surface-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium leading-tight">{ev.nombre}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{ev.fecha}
                      </p>
                    </div>
                    <span className={cn('text-lg font-bold flex-shrink-0', ev.promedio >= 70 ? 'text-emerald-400' : ev.promedio >= 60 ? 'text-amber-400' : 'text-red-400')}>
                      {ev.promedio}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mt-2">
                    {[
                      { label: 'Ser', val: ev.ser, color: 'text-purple-400' },
                      { label: 'Saber/Hacer', val: ev.saberHacer, color: 'text-blue-400' },
                      { label: 'Especifico', val: ev.especifico, color: 'text-emerald-400' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="bg-surface-3 rounded-lg p-2">
                        <div className={cn('text-base font-bold', color)}>{val}%</div>
                        <div className="text-[10px] text-muted-foreground">{label}</div>
                      </div>
                    ))}
                  </div>
                  {ev.promedio < 60 && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                      <AlertTriangle className="w-3.5 h-3.5" />Plan de mejora activado
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ForgeCard>

        {/* Planes */}
        <ForgeCard className="p-5">
          <ForgeCardHeader title="Planes de mejora y desarrollo" />
          {planesDelTalento.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">Sin planes registrados.</div>
          ) : (
            <div className="space-y-3">
              {planesDelTalento.map(p => (
                <div key={p.id} className="p-3 rounded-lg bg-surface-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold',
                          p.tipo === 'mejora' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300')}>
                          {p.tipo === 'mejora' ? 'Mejora' : 'Desarrollo'}
                        </span>
                        <span className="text-xs text-muted-foreground">{p.subtipo}</span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />{p.fechaInicio} → {p.fechaFinInicial}
                      </p>
                    </div>
                    <span className="text-base font-bold text-primary">{p.avance}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                    <div className={cn('h-full rounded-full',
                      p.estado === 'en_riesgo' ? 'bg-red-500' : p.tipo === 'desarrollo' ? 'bg-emerald-500' : 'bg-primary'
                    )} style={{ width: `${p.avance}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ForgeCard>

        {/* Informacion adicional */}
        <ForgeCard className="p-5">
          <ForgeCardHeader title="Informacion del perfil" />
          <div className="space-y-2 text-sm">
            {[
              ['Nombre completo', talento.nombre],
              ['Cargo', talento.cargo],
              ['Area', talento.area],
              ['Equipo', talento.equipo],
              ['Vicepresidencia', talento.vicepresidencia],
              ['Lider directo', lider?.nombre || 'N/A'],
              ['Email', talento.email],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-right max-w-[55%] truncate">{v}</span>
              </div>
            ))}
          </div>
        </ForgeCard>
      </div>

      {/* Dialog IA */}
      <Dialog open={showIA} onOpenChange={setShowIA}>
        <DialogContent className="max-w-2xl bg-surface border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Análisis IA — {talento.nombre}
            </DialogTitle>
          </DialogHeader>

          {iaLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground text-sm">Analizando datos de desempeño...</p>
            </div>
          ) : iaResult ? (
            <div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 mb-4 text-xs text-muted-foreground">
                Basado en: radar de competencias ({radar.length} dimensiones), {encResultados.length} evaluaciones y {planesDelTalento.length} planes.
              </div>
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                {iaResult}
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(iaResult || '')}>
                  Copiar análisis
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowIA(false)}>Cerrar</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Page() {
  const { currentModule } = useForgeStore()
  const content = (() => {
    if (currentModule === 'dashboard') return <DashboardModule />
    if (currentModule === 'planes') return <PlanesModule />
    if (currentModule === 'evaluaciones') return <EncuestasModule />
    return <ModulePlaceholder moduleId={currentModule} />
  })()
  return <ForgeLayout>{content}</ForgeLayout>
}
