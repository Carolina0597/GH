'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useForgeStore, type Encuesta, type PreguntaEncuesta, type TipoEncuesta, type TipoPregunta } from '@/lib/store'
import { ForgeCard, Badge } from '@/components/forge/forge-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ChevronLeft, Plus, Trash2, GripVertical, Save, Copy,
  Settings, FileText, Type, List, CheckSquare, ToggleLeft, Percent,
  ChevronUp, ChevronDown, AlertTriangle, BarChart3, Hash, Tag,
  TrendingUp, Check, Info, Users, X, Search, UserPlus, FolderPlus
} from 'lucide-react'
import { VoiceAIAssistant } from '@/components/planes/voice-ai-assistant'

// ─── Tipos ────────────────────────────────────────────────────────────────────

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

const tipoPreguntaLabels: Record<TipoPregunta, string> = {
  escala_5: 'Escala 1-5',
  escala_likert: 'Escala Likert',
  texto_abierto: 'Texto abierto',
  seleccion_unica: 'Seleccion unica',
  seleccion_multiple: 'Seleccion multiple',
  si_no: 'Si / No',
  porcentaje: 'Porcentaje',
}

// ─── Tipos para pilares configurables ────────────────────────────────────────

interface PilarConfig {
  id: string
  nombre: string
  peso: number        // 0-100
  color: string
}

const PILARES_DEFAULT: PilarConfig[] = [
  { id: 'ser',        nombre: 'Ser',           peso: 20, color: 'purple' },
  { id: 'saber_hacer',nombre: 'Saber y Hacer', peso: 40, color: 'blue'   },
  { id: 'especifico', nombre: 'Especifico',    peso: 40, color: 'emerald'},
]

const COLORES_PILAR = ['purple','blue','emerald','amber','red','pink','cyan','orange']

// ─── Tipos para métricas ──────────────────────────────────────────────────────

export type TipoMetrica =
  | 'promedio_general' | 'promedio_pilar' | 'promedio_objetivo'
  | 'distribucion_respuestas' | 'comparativa_equipos' | 'comparativa_lanzamientos'
  | 'top_fortalezas' | 'top_brechas' | 'tasa_respuesta' | 'activacion_planes'
  | 'por_lider' | 'por_area' | 'por_vp' | 'segmento_personalizado'

export interface ConfigMetrica {
  id: string; tipo: TipoMetrica; nombre: string; activa: boolean
  opciones?: { umbralPlanMejora?: number; topN?: number; segmentoEtiqueta?: string }
}

const METRICAS_DISPONIBLES = [
  { tipo: 'promedio_general' as TipoMetrica,         label: 'Promedio general',          descripcion: 'Puntaje total promedio de todos los participantes.',                categoria: 'Resultados' },
  { tipo: 'promedio_pilar' as TipoMetrica,           label: 'Promedio por pilar',         descripcion: 'Puntaje promedio desglosado por cada pilar configurado.',           categoria: 'Resultados' },
  { tipo: 'promedio_objetivo' as TipoMetrica,        label: 'Por objetivo estrategico',   descripcion: 'Promedio agrupado por objetivo estrategico de cada pregunta.',      categoria: 'Resultados' },
  { tipo: 'distribucion_respuestas' as TipoMetrica,  label: 'Distribucion de respuestas', descripcion: 'Como se distribuyen las respuestas en cada pregunta.',              categoria: 'Resultados' },
  { tipo: 'top_fortalezas' as TipoMetrica,           label: 'Top fortalezas',             descripcion: 'Preguntas con los puntajes mas altos.',                             categoria: 'Brechas'    },
  { tipo: 'top_brechas' as TipoMetrica,              label: 'Top brechas',                descripcion: 'Preguntas con los puntajes mas bajos.',                             categoria: 'Brechas'    },
  { tipo: 'activacion_planes' as TipoMetrica,        label: 'Activacion de planes',       descripcion: 'Cuantos participantes activaron plan de mejora.',                   categoria: 'Brechas'    },
  { tipo: 'comparativa_equipos' as TipoMetrica,      label: 'Por equipo / area',          descripcion: 'Resultados comparados entre equipos o areas.',                      categoria: 'Comparativas'},
  { tipo: 'por_lider' as TipoMetrica,                label: 'Por lider',                  descripcion: 'Resultados agrupados por lider evaluador.',                         categoria: 'Comparativas'},
  { tipo: 'por_area' as TipoMetrica,                 label: 'Por area',                   descripcion: 'Resultados agrupados por area organizacional.',                     categoria: 'Comparativas'},
  { tipo: 'por_vp' as TipoMetrica,                   label: 'Por vicepresidencia',        descripcion: 'Resultados agrupados por VP.',                                      categoria: 'Comparativas'},
  { tipo: 'comparativa_lanzamientos' as TipoMetrica, label: 'Evolucion en el tiempo',     descripcion: 'Compara resultados entre distintos lanzamientos.',                  categoria: 'Comparativas'},
  { tipo: 'tasa_respuesta' as TipoMetrica,           label: 'Tasa de respuesta',          descripcion: 'Porcentaje de participantes que completaron la encuesta.',          categoria: 'Participacion'},
  { tipo: 'segmento_personalizado' as TipoMetrica,   label: 'Segmento personalizado',     descripcion: 'Agrupa resultados segun una etiqueta que defines tu.',              categoria: 'Participacion'},
]

const CATEGORIAS_METRICAS = ['Resultados','Brechas','Comparativas','Participacion']

const METRICAS_DEFAULT: ConfigMetrica[] = [
  { id:'m1', tipo:'promedio_general',  nombre:'Promedio general',  activa:true, opciones:{ umbralPlanMejora:60 } },
  { id:'m2', tipo:'promedio_pilar',    nombre:'Por pilar',          activa:true },
  { id:'m3', tipo:'tasa_respuesta',    nombre:'Tasa de respuesta',  activa:true },
  { id:'m4', tipo:'activacion_planes', nombre:'Planes activados',   activa:true, opciones:{ umbralPlanMejora:60 } },
]

// ─── Directorio Activo mock ───────────────────────────────────────────────────

interface PersonaDA { id:string; nombre:string; cargo:string; area:string; email:string }
interface GrupoDA   { id:string; nombre:string; descripcion:string; miembros:string[]; creadoPor:string }

const DIRECTORIO_ACTIVO: PersonaDA[] = [
  { id:'da1',  nombre:'Ana García',         cargo:'Backend Developer',   area:'Tecnología',  email:'ana.garcia@sistecredito.com' },
  { id:'da2',  nombre:'Juan Ramos',          cargo:'Frontend Developer',  area:'Tecnología',  email:'juan.ramos@sistecredito.com' },
  { id:'da3',  nombre:'Carlos Méndez',       cargo:'Senior Developer',    area:'Tecnología',  email:'carlos.mendez@sistecredito.com' },
  { id:'da4',  nombre:'Laura Torres',        cargo:'Product Manager',     area:'Producto',    email:'laura.torres@sistecredito.com' },
  { id:'da5',  nombre:'Nicolás Pérez',       cargo:'QA Engineer',         area:'Tecnología',  email:'nicolas.perez@sistecredito.com' },
  { id:'da6',  nombre:'Valentina Flórez',    cargo:'UX Designer',         area:'Diseño',      email:'valentina.florez@sistecredito.com' },
  { id:'da7',  nombre:'Mateo Toro',          cargo:'Data Analyst',        area:'Datos',       email:'mateo.toro@sistecredito.com' },
  { id:'da8',  nombre:'Sandra Roldán',       cargo:'Scrum Master',        area:'Agilidad',    email:'sandra.roldan@sistecredito.com' },
  { id:'da9',  nombre:'Catalina Jaramillo',  cargo:'DevOps Engineer',     area:'Tecnología',  email:'catalina.jaramillo@sistecredito.com' },
  { id:'da10', nombre:'Andrés Gómez',        cargo:'Mobile Developer',    area:'Tecnología',  email:'andres.gomez@sistecredito.com' },
  { id:'da11', nombre:'María López',         cargo:'Engineering Manager', area:'Tecnología',  email:'maria.lopez@sistecredito.com' },
  { id:'da12', nombre:'Sebastián Mariño',    cargo:'Product Lead',        area:'Producto',    email:'sebastian.marino@sistecredito.com' },
  { id:'da13', nombre:'Laura Roldán',        cargo:'Design Lead',         area:'Diseño',      email:'laura.roldan@sistecredito.com' },
]

// ─── Componente selector de público con Directorio Activo ────────────────────

function SelectorPublico({
  personasSeleccionadas, setPersonasSeleccionadas,
  gruposSeleccionados, setGruposSeleccionados,
  grupos, setGrupos,
}: {
  personasSeleccionadas: string[]
  setPersonasSeleccionadas: (v: string[]) => void
  gruposSeleccionados: string[]
  setGruposSeleccionados: (v: string[]) => void
  grupos: GrupoDA[]
  setGrupos: (v: GrupoDA[]) => void
}) {
  const [tab, setTab] = useState<'personas'|'grupos'>('personas')
  const [busqueda, setBusqueda] = useState('')
  const [mostrarCrearGrupo, setMostrarCrearGrupo] = useState(false)
  const [editandoGrupo, setEditandoGrupo] = useState<GrupoDA|null>(null)
  const [nuevoGrupo, setNuevoGrupo] = useState({ nombre:'', descripcion:'', miembros:[] as string[] })

  const personasFiltradas = DIRECTORIO_ACTIVO.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.area.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.cargo.toLowerCase().includes(busqueda.toLowerCase())
  )

  const togglePersona = (id: string) =>
    setPersonasSeleccionadas(personasSeleccionadas.includes(id)
      ? personasSeleccionadas.filter(x => x !== id)
      : [...personasSeleccionadas, id])

  const toggleGrupo = (id: string) =>
    setGruposSeleccionados(gruposSeleccionados.includes(id)
      ? gruposSeleccionados.filter(x => x !== id)
      : [...gruposSeleccionados, id])

  const guardarGrupo = () => {
    if (!nuevoGrupo.nombre) return
    if (editandoGrupo) {
      setGrupos(grupos.map(g => g.id === editandoGrupo.id
        ? { ...g, nombre: nuevoGrupo.nombre, descripcion: nuevoGrupo.descripcion, miembros: nuevoGrupo.miembros }
        : g))
    } else {
      setGrupos([...grupos, { id:`g${Date.now()}`, nombre:nuevoGrupo.nombre, descripcion:nuevoGrupo.descripcion, miembros:nuevoGrupo.miembros, creadoPor:'Usuario actual' }])
    }
    setNuevoGrupo({ nombre:'', descripcion:'', miembros:[] })
    setMostrarCrearGrupo(false)
    setEditandoGrupo(null)
  }

  const eliminarGrupo = (id: string) => {
    setGrupos(grupos.filter(g => g.id !== id))
    setGruposSeleccionados(gruposSeleccionados.filter(x => x !== id))
  }

  const totalSeleccionados = personasSeleccionadas.length +
    gruposSeleccionados.reduce((s, gid) => s + (grupos.find(g => g.id === gid)?.miembros.length || 0), 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Publico objetivo</Label>
        {totalSeleccionados > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            {totalSeleccionados} persona{totalSeleccionados > 1 ? 's' : ''} seleccionada{totalSeleccionados > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-2 rounded-lg w-fit">
        {(['personas','grupos'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              tab === t ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            {t === 'personas' ? `Personas (${personasSeleccionadas.length})` : `Grupos (${gruposSeleccionados.length})`}
          </button>
        ))}
      </div>

      {tab === 'personas' && (
        <div className="border border-border rounded-xl overflow-hidden">
          {/* Buscador */}
          <div className="p-3 border-b border-border bg-surface-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, area o cargo..."
                className="w-full pl-8 pr-3 py-1.5 bg-card border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          {/* Lista */}
          <div className="max-h-52 overflow-y-auto divide-y divide-border/50">
            {personasFiltradas.map(p => {
              const sel = personasSeleccionadas.includes(p.id)
              return (
                <div key={p.id} onClick={() => togglePersona(p.id)}
                  className={cn('flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors',
                    sel ? 'bg-primary/8' : 'hover:bg-surface-2')}>
                  <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    sel ? 'bg-primary border-primary' : 'border-border')}>
                    {sel && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                    {p.nombre.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.nombre}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{p.cargo} · {p.area}</p>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Seleccionados chips */}
          {personasSeleccionadas.length > 0 && (
            <div className="p-2 border-t border-border bg-surface-2 flex flex-wrap gap-1">
              {personasSeleccionadas.map(id => {
                const p = DIRECTORIO_ACTIVO.find(x => x.id === id)!
                return (
                  <span key={id} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                    {p?.nombre.split(' ')[0]}
                    <button onClick={e => { e.stopPropagation(); togglePersona(id) }}><X className="w-2.5 h-2.5" /></button>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'grupos' && (
        <div className="space-y-2">
          {/* Crear grupo */}
          {!mostrarCrearGrupo ? (
            <button onClick={() => setMostrarCrearGrupo(true)}
              className="w-full flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-all text-xs">
              <FolderPlus className="w-4 h-4" /> Crear nuevo grupo
            </button>
          ) : (
            <div className="p-4 rounded-xl border border-primary/40 bg-primary/5 space-y-3">
              <p className="text-xs font-semibold text-primary">{editandoGrupo ? 'Editar grupo' : 'Nuevo grupo'}</p>
              <Input value={nuevoGrupo.nombre} onChange={e => setNuevoGrupo({...nuevoGrupo, nombre: e.target.value})}
                placeholder="Nombre del grupo" className="bg-surface-2 border-border h-8 text-xs" />
              <Input value={nuevoGrupo.descripcion} onChange={e => setNuevoGrupo({...nuevoGrupo, descripcion: e.target.value})}
                placeholder="Descripcion (opcional)" className="bg-surface-2 border-border h-8 text-xs" />
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Agregar miembros del directorio</p>
                <div className="max-h-32 overflow-y-auto border border-border rounded-lg divide-y divide-border/50">
                  {DIRECTORIO_ACTIVO.map(p => {
                    const enGrupo = nuevoGrupo.miembros.includes(p.id)
                    return (
                      <div key={p.id} onClick={() => setNuevoGrupo({...nuevoGrupo,
                        miembros: enGrupo ? nuevoGrupo.miembros.filter(x=>x!==p.id) : [...nuevoGrupo.miembros, p.id]})}
                        className={cn('flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs', enGrupo ? 'bg-primary/8' : 'hover:bg-surface-2')}>
                        <div className={cn('w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0',
                          enGrupo ? 'bg-primary border-primary' : 'border-border')}>
                          {enGrupo && <Check className="w-2 h-2 text-white" />}
                        </div>
                        <span className="flex-1 truncate">{p.nombre}</span>
                        <span className="text-muted-foreground text-[10px]">{p.area}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-primary hover:bg-primary/90 h-7 text-xs" onClick={guardarGrupo}
                  disabled={!nuevoGrupo.nombre}>
                  Guardar grupo
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                  setMostrarCrearGrupo(false); setEditandoGrupo(null)
                  setNuevoGrupo({ nombre:'', descripcion:'', miembros:[] })
                }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Lista de grupos */}
          {grupos.length === 0 && !mostrarCrearGrupo && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No hay grupos creados aun. Crea uno para reutilizarlo en varias encuestas.
            </p>
          )}
          {grupos.map(g => {
            const sel = gruposSeleccionados.includes(g.id)
            return (
              <div key={g.id} className={cn('p-3 rounded-xl border-2 transition-all',
                sel ? 'border-primary/60 bg-primary/5' : 'border-border hover:border-border/80')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 cursor-pointer" onClick={() => toggleGrupo(g.id)}>
                    <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                      sel ? 'bg-primary border-primary' : 'border-border')}>
                      {sel && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{g.nombre}</p>
                      {g.descripcion && <p className="text-[10px] text-muted-foreground">{g.descripcion}</p>}
                      <p className="text-[10px] text-muted-foreground mt-0.5">{g.miembros.length} miembro{g.miembros.length!==1?'s':''}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => {
                      setEditandoGrupo(g)
                      setNuevoGrupo({ nombre:g.nombre, descripcion:g.descripcion, miembros:[...g.miembros] })
                      setMostrarCrearGrupo(true)
                    }} className="p-1 rounded hover:bg-surface-2 text-muted-foreground text-[10px]">✏️</button>
                    <button onClick={() => eliminarGrupo(g.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400"><X className="w-3 h-3" /></button>
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

// ─── Editor principal ─────────────────────────────────────────────────────────

interface EncuestaEditorProps {
  encuesta: Encuesta | null
  tipoNueva: TipoEncuesta | null
  onBack: () => void
  onSave: (encuesta: Encuesta) => void
}

export function EncuestaEditor({ encuesta, tipoNueva, onBack, onSave }: EncuestaEditorProps) {
  const { talentos } = useForgeStore()

  const [paso, setPaso] = useState<'config'|'preguntas'|'metricas'|'preview'>('config')

  // Datos generales
  const [nombre, setNombre] = useState(encuesta?.nombre || '')
  const [descripcion, setDescripcion] = useState(encuesta?.descripcion || '')
  const [tipo, setTipo] = useState<TipoEncuesta>(encuesta?.tipo || tipoNueva || 'lider_colaborador')
  const [esPlantilla, setEsPlantilla] = useState(encuesta?.esPlantilla || false)

  // Pilares configurables (no fijos)
  const [pilares, setPilares] = useState<PilarConfig[]>(PILARES_DEFAULT)
  const [preguntas, setPreguntas] = useState<PreguntaEncuesta[]>(encuesta?.preguntas || [])
  const [expandedPregunta, setExpandedPregunta] = useState<string|null>(null)

  // Métricas
  const [metricas, setMetricas] = useState<ConfigMetrica[]>(METRICAS_DEFAULT)

  // Público - Directorio Activo
  const [personasSeleccionadas, setPersonasSeleccionadas] = useState<string[]>([])
  const [gruposSeleccionados, setGruposSeleccionados] = useState<string[]>([])
  const [grupos, setGrupos] = useState<GrupoDA[]>([
    { id:'g1', nombre:'Equipo Backend', descripcion:'Developers Backend', miembros:['da1','da3','da9'], creadoPor:'Sistema' },
    { id:'g2', nombre:'Lideres Tecnologia', descripcion:'Lideres del area tech', miembros:['da11','da12','da13'], creadoPor:'Sistema' },
  ])

  // Validaciones
  const pesoPilaresTotal = pilares.reduce((s,p) => s + p.peso, 0)
  const pesoPreguntas = preguntas.reduce((s,p) => s + p.pesoPregunta, 0)

  // Handlers pilares
  const addPilar = () => setPilares([...pilares, {
    id: `pilar-${Date.now()}`, nombre: 'Nuevo pilar', peso: 0,
    color: COLORES_PILAR[pilares.length % COLORES_PILAR.length]
  }])
  const updatePilar = (id:string, updates:Partial<PilarConfig>) =>
    setPilares(pilares.map(p => p.id===id ? {...p,...updates} : p))
  const deletePilar = (id:string) => {
    setPilares(pilares.filter(p=>p.id!==id))
    setPreguntas(preguntas.filter(p=>p.pilar!==id))
  }

  // Handlers preguntas
  const addPregunta = (pilarId?:string) => {
    const p: PreguntaEncuesta = {
      id:`preg-${Date.now()}`, pilar:(pilarId||pilares[0]?.id||'ser') as any,
      texto:'', tipoPregunta:'escala_5', pesoPregunta:10,
      escalaCalificacion:[
        {valor:5,porcentaje:10},{valor:4,porcentaje:8},
        {valor:3,porcentaje:6},{valor:2,porcentaje:4},{valor:1,porcentaje:2},
      ],
      requerida:true, orden:preguntas.length+1,
    }
    setPreguntas([...preguntas, p])
    setExpandedPregunta(p.id)
  }
  const updatePregunta = (id:string, u:Partial<PreguntaEncuesta>) =>
    setPreguntas(preguntas.map(p=>p.id===id?{...p,...u}:p))
  const deletePregunta = (id:string) =>
    setPreguntas(preguntas.filter(p=>p.id!==id).map((p,i)=>({...p,orden:i+1})))
  const movePregunta = (id:string, dir:'up'|'down') => {
    const idx = preguntas.findIndex(p=>p.id===id)
    if ((dir==='up'&&idx===0)||(dir==='down'&&idx===preguntas.length-1)) return
    const arr=[...preguntas]; const ti=dir==='up'?idx-1:idx+1
    ;[arr[idx],arr[ti]]=[arr[ti],arr[idx]]
    setPreguntas(arr.map((p,i)=>({...p,orden:i+1})))
  }

  // Handlers métricas
  const toggleMetrica = (tipo:TipoMetrica) => {
    const existe = metricas.find(m=>m.tipo===tipo)
    if (existe) setMetricas(metricas.map(m=>m.tipo===tipo?{...m,activa:!m.activa}:m))
    else {
      const def=METRICAS_DISPONIBLES.find(m=>m.tipo===tipo)!
      setMetricas([...metricas,{id:`m-${Date.now()}`,tipo,nombre:def.label,activa:true}])
    }
  }
  const isMetricaActiva = (tipo:TipoMetrica) => metricas.find(m=>m.tipo===tipo)?.activa??false
  const updateMetricaOpc = (tipo:TipoMetrica, opc:ConfigMetrica['opciones']) =>
    setMetricas(metricas.map(m=>m.tipo===tipo?{...m,opciones:{...m.opciones,...opc}}:m))
  const updateMetricaNombre = (tipo:TipoMetrica, nombre:string) =>
    setMetricas(metricas.map(m=>m.tipo===tipo?{...m,nombre}:m))

  const handleSave = (borrador=false) => {
    const enc:Encuesta = {
      id:encuesta?.id||`enc-${Date.now()}`, nombre, descripcion, tipo,
      version:encuesta?.version||'1.0', estado:borrador?'borrador':'activa',
      preguntas, esPlantilla,
      createdAt:encuesta?.createdAt||new Date().toISOString().split('T')[0],
      updatedAt:new Date().toISOString().split('T')[0],
      createdBy:encuesta?.createdBy||'Usuario actual',
    }
    onSave(enc)
  }

  const pasos = [
    { id:'config',    label:'Configuracion', done:!!nombre },
    { id:'preguntas', label:'Preguntas',      done:preguntas.length>0 },
    { id:'metricas',  label:'Metricas',       done:metricas.filter(m=>m.activa).length>0 },
    { id:'preview',   label:'Vista previa',   done:false },
  ]

  const pilarColor = (c:string) => ({
    purple:'text-purple-400 bg-purple-500/20 border-purple-500/30',
    blue:'text-blue-400 bg-blue-500/20 border-blue-500/30',
    emerald:'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    amber:'text-amber-400 bg-amber-500/20 border-amber-500/30',
    red:'text-red-400 bg-red-500/20 border-red-500/30',
    pink:'text-pink-400 bg-pink-500/20 border-pink-500/30',
    cyan:'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
    orange:'text-orange-400 bg-orange-500/20 border-orange-500/30',
  }[c]||'text-blue-400 bg-blue-500/20 border-blue-500/30')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-2" />Volver</Button>
          <div>
            <h1 className="text-xl font-bold">{encuesta?'Editar encuesta':'Nueva encuesta'}</h1>
            <p className="text-sm text-muted-foreground">{nombre||'Sin nombre'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <VoiceAIAssistant mode="full" context={{tipo,nombre,cantidadPreguntas:preguntas.length}}
            onSuggestion={(s)=>{
              try{const d=JSON.parse(s);if(d.preguntas)setPreguntas(d.preguntas.map((p:any,i:number)=>({
                id:`ai-${Date.now()}-${i}`,pilar:p.pilar||'saber_hacer',texto:p.texto,
                tipoPregunta:p.tipoPregunta||'escala_5',pesoPregunta:p.pesoPregunta||10,
                escalaCalificacion:[{valor:5,porcentaje:p.pesoPregunta||10},{valor:4,porcentaje:(p.pesoPregunta||10)*.8},{valor:3,porcentaje:(p.pesoPregunta||10)*.6},{valor:2,porcentaje:(p.pesoPregunta||10)*.4},{valor:1,porcentaje:(p.pesoPregunta||10)*.2}],
                requerida:true,orden:i+1,
              })))}catch{}
            }}
          />
          <Button variant="outline" onClick={()=>handleSave(true)}><Save className="w-4 h-4 mr-2" />Borrador</Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={()=>handleSave(false)} disabled={!nombre||preguntas.length===0}>
            <Save className="w-4 h-4 mr-2" />Guardar
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1">
        {pasos.map((p,i)=>(
          <div key={p.id} className="flex items-center gap-1 flex-1">
            <button onClick={()=>setPaso(p.id as any)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 justify-center',
                paso===p.id?'bg-primary text-white':
                p.done?'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30':
                'bg-surface-2 text-muted-foreground hover:text-foreground')}>
              {p.done&&paso!==p.id?<Check className="w-3.5 h-3.5"/>:<span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-xs">{i+1}</span>}
              {p.label}
            </button>
            {i<pasos.length-1&&<div className="w-4 h-px bg-border flex-shrink-0"/>}
          </div>
        ))}
      </div>

      {/* ── PASO 1: CONFIGURACION ── */}
      {paso==='config'&&(
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ForgeCard className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Settings className="w-4 h-4"/>Datos generales</h3>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Nombre *</Label>
                <Input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej: Evaluacion Liderazgo Q2 2026" className="bg-surface-2 border-border"/>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Descripcion</Label>
                <Textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Proposito y alcance..." rows={3} className="bg-surface-2 border-border resize-none"/>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Tipo</Label>
                <Select value={tipo} onValueChange={v=>setTipo(v as TipoEncuesta)}>
                  <SelectTrigger className="bg-surface-2 border-border"><SelectValue/></SelectTrigger>
                  <SelectContent>{Object.entries(tipoEncuestaLabels).map(([k,v])=><SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2">
                <div><p className="text-sm font-medium">Guardar como plantilla</p><p className="text-xs text-muted-foreground">Permite reutilizar esta encuesta</p></div>
                <Switch checked={esPlantilla} onCheckedChange={setEsPlantilla}/>
              </div>
            </ForgeCard>
          </div>

          <div className="space-y-4">
            {/* Pilares configurables */}
            <ForgeCard className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4"/>Pilares de evaluacion</h3>
                <Button variant="outline" size="sm" onClick={addPilar}><Plus className="w-3.5 h-3.5 mr-1"/>Agregar pilar</Button>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <Info className="w-4 h-4 flex-shrink-0"/>
                Los pilares son completamente configurables. Define el nombre y el peso de cada uno. El total debe sumar 100%.
              </div>

              <div className="space-y-3">
                {pilares.map((pilar,i)=>(
                  <div key={pilar.id} className="flex items-center gap-2 p-3 rounded-lg bg-surface-2">
                    <Select value={pilar.color} onValueChange={v=>updatePilar(pilar.id,{color:v})}>
                      <SelectTrigger className="w-20 bg-surface-3 border-border h-8 text-xs"><SelectValue/></SelectTrigger>
                      <SelectContent>{COLORES_PILAR.map(c=><SelectItem key={c} value={c}><span className={cn('font-medium',pilarColor(c).split(' ')[0])}>{c}</span></SelectItem>)}</SelectContent>
                    </Select>
                    <Input value={pilar.nombre} onChange={e=>updatePilar(pilar.id,{nombre:e.target.value})}
                      className="bg-surface-3 border-border h-8 text-sm flex-1" placeholder="Nombre del pilar"/>
                    <div className="flex items-center gap-1">
                      <Input type="number" min={0} max={100} value={pilar.peso}
                        onChange={e=>updatePilar(pilar.id,{peso:parseInt(e.target.value)||0})}
                        className="bg-surface-3 border-border h-8 text-sm w-16 text-center"/>
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                    {pilares.length>1&&(
                      <button onClick={()=>deletePilar(pilar.id)} className="p-1 rounded hover:bg-red-500/20 text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm pt-1 border-t border-border">
                <span className="text-muted-foreground">Total</span>
                <span className={cn('font-bold', pesoPilaresTotal===100?'text-emerald-400':pesoPilaresTotal>100?'text-red-400':'text-amber-400')}>
                  {pesoPilaresTotal}% / 100%
                </span>
              </div>
              {pesoPilaresTotal!==100&&(
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5"/>Los pesos deben sumar exactamente 100%
                </div>
              )}
            </ForgeCard>

            {/* Público */}
            <ForgeCard className="p-5">
              <SelectorPublico
                personasSeleccionadas={personasSeleccionadas}
                setPersonasSeleccionadas={setPersonasSeleccionadas}
                gruposSeleccionados={gruposSeleccionados}
                setGruposSeleccionados={setGruposSeleccionados}
                grupos={grupos} setGrupos={setGrupos}
              />
            </ForgeCard>
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <Button className="bg-primary hover:bg-primary/90" onClick={()=>setPaso('preguntas')} disabled={!nombre}>Continuar a preguntas →</Button>
          </div>
        </div>
      )}

      {/* ── PASO 2: PREGUNTAS ── */}
      {paso==='preguntas'&&(
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <ForgeCard className="p-4">
              <h3 className="font-semibold mb-3 text-sm">Resumen de pesos</h3>
              <div className="space-y-2">
                {pilares.map(pilar=>{
                  const total=preguntas.filter(p=>p.pilar===pilar.id||p.pilar===(pilar.id==='ser'?'ser':pilar.id==='saber_hacer'?'saber_hacer':pilar.id==='especifico'?'especifico':pilar.id)).reduce((s,p)=>s+p.pesoPregunta,0)
                  return(
                    <div key={pilar.id}>
                      <div className="flex justify-between mb-1">
                        <span className={cn('text-xs font-medium',pilarColor(pilar.color).split(' ')[0])}>{pilar.nombre}</span>
                        <span className={cn('text-xs font-semibold',total===pilar.peso?'text-emerald-400':total>pilar.peso?'text-red-400':'text-amber-400')}>
                          {total}% / {pilar.peso}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                        <div className={cn('h-full rounded-full',`bg-${pilar.color}-500`)} style={{width:`${Math.min((total/pilar.peso)*100||0,100)}%`}}/>
                      </div>
                    </div>
                  )
                })}
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">Total preguntas</span>
                  <span className={cn('text-xs font-bold',pesoPreguntas===100?'text-emerald-400':pesoPreguntas>100?'text-red-400':'text-amber-400')}>
                    {pesoPreguntas}% / 100%
                  </span>
                </div>
              </div>
            </ForgeCard>

            <ForgeCard className="p-4">
              <p className="text-sm font-medium mb-2">Por pilar</p>
              {pilares.map(pilar=>{
                const pp=preguntas.filter(p=>p.pilar===pilar.id||(pilar.id==='ser'&&p.pilar==='ser')||(pilar.id==='saber_hacer'&&p.pilar==='saber_hacer')||(pilar.id==='especifico'&&p.pilar==='especifico'))
                return(
                  <div key={pilar.id} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn('text-xs font-medium',pilarColor(pilar.color).split(' ')[0])}>{pilar.nombre}</span>
                      <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={()=>addPregunta(pilar.id)}>
                        <Plus className="w-3 h-3 mr-1"/>Agregar
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {pp.map((p,i)=>(
                        <button key={p.id} onClick={()=>setExpandedPregunta(p.id)}
                          className={cn('w-full text-left text-[10px] p-1.5 rounded transition-all truncate',
                            expandedPregunta===p.id?'bg-primary/20 text-primary':'bg-surface-2 text-muted-foreground hover:text-foreground')}>
                          {i+1}. {p.texto||'Sin texto'}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </ForgeCard>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Preguntas ({preguntas.length})</h3>
              <Button onClick={()=>addPregunta()} size="sm"><Plus className="w-4 h-4 mr-2"/>Agregar pregunta</Button>
            </div>
            {preguntas.length===0?(
              <ForgeCard className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                <p className="text-muted-foreground mb-4">Agrega la primera pregunta.</p>
                <Button onClick={()=>addPregunta()}><Plus className="w-4 h-4 mr-2"/>Agregar pregunta</Button>
              </ForgeCard>
            ):(
              preguntas.map((p,idx)=>(
                <PreguntaEditor key={p.id} pregunta={p} index={idx} pilares={pilares}
                  isExpanded={expandedPregunta===p.id}
                  onToggleExpand={()=>setExpandedPregunta(expandedPregunta===p.id?null:p.id)}
                  onUpdate={u=>updatePregunta(p.id,u)}
                  onDelete={()=>deletePregunta(p.id)}
                  onMoveUp={()=>movePregunta(p.id,'up')}
                  onMoveDown={()=>movePregunta(p.id,'down')}
                  onDuplicate={()=>{const np={...p,id:`preg-${Date.now()}`,orden:preguntas.length+1};setPreguntas([...preguntas,np]);setExpandedPregunta(np.id)}}
                  canMoveUp={idx>0} canMoveDown={idx<preguntas.length-1}
                  pilarColor={pilarColor}
                />
              ))
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={()=>setPaso('config')}>← Anterior</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={()=>setPaso('metricas')}>Continuar a metricas →</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PASO 3: METRICAS ── */}
      {paso==='metricas'&&(
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-medium">Selecciona las metricas que quieres ver en los resultados</p>
              <p className="text-xs text-muted-foreground mt-1">Activa o desactiva cualquier metrica sin tocar el desarrollo. Los calculos son automaticos.</p>
            </div>
          </div>

          {CATEGORIAS_METRICAS.map(cat=>{
            const items=METRICAS_DISPONIBLES.filter(m=>m.categoria===cat)
            return(
              <ForgeCard key={cat} className="p-5">
                <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">{cat}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {items.map(item=>{
                    const activa=isMetricaActiva(item.tipo)
                    const config=metricas.find(m=>m.tipo===item.tipo)
                    return(
                      <div key={item.tipo}
                        className={cn('p-4 rounded-xl border-2 cursor-pointer transition-all',
                          activa?'border-primary/60 bg-primary/5':'border-border bg-surface-2 hover:border-border/80')}
                        onClick={()=>toggleMetrica(item.tipo)}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-medium text-sm">{item.label}</span>
                          <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                            activa?'bg-primary border-primary':'border-border')}>
                            {activa&&<Check className="w-3 h-3 text-white"/>}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.descripcion}</p>
                        {activa&&(item.tipo==='promedio_general'||item.tipo==='activacion_planes')&&(
                          <div className="mt-3 pt-3 border-t border-border/50" onClick={e=>e.stopPropagation()}>
                            <Label className="text-[11px] text-muted-foreground mb-1 block">Umbral plan de mejora (%)</Label>
                            <Input type="number" min={0} max={100} value={config?.opciones?.umbralPlanMejora??60}
                              onChange={e=>updateMetricaOpc(item.tipo,{umbralPlanMejora:parseInt(e.target.value)||60})}
                              className="bg-surface-3 border-border h-8 text-sm"/>
                          </div>
                        )}
                        {activa&&(item.tipo==='top_fortalezas'||item.tipo==='top_brechas')&&(
                          <div className="mt-3 pt-3 border-t border-border/50" onClick={e=>e.stopPropagation()}>
                            <Label className="text-[11px] text-muted-foreground mb-1 block">Mostrar top N</Label>
                            <Input type="number" min={1} max={10} value={config?.opciones?.topN??3}
                              onChange={e=>updateMetricaOpc(item.tipo,{topN:parseInt(e.target.value)||3})}
                              className="bg-surface-3 border-border h-8 text-sm"/>
                          </div>
                        )}
                        {activa&&item.tipo==='segmento_personalizado'&&(
                          <div className="mt-3 pt-3 border-t border-border/50" onClick={e=>e.stopPropagation()}>
                            <Label className="text-[11px] text-muted-foreground mb-1 block">Nombre del segmento</Label>
                            <Input placeholder="Ej: Region, Antiguedad" value={config?.opciones?.segmentoEtiqueta??''}
                              onChange={e=>updateMetricaOpc(item.tipo,{segmentoEtiqueta:e.target.value})}
                              className="bg-surface-3 border-border h-8 text-sm"/>
                          </div>
                        )}
                        {activa&&(
                          <div className="mt-3 pt-3 border-t border-border/50" onClick={e=>e.stopPropagation()}>
                            <Label className="text-[11px] text-muted-foreground mb-1 block">Nombre en dashboard</Label>
                            <Input value={config?.nombre??item.label}
                              onChange={e=>updateMetricaNombre(item.tipo,e.target.value)}
                              className="bg-surface-3 border-border h-8 text-sm"/>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ForgeCard>
            )
          })}

          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border">
            <p className="text-sm"><span className="font-semibold text-primary">{metricas.filter(m=>m.activa).length}</span> metricas activas</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setPaso('preguntas')}>← Anterior</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={()=>setPaso('preview')}>Ver vista previa →</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PASO 4: PREVIEW ── */}
      {paso==='preview'&&(
        <div className="space-y-4">
          <ForgeCard className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">{nombre||'Sin nombre'}</h2>
                <p className="text-sm text-muted-foreground">{tipoEncuestaLabels[tipo]}</p>
              </div>
              <div className="flex gap-2">
                {esPlantilla&&<span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">Plantilla</span>}
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Activa</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 text-sm">
              {[
                ['Preguntas', preguntas.length, 'text-primary'],
                ['Peso total', `${pesoPreguntas}%`, pesoPreguntas===100?'text-emerald-400':'text-amber-400'],
                ['Pilares', pilares.length, 'text-purple-400'],
                ['Metricas', metricas.filter(m=>m.activa).length, 'text-blue-400'],
              ].map(([l,v,c])=>(
                <div key={l as string} className="p-3 rounded-lg bg-surface-2 text-center">
                  <div className={cn('text-xl font-bold',c as string)}>{v}</div>
                  <div className="text-xs text-muted-foreground mt-1">{l}</div>
                </div>
              ))}
            </div>
          </ForgeCard>

          <ForgeCard className="p-5">
            <h3 className="font-semibold mb-3">Pilares configurados</h3>
            <div className="flex flex-wrap gap-2">
              {pilares.map(p=>(
                <span key={p.id} className={cn('text-xs px-3 py-1.5 rounded-lg border font-medium',pilarColor(p.color))}>
                  {p.nombre} ({p.peso}%)
                </span>
              ))}
            </div>
          </ForgeCard>

          <ForgeCard className="p-5">
            <h3 className="font-semibold mb-3">Metricas activas</h3>
            <div className="flex flex-wrap gap-2">
              {metricas.filter(m=>m.activa).map(m=>(
                <span key={m.id} className="text-xs px-3 py-1.5 rounded-lg bg-primary/15 text-primary border border-primary/30">{m.nombre}</span>
              ))}
            </div>
          </ForgeCard>

          <ForgeCard className="p-5">
            <h3 className="font-semibold mb-3">Preguntas</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {preguntas.map((p,i)=>{
                const pilar=pilares.find(x=>x.id===p.pilar)||pilares.find(x=>x.id===(p.pilar as string))
                return(
                  <div key={p.id} className="p-3 rounded-lg bg-surface-2 flex items-start gap-3">
                    <span className="text-xs text-muted-foreground w-5">{i+1}.</span>
                    <div className="flex-1">
                      <p className="text-sm">{p.texto||<em className="text-muted-foreground">Sin texto</em>}</p>
                      <div className="flex gap-2 mt-1">
                        {pilar&&<span className={cn('text-[10px] px-1.5 py-0.5 rounded border',pilarColor(pilar.color))}>{pilar.nombre}</span>}
                        <span className="text-[10px] text-muted-foreground">Peso: {p.pesoPregunta}%</span>
                      </div>
                    </div>
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

function PreguntaEditor({ pregunta, index, pilares, isExpanded, onToggleExpand, onUpdate, onDelete, onMoveUp, onMoveDown, onDuplicate, canMoveUp, canMoveDown, pilarColor }: {
  pregunta: PreguntaEncuesta; index: number; pilares: PilarConfig[]
  isExpanded: boolean; onToggleExpand:()=>void; onUpdate:(u:Partial<PreguntaEncuesta>)=>void
  onDelete:()=>void; onMoveUp:()=>void; onMoveDown:()=>void; onDuplicate:()=>void
  canMoveUp:boolean; canMoveDown:boolean; pilarColor:(c:string)=>string
}) {
  const pilarActual = pilares.find(p=>p.id===pregunta.pilar)||pilares[0]

  return(
    <ForgeCard className={cn('p-4 transition-all',isExpanded&&'ring-1 ring-primary/50')}>
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1">
          <button className="p-1 text-muted-foreground cursor-grab"><GripVertical className="w-4 h-4"/></button>
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">{index+1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between cursor-pointer" onClick={onToggleExpand}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {pilarActual&&<span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium',pilarColor(pilarActual.color))}>{pilarActual.nombre}</span>}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 border border-border">{tipoPreguntaLabels[pregunta.tipoPregunta]}</span>
                <span className="text-xs text-muted-foreground">Peso: {pregunta.pesoPregunta}%</span>
              </div>
              <p className={cn('text-sm',pregunta.texto?'text-foreground':'text-muted-foreground italic')}>
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

          {isExpanded&&(
            <div className="mt-4 pt-4 border-t border-border space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Pilar</Label>
                  <Select value={pregunta.pilar} onValueChange={v=>onUpdate({pilar:v as any})}>
                    <SelectTrigger className="bg-surface-2 border-border"><SelectValue/></SelectTrigger>
                    <SelectContent>{pilares.map(p=><SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Tipo de pregunta</Label>
                  <Select value={pregunta.tipoPregunta} onValueChange={v=>onUpdate({tipoPregunta:v as TipoPregunta})}>
                    <SelectTrigger className="bg-surface-2 border-border"><SelectValue/></SelectTrigger>
                    <SelectContent>{Object.entries(tipoPreguntaLabels).map(([k,v])=><SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Objetivo estrategico (opcional)</Label>
                <Input value={pregunta.objetivoEstrategico||''} onChange={e=>onUpdate({objetivoEstrategico:e.target.value})}
                  placeholder="Ej: Transformacion de procesos" className="bg-surface-2 border-border"/>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Texto de la pregunta *</Label>
                <Textarea value={pregunta.texto} onChange={e=>onUpdate({texto:e.target.value})}
                  placeholder="Escribe la pregunta..." rows={3} className="bg-surface-2 border-border resize-none"/>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Peso (%)</Label>
                  <Input type="number" min={0} max={100} step={0.5} value={pregunta.pesoPregunta}
                    onChange={e=>onUpdate({pesoPregunta:parseFloat(e.target.value)||0})}
                    className="bg-surface-2 border-border"/>
                </div>
              </div>
              {(pregunta.tipoPregunta==='escala_5'||pregunta.tipoPregunta==='escala_likert')&&(
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Escala de calificacion (valor → % que aporta)</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[5,4,3,2,1].map(valor=>{
                      const esc=pregunta.escalaCalificacion?.find(e=>e.valor===valor)
                      return(
                        <div key={valor} className="text-center">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center mx-auto mb-1 font-medium">{valor}</div>
                          <Input type="number" min={0} max={100} step={0.1} value={esc?.porcentaje||''}
                            onChange={e=>{
                              const arr=[...(pregunta.escalaCalificacion||[])]
                              const idx=arr.findIndex(x=>x.valor===valor)
                              if(idx>=0)arr[idx]={valor,porcentaje:parseFloat(e.target.value)||0}
                              else arr.push({valor,porcentaje:parseFloat(e.target.value)||0})
                              onUpdate({escalaCalificacion:arr.sort((a,b)=>b.valor-a.valor)})
                            }}
                            placeholder="%" className="bg-surface-2 border-border text-center text-xs h-8"/>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {(pregunta.tipoPregunta==='seleccion_unica'||pregunta.tipoPregunta==='seleccion_multiple')&&(
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Opciones de respuesta</Label>
                  <div className="space-y-2">
                    {(pregunta.opciones||[]).map((op,i)=>(
                      <div key={i} className="flex items-center gap-2">
                        <Input value={op} onChange={e=>{const arr=[...(pregunta.opciones||[])];arr[i]=e.target.value;onUpdate({opciones:arr})}}
                          placeholder={`Opcion ${i+1}`} className="bg-surface-2 border-border"/>
                        <button onClick={()=>onUpdate({opciones:(pregunta.opciones||[]).filter((_,j)=>j!==i)})} className="p-2 rounded hover:bg-red-500/20 text-red-400"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={()=>onUpdate({opciones:[...(pregunta.opciones||[]),'']})}>
                      <Plus className="w-4 h-4 mr-2"/>Agregar opcion
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2">
                <div><p className="text-sm font-medium">Pregunta requerida</p><p className="text-xs text-muted-foreground">El participante debe responder esta pregunta</p></div>
                <Switch checked={pregunta.requerida} onCheckedChange={v=>onUpdate({requerida:v})}/>
              </div>
            </div>
          )}
        </div>
      </div>
    </ForgeCard>
  )
}

