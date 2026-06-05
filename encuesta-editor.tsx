'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useForgeStore, type Encuesta, type PreguntaEncuesta, type TipoPregunta } from '@/lib/store'
import { ForgeCard } from '@/components/forge/forge-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ChevronLeft, Plus, Trash2, GripVertical, Save, Copy, Settings,
  FileText, ChevronUp, ChevronDown, AlertTriangle, BarChart3,
  Check, Info, Users, X, Search, FolderPlus, Sparkles,
  Hash, TrendingUp, Percent, Eye
} from 'lucide-react'

// ─── Tipos pilar (libre) ──────────────────────────────────────────────────────
interface PilarConfig {
  id: string
  nombre: string
  peso: number
  color: string
}

const COLORES = ['blue','purple','emerald','amber','red','pink','cyan','orange']
const colorClass = (c: string) => ({
  blue:    { text: 'text-blue-400',    bg: 'bg-blue-500/20',    border: 'border-blue-500/40'    },
  purple:  { text: 'text-purple-400',  bg: 'bg-purple-500/20',  border: 'border-purple-500/40'  },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/20',   border: 'border-amber-500/40'   },
  red:     { text: 'text-red-400',     bg: 'bg-red-500/20',     border: 'border-red-500/40'     },
  pink:    { text: 'text-pink-400',    bg: 'bg-pink-500/20',    border: 'border-pink-500/40'    },
  cyan:    { text: 'text-cyan-400',    bg: 'bg-cyan-500/20',    border: 'border-cyan-500/40'    },
  orange:  { text: 'text-orange-400',  bg: 'bg-orange-500/20',  border: 'border-orange-500/40'  },
}[c] || { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/40' })

// ─── Métricas simples ─────────────────────────────────────────────────────────
interface MetricaSimple {
  id: string
  label: string
  descripcion: string
  activa: boolean
  umbral?: number   // para "activacion de plan de mejora"
  topN?: number     // para fortalezas/brechas
}

const METRICAS_BASE: MetricaSimple[] = [
  { id: 'participacion',    label: '¿Cuántas personas respondieron?',        descripcion: 'Muestra el total de participantes y la tasa de respuesta.',               activa: true  },
  { id: 'puntaje_promedio', label: 'Puntaje promedio general',               descripcion: 'El puntaje total promedio de todos los que respondieron.',               activa: true  },
  { id: 'por_seccion',      label: 'Puntaje por sección / pilar',            descripcion: 'Muestra el promedio de cada sección que configuraste.',                  activa: true  },
  { id: 'fortalezas',       label: 'Preguntas con mayor puntaje (fortalezas)', descripcion: 'Las preguntas donde las personas obtuvieron mejor calificación.',      activa: false, topN: 3 },
  { id: 'brechas',          label: 'Preguntas con menor puntaje (brechas)',  descripcion: 'Las preguntas donde las personas obtuvieron menor calificación.',        activa: false, topN: 3 },
  { id: 'por_area',         label: 'Comparar resultados por área',           descripcion: 'Ver si hay diferencias de puntaje entre áreas o equipos.',              activa: false },
  { id: 'por_lider',        label: 'Comparar resultados por líder',          descripcion: 'Ver el puntaje promedio agrupado por líder.',                           activa: false },
  { id: 'evolucion',        label: 'Evolución entre lanzamientos',           descripcion: 'Comparar los resultados con versiones anteriores de esta encuesta.',    activa: false },
  { id: 'plan_mejora',      label: 'Activar plan de mejora automáticamente', descripcion: 'Si el puntaje de alguien está por debajo del umbral, se activa un plan.', activa: false, umbral: 60 },
]

// ─── Directorio Activo mock ───────────────────────────────────────────────────
interface PersonaDA { id:string; nombre:string; cargo:string; area:string }
interface GrupoDA   { id:string; nombre:string; descripcion:string; miembros:string[] }

const DIRECTORIO: PersonaDA[] = [
  {id:'da1', nombre:'Ana García',        cargo:'Backend Developer',   area:'Tecnología'},
  {id:'da2', nombre:'Juan Ramos',         cargo:'Frontend Developer',  area:'Tecnología'},
  {id:'da3', nombre:'Carlos Méndez',      cargo:'Senior Developer',    area:'Tecnología'},
  {id:'da4', nombre:'Laura Torres',       cargo:'Product Manager',     area:'Producto'},
  {id:'da5', nombre:'Nicolás Pérez',      cargo:'QA Engineer',         area:'Tecnología'},
  {id:'da6', nombre:'Valentina Flórez',   cargo:'UX Designer',         area:'Diseño'},
  {id:'da7', nombre:'Mateo Toro',         cargo:'Data Analyst',        area:'Datos'},
  {id:'da8', nombre:'Sandra Roldán',      cargo:'Scrum Master',        area:'Agilidad'},
  {id:'da9', nombre:'Catalina Jaramillo', cargo:'DevOps Engineer',     area:'Tecnología'},
  {id:'da10',nombre:'Andrés Gómez',       cargo:'Mobile Developer',    area:'Tecnología'},
  {id:'da11',nombre:'María López',        cargo:'Engineering Manager', area:'Tecnología'},
  {id:'da12',nombre:'Sebastián Mariño',   cargo:'Product Lead',        area:'Producto'},
  {id:'da13',nombre:'Laura Roldán',       cargo:'Design Lead',         area:'Diseño'},
]

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  encuesta: Encuesta | null
  tipoNueva: any
  onBack: () => void
  onSave: (e: Encuesta) => void
}

// ─── Editor principal ─────────────────────────────────────────────────────────
export function EncuestaEditor({ encuesta, onBack, onSave }: Props) {
  const [paso, setPaso] = useState<'config'|'preguntas'|'metricas'|'preview'>('config')

  // Datos generales
  const [nombre, setNombre]       = useState(encuesta?.nombre || '')
  const [descripcion, setDescripcion] = useState(encuesta?.descripcion || '')
  const [esPlantilla, setEsPlantilla] = useState(encuesta?.esPlantilla || false)
  const [tipoEncuesta, setTipoEncuesta] = useState('')
  const [tipoOtro, setTipoOtro] = useState('')
  const [recordatorios, setRecordatorios] = useState(false)
  const [periodicidad, setPeriodicidad] = useState('semanal')
  const [fechaLimiteRecordatorio, setFechaLimiteRecordatorio] = useState('')

  // Secciones/pilares — completamente libres, sin valores predeterminados
  const [pilares, setPilares] = useState<PilarConfig[]>([])

  // Preguntas
  const [preguntas, setPreguntas] = useState<PreguntaEncuesta[]>(encuesta?.preguntas || [])
  const [expandedId, setExpandedId] = useState<string|null>(null)

  // Métricas
  const [metricas, setMetricas] = useState<MetricaSimple[]>(METRICAS_BASE)

  // Público
  const [personas, setPersonas]       = useState<string[]>([])
  const [gruposSel, setGruposSel]     = useState<string[]>([])
  const [grupos, setGrupos]           = useState<GrupoDA[]>([
    {id:'g1', nombre:'Equipo Backend',      descripcion:'Developers Backend',   miembros:['da1','da3','da9']},
    {id:'g2', nombre:'Líderes Tecnología',  descripcion:'Líderes del área tech', miembros:['da11','da12','da13']},
  ])

  const pesoPilares  = pilares.reduce((s,p)=>s+p.peso,0)
  const pesoPreguntas = preguntas.reduce((s,p)=>s+p.pesoPregunta,0)
  const totalPersonas = personas.length + gruposSel.reduce((s,gid)=>s+(grupos.find(g=>g.id===gid)?.miembros.length||0),0)

  // ─── Handlers pilares ──────────────────────────────────────────────────────
  const addPilar = () => setPilares([...pilares,{id:`p-${Date.now()}`,nombre:'',peso:0,color:COLORES[pilares.length%COLORES.length]}])
  const updPilar = (id:string,u:Partial<PilarConfig>) => setPilares(pilares.map(p=>p.id===id?{...p,...u}:p))
  const delPilar = (id:string) => { setPilares(pilares.filter(p=>p.id!==id)); setPreguntas(preguntas.filter(p=>p.pilar!==id as any)) }

  // ─── Handlers preguntas ────────────────────────────────────────────────────
  const addPregunta = (pilarId?:string) => {
    const np:PreguntaEncuesta = {
      id:`preg-${Date.now()}`, pilar:(pilarId||pilares[0]?.id||'general') as any,
      texto:'', tipoPregunta:'escala_5', pesoPregunta:10,
      escalaCalificacion:[{valor:5,porcentaje:10},{valor:4,porcentaje:8},{valor:3,porcentaje:6},{valor:2,porcentaje:4},{valor:1,porcentaje:2}],
      requerida:true, orden:preguntas.length+1,
    }
    setPreguntas([...preguntas,np]); setExpandedId(np.id)
  }
  const updPregunta = (id:string,u:Partial<PreguntaEncuesta>) => setPreguntas(preguntas.map(p=>p.id===id?{...p,...u}:p))
  const delPregunta = (id:string) => setPreguntas(preguntas.filter(p=>p.id!==id).map((p,i)=>({...p,orden:i+1})))
  const movePregunta = (id:string,dir:'up'|'down') => {
    const idx=preguntas.findIndex(p=>p.id===id)
    if((dir==='up'&&idx===0)||(dir==='down'&&idx===preguntas.length-1))return
    const arr=[...preguntas]; const ti=dir==='up'?idx-1:idx+1; [arr[idx],arr[ti]]=[arr[ti],arr[idx]]
    setPreguntas(arr.map((p,i)=>({...p,orden:i+1})))
  }

  // ─── Handlers métricas ─────────────────────────────────────────────────────
  const toggleMetrica = (id:string) => setMetricas(metricas.map(m=>m.id===id?{...m,activa:!m.activa}:m))
  const updMetrica    = (id:string,u:Partial<MetricaSimple>) => setMetricas(metricas.map(m=>m.id===id?{...m,...u}:m))

  const handleSave = (borrador=false) => {
    onSave({
      id: encuesta?.id||`enc-${Date.now()}`, nombre, descripcion,
      tipo: 'lider_colaborador', version:'1.0', estado:borrador?'borrador':'activa',
      preguntas, esPlantilla,
      createdAt: encuesta?.createdAt||new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: encuesta?.createdBy||'Usuario actual',
    })
  }

  const pasos = [
    {id:'config',    label:'1. Datos',      done:!!nombre},
    {id:'preguntas', label:'2. Preguntas',   done:preguntas.length>0},
    {id:'metricas',  label:'3. Qué medir',   done:metricas.some(m=>m.activa)},
    {id:'preview',   label:'4. Revisar',     done:false},
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1"/>Volver</Button>
          <div>
            <h1 className="text-xl font-bold">{encuesta?'Editar encuesta':'Nueva encuesta'}</h1>
            {nombre && <p className="text-sm text-muted-foreground">{nombre}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={()=>handleSave(true)}><Save className="w-4 h-4 mr-2"/>Guardar borrador</Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={()=>handleSave(false)} disabled={!nombre||preguntas.length===0}>
            <Save className="w-4 h-4 mr-2"/>Guardar y activar
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex gap-2">
        {pasos.map((p,i)=>(
          <button key={p.id} onClick={()=>setPaso(p.id as any)}
            className={cn('flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2',
              paso===p.id ?'bg-primary text-white shadow-sm':
              p.done      ?'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30':
                           'bg-surface-2 text-muted-foreground hover:text-foreground')}>
            {p.done&&paso!==p.id && <Check className="w-3.5 h-3.5"/>}
            {p.label}
          </button>
        ))}
      </div>

      {/* ── PASO 1: DATOS ── */}
      {paso==='config' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <ForgeCard className="p-5 space-y-4">
            <h3 className="font-semibold">Información básica</h3>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Nombre de la encuesta *</Label>
              <Input value={nombre} onChange={e=>setNombre(e.target.value)}
                placeholder="Ej: Evaluación de desempeño Q2 2026" className="bg-surface-2 border-border"/>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Descripción (opcional)</Label>
              <Textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)}
                placeholder="¿Para qué es esta encuesta? ¿Qué quieres medir?" rows={3}
                className="bg-surface-2 border-border resize-none"/>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2">
              <div>
                <p className="text-sm font-medium">Guardar como plantilla</p>
                <p className="text-xs text-muted-foreground">Puedes reutilizarla para otras encuestas</p>
              </div>
              <Switch checked={esPlantilla} onCheckedChange={setEsPlantilla}/>
            </div>

            {/* Tipo de encuesta */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Tipo de encuesta</Label>
              <Select value={tipoEncuesta} onValueChange={v => { setTipoEncuesta(v); if(v!=='otro') setTipoOtro('') }}>
                <SelectTrigger className="bg-surface-2 border-border">
                  <SelectValue placeholder="Selecciona el tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lider_colaborador">Líder a Colaborador</SelectItem>
                  <SelectItem value="lider_lider">Líder a Líder</SelectItem>
                  <SelectItem value="colaborador_lider">Colaborador a Líder</SelectItem>
                  <SelectItem value="autoevaluacion">Autoevaluación</SelectItem>
                  <SelectItem value="area_interaccion">Área con mayor interacción</SelectItem>
                  <SelectItem value="transversal">Áreas transversales</SelectItem>
                  <SelectItem value="prorroga">Prórroga de contrato</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              {tipoEncuesta === 'otro' && (
                <Input className="mt-2 bg-surface-2 border-border" placeholder="Describe el tipo de encuesta..."
                  value={tipoOtro} onChange={e => setTipoOtro(e.target.value)}/>
              )}
              {tipoEncuesta === 'prorroga' && (
                <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                  <span className="text-base flex-shrink-0">⚠️</span>
                  <span>Si el resultado de la primera evaluación no es el esperado, se enviará una alerta automática al líder del talento.</span>
                </div>
              )}
            </div>

            {/* Recordatorios */}
            <div className="p-3 rounded-lg bg-surface-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Activar recordatorios automáticos</p>
                  <p className="text-xs text-muted-foreground">Notifica a los participantes que no han respondido</p>
                </div>
                <Switch checked={recordatorios} onCheckedChange={setRecordatorios}/>
              </div>
              {recordatorios && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Periodicidad</Label>
                    <Select value={periodicidad} onValueChange={setPeriodicidad}>
                      <SelectTrigger className="bg-surface-3 border-border h-8">
                        <SelectValue/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Cada día</SelectItem>
                        <SelectItem value="cada_2_dias">Cada 2 días</SelectItem>
                        <SelectItem value="semanal">Cada semana</SelectItem>
                        <SelectItem value="quincenal">Cada 15 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Enviar recordatorios hasta</Label>
                    <Input type="date" value={fechaLimiteRecordatorio}
                      onChange={e => setFechaLimiteRecordatorio(e.target.value)}
                      className="bg-surface-3 border-border h-8 text-sm"/>
                  </div>
                </div>
              )}
            </div>
          </ForgeCard>

          <div className="space-y-4">
            {/* Secciones libres */}
            <ForgeCard className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Secciones de la encuesta</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Opcional — agrupa las preguntas como quieras</p>
                </div>
                <Button variant="outline" size="sm" onClick={addPilar}>
                  <Plus className="w-3.5 h-3.5 mr-1"/>Agregar sección
                </Button>
              </div>

              {pilares.length===0 ? (
                <div className="p-4 rounded-lg border-2 border-dashed border-border text-center">
                  <p className="text-sm text-muted-foreground">Sin secciones — las preguntas irán en un solo grupo.</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Puedes agregar secciones como "Liderazgo", "Comunicación", etc.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pilares.map((p,i)=>(
                    <div key={p.id} className="flex items-center gap-2 p-3 rounded-lg bg-surface-2">
                      <select value={p.color} onChange={e=>updPilar(p.id,{color:e.target.value})}
                        className="bg-surface-3 border border-border rounded-lg h-8 text-xs px-2 cursor-pointer">
                        {COLORES.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                      <Input value={p.nombre} onChange={e=>updPilar(p.id,{nombre:e.target.value})}
                        placeholder="Nombre de la sección (ej: Comunicación)"
                        className="bg-surface-3 border-border h-8 text-sm flex-1"/>
                      <div className="flex items-center gap-1">
                        <Input type="number" min={0} max={100} value={p.peso||''}
                          onChange={e=>updPilar(p.id,{peso:parseInt(e.target.value)||0})}
                          placeholder="0" className="bg-surface-3 border-border h-8 text-sm w-16 text-center"/>
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                      <button onClick={()=>delPilar(p.id)} className="p-1 rounded hover:bg-red-500/20 text-red-400">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  ))}
                  <div className={cn('flex items-center justify-between text-sm px-1 pt-1',pesoPilares===100?'text-emerald-400':pesoPilares>100?'text-red-400':'text-amber-400')}>
                    <span>Total secciones</span>
                    <span className="font-bold">{pesoPilares}% / 100%</span>
                  </div>
                </div>
              )}
            </ForgeCard>

            {/* Público */}
            <ForgeCard className="p-5">
              <SelectorPublico
                personas={personas} setPersonas={setPersonas}
                gruposSel={gruposSel} setGruposSel={setGruposSel}
                grupos={grupos} setGrupos={setGrupos}
                totalPersonas={totalPersonas}
              />
            </ForgeCard>
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <Button className="bg-primary hover:bg-primary/90" onClick={()=>setPaso('preguntas')} disabled={!nombre}>
              Continuar a preguntas →
            </Button>
          </div>
        </div>
      )}

      {/* ── PASO 2: PREGUNTAS ── */}
      {paso==='preguntas' && (
        <div className="space-y-4">
          {/* Resumen rápido */}
          {pilares.length>0 && (
            <div className="flex gap-3 flex-wrap">
              {pilares.map(p=>{
                const n=preguntas.filter(q=>q.pilar===p.id as any).length
                const cc=colorClass(p.color)
                return (
                  <div key={p.id} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium',cc.bg,cc.border,cc.text)}>
                    {p.nombre||'Sin nombre'} · {n} pregunta{n!==1?'s':''}
                    <button onClick={()=>addPregunta(p.id)} className="hover:opacity-70">
                      <Plus className="w-3 h-3"/>
                    </button>
                  </div>
                )
              })}
              <div className={cn('flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium bg-surface-2 border-border text-muted-foreground',
                pesoPreguntas===100?'border-emerald-500/40 text-emerald-400':pesoPreguntas>100?'border-red-500/40 text-red-400':'border-amber-500/40 text-amber-400')}>
                Peso total: {pesoPreguntas}% / 100%
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Preguntas ({preguntas.length})</h3>
            <Button onClick={()=>addPregunta()} size="sm"><Plus className="w-4 h-4 mr-2"/>Agregar pregunta</Button>
          </div>

          {preguntas.length===0 ? (
            <ForgeCard className="p-10 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3"/>
              <p className="font-medium mb-1">Aún no hay preguntas</p>
              <p className="text-sm text-muted-foreground mb-4">Agrega las preguntas que quieres incluir en esta encuesta.</p>
              <Button onClick={()=>addPregunta()}><Plus className="w-4 h-4 mr-2"/>Agregar primera pregunta</Button>
            </ForgeCard>
          ) : (
            preguntas.map((p,idx)=>(
              <PreguntaEditor key={p.id} pregunta={p} index={idx} pilares={pilares}
                expanded={expandedId===p.id}
                onToggle={()=>setExpandedId(expandedId===p.id?null:p.id)}
                onUpdate={u=>updPregunta(p.id,u)}
                onDelete={()=>delPregunta(p.id)}
                onMoveUp={()=>movePregunta(p.id,'up')}
                onMoveDown={()=>movePregunta(p.id,'down')}
                onDuplicate={()=>{const np={...p,id:`preg-${Date.now()}`,orden:preguntas.length+1};setPreguntas([...preguntas,np]);setExpandedId(np.id)}}
                canMoveUp={idx>0} canMoveDown={idx<preguntas.length-1}
              />
            ))
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={()=>setPaso('config')}>← Anterior</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={()=>setPaso('metricas')}>Continuar →</Button>
          </div>
        </div>
      )}

      {/* ── PASO 3: QUÉ MEDIR ── */}
      {paso==='metricas' && (
        <div className="space-y-4">
          <ForgeCard className="p-4 bg-primary/10 border-primary/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"/>
              <div>
                <p className="font-medium text-sm">¿Qué quieres ver cuando la encuesta esté completa?</p>
                <p className="text-xs text-muted-foreground mt-1">Selecciona las métricas que te interesan. Los resultados se calcularán automáticamente.</p>
              </div>
            </div>
          </ForgeCard>

          <div className="grid sm:grid-cols-2 gap-3">
            {metricas.map(m=>(
              <div key={m.id}
                onClick={()=>toggleMetrica(m.id)}
                className={cn('p-4 rounded-xl border-2 cursor-pointer transition-all',
                  m.activa?'border-primary/60 bg-primary/8':'border-border bg-surface-2 hover:border-border/80')}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-sm leading-tight">{m.label}</p>
                  <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all mt-0.5',
                    m.activa?'bg-primary border-primary':'border-border')}>
                    {m.activa && <Check className="w-3 h-3 text-white"/>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.descripcion}</p>

                {/* Opciones extra */}
                {m.activa && m.id==='plan_mejora' && (
                  <div className="mt-3 pt-3 border-t border-border/50" onClick={e=>e.stopPropagation()}>
                    <Label className="text-xs text-muted-foreground mb-1 block">Si el puntaje está por debajo de:</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={0} max={100} value={m.umbral??60}
                        onChange={e=>updMetrica(m.id,{umbral:parseInt(e.target.value)||60})}
                        className="bg-surface-3 border-border h-8 w-20 text-sm text-center"/>
                      <span className="text-sm text-muted-foreground">% → se activa un plan de mejora</span>
                    </div>
                  </div>
                )}
                {m.activa && (m.id==='fortalezas'||m.id==='brechas') && (
                  <div className="mt-3 pt-3 border-t border-border/50" onClick={e=>e.stopPropagation()}>
                    <Label className="text-xs text-muted-foreground mb-1 block">Mostrar las</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={1} max={10} value={m.topN??3}
                        onChange={e=>updMetrica(m.id,{topN:parseInt(e.target.value)||3})}
                        className="bg-surface-3 border-border h-8 w-16 text-sm text-center"/>
                      <span className="text-sm text-muted-foreground">preguntas {m.id==='fortalezas'?'con mayor puntaje':'con menor puntaje'}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-surface-2 border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{metricas.filter(m=>m.activa).length} métrica{metricas.filter(m=>m.activa).length!==1?'s':''} activa{metricas.filter(m=>m.activa).length!==1?'s':''}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Se calcularán al cerrar cada lanzamiento</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setPaso('preguntas')}>← Anterior</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={()=>setPaso('preview')}>Ver resumen →</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PASO 4: PREVIEW ── */}
      {paso==='preview' && (
        <div className="space-y-4">
          <ForgeCard className="p-5">
            <h2 className="text-lg font-bold mb-1">{nombre}</h2>
            {descripcion && <p className="text-sm text-muted-foreground mb-3">{descripcion}</p>}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-surface-2 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{preguntas.length}</div>
                <div className="text-xs text-muted-foreground">Preguntas</div>
              </div>
              <div className="p-3 bg-surface-2 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">{pilares.length||1}</div>
                <div className="text-xs text-muted-foreground">Secciones</div>
              </div>
              <div className="p-3 bg-surface-2 rounded-lg text-center">
                <div className="text-2xl font-bold text-emerald-400">{totalPersonas}</div>
                <div className="text-xs text-muted-foreground">Participantes</div>
              </div>
            </div>
          </ForgeCard>

          <ForgeCard className="p-5">
            <h3 className="font-semibold mb-3">Métricas que verás en los resultados</h3>
            <div className="flex flex-wrap gap-2">
              {metricas.filter(m=>m.activa).map(m=>(
                <span key={m.id} className="text-xs px-3 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30">{m.label}</span>
              ))}
            </div>
          </ForgeCard>

          <ForgeCard className="p-5">
            <h3 className="font-semibold mb-3">Preguntas</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {preguntas.map((p,i)=>{
                const pilar=pilares.find(x=>x.id===p.pilar as any)
                const cc=pilar?colorClass(pilar.color):null
                return (
                  <div key={p.id} className={cn('p-3 rounded-lg bg-surface-2',pilar?`border-l-4 ${cc?.border}`:'')}>
                    <div className="flex items-center gap-2 mb-1">
                      {pilar&&<span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded',cc?.bg,cc?.text)}>{pilar.nombre}</span>}
                      <span className="text-xs text-muted-foreground">Peso: {p.pesoPregunta}%</span>
                    </div>
                    <p className="text-sm">{i+1}. {p.texto||<em className="text-muted-foreground">Sin texto</em>}</p>
                  </div>
                )
              })}
            </div>
          </ForgeCard>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={()=>setPaso('metricas')}>← Anterior</Button>
            <Button variant="outline" onClick={()=>handleSave(true)}>Guardar borrador</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={()=>handleSave(false)}
              disabled={!nombre||preguntas.length===0}>
              <Save className="w-4 h-4 mr-2"/>Crear encuesta
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Editor de pregunta ───────────────────────────────────────────────────────
function PreguntaEditor({pregunta,index,pilares,expanded,onToggle,onUpdate,onDelete,onMoveUp,onMoveDown,onDuplicate,canMoveUp,canMoveDown}:{
  pregunta:PreguntaEncuesta; index:number; pilares:PilarConfig[]; expanded:boolean
  onToggle:()=>void; onUpdate:(u:Partial<PreguntaEncuesta>)=>void
  onDelete:()=>void; onMoveUp:()=>void; onMoveDown:()=>void; onDuplicate:()=>void
  canMoveUp:boolean; canMoveDown:boolean
}){
  const pilar = pilares.find(p=>p.id===pregunta.pilar as any)
  const cc    = pilar ? colorClass(pilar.color) : null

  const tipoPreguntaLabels:Record<TipoPregunta,string> = {
    escala_5:'Escala 1 al 5', escala_likert:'Escala Likert', texto_abierto:'Respuesta libre',
    seleccion_unica:'Selección única', seleccion_multiple:'Selección múltiple', si_no:'Sí / No', porcentaje:'Porcentaje',
  }

  return (
    <ForgeCard className={cn('p-4 transition-all',expanded&&'ring-1 ring-primary/50')}>
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 mt-1">
          <span className="text-muted-foreground cursor-grab"><GripVertical className="w-4 h-4"/></span>
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">{index+1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between cursor-pointer" onClick={onToggle}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {pilar&&<span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold',cc?.bg,cc?.text)}>{pilar.nombre}</span>}
                <span className="text-xs text-muted-foreground bg-surface-2 px-2 py-0.5 rounded">{tipoPreguntaLabels[pregunta.tipoPregunta]}</span>
                <span className="text-xs text-muted-foreground">Peso: {pregunta.pesoPregunta}%</span>
              </div>
              <p className={cn('text-sm',pregunta.texto?'':'text-muted-foreground italic')}>
                {pregunta.texto||'Escribe el texto de la pregunta...'}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              {canMoveUp&&<button onClick={e=>{e.stopPropagation();onMoveUp()}} className="p-1 rounded hover:bg-surface-2 text-muted-foreground"><ChevronUp className="w-4 h-4"/></button>}
              {canMoveDown&&<button onClick={e=>{e.stopPropagation();onMoveDown()}} className="p-1 rounded hover:bg-surface-2 text-muted-foreground"><ChevronDown className="w-4 h-4"/></button>}
              <button onClick={e=>{e.stopPropagation();onDuplicate()}} className="p-1 rounded hover:bg-surface-2 text-muted-foreground"><Copy className="w-4 h-4"/></button>
              <button onClick={e=>{e.stopPropagation();onDelete()}} className="p-1 rounded hover:bg-red-500/20 text-red-400"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              {pilares.length>0&&(
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Sección</Label>
                  <Select value={pregunta.pilar as string} onValueChange={v=>onUpdate({pilar:v as any})}>
                    <SelectTrigger className="bg-surface-2 border-border"><SelectValue placeholder="Sin sección"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin sección</SelectItem>
                      {pilares.map(p=><SelectItem key={p.id} value={p.id}>{p.nombre||'Sin nombre'}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Texto de la pregunta *</Label>
                <Textarea value={pregunta.texto} onChange={e=>onUpdate({texto:e.target.value})}
                  placeholder="Escribe la pregunta aquí..." rows={3} className="bg-surface-2 border-border resize-none"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Tipo de respuesta</Label>
                  <Select value={pregunta.tipoPregunta} onValueChange={v=>onUpdate({tipoPregunta:v as TipoPregunta})}>
                    <SelectTrigger className="bg-surface-2 border-border"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {Object.entries(tipoPreguntaLabels).map(([k,v])=><SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Peso en la encuesta (%)</Label>
                  <Input type="number" min={0} max={100} step={0.5} value={pregunta.pesoPregunta}
                    onChange={e=>onUpdate({pesoPregunta:parseFloat(e.target.value)||0})}
                    className="bg-surface-2 border-border"/>
                </div>
              </div>
              {(pregunta.tipoPregunta==='seleccion_unica'||pregunta.tipoPregunta==='seleccion_multiple')&&(
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Opciones de respuesta</Label>
                  <div className="space-y-2">
                    {(pregunta.opciones||[]).map((op,i)=>(
                      <div key={i} className="flex gap-2">
                        <Input value={op} onChange={e=>{const a=[...(pregunta.opciones||[])];a[i]=e.target.value;onUpdate({opciones:a})}}
                          placeholder={`Opción ${i+1}`} className="bg-surface-2 border-border"/>
                        <button onClick={()=>onUpdate({opciones:(pregunta.opciones||[]).filter((_,j)=>j!==i)})}
                          className="p-2 rounded hover:bg-red-500/20 text-red-400"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={()=>onUpdate({opciones:[...(pregunta.opciones||[]),'']})}>
                      <Plus className="w-3.5 h-3.5 mr-1"/>Agregar opción
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ForgeCard>
  )
}

// ─── Selector público Directorio Activo ───────────────────────────────────────
function SelectorPublico({personas,setPersonas,gruposSel,setGruposSel,grupos,setGrupos,totalPersonas}:{
  personas:string[]; setPersonas:(v:string[])=>void
  gruposSel:string[]; setGruposSel:(v:string[])=>void
  grupos:GrupoDA[]; setGrupos:(v:GrupoDA[])=>void
  totalPersonas:number
}){
  const [tab,setTab]=useState<'personas'|'grupos'>('personas')
  const [busqueda,setBusqueda]=useState('')
  const [modoGrupo,setModoGrupo]=useState<'crear'|'editar'|null>(null)
  const [editGrupo,setEditGrupo]=useState<GrupoDA|null>(null)
  const [nuevoGrupo,setNuevoGrupo]=useState({nombre:'',descripcion:'',miembros:[] as string[]})

  const filtrados=DIRECTORIO.filter(p=>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())||
    p.area.toLowerCase().includes(busqueda.toLowerCase())||
    p.cargo.toLowerCase().includes(busqueda.toLowerCase())
  )
  const togglePersona=(id:string)=>setPersonas(personas.includes(id)?personas.filter(x=>x!==id):[...personas,id])
  const toggleGrupo=(id:string)=>setGruposSel(gruposSel.includes(id)?gruposSel.filter(x=>x!==id):[...gruposSel,id])

  const guardarGrupo=()=>{
    if(!nuevoGrupo.nombre)return
    if(editGrupo){
      setGrupos(grupos.map(g=>g.id===editGrupo.id?{...g,...nuevoGrupo}:g))
    } else {
      setGrupos([...grupos,{id:`g-${Date.now()}`,...nuevoGrupo}])
    }
    setModoGrupo(null);setEditGrupo(null);setNuevoGrupo({nombre:'',descripcion:'',miembros:[]})
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">¿Quién responde esta encuesta?</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Selecciona personas o grupos del directorio</p>
        </div>
        {totalPersonas>0&&(
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
            {totalPersonas} persona{totalPersonas!==1?'s':''} seleccionada{totalPersonas!==1?'s':''}
          </span>
        )}
      </div>

      <div className="flex gap-1 p-1 bg-surface-2 rounded-lg w-fit">
        {(['personas','grupos'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className={cn('px-4 py-1.5 rounded-md text-xs font-medium transition-all',
              tab===t?'bg-card text-foreground shadow-sm':'text-muted-foreground hover:text-foreground')}>
            {t==='personas'?`Personas (${personas.length})`:`Grupos (${gruposSel.length})`}
          </button>
        ))}
      </div>

      {tab==='personas'&&(
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="p-3 border-b border-border bg-surface-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/>
              <input value={busqueda} onChange={e=>setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, área o cargo..."
                className="w-full pl-8 pr-3 py-1.5 bg-card border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50"/>
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto divide-y divide-border/50">
            {filtrados.map(p=>{
              const sel=personas.includes(p.id)
              return (
                <div key={p.id} onClick={()=>togglePersona(p.id)}
                  className={cn('flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors',sel?'bg-primary/8':'hover:bg-surface-2')}>
                  <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',sel?'bg-primary border-primary':'border-border')}>
                    {sel&&<Check className="w-2.5 h-2.5 text-white"/>}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                    {p.nombre.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.nombre}</p>
                    <p className="text-[10px] text-muted-foreground">{p.cargo} · {p.area}</p>
                  </div>
                </div>
              )
            })}
          </div>
          {personas.length>0&&(
            <div className="p-2 border-t border-border bg-surface-2 flex flex-wrap gap-1">
              {personas.map(id=>{
                const p=DIRECTORIO.find(x=>x.id===id)
                return p?(
                  <span key={id} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                    {p.nombre.split(' ')[0]}
                    <button onClick={e=>{e.stopPropagation();togglePersona(id)}}><X className="w-2.5 h-2.5"/></button>
                  </span>
                ):null
              })}
            </div>
          )}
        </div>
      )}

      {tab==='grupos'&&(
        <div className="space-y-2">
          {modoGrupo?(
            <div className="p-4 rounded-xl border border-primary/40 bg-primary/5 space-y-3">
              <p className="text-xs font-semibold text-primary">{modoGrupo==='editar'?'Editar grupo':'Crear nuevo grupo'}</p>
              <Input value={nuevoGrupo.nombre} onChange={e=>setNuevoGrupo({...nuevoGrupo,nombre:e.target.value})}
                placeholder="Nombre del grupo" className="bg-surface-2 border-border h-8 text-sm"/>
              <Input value={nuevoGrupo.descripcion} onChange={e=>setNuevoGrupo({...nuevoGrupo,descripcion:e.target.value})}
                placeholder="Descripción (opcional)" className="bg-surface-2 border-border h-8 text-sm"/>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Miembros del directorio</p>
                <div className="max-h-36 overflow-y-auto border border-border rounded-lg divide-y divide-border/50">
                  {DIRECTORIO.map(p=>{
                    const en=nuevoGrupo.miembros.includes(p.id)
                    return (
                      <div key={p.id} onClick={()=>setNuevoGrupo({...nuevoGrupo,miembros:en?nuevoGrupo.miembros.filter(x=>x!==p.id):[...nuevoGrupo.miembros,p.id]})}
                        className={cn('flex items-center gap-2 px-3 py-2 cursor-pointer text-xs',en?'bg-primary/8':'hover:bg-surface-2')}>
                        <div className={cn('w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0',en?'bg-primary border-primary':'border-border')}>
                          {en&&<Check className="w-2 h-2 text-white"/>}
                        </div>
                        <span className="flex-1">{p.nombre}</span>
                        <span className="text-muted-foreground text-[10px]">{p.area}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-primary hover:bg-primary/90 h-8 text-xs" onClick={guardarGrupo} disabled={!nuevoGrupo.nombre}>Guardar</Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={()=>{setModoGrupo(null);setEditGrupo(null);setNuevoGrupo({nombre:'',descripcion:'',miembros:[]})}}>Cancelar</Button>
              </div>
            </div>
          ):(
            <button onClick={()=>setModoGrupo('crear')}
              className="w-full flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-all text-xs">
              <FolderPlus className="w-4 h-4"/>Crear nuevo grupo
            </button>
          )}

          {grupos.map(g=>{
            const sel=gruposSel.includes(g.id)
            return (
              <div key={g.id} className={cn('p-3 rounded-xl border-2 transition-all',sel?'border-primary/60 bg-primary/5':'border-border')}>
                <div className="flex items-start gap-2">
                  <div className="flex items-start gap-2 flex-1 cursor-pointer" onClick={()=>toggleGrupo(g.id)}>
                    <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5',sel?'bg-primary border-primary':'border-border')}>
                      {sel&&<Check className="w-2.5 h-2.5 text-white"/>}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{g.nombre}</p>
                      {g.descripcion&&<p className="text-[10px] text-muted-foreground">{g.descripcion}</p>}
                      <p className="text-[10px] text-muted-foreground mt-0.5">{g.miembros.length} miembro{g.miembros.length!==1?'s':''}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={()=>{setEditGrupo(g);setNuevoGrupo({nombre:g.nombre,descripcion:g.descripcion,miembros:[...g.miembros]});setModoGrupo('editar')}}
                      className="p-1 rounded hover:bg-surface-2 text-muted-foreground text-xs">✏️</button>
                    <button onClick={()=>{setGrupos(grupos.filter(x=>x.id!==g.id));setGruposSel(gruposSel.filter(x=>x!==g.id))}}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400"><X className="w-3 h-3"/></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
