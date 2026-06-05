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
  ChevronLeft, Plus, Trash2, GripVertical, Save, Copy, Settings,
  FileText, Type, List, CheckSquare, ToggleLeft, Percent, Sparkles,
  ChevronUp, ChevronDown, AlertTriangle, BarChart3, PieChart,
  Hash, Tag, TrendingUp, Eye, Check, X, Info
} from 'lucide-react'
import { VoiceAIAssistant } from '@/components/planes/voice-ai-assistant'

// ─── Labels ──────────────────────────────────────────────────────────────────

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

// ─── Tipos para metricas flexibles ───────────────────────────────────────────

export type TipoMetrica =
  | 'promedio_general'       // Puntaje total promedio
  | 'promedio_pilar'         // Promedio por pilar (Ser/Saber-Hacer/Especifico)
  | 'promedio_objetivo'      // Promedio por objetivo estrategico
  | 'distribucion_respuestas'// Como se distribuyen las respuestas (1-5)
  | 'comparativa_equipos'    // Comparacion entre equipos/areas
  | 'comparativa_lanzamientos' // Evolucion entre lanzamientos
  | 'top_fortalezas'         // Preguntas con mayor puntaje
  | 'top_brechas'            // Preguntas con menor puntaje
  | 'tasa_respuesta'         // % de participantes que respondieron
  | 'activacion_planes'      // Cuantos planes de mejora se activaron
  | 'por_lider'              // Resultados agrupados por lider
  | 'por_area'               // Resultados agrupados por area
  | 'por_vp'                 // Resultados agrupados por VP
  | 'segmento_personalizado' // Agrupacion custom por etiqueta

export interface ConfigMetrica {
  id: string
  tipo: TipoMetrica
  nombre: string           // Nombre personalizable
  descripcion?: string
  activa: boolean
  // Opciones segun tipo
  opciones?: {
    umbralPlanMejora?: number   // % por debajo del cual se activa plan de mejora (default 60)
    mostrarEtiquetas?: boolean
    colores?: Record<string, string>
    agrupacionPor?: string      // campo por el que agrupar
    topN?: number               // para top_fortalezas/brechas cuantos mostrar
    segmentoEtiqueta?: string   // para segmento personalizado
  }
}

const METRICAS_DISPONIBLES: { tipo: TipoMetrica; label: string; descripcion: string; icono: React.ReactNode; categoria: string }[] = [
  // Resultados
  { tipo: 'promedio_general',        label: 'Promedio general',         descripcion: 'Puntaje total promedio de todos los participantes.',                categoria: 'Resultados', icono: <Hash className="w-4 h-4" /> },
  { tipo: 'promedio_pilar',          label: 'Promedio por pilar',       descripcion: 'Puntaje promedio desglosado por pilar (Ser, Saber y Hacer, Especifico).', categoria: 'Resultados', icono: <PieChart className="w-4 h-4" /> },
  { tipo: 'promedio_objetivo',       label: 'Por objetivo estrategico', descripcion: 'Promedio agrupado por objetivo estrategico de cada pregunta.',    categoria: 'Resultados', icono: <Tag className="w-4 h-4" /> },
  { tipo: 'distribucion_respuestas', label: 'Distribucion de respuestas',descripcion: 'Como se distribuyen las respuestas 1 a 5 en cada pregunta.',      categoria: 'Resultados', icono: <BarChart3 className="w-4 h-4" /> },
  // Brechas
  { tipo: 'top_fortalezas',          label: 'Top fortalezas',           descripcion: 'Preguntas o areas con los puntajes mas altos.',                    categoria: 'Brechas', icono: <TrendingUp className="w-4 h-4" /> },
  { tipo: 'top_brechas',             label: 'Top brechas',              descripcion: 'Preguntas o areas con los puntajes mas bajos.',                    categoria: 'Brechas', icono: <AlertTriangle className="w-4 h-4" /> },
  { tipo: 'activacion_planes',       label: 'Activacion de planes',     descripcion: 'Cuantos participantes activaron plan de mejora (puntaje bajo umbral).', categoria: 'Brechas', icono: <AlertTriangle className="w-4 h-4" /> },
  // Comparativas
  { tipo: 'comparativa_equipos',     label: 'Por equipo / area',        descripcion: 'Resultados comparados entre equipos o areas.',                     categoria: 'Comparativas', icono: <BarChart3 className="w-4 h-4" /> },
  { tipo: 'por_lider',               label: 'Por lider',                descripcion: 'Resultados agrupados por lider evaluador.',                        categoria: 'Comparativas', icono: <BarChart3 className="w-4 h-4" /> },
  { tipo: 'por_area',                label: 'Por area',                 descripcion: 'Resultados agrupados por area organizacional.',                    categoria: 'Comparativas', icono: <BarChart3 className="w-4 h-4" /> },
  { tipo: 'por_vp',                  label: 'Por vicepresidencia',      descripcion: 'Resultados agrupados por VP.',                                     categoria: 'Comparativas', icono: <BarChart3 className="w-4 h-4" /> },
  { tipo: 'comparativa_lanzamientos',label: 'Evolucion en el tiempo',   descripcion: 'Compara resultados entre distintos lanzamientos de esta encuesta.', categoria: 'Comparativas', icono: <TrendingUp className="w-4 h-4" /> },
  // Participacion
  { tipo: 'tasa_respuesta',          label: 'Tasa de respuesta',        descripcion: 'Porcentaje de participantes que completaron la encuesta.',         categoria: 'Participacion', icono: <Percent className="w-4 h-4" /> },
  { tipo: 'segmento_personalizado',  label: 'Segmento personalizado',   descripcion: 'Agrupa resultados segun una etiqueta que defines tu.',             categoria: 'Participacion', icono: <Tag className="w-4 h-4" /> },
]

const categorias = ['Resultados', 'Brechas', 'Comparativas', 'Participacion']

// Metricas activas por defecto
const METRICAS_DEFAULT: ConfigMetrica[] = [
  { id: 'm1', tipo: 'promedio_general',  nombre: 'Promedio general',  activa: true, opciones: { umbralPlanMejora: 60 } },
  { id: 'm2', tipo: 'promedio_pilar',    nombre: 'Por pilar',         activa: true },
  { id: 'm3', tipo: 'tasa_respuesta',    nombre: 'Tasa de respuesta', activa: true },
  { id: 'm4', tipo: 'activacion_planes', nombre: 'Planes activados',  activa: true, opciones: { umbralPlanMejora: 60 } },
]

// ─── Props ───────────────────────────────────────────────────────────────────

interface EncuestaEditorProps {
  encuesta: Encuesta | null
  tipoNueva: TipoEncuesta | null
  onBack: () => void
  onSave: (encuesta: Encuesta) => void
}

// ─── Editor principal ─────────────────────────────────────────────────────────

export function EncuestaEditor({ encuesta, tipoNueva, onBack, onSave }: EncuestaEditorProps) {
  const { talentos } = useForgeStore()

  // Paso activo del editor
  const [paso, setPaso] = useState<'config' | 'preguntas' | 'metricas' | 'preview'>('config')

  // Form state
  const [nombre, setNombre] = useState(encuesta?.nombre || '')
  const [descripcion, setDescripcion] = useState(encuesta?.descripcion || '')
  const [tipo, setTipo] = useState<TipoEncuesta>(encuesta?.tipo || tipoNueva || 'lider_colaborador')
  const [preguntas, setPreguntas] = useState<PreguntaEncuesta[]>(encuesta?.preguntas || [])
  const [esPlantilla, setEsPlantilla] = useState(encuesta?.esPlantilla || false)
  const [aplicaAreas, setAplicaAreas] = useState<string[]>(encuesta?.aplicaAreas || [])
  const [aplicaEquipos, setAplicaEquipos] = useState<string[]>(encuesta?.aplicaEquipos || [])

  // Metricas configurables
  const [metricas, setMetricas] = useState<ConfigMetrica[]>(METRICAS_DEFAULT)

  const [expandedPregunta, setExpandedPregunta] = useState<string | null>(null)

  const areas = useMemo(() => [...new Set(talentos.map(t => t.area))], [talentos])
  const equipos = useMemo(() => [...new Set(talentos.map(t => t.equipo))], [talentos])
  const pesoTotal = useMemo(() => preguntas.reduce((s, p) => s + p.pesoPregunta, 0), [preguntas])

  // Handlers preguntas
  const addPregunta = () => {
    const p: PreguntaEncuesta = {
      id: `preg-${Date.now()}`,
      pilar: 'saber_hacer',
      texto: '',
      tipoPregunta: 'escala_5',
      pesoPregunta: 10,
      escalaCalificacion: [
        { valor: 5, porcentaje: 10 }, { valor: 4, porcentaje: 8 },
        { valor: 3, porcentaje: 6 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 },
      ],
      requerida: true,
      orden: preguntas.length + 1,
    }
    setPreguntas([...preguntas, p])
    setExpandedPregunta(p.id)
  }

  const updatePregunta = (id: string, updates: Partial<PreguntaEncuesta>) =>
    setPreguntas(preguntas.map(p => p.id === id ? { ...p, ...updates } : p))

  const deletePregunta = (id: string) =>
    setPreguntas(preguntas.filter(p => p.id !== id).map((p, i) => ({ ...p, orden: i + 1 })))

  const movePregunta = (id: string, dir: 'up' | 'down') => {
    const idx = preguntas.findIndex(p => p.id === id)
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === preguntas.length - 1)) return
    const arr = [...preguntas]
    const ti = dir === 'up' ? idx - 1 : idx + 1;
    [arr[idx], arr[ti]] = [arr[ti], arr[idx]]
    setPreguntas(arr.map((p, i) => ({ ...p, orden: i + 1 })))
  }

  // Handlers metricas
  const toggleMetrica = (tipo: TipoMetrica) => {
    const existe = metricas.find(m => m.tipo === tipo)
    if (existe) {
      setMetricas(metricas.map(m => m.tipo === tipo ? { ...m, activa: !m.activa } : m))
    } else {
      const def = METRICAS_DISPONIBLES.find(m => m.tipo === tipo)!
      setMetricas([...metricas, {
        id: `m-${Date.now()}`,
        tipo,
        nombre: def.label,
        activa: true,
      }])
    }
  }

  const updateMetricaOpcion = (tipo: TipoMetrica, opciones: ConfigMetrica['opciones']) =>
    setMetricas(metricas.map(m => m.tipo === tipo ? { ...m, opciones: { ...m.opciones, ...opciones } } : m))

  const updateMetricaNombre = (tipo: TipoMetrica, nombre: string) =>
    setMetricas(metricas.map(m => m.tipo === tipo ? { ...m, nombre } : m))

  const isMetricaActiva = (tipo: TipoMetrica) =>
    metricas.find(m => m.tipo === tipo)?.activa ?? false

  const handleSave = (asBorrador = false) => {
    const enc: Encuesta = {
      id: encuesta?.id || `enc-${Date.now()}`,
      nombre, descripcion, tipo,
      version: encuesta?.version || '1.0',
      estado: asBorrador ? 'borrador' : 'activa',
      preguntas, esPlantilla,
      aplicaAreas: aplicaAreas.length > 0 ? aplicaAreas : undefined,
      aplicaEquipos: aplicaEquipos.length > 0 ? aplicaEquipos : undefined,
      createdAt: encuesta?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: encuesta?.createdBy || 'Usuario actual',
    }
    onSave(enc)
  }

  const pasos = [
    { id: 'config', label: 'Configuracion', done: !!nombre },
    { id: 'preguntas', label: 'Preguntas', done: preguntas.length > 0 && pesoTotal === 100 },
    { id: 'metricas', label: 'Metricas', done: metricas.filter(m => m.activa).length > 0 },
    { id: 'preview', label: 'Vista previa', done: false },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />Volver
          </Button>
          <div>
            <h1 className="text-xl font-bold">{encuesta ? 'Editar encuesta' : 'Nueva encuesta'}</h1>
            <p className="text-sm text-muted-foreground">{tipoEncuestaLabels[tipo]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <VoiceAIAssistant
            mode="full"
            context={{ tipo, nombre, cantidadPreguntas: preguntas.length }}
            onSuggestion={(suggestion) => {
              try {
                const data = JSON.parse(suggestion)
                if (data.preguntas) {
                  setPreguntas(data.preguntas.map((p: any, i: number) => ({
                    id: `ai-${Date.now()}-${i}`,
                    pilar: p.pilar || 'saber_hacer',
                    objetivoEstrategico: p.objetivoEstrategico,
                    texto: p.texto,
                    tipoPregunta: p.tipoPregunta || 'escala_5',
                    pesoPregunta: p.pesoPregunta || 10,
                    escalaCalificacion: [
                      { valor: 5, porcentaje: p.pesoPregunta || 10 },
                      { valor: 4, porcentaje: (p.pesoPregunta || 10) * 0.8 },
                      { valor: 3, porcentaje: (p.pesoPregunta || 10) * 0.6 },
                      { valor: 2, porcentaje: (p.pesoPregunta || 10) * 0.4 },
                      { valor: 1, porcentaje: (p.pesoPregunta || 10) * 0.2 },
                    ],
                    requerida: true,
                    orden: i + 1,
                  })))
                }
              } catch { /* ignore */ }
            }}
          />
          <Button variant="outline" onClick={() => handleSave(true)}>
            <Save className="w-4 h-4 mr-2" />Borrador
          </Button>
          <Button onClick={() => handleSave(false)} className="bg-primary hover:bg-primary/90"
            disabled={!nombre || preguntas.length === 0}>
            <Save className="w-4 h-4 mr-2" />Guardar
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1">
        {pasos.map((p, i) => (
          <div key={p.id} className="flex items-center gap-1 flex-1">
            <button onClick={() => setPaso(p.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 justify-center',
                paso === p.id ? 'bg-primary text-white' :
                p.done ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                'bg-surface-2 text-muted-foreground hover:text-foreground'
              )}>
              {p.done && paso !== p.id
                ? <Check className="w-3.5 h-3.5" />
                : <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-xs">{i + 1}</span>
              }
              {p.label}
            </button>
            {i < pasos.length - 1 && <div className="w-4 h-px bg-border flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* ── PASO 1: CONFIGURACION ── */}
      {paso === 'config' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <ForgeCard className="p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Settings className="w-4 h-4" />Datos generales</h3>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Nombre de la encuesta *</Label>
              <Input value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Evaluacion Lider-Colaborador Q2 2026"
                className="bg-surface-2 border-border" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Descripcion</Label>
              <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                placeholder="Proposito y alcance de la encuesta..."
                rows={3} className="bg-surface-2 border-border resize-none" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Tipo de evaluacion</Label>
              <Select value={tipo} onValueChange={v => setTipo(v as TipoEncuesta)}>
                <SelectTrigger className="bg-surface-2 border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoEncuestaLabels).map(([k, v]) =>
                    <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2">
              <div>
                <p className="text-sm font-medium">Guardar como plantilla</p>
                <p className="text-xs text-muted-foreground">Permite reutilizar esta encuesta</p>
              </div>
              <Switch checked={esPlantilla} onCheckedChange={setEsPlantilla} />
            </div>
          </ForgeCard>

          <ForgeCard className="p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" />Publico objetivo</h3>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Area (opcional)</Label>
              <Select value={aplicaAreas[0] || ''} onValueChange={v => setAplicaAreas(v ? [v] : [])}>
                <SelectTrigger className="bg-surface-2 border-border"><SelectValue placeholder="Todas las areas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las areas</SelectItem>
                  {areas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Equipo (opcional)</Label>
              <Select value={aplicaEquipos[0] || ''} onValueChange={v => setAplicaEquipos(v ? [v] : [])}>
                <SelectTrigger className="bg-surface-2 border-border"><SelectValue placeholder="Todos los equipos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los equipos</SelectItem>
                  {equipos.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Estructura de pesos por pilar</p>
              <div className="space-y-1.5">
                {[
                  { pilar: 'Ser', pct: '20%', color: 'bg-purple-500' },
                  { pilar: 'Saber y Hacer', pct: '40%', color: 'bg-blue-500' },
                  { pilar: 'Especifico del area', pct: '40%', color: 'bg-emerald-500' },
                ].map(({ pilar, pct, color }) => (
                  <div key={pilar} className="flex items-center gap-2 text-sm">
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0', color)} />
                    <span className="flex-1 text-muted-foreground">{pilar}</span>
                    <span className="font-medium">{pct}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/60 mt-2">
                Ajusta los pesos al asignar las preguntas en el paso siguiente.
              </p>
            </div>
          </ForgeCard>

          <div className="lg:col-span-2 flex justify-end">
            <Button className="bg-primary hover:bg-primary/90" onClick={() => setPaso('preguntas')} disabled={!nombre}>
              Continuar a preguntas →
            </Button>
          </div>
        </div>
      )}

      {/* ── PASO 2: PREGUNTAS ── */}
      {paso === 'preguntas' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Resumen lateral */}
          <div className="lg:col-span-1 space-y-4">
            <ForgeCard className="p-4">
              <h3 className="font-semibold mb-3">Resumen de pesos</h3>
              <div className="space-y-2 text-sm">
                {(['ser', 'saber_hacer', 'especifico'] as const).map(pilar => {
                  const total = preguntas.filter(p => p.pilar === pilar).reduce((s, p) => s + p.pesoPregunta, 0)
                  const target = pilar === 'ser' ? 20 : 40
                  return (
                    <div key={pilar}>
                      <div className="flex justify-between mb-1">
                        <span className={cn('font-medium text-xs',
                          pilar === 'ser' ? 'text-purple-400' : pilar === 'saber_hacer' ? 'text-blue-400' : 'text-emerald-400')}>
                          {pilar === 'ser' ? 'Ser' : pilar === 'saber_hacer' ? 'Saber y Hacer' : 'Especifico'}
                        </span>
                        <span className={cn('text-xs font-semibold', total === target ? 'text-emerald-400' : total > target ? 'text-red-400' : 'text-amber-400')}>
                          {total}% / {target}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all',
                          total === target ? 'bg-emerald-500' : total > target ? 'bg-red-500' : 'bg-amber-500'
                        )} style={{ width: `${Math.min((total / target) * 100, 100)}%` }} />
                      </div>
                    </div>
                  )
                })}
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Total</span>
                  <span className={cn('font-bold', pesoTotal === 100 ? 'text-emerald-400' : pesoTotal > 100 ? 'text-red-400' : 'text-amber-400')}>
                    {pesoTotal}% / 100%
                  </span>
                </div>
              </div>
              {pesoTotal !== 100 && (
                <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  El peso total debe sumar 100%
                </div>
              )}
            </ForgeCard>

            <ForgeCard className="p-4">
              <p className="text-sm font-medium mb-2">Preguntas: {preguntas.length}</p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {preguntas.map((p, i) => (
                  <button key={p.id} onClick={() => setExpandedPregunta(p.id)}
                    className={cn('w-full text-left text-xs p-2 rounded-lg transition-all',
                      expandedPregunta === p.id ? 'bg-primary/20 text-primary' : 'bg-surface-2 text-muted-foreground hover:text-foreground')}>
                    <span className="font-semibold mr-1">{i + 1}.</span>
                    {p.texto ? p.texto.substring(0, 50) + (p.texto.length > 50 ? '…' : '') : 'Sin texto'}
                  </button>
                ))}
              </div>
            </ForgeCard>
          </div>

          {/* Lista de preguntas */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Preguntas ({preguntas.length})</h3>
              <Button onClick={addPregunta} size="sm"><Plus className="w-4 h-4 mr-2" />Agregar pregunta</Button>
            </div>
            {preguntas.length === 0 ? (
              <ForgeCard className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Agrega la primera pregunta para comenzar.</p>
                <Button onClick={addPregunta}><Plus className="w-4 h-4 mr-2" />Agregar pregunta</Button>
              </ForgeCard>
            ) : (
              preguntas.map((p, idx) => (
                <PreguntaEditor
                  key={p.id} pregunta={p} index={idx}
                  isExpanded={expandedPregunta === p.id}
                  onToggleExpand={() => setExpandedPregunta(expandedPregunta === p.id ? null : p.id)}
                  onUpdate={u => updatePregunta(p.id, u)}
                  onDelete={() => deletePregunta(p.id)}
                  onMoveUp={() => movePregunta(p.id, 'up')}
                  onMoveDown={() => movePregunta(p.id, 'down')}
                  onDuplicate={() => {
                    const np = { ...p, id: `preg-${Date.now()}`, orden: preguntas.length + 1 }
                    setPreguntas([...preguntas, np])
                    setExpandedPregunta(np.id)
                  }}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < preguntas.length - 1}
                />
              ))
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPaso('config')}>← Anterior</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => setPaso('metricas')}>
                Continuar a metricas →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PASO 3: METRICAS ── */}
      {paso === 'metricas' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Selecciona las metricas que quieres ver en los resultados</p>
              <p className="text-xs text-muted-foreground mt-1">
                Puedes activar o desactivar cualquier metrica sin tocar el desarrollo. Los resultados se calculan automaticamente
                segun las respuestas recibidas y la configuracion que definas aqui.
              </p>
            </div>
          </div>

          {categorias.map(cat => {
            const items = METRICAS_DISPONIBLES.filter(m => m.categoria === cat)
            return (
              <ForgeCard key={cat} className="p-5">
                <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">{cat}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {items.map(item => {
                    const activa = isMetricaActiva(item.tipo)
                    const config = metricas.find(m => m.tipo === item.tipo)
                    return (
                      <div key={item.tipo}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all cursor-pointer',
                          activa
                            ? 'border-primary/60 bg-primary/8'
                            : 'border-border bg-surface-2 hover:border-border/80'
                        )}
                        onClick={() => toggleMetrica(item.tipo)}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center',
                              activa ? 'bg-primary/20 text-primary' : 'bg-surface-3 text-muted-foreground')}>
                              {item.icono}
                            </div>
                            <span className="font-medium text-sm">{item.label}</span>
                          </div>
                          <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                            activa ? 'bg-primary border-primary' : 'border-border')}>
                            {activa && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.descripcion}</p>

                        {/* Opciones extra si esta activa */}
                        {activa && (item.tipo === 'promedio_general' || item.tipo === 'activacion_planes') && (
                          <div className="mt-3 pt-3 border-t border-border/50" onClick={e => e.stopPropagation()}>
                            <Label className="text-[11px] text-muted-foreground mb-1 block">
                              Umbral para activar plan de mejora (%)
                            </Label>
                            <Input
                              type="number" min={0} max={100}
                              value={config?.opciones?.umbralPlanMejora ?? 60}
                              onChange={e => updateMetricaOpcion(item.tipo, { umbralPlanMejora: parseInt(e.target.value) || 60 })}
                              className="bg-surface-3 border-border h-8 text-sm"
                            />
                          </div>
                        )}

                        {activa && item.tipo === 'top_fortalezas' && (
                          <div className="mt-3 pt-3 border-t border-border/50" onClick={e => e.stopPropagation()}>
                            <Label className="text-[11px] text-muted-foreground mb-1 block">Mostrar top N</Label>
                            <Input type="number" min={1} max={10}
                              value={config?.opciones?.topN ?? 3}
                              onChange={e => updateMetricaOpcion(item.tipo, { topN: parseInt(e.target.value) || 3 })}
                              className="bg-surface-3 border-border h-8 text-sm" />
                          </div>
                        )}

                        {activa && item.tipo === 'top_brechas' && (
                          <div className="mt-3 pt-3 border-t border-border/50" onClick={e => e.stopPropagation()}>
                            <Label className="text-[11px] text-muted-foreground mb-1 block">Mostrar top N brechas</Label>
                            <Input type="number" min={1} max={10}
                              value={config?.opciones?.topN ?? 3}
                              onChange={e => updateMetricaOpcion(item.tipo, { topN: parseInt(e.target.value) || 3 })}
                              className="bg-surface-3 border-border h-8 text-sm" />
                          </div>
                        )}

                        {activa && item.tipo === 'segmento_personalizado' && (
                          <div className="mt-3 pt-3 border-t border-border/50" onClick={e => e.stopPropagation()}>
                            <Label className="text-[11px] text-muted-foreground mb-1 block">Nombre del segmento</Label>
                            <Input
                              placeholder="Ej: Antiguedad, Region, Nivel"
                              value={config?.opciones?.segmentoEtiqueta ?? ''}
                              onChange={e => updateMetricaOpcion(item.tipo, { segmentoEtiqueta: e.target.value })}
                              className="bg-surface-3 border-border h-8 text-sm" />
                          </div>
                        )}

                        {activa && (
                          <div className="mt-3 pt-3 border-t border-border/50" onClick={e => e.stopPropagation()}>
                            <Label className="text-[11px] text-muted-foreground mb-1 block">Nombre visible en dashboard</Label>
                            <Input
                              value={config?.nombre ?? item.label}
                              onChange={e => updateMetricaNombre(item.tipo, e.target.value)}
                              className="bg-surface-3 border-border h-8 text-sm" />
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
            <div>
              <p className="text-sm font-medium">{metricas.filter(m => m.activa).length} metricas activas</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Se calcularan automaticamente al cerrar cada lanzamiento.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPaso('preguntas')}>← Anterior</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => setPaso('preview')}>
                Ver vista previa →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PASO 4: PREVIEW ── */}
      {paso === 'preview' && (
        <div className="space-y-4">
          <ForgeCard className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">{nombre || 'Sin nombre'}</h2>
                <p className="text-sm text-muted-foreground">{tipoEncuestaLabels[tipo]}</p>
                {descripcion && <p className="text-sm mt-1">{descripcion}</p>}
              </div>
              <div className="flex gap-2">
                {esPlantilla && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">Plantilla</span>}
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Activa</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-surface-2 text-center">
                <div className="text-xl font-bold text-primary">{preguntas.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Preguntas</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-2 text-center">
                <div className={cn('text-xl font-bold', pesoTotal === 100 ? 'text-emerald-400' : 'text-amber-400')}>{pesoTotal}%</div>
                <div className="text-xs text-muted-foreground mt-1">Peso total</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-2 text-center">
                <div className="text-xl font-bold text-purple-400">{metricas.filter(m => m.activa).length}</div>
                <div className="text-xs text-muted-foreground mt-1">Metricas activas</div>
              </div>
            </div>
          </ForgeCard>

          {/* Metricas activas */}
          <ForgeCard className="p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4" />Metricas configuradas</h3>
            <div className="flex flex-wrap gap-2">
              {metricas.filter(m => m.activa).map(m => (
                <span key={m.id} className="text-xs px-3 py-1.5 rounded-lg bg-primary/15 text-primary border border-primary/30">
                  {m.nombre}
                  {m.opciones?.umbralPlanMejora !== undefined && ` (umbral: ${m.opciones.umbralPlanMejora}%)`}
                  {m.opciones?.topN !== undefined && ` (top ${m.opciones.topN})`}
                </span>
              ))}
            </div>
          </ForgeCard>

          {/* Preguntas preview */}
          <ForgeCard className="p-5">
            <h3 className="font-semibold mb-3">Preguntas</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {preguntas.map((p, i) => (
                <div key={p.id} className={cn('p-3 rounded-lg border-l-4',
                  p.pilar === 'ser' ? 'bg-purple-500/8 border-l-purple-500/60' :
                  p.pilar === 'saber_hacer' ? 'bg-blue-500/8 border-l-blue-500/60' :
                  'bg-emerald-500/8 border-l-emerald-500/60')}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded',
                      p.pilar === 'ser' ? 'bg-purple-500/20 text-purple-300' :
                      p.pilar === 'saber_hacer' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-emerald-500/20 text-emerald-300')}>
                      {p.pilar === 'ser' ? 'Ser' : p.pilar === 'saber_hacer' ? 'Saber y Hacer' : 'Especifico'}
                    </span>
                    <span className="text-xs text-muted-foreground">{tipoPreguntaLabels[p.tipoPregunta]}</span>
                    <span className="text-xs text-muted-foreground ml-auto">Peso: {p.pesoPregunta}%</span>
                  </div>
                  <p className="text-sm">{i + 1}. {p.texto || <em className="text-muted-foreground">Sin texto</em>}</p>
                </div>
              ))}
            </div>
          </ForgeCard>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPaso('metricas')}>← Anterior</Button>
            <Button variant="outline" onClick={() => handleSave(true)}>Guardar borrador</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => handleSave(false)}
              disabled={!nombre || preguntas.length === 0 || pesoTotal !== 100}>
              <Save className="w-4 h-4 mr-2" />Crear encuesta
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Editor de pregunta individual ───────────────────────────────────────────

function PreguntaEditor({ pregunta, index, isExpanded, onToggleExpand, onUpdate, onDelete, onMoveUp, onMoveDown, onDuplicate, canMoveUp, canMoveDown }: {
  pregunta: PreguntaEncuesta; index: number; isExpanded: boolean
  onToggleExpand: () => void; onUpdate: (u: Partial<PreguntaEncuesta>) => void
  onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void
  onDuplicate: () => void; canMoveUp: boolean; canMoveDown: boolean
}) {
  const pilarColors = {
    ser: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    saber_hacer: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    especifico: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  }

  return (
    <ForgeCard className={cn('p-4 transition-all', isExpanded && 'ring-1 ring-primary/50')}>
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1">
          <button className="p-1 text-muted-foreground cursor-grab"><GripVertical className="w-4 h-4" /></button>
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between cursor-pointer" onClick={onToggleExpand}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge className={cn('text-[10px]', pilarColors[pregunta.pilar])}>
                  {pregunta.pilar === 'ser' ? 'Ser' : pregunta.pilar === 'saber_hacer' ? 'Saber y Hacer' : 'Especifico'}
                </Badge>
                <Badge className="text-[10px] bg-surface-2 border border-border">{tipoPreguntaLabels[pregunta.tipoPregunta]}</Badge>
                <span className="text-xs text-muted-foreground">Peso: {pregunta.pesoPregunta}%</span>
              </div>
              <p className={cn('text-sm', pregunta.texto ? 'text-foreground' : 'text-muted-foreground italic')}>
                {pregunta.texto || 'Escribe el texto de la pregunta...'}
              </p>
              {pregunta.objetivoEstrategico && <p className="text-xs text-muted-foreground mt-1">Objetivo: {pregunta.objetivoEstrategico}</p>}
            </div>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              {canMoveUp && <button onClick={e => { e.stopPropagation(); onMoveUp() }} className="p-1 rounded hover:bg-surface-2 text-muted-foreground"><ChevronUp className="w-4 h-4" /></button>}
              {canMoveDown && <button onClick={e => { e.stopPropagation(); onMoveDown() }} className="p-1 rounded hover:bg-surface-2 text-muted-foreground"><ChevronDown className="w-4 h-4" /></button>}
              <button onClick={e => { e.stopPropagation(); onDuplicate() }} className="p-1 rounded hover:bg-surface-2 text-muted-foreground"><Copy className="w-4 h-4" /></button>
              <button onClick={e => { e.stopPropagation(); onDelete() }} className="p-1 rounded hover:bg-red-500/20 text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-border space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Pilar</Label>
                  <Select value={pregunta.pilar} onValueChange={v => onUpdate({ pilar: v as any })}>
                    <SelectTrigger className="bg-surface-2 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ser">Ser (Cultura)</SelectItem>
                      <SelectItem value="saber_hacer">Saber y Hacer</SelectItem>
                      <SelectItem value="especifico">Especifico del area</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Tipo de pregunta</Label>
                  <Select value={pregunta.tipoPregunta} onValueChange={v => onUpdate({ tipoPregunta: v as TipoPregunta })}>
                    <SelectTrigger className="bg-surface-2 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(tipoPreguntaLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Objetivo estrategico (opcional)</Label>
                <Input value={pregunta.objetivoEstrategico || ''} onChange={e => onUpdate({ objetivoEstrategico: e.target.value })}
                  placeholder="Ej: Transformacion de procesos y sostenibilidad financiera" className="bg-surface-2 border-border" />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Texto de la pregunta *</Label>
                <Textarea value={pregunta.texto} onChange={e => onUpdate({ texto: e.target.value })}
                  placeholder="Escribe la pregunta de evaluacion..." rows={3} className="bg-surface-2 border-border resize-none" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Peso de la pregunta (%)</Label>
                  <Input type="number" min={0} max={100} step={0.5} value={pregunta.pesoPregunta}
                    onChange={e => onUpdate({ pesoPregunta: parseFloat(e.target.value) || 0 })}
                    className="bg-surface-2 border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Total pilar (%)</Label>
                  <Input type="number" min={0} max={100} step={1} value={pregunta.totalPilar || ''}
                    onChange={e => onUpdate({ totalPilar: parseFloat(e.target.value) || undefined })}
                    placeholder="Ej: 20 o 40" className="bg-surface-2 border-border" />
                </div>
              </div>

              {(pregunta.tipoPregunta === 'escala_5' || pregunta.tipoPregunta === 'escala_likert') && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Escala de calificacion</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[5, 4, 3, 2, 1].map(valor => {
                      const esc = pregunta.escalaCalificacion?.find(e => e.valor === valor)
                      return (
                        <div key={valor} className="text-center">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center mx-auto mb-1 font-medium">{valor}</div>
                          <Input type="number" min={0} max={100} step={0.1} value={esc?.porcentaje || ''}
                            onChange={e => {
                              const arr = [...(pregunta.escalaCalificacion || [])]
                              const idx = arr.findIndex(x => x.valor === valor)
                              if (idx >= 0) arr[idx] = { valor, porcentaje: parseFloat(e.target.value) || 0 }
                              else arr.push({ valor, porcentaje: parseFloat(e.target.value) || 0 })
                              onUpdate({ escalaCalificacion: arr.sort((a, b) => b.valor - a.valor) })
                            }}
                            placeholder="%" className="bg-surface-2 border-border text-center text-xs h-8" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {(pregunta.tipoPregunta === 'seleccion_unica' || pregunta.tipoPregunta === 'seleccion_multiple') && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Opciones de respuesta</Label>
                  <div className="space-y-2">
                    {(pregunta.opciones || []).map((op, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input value={op}
                          onChange={e => { const arr = [...(pregunta.opciones || [])]; arr[i] = e.target.value; onUpdate({ opciones: arr }) }}
                          placeholder={`Opcion ${i + 1}`} className="bg-surface-2 border-border" />
                        <button onClick={() => onUpdate({ opciones: (pregunta.opciones || []).filter((_, j) => j !== i) })}
                          className="p-2 rounded hover:bg-red-500/20 text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => onUpdate({ opciones: [...(pregunta.opciones || []), ''] })}>
                      <Plus className="w-4 h-4 mr-2" />Agregar opcion
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2">
                <div>
                  <p className="text-sm font-medium">Pregunta requerida</p>
                  <p className="text-xs text-muted-foreground">El participante debe responder esta pregunta</p>
                </div>
                <Switch checked={pregunta.requerida} onCheckedChange={v => onUpdate({ requerida: v })} />
              </div>
            </div>
          )}
        </div>
      </div>
    </ForgeCard>
  )
}
