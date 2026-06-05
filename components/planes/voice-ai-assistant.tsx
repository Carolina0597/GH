'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { Mic, MicOff, Sparkles, Loader2, AlertTriangle, Volume2, X, Check, Wand2 } from 'lucide-react'

interface VoiceAIAssistantProps {
  onSuggestion: (suggestion: string) => void
  fieldName?: string
  fieldLabel?: string
  context?: {
    tipoplan?: string
    talento?: string
    ejes?: string[]
    hallazgos?: string
    meta?: string
  }
  mode: 'field' | 'full' // field = solo un campo, full = todo el plan
}

// Prompts para generar sugerencias segun el campo
const fieldPrompts: Record<string, string> = {
  hallazgos: `Eres un experto en recursos humanos de Sistecredito. Genera un texto profesional para el campo "Hallazgos encontrados / motivo(s) para iniciar el plan" basandote en lo que el lider describe. El texto debe ser claro, especifico y orientado a hechos observables. Maximo 3 parrafos.`,
  reglasAcuerdos: `Eres un experto en recursos humanos de Sistecredito. Genera reglas iniciales y acuerdos de seguimiento para un plan de mejora/desarrollo. Incluye frecuencia de reuniones, compromisos mutuos y mecanismos de seguimiento. Maximo 5 puntos.`,
  beneficioEsperado: `Eres un experto en recursos humanos de Sistecredito. Genera el beneficio esperado del plan describiendo el impacto positivo para el talento, el equipo y la organizacion. Maximo 2 parrafos.`,
  metaTrazada: `Eres un experto en recursos humanos de Sistecredito. Genera una meta SMART (Especifica, Medible, Alcanzable, Relevante, con Tiempo definido) para el plan de mejora/desarrollo. La meta debe ser clara y verificable.`,
  criterioCierre: `Eres un experto en recursos humanos de Sistecredito. Genera criterios claros y medibles para cerrar exitosamente el plan. Incluye indicadores especificos que demuestren que la meta fue alcanzada.`,
  actividad: `Eres un experto en recursos humanos de Sistecredito. Genera una actividad/compromiso especifico para el plan. Incluye: que se debe hacer, como se medira, y cual es la evidencia esperada.`,
}

const fullPlanPrompt = `Eres un experto en recursos humanos de Sistecredito. Basandote en la descripcion del lider sobre la situacion del talento, genera una propuesta completa de plan de mejora/desarrollo con la siguiente estructura JSON:

{
  "hallazgos": "Descripcion de hallazgos y motivos del plan",
  "reglasAcuerdos": "Reglas iniciales y acuerdos de seguimiento",
  "beneficioEsperado": "Beneficio esperado del plan",
  "metaTrazada": "Meta SMART del plan",
  "criterioCierre": "Criterios para cerrar el plan",
  "ejesSugeridos": ["ser", "saber", "hacer"], // los que apliquen
  "actividadesSugeridas": [
    {
      "tema": "Tema a intervenir",
      "objetivo": "Objetivo especifico",
      "actividad": "Actividad/compromiso",
      "indicador": "Indicador/meta",
      "evidencia": "Evidencia esperada",
      "eje": "ser|saber|hacer"
    }
  ]
}

Responde SOLO con el JSON, sin texto adicional.`

export function VoiceAIAssistant({ 
  onSuggestion, 
  fieldName, 
  fieldLabel,
  context,
  mode 
}: VoiceAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Inicializar Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'es-ES'
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ''
          let interimTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }
          
          setTranscript(prev => prev + finalTranscript + interimTranscript)
        }
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('[v0] Speech recognition error:', event.error)
          setError(`Error de reconocimiento: ${event.error}`)
          setIsListening(false)
        }
        
        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Tu navegador no soporta reconocimiento de voz. Por favor usa Chrome o Edge.')
      return
    }
    
    setError(null)
    setTranscript('')
    setSuggestion('')
    setIsListening(true)
    
    try {
      recognitionRef.current.start()
    } catch (err) {
      console.error('[v0] Error starting recognition:', err)
      setIsListening(false)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [])

  const generateSuggestion = async () => {
    if (!transcript.trim()) {
      setError('Por favor, primero describe la situacion usando el microfono.')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Construir el prompt segun el modo
      let systemPrompt = mode === 'full' 
        ? fullPlanPrompt 
        : fieldPrompts[fieldName || 'hallazgos'] || fieldPrompts.hallazgos
      
      // Agregar contexto si esta disponible
      let contextStr = ''
      if (context) {
        if (context.tipoplan) contextStr += `\nTipo de plan: ${context.tipoplan}`
        if (context.talento) contextStr += `\nTalento: ${context.talento}`
        if (context.ejes?.length) contextStr += `\nEjes: ${context.ejes.join(', ')}`
        if (context.hallazgos) contextStr += `\nHallazgos previos: ${context.hallazgos}`
        if (context.meta) contextStr += `\nMeta: ${context.meta}`
      }
      
      const userMessage = `${contextStr ? 'Contexto:' + contextStr + '\n\n' : ''}Lo que describe el lider:\n"${transcript}"`
      
      // Llamar a la API de AI
      const response = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          userMessage,
          mode
        })
      })
      
      if (!response.ok) {
        throw new Error('Error al generar sugerencia')
      }
      
      const data = await response.json()
      setSuggestion(data.suggestion || data.text || '')
      
    } catch (err) {
      console.error('[v0] Error generating suggestion:', err)
      
      // Fallback: generar sugerencia local simulada
      const simulatedSuggestion = generateLocalSuggestion(transcript, mode, fieldName)
      setSuggestion(simulatedSuggestion)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAccept = () => {
    onSuggestion(suggestion)
    setIsOpen(false)
    setTranscript('')
    setSuggestion('')
  }

  const handleOpen = () => {
    setIsOpen(true)
    setTranscript('')
    setSuggestion('')
    setError(null)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="gap-2 text-primary border-primary/30 hover:bg-primary/10"
      >
        <Wand2 className="w-4 h-4" />
        {mode === 'full' ? 'Generar con IA' : 'Asistente IA'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl bg-surface-1 border-surface-3">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-primary" />
              {mode === 'full' 
                ? 'Generar propuesta de plan con IA' 
                : `Asistente IA para: ${fieldLabel || fieldName}`
              }
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Describe la situacion del talento con tu voz y la IA generara una propuesta.
            </DialogDescription>
          </DialogHeader>

          {/* Nota tecnica */}
          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <AlertDescription className="text-amber-200 text-sm">
              <strong>Nota:</strong> Funcionalidad por revisar con equipo tecnico. 
              La integracion con el modelo de IA esta pendiente de configuracion.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {/* Boton de microfono */}
            <div className="flex flex-col items-center gap-4 py-4">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center transition-all",
                  "border-4",
                  isListening 
                    ? "bg-red-500/20 border-red-500 animate-pulse" 
                    : "bg-primary/10 border-primary/50 hover:border-primary hover:bg-primary/20",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
              >
                {isListening ? (
                  <MicOff className="w-10 h-10 text-red-500" />
                ) : (
                  <Mic className="w-10 h-10 text-primary" />
                )}
              </button>
              <p className="text-sm text-muted-foreground">
                {isListening 
                  ? "Escuchando... Haz clic para detener" 
                  : "Haz clic para comenzar a hablar"
                }
              </p>
            </div>

            {/* Transcripcion */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Lo que describiste:
              </label>
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Tu descripcion aparecera aqui... (tambien puedes escribir directamente)"
                className="min-h-[100px] bg-surface-2 border-surface-3"
              />
            </div>

            {/* Boton generar */}
            <Button
              onClick={generateSuggestion}
              disabled={!transcript.trim() || isProcessing}
              className="w-full gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando propuesta...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generar propuesta con IA
                </>
              )}
            </Button>

            {/* Error */}
            {error && (
              <Alert className="bg-destructive/10 border-destructive/30">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Sugerencia generada */}
            {suggestion && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Propuesta generada:
                </label>
                <div className="bg-surface-2 border border-surface-3 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                    {suggestion}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            {suggestion && (
              <Button onClick={handleAccept} className="gap-2">
                <Check className="w-4 h-4" />
                Usar esta propuesta
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Generador local de sugerencias (fallback cuando no hay API)
function generateLocalSuggestion(transcript: string, mode: 'field' | 'full', fieldName?: string): string {
  const lowerTranscript = transcript.toLowerCase()
  
  if (mode === 'full') {
    // Analizar el transcript para determinar ejes
    const ejesDetectados: string[] = []
    if (lowerTranscript.includes('actitud') || lowerTranscript.includes('comportamiento') || lowerTranscript.includes('comunicacion') || lowerTranscript.includes('trabajo en equipo')) {
      ejesDetectados.push('ser')
    }
    if (lowerTranscript.includes('conocimiento') || lowerTranscript.includes('capacitacion') || lowerTranscript.includes('aprender') || lowerTranscript.includes('tecnico')) {
      ejesDetectados.push('saber')
    }
    if (lowerTranscript.includes('entrega') || lowerTranscript.includes('resultado') || lowerTranscript.includes('cumplimiento') || lowerTranscript.includes('meta')) {
      ejesDetectados.push('hacer')
    }
    if (ejesDetectados.length === 0) ejesDetectados.push('hacer')
    
    return JSON.stringify({
      hallazgos: `Segun lo descrito por el lider: "${transcript.substring(0, 200)}..." Se han identificado oportunidades de mejora que requieren atencion y seguimiento estructurado.`,
      reglasAcuerdos: "1. Reuniones de seguimiento cada 15 dias\n2. El talento debe reportar avances semanalmente\n3. El lider proporcionara retroalimentacion continua\n4. Ambas partes se comprometen a cumplir los acuerdos establecidos\n5. Cualquier cambio en el plan debe ser comunicado y acordado",
      beneficioEsperado: "Se espera que al finalizar el plan, el talento mejore su desempeno en las areas identificadas, fortalezca sus competencias y contribuya de manera mas efectiva al equipo y la organizacion.",
      metaTrazada: "Lograr una mejora del 80% en los indicadores identificados dentro del plazo establecido, evidenciado a traves de las actividades y seguimientos programados.",
      criterioCierre: "1. Cumplimiento del 80% de las actividades programadas\n2. Evidencias documentadas de mejora\n3. Evaluacion positiva del lider\n4. Retroalimentacion favorable del equipo",
      ejesSugeridos: ejesDetectados,
      actividadesSugeridas: [
        {
          tema: "Mejora de competencias clave",
          objetivo: "Desarrollar las habilidades identificadas como oportunidad de mejora",
          actividad: "Participar en sesiones de coaching y aplicar lo aprendido",
          indicador: "Completar 100% de las sesiones programadas",
          evidencia: "Certificados, reportes de avance, retroalimentacion del coach",
          eje: ejesDetectados[0]
        }
      ]
    }, null, 2)
  }
  
  // Sugerencias por campo
  const suggestions: Record<string, string> = {
    hallazgos: `Basado en lo descrito: "${transcript.substring(0, 150)}..."\n\nSe han identificado las siguientes oportunidades de mejora que requieren atencion:\n\n1. Aspectos especificos mencionados que necesitan ser abordados\n2. Impacto observado en el desempeno y/o equipo\n3. Necesidad de establecer un plan estructurado de acompanamiento`,
    reglasAcuerdos: "Acuerdos de seguimiento establecidos:\n\n1. Reuniones de seguimiento cada 15 dias entre lider y talento\n2. Reportes de avance semanales por parte del talento\n3. Retroalimentacion continua y constructiva\n4. Comunicacion abierta sobre dificultades o necesidades\n5. Revision y ajuste del plan segun sea necesario",
    beneficioEsperado: "Al completar exitosamente este plan se espera:\n\n- Mejora significativa en las areas identificadas\n- Mayor autonomia y proactividad del talento\n- Contribucion mas efectiva al equipo\n- Desarrollo profesional sostenible\n- Impacto positivo en los indicadores del area",
    metaTrazada: `Meta: Lograr una mejora medible y sostenible en las competencias identificadas, alcanzando al menos el 80% de los objetivos planteados en un plazo de 90 dias, evidenciado a traves del cumplimiento de las actividades y la retroalimentacion positiva del equipo.`,
    criterioCierre: "El plan se considerara exitoso cuando:\n\n1. Se complete el 80% o mas de las actividades programadas\n2. Se evidencie mejora en los indicadores establecidos\n3. El lider valide positivamente los avances\n4. El talento demuestre autonomia en las areas trabajadas\n5. Se documenten las evidencias de mejora",
    actividad: "Actividad sugerida basada en la descripcion:\n\nTema: Desarrollo de competencia clave\nObjetivo: Fortalecer la habilidad identificada\nCompromiso: Participar activamente en las sesiones y aplicar lo aprendido\nIndicador: Cumplir 100% de las sesiones y demostrar aplicacion practica\nEvidencia: Reportes de avance, retroalimentacion del lider"
  }
  
  return suggestions[fieldName || 'hallazgos'] || suggestions.hallazgos
}
