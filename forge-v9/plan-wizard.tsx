'use client'

import { useState, useMemo, useEffect } from 'react'
import { useForgeStore, type PlanType, type Criticidad, type EjePrincipal, type Actividad, type Plan, ejeLabels, ejeColors, type ActividadEstado } from '@/lib/store'
import { ForgeCard, ForgeCardHeader, PageHeader, ProgressBar, ForgeBadge } from '@/components/forge/forge-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, Sparkles, 
  CheckCircle2, AlertTriangle, Target, User, Lightbulb, Send,
  Building, Calendar, FileText, GraduationCap, X, Save, Wand2
} from 'lucide-react'
import { VoiceAIAssistant } from './voice-ai-assistant'

interface PlanWizardProps {
  tipo: PlanType
  planToEdit?: Plan | null
  onCancel: () => void
  onComplete: () => void
}

export function PlanWizard({ tipo, planToEdit, onCancel, onComplete }: PlanWizardProps) {
  const { talentos, lideres, addPlan, updatePlan, addNotification } = useForgeStore()
  const isEditing = !!planToEdit
  
  // Form state - basado en el formato Excel
  const [formData, setFormData] = useState({
    // SECCION 1: Datos iniciales del plan
    talentoId: planToEdit?.talentoId || '',
    responsableAdicional: planToEdit?.responsableAdicional || '',
    fechaInicio: planToEdit?.fechaInicio || new Date().toISOString().split('T')[0],
    fechaFin: planToEdit?.fechaFinInicial || '',
    version: planToEdit?.version || '1.0',
    
    // Ejes - multiseleccion
    ejes: planToEdit?.ejes || [] as EjePrincipal[],
    criticidad: planToEdit?.criticidad || 'media' as Criticidad,
    
    // SECCION 2: Hallazgos y acuerdos (DRF v1.1 — metaTrazada y beneficioEsperado eliminados)
    hallazgos: planToEdit?.hallazgos || '',
    reglasAcuerdos: planToEdit?.reglasAcuerdos || '',
    criterioCierre: planToEdit?.criterioCierre || '',
    
    // SECCION 3: Actividades simplificadas (DRF v1.1)
    actividades: planToEdit?.actividades || [] as Partial<Actividad>[],
  })
  
  const selectedTalento = talentos.find(t => t.id === formData.talentoId)
  const selectedLider = selectedTalento ? lideres.find(l => l.id === selectedTalento.liderId) : null
  
  // Cargar info del talento al seleccionarlo
  useEffect(() => {
    if (selectedTalento && !isEditing) {
      // Aqui se cargaria la info del directorio activo
      console.log('[v0] Talento seleccionado:', selectedTalento.nombre)
    }
  }, [selectedTalento, isEditing])
  
  // Toggle eje
  const toggleEje = (eje: EjePrincipal) => {
    setFormData(prev => ({
      ...prev,
      ejes: prev.ejes.includes(eje) 
        ? prev.ejes.filter(e => e !== eje)
        : [...prev.ejes, eje]
    }))
  }
  
  // Validacion
  const isValid = useMemo(() => {
    return formData.talentoId && 
           formData.fechaInicio && 
           formData.fechaFin && 
           formData.ejes.length > 0 && 
           formData.hallazgos &&
           formData.criterioCierre &&
           formData.actividades.length > 0
  }, [formData])
  
  const handleAddActividad = () => {
    setFormData(prev => ({
      ...prev,
      actividades: [...prev.actividades, {
        id: `new-${Date.now()}`,
        eje: prev.ejes[0] || 'hacer',
        // Campos simplificados DRF v1.1
        hallazgoAsociado: '',
        compromiso: '',
        fechaCompromiso: formData.fechaFin,
        evidenciaEsperada: '',
        estado: 'pendiente' as ActividadEstado,
        comentarios: [],
        novedades: [],
        seguimientos: [],
      }]
    }))
  }
  
  const handleRemoveActividad = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actividades: prev.actividades.filter((_, i) => i !== index)
    }))
  }
  
  const handleUpdateActividad = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      actividades: prev.actividades.map((a, i) => i === index ? { ...a, [field]: value } : a)
    }))
  }
  
  const handleSave = (asBorrador: boolean = false) => {
    if (!selectedTalento || !selectedLider) return
    
    const planData: Plan = {
      id: planToEdit?.id || `p${Date.now()}`,
      tipo,
      subtipo: formData.subtipoPlan === 'por_desempeno' ? (tipo==='mejora'?'Por desempeño':'Por desempeño destacado') : formData.subtipoPlan === 'por_prorroga' ? 'Por prórroga de contrato' : formData.subtipoPlan === 'por_ascenso' ? 'Por ascenso' : formData.subtipoPlanOtro || (tipo === 'mejora' ? 'Plan de mejora' : 'Plan de desarrollo'),
      subtipoPlan: planToEdit?.subtipoPlan || '',
      subtipoPlanOtro: planToEdit?.subtipoPlanOtro || '',
      origen: 'Manual',
      talentoId: formData.talentoId,
      talento: selectedTalento,
      liderId: selectedLider.id,
      lider: selectedLider,
      responsableAdicional: formData.responsableAdicional,
      fechaInicio: formData.fechaInicio,
      fechaFinInicial: formData.fechaFin,
      estado: asBorrador ? 'borrador' : 'activo',
      version: formData.version,
      criticidad: formData.criticidad,
      ejePrincipal: formData.ejes[0] || 'hacer',
      ejes: formData.ejes,
      avance: planToEdit?.avance || 0,
      hallazgos: formData.hallazgos,
      reglasAcuerdos: formData.reglasAcuerdos,
      criterioCierre: formData.criterioCierre,
      // DRF v1.1 — metaTrazada, beneficioEsperado y solicitudForPlus eliminados del wizard
      adjuntosIniciales: planToEdit?.adjuntosIniciales || [],
      actividades: formData.actividades as Actividad[],
      seguimientos: planToEdit?.seguimientos || [],
      comentariosTalento: planToEdit?.comentariosTalento || [],
      historial: [
        ...(planToEdit?.historial || []),
        {
          id: `h${Date.now()}`,
          fecha: new Date().toISOString().split('T')[0],
          accion: isEditing ? 'Plan editado' : 'Plan creado',
          autor: selectedLider.nombre,
          detalles: `Plan de ${tipo} ${isEditing ? 'editado' : 'creado'} con ${formData.ejes.length} eje(s): ${formData.ejes.map(e => ejeLabels[e]).join(', ')}.`,
        }
      ],
      ampliaciones: planToEdit?.ampliaciones || [],
      createdAt: planToEdit?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: planToEdit?.createdBy || selectedLider.nombre,
    }
    
    if (isEditing) {
      updatePlan(planToEdit.id, planData)
    } else {
      addPlan(planData)
      if (!asBorrador) {
        addNotification({
          id: `n${Date.now()}`,
          tipo: 'plan_creado',
          titulo: 'Nuevo plan asignado',
          mensaje: `Se te ha asignado un plan de ${tipo}`,
          fecha: new Date().toISOString().split('T')[0],
          leida: false,
          rol: 'talento',
          planId: planData.id,
          talentoId: formData.talentoId,
        })
      }
    }
    
    onComplete()
  }
  
  return (
    <div className="pb-8">
      {/* Header fijo */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {isEditing ? 'Editar' : 'Crear'} plan de {tipo}
            </h1>
            <p className="text-sm text-muted-foreground">
              Seguimiento plan de {tipo === 'mejora' ? 'Mejoramiento' : 'Desarrollo'}
            </p>
          </div>
        </div>
          <div className="flex items-center gap-2">
            <VoiceAIAssistant
              mode="full"
              context={{
                tipoplan: tipo === 'mejora' ? 'Plan de mejora' : 'Plan de desarrollo',
                talento: selectedTalento?.nombre,
                ejes: formData.ejes,
              }}
              onSuggestion={(suggestion) => {
                try {
                  const data = JSON.parse(suggestion)
                  setFormData(prev => ({
                    ...prev,
                    hallazgos: data.hallazgos || prev.hallazgos,
                    reglasAcuerdos: data.reglasAcuerdos || prev.reglasAcuerdos,
                    beneficioEsperado: data.beneficioEsperado || prev.beneficioEsperado,
                    metaTrazada: data.metaTrazada || prev.metaTrazada,
                    criterioCierre: data.criterioCierre || prev.criterioCierre,
                    ejes: data.ejesSugeridos?.length ? data.ejesSugeridos : prev.ejes,
                    actividades: data.actividadesSugeridas?.length 
                      ? data.actividadesSugeridas.map((a: any, i: number) => ({
                          id: `ai-${Date.now()}-${i}`,
                          eje: a.eje || 'hacer',
                          tema: a.tema || '',
                          hallazgoAsociado: '',
                          objetivoEspecifico: a.objetivo || '',
                          compromiso: a.actividad || '',
                          responsable: selectedTalento?.nombre || '',
                          fechaInicio: formData.fechaInicio,
                          fechaCompromiso: formData.fechaFin,
                          indicador: a.indicador || '',
                          evidenciaEsperada: a.evidencia || '',
                          estado: 'pendiente' as ActividadEstado,
                          comentarios: [],
                          novedades: [],
                          seguimientos: [],
                        }))
                      : prev.actividades,
                  }))
                } catch {
                  // Si no es JSON, usar como texto plano
                  setFormData(prev => ({ ...prev, hallazgos: suggestion }))
                }
              }}
            />
            <Button variant="outline" onClick={() => handleSave(true)} disabled={!formData.talentoId}>
              <Save className="w-4 h-4 mr-2" />
              Guardar borrador
            </Button>
          <Button onClick={() => handleSave(false)} disabled={!isValid}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {isEditing ? 'Guardar cambios' : 'Crear plan'}
          </Button>
        </div>
      </div>

      {/* Formulario - Layout tipo tabla/Excel */}
      <div className="space-y-6">
        
        {/* SECCION 1: Datos iniciales del plan */}
        <ForgeCard>
          <div className="bg-primary/20 px-4 py-2 -mx-4 -mt-4 mb-4 rounded-t-lg">
            <h2 className="font-semibold text-sm">1. Datos iniciales del plan</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Colaborador */}
            <div className="lg:col-span-2">
              <Label className="text-xs text-muted-foreground mb-1 block">Colaborador(a) *</Label>
              <Select value={formData.talentoId} onValueChange={(v) => setFormData(p => ({ ...p, talentoId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar talento..." />
                </SelectTrigger>
                <SelectContent>
                  {talentos.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                          {t.avatar}
                        </span>
                        {t.nombre}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Cargo / rol - Se carga automaticamente */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Cargo / rol</Label>
              <Input value={selectedTalento?.cargo || ''} disabled className="bg-surface-2" />
            </div>
            
            {/* Area / equipo - Se carga automaticamente */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Area / equipo</Label>
              <Input value={selectedTalento?.area || ''} disabled className="bg-surface-2" />
            </div>
            
            {/* SuperExperto responsable */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">SuperExperto responsable</Label>
              <Input value={selectedLider?.nombre || ''} disabled className="bg-surface-2" />
            </div>
            
            {/* Responsable adicional */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Responsable adicional (opcional)</Label>
              <Select value={formData.responsableAdicional} onValueChange={(v) => setFormData(p => ({ ...p, responsableAdicional: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguno</SelectItem>
                  {lideres.map(l => (
                    <SelectItem key={l.id} value={l.nombre}>{l.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Tipo de plan - selector con opciones */}
            <div className="lg:col-span-2">
              <Label className="text-xs text-muted-foreground mb-1 block">Tipo de plan *</Label>
              <Select value={formData.subtipoPlan || ''} onValueChange={(v) => setFormData(p => ({ ...p, subtipoPlan: v, subtipoPlanOtro: v !== 'otro' ? '' : p.subtipoPlanOtro }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el motivo del plan..." />
                </SelectTrigger>
                <SelectContent>
                  {tipo === 'mejora' ? (
                    <>
                      <SelectItem value="por_desempeno">Por desempeño</SelectItem>
                      <SelectItem value="por_prorroga">Por prórroga de contrato</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="por_desempeno">Por desempeño destacado</SelectItem>
                      <SelectItem value="por_ascenso">Por ascenso</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {formData.subtipoPlan === 'otro' && (
                <Input
                  className="mt-2"
                  placeholder="Describe el motivo del plan..."
                  value={formData.subtipoPlanOtro || ''}
                  onChange={e => setFormData(p => ({ ...p, subtipoPlanOtro: e.target.value }))}
                />
              )}
            </div>
            
            {/* Fecha inicio */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Fecha inicio *</Label>
              <Input 
                type="date" 
                value={formData.fechaInicio} 
                onChange={(e) => setFormData(p => ({ ...p, fechaInicio: e.target.value }))}
              />
            </div>
            
            {/* Fecha fin inicial */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Fecha fin inicial *</Label>
              <Input 
                type="date" 
                value={formData.fechaFin} 
                onChange={(e) => setFormData(p => ({ ...p, fechaFin: e.target.value }))}
              />
            </div>
            
            {/* Estado actual - solo lectura */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Estado actual</Label>
              <Input value={isEditing ? (planToEdit?.estado || 'activo') : 'Nuevo'} disabled className="bg-surface-2" />
            </div>
            
            {/* Version */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Version</Label>
              <Input value={formData.version} disabled className="bg-surface-2" />
            </div>
            
            {/* Criticidad */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Criticidad</Label>
              <Select value={formData.criticidad} onValueChange={(v) => setFormData(p => ({ ...p, criticidad: v as Criticidad }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Critica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Eje(s) del plan */}
          <div className="mt-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Eje(s) del plan * (puedes seleccionar varios)</Label>
            <div className="flex flex-wrap gap-2">
              {(['ser', 'saber', 'hacer'] as EjePrincipal[]).map(eje => (
                <button
                  key={eje}
                  type="button"
                  onClick={() => toggleEje(eje)}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium',
                    formData.ejes.includes(eje)
                      ? eje === 'ser' ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : eje === 'saber' ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-surface-2 border-border text-muted-foreground hover:border-primary/50'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {formData.ejes.includes(eje) && <CheckCircle2 className="w-4 h-4" />}
                    {ejeLabels[eje]}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ser = Actitudes, valores | Saber = Conocimientos | Hacer = Resultados, entregas
            </p>
          </div>
        </ForgeCard>

        {/* SECCION 2: Hallazgos, acuerdos y criterio de cierre — DRF v1.1 simplificado */}
        <ForgeCard>
          <div className="bg-primary/20 px-4 py-2 -mx-4 -mt-4 mb-4 rounded-t-lg">
            <h2 className="font-semibold text-sm">2. Hallazgos, acuerdos y criterio de cierre</h2>
          </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs text-muted-foreground">Hallazgos encontrados / motivo(s) para iniciar el plan *</Label>
                  <VoiceAIAssistant
                    mode="field"
                    fieldName="hallazgos"
                    fieldLabel="Hallazgos"
                    context={{ tipoplan: tipo, talento: selectedTalento?.nombre, ejes: formData.ejes }}
                    onSuggestion={(text) => setFormData(p => ({ ...p, hallazgos: text }))}
                  />
                </div>
                <Textarea
                value={formData.hallazgos}
                onChange={(e) => setFormData(p => ({ ...p, hallazgos: e.target.value }))}
                placeholder="Describe los hallazgos o situación que motiva este plan..."
                rows={3}
              />
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Reglas iniciales / acuerdos de seguimiento</Label>
              <Textarea 
                value={formData.reglasAcuerdos}
                onChange={(e) => setFormData(p => ({ ...p, reglasAcuerdos: e.target.value }))}
                placeholder="Define las reglas y acuerdos para el seguimiento del plan..."
                rows={2}
              />
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Criterio de cumplimiento para el cierre del plan *</Label>
              <Textarea 
                value={formData.criterioCierre}
                onChange={(e) => setFormData(p => ({ ...p, criterioCierre: e.target.value }))}
                placeholder="¿Qué debe cumplirse para poder cerrar este plan?"
                rows={2}
              />
            </div>
          </div>
        </ForgeCard>

        {/* SECCION 4: Actividades / temas a intervenir */}
        <ForgeCard>
          <div className="bg-primary/20 px-4 py-2 -mx-4 -mt-4 mb-4 rounded-t-lg flex items-center justify-between">
            <h2 className="font-semibold text-sm">4. Actividades / temas a intervenir</h2>
            <Button size="sm" onClick={handleAddActividad} className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Agregar actividad
            </Button>
          </div>
          
          {formData.actividades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay actividades. Haz clic en "Agregar actividad" para comenzar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.actividades.map((act, idx) => (
                <div key={act.id} className="p-4 rounded-lg bg-surface-2 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <Select 
                        value={act.eje || 'hacer'} 
                        onValueChange={(v) => handleUpdateActividad(idx, 'eje', v)}
                      >
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.ejes.map(eje => (
                            <SelectItem key={eje} value={eje}>{ejeLabels[eje]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveActividad(idx)} className="h-7 w-7 p-0 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Matriz simplificada DRF v1.1: hallazgo, actividad, fecha, evidencia */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <Label className="text-[10px] text-muted-foreground">¿De dónde nace? (hallazgo asociado)</Label>
                      <Input 
                        value={act.hallazgoAsociado || ''} 
                        onChange={(e) => handleUpdateActividad(idx, 'hallazgoAsociado', e.target.value)}
                        placeholder="Ej: Bajo cumplimiento en entregas..."
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-[10px] text-muted-foreground">Actividad / compromiso *</Label>
                      <Input 
                        value={act.compromiso || ''} 
                        onChange={(e) => handleUpdateActividad(idx, 'compromiso', e.target.value)}
                        placeholder="¿Qué va a hacer el talento?..."
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Fecha de cumplimiento *</Label>
                      <Input 
                        type="date"
                        value={act.fechaCompromiso || formData.fechaFin} 
                        onChange={(e) => handleUpdateActividad(idx, 'fechaCompromiso', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Evidencia esperada</Label>
                      <Input 
                        value={act.evidenciaEsperada || ''} 
                        onChange={(e) => handleUpdateActividad(idx, 'evidenciaEsperada', e.target.value)}
                        placeholder="¿Qué documenta el cumplimiento?..."
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Estado</Label>
                      <Select 
                        value={act.estado || 'pendiente'} 
                        onValueChange={(v) => handleUpdateActividad(idx, 'estado', v)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="en_progreso">En progreso</SelectItem>
                          <SelectItem value="cumplido">Cumplido</SelectItem>
                          <SelectItem value="no_cumplido">No cumplido</SelectItem>
                          <SelectItem value="en_riesgo">En riesgo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ForgeCard>

        {/* SECCION 3 (ex-4): Actividades — ya renderizada arriba */}
        {/* Formación For+ eliminada del wizard — DRF v1.1, reunión 11 jun 2026 */}
      </div>
    </div>
  )
}
