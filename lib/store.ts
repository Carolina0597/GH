'use client'

import { create } from 'zustand'

// =====================================================
// TIPOS BASE
// =====================================================

export type RoleType = 'gh' | 'peopleops' | 'lider' | 'talento' | 'forplus' | 'relaciones' | 'admin_gestion' | 'admin_tecnico'

export const roleLabels: Record<RoleType, string> = {
  gh: 'Gestion Humana',
  peopleops: 'PeopleOps',
  lider: 'Lider',
  talento: 'Talento',
  forplus: 'For+',
  relaciones: 'Relaciones Laborales',
  admin_gestion: 'Gestion Administrativa',
  admin_tecnico: 'Administrador Tecnico',
}

export type ModuleId = 'dashboard' | 'planes' | 'evaluaciones' | 'radar' | 'prorrogas' | 'reportes' | 'admin'

export const moduleLabels: Record<ModuleId, string> = {
  dashboard: 'Dashboard',
  planes: 'Planes de Mejora y Desarrollo',
  evaluaciones: 'Evaluaciones',
  radar: 'Radar de Competencias',
  prorrogas: 'Prorrogas de Contrato',
  reportes: 'Reportes',
  admin: 'Administracion',
}

export const moduleDescriptions: Record<ModuleId, string> = {
  dashboard: 'Vista general del modulo de desempeno con KPIs y metricas principales.',
  planes: 'Gestion centralizada de planes de mejora y desarrollo para el talento.',
  evaluaciones: 'Evaluaciones de desempeno, lider-talento, autoevaluaciones y 4D/triadas.',
  radar: 'Radar de competencias y encuestas de evaluacion configurables.',
  prorrogas: 'Gestion de prorrogas de contrato con evaluaciones asociadas.',
  reportes: 'Reportes y visualizaciones de resultados de desempeno.',
  admin: 'Configuracion y administracion del modulo de desempeno.',
}

export const roleModuleAccess: Record<RoleType, ModuleId[]> = {
  gh: ['dashboard', 'planes', 'evaluaciones', 'radar', 'prorrogas', 'reportes', 'admin'],
  peopleops: ['dashboard', 'planes', 'evaluaciones', 'radar', 'prorrogas', 'reportes'],
  lider: ['dashboard', 'planes', 'evaluaciones', 'prorrogas'],
  talento: ['dashboard', 'planes', 'evaluaciones', 'prorrogas'],
  forplus: ['dashboard', 'planes'],
  relaciones: ['dashboard', 'planes', 'prorrogas', 'reportes'],
  admin_gestion: ['dashboard', 'planes', 'evaluaciones', 'prorrogas', 'reportes'],
  admin_tecnico: ['dashboard', 'planes', 'evaluaciones', 'radar', 'prorrogas', 'reportes', 'admin'],
}

// =====================================================
// PERMISOS PARA PLANES
// =====================================================

export interface PlanPermissions {
  ver: boolean
  crear: boolean
  editar: boolean
  comentar: boolean
  seguimiento: boolean
  adjuntar: boolean
  solicitarFormacion: boolean
  ampliar: boolean
  cerrar: boolean
  descargar: boolean
  verMetricas: boolean
  verHistorico: boolean
  verTodo: boolean
  verTribus: boolean
  verSoloEquipo: boolean
  verSoloPropios: boolean
  auditar: boolean
}

export const rolePlanPermissions: Record<RoleType, PlanPermissions> = {
  gh: { ver: true, crear: true, editar: true, comentar: true, seguimiento: true, adjuntar: true, solicitarFormacion: true, ampliar: true, cerrar: true, descargar: true, verMetricas: true, verHistorico: true, verTodo: true, verTribus: false, verSoloEquipo: false, verSoloPropios: false, auditar: true },
  peopleops: { ver: true, crear: true, editar: true, comentar: true, seguimiento: true, adjuntar: true, solicitarFormacion: true, ampliar: true, cerrar: true, descargar: true, verMetricas: true, verHistorico: true, verTodo: false, verTribus: true, verSoloEquipo: false, verSoloPropios: false, auditar: false },
  lider: { ver: true, crear: true, editar: true, comentar: true, seguimiento: true, adjuntar: true, solicitarFormacion: true, ampliar: true, cerrar: true, descargar: true, verMetricas: true, verHistorico: true, verTodo: false, verTribus: false, verSoloEquipo: true, verSoloPropios: false, auditar: false },
  talento: { ver: true, crear: false, editar: false, comentar: true, seguimiento: false, adjuntar: true, solicitarFormacion: false, ampliar: false, cerrar: false, descargar: false, verMetricas: false, verHistorico: true, verTodo: false, verTribus: false, verSoloEquipo: false, verSoloPropios: true, auditar: false },
  forplus: { ver: true, crear: false, editar: false, comentar: true, seguimiento: false, adjuntar: false, solicitarFormacion: false, ampliar: false, cerrar: false, descargar: false, verMetricas: false, verHistorico: false, verTodo: false, verTribus: false, verSoloEquipo: false, verSoloPropios: false, auditar: false },
  relaciones: { ver: true, crear: false, editar: false, comentar: true, seguimiento: false, adjuntar: false, solicitarFormacion: false, ampliar: false, cerrar: false, descargar: true, verMetricas: true, verHistorico: true, verTodo: true, verTribus: false, verSoloEquipo: false, verSoloPropios: false, auditar: true },
  admin_gestion: { ver: true, crear: true, editar: true, comentar: true, seguimiento: true, adjuntar: true, solicitarFormacion: true, ampliar: true, cerrar: true, descargar: true, verMetricas: true, verHistorico: true, verTodo: true, verTribus: false, verSoloEquipo: false, verSoloPropios: false, auditar: false },
  admin_tecnico: { ver: true, crear: true, editar: true, comentar: true, seguimiento: true, adjuntar: true, solicitarFormacion: true, ampliar: true, cerrar: true, descargar: true, verMetricas: true, verHistorico: true, verTodo: true, verTribus: false, verSoloEquipo: false, verSoloPropios: false, auditar: true },
}

// =====================================================
// TIPOS PARA PLANES
// =====================================================

export type PlanType = 'mejora' | 'desarrollo'
export type PlanStatus = 'borrador' | 'activo' | 'en_progreso' | 'en_riesgo' | 'seguimiento_vencido' | 'ampliado' | 'cerrado_superado' | 'cerrado_no_superado' | 'archivado'
export type Criticidad = 'baja' | 'media' | 'alta' | 'critica'
export type EjePrincipal = 'ser' | 'saber' | 'hacer'
export type ActividadEstado = 'pendiente' | 'en_progreso' | 'cumplido' | 'no_cumplido' | 'en_riesgo'
export type ForPlusEstado = 'no_solicitada' | 'solicitada' | 'en_revision' | 'en_curso' | 'completada' | 'cancelada'

export const planStatusLabels: Record<PlanStatus, string> = {
  borrador: 'Borrador',
  activo: 'Activo',
  en_progreso: 'En progreso',
  en_riesgo: 'En riesgo',
  seguimiento_vencido: 'Seguimiento vencido',
  ampliado: 'Ampliado',
  cerrado_superado: 'Cerrado - Superado',
  cerrado_no_superado: 'Cerrado - No superado',
  archivado: 'Archivado',
}

export const planStatusColors: Record<PlanStatus, 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gray'> = {
  borrador: 'gray',
  activo: 'blue',
  en_progreso: 'blue',
  en_riesgo: 'red',
  seguimiento_vencido: 'yellow',
  ampliado: 'purple',
  cerrado_superado: 'green',
  cerrado_no_superado: 'red',
  archivado: 'gray',
}

export const criticidadLabels: Record<Criticidad, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Critica',
}

export const criticidadColors: Record<Criticidad, 'green' | 'yellow' | 'red' | 'purple'> = {
  baja: 'green',
  media: 'yellow',
  alta: 'red',
  critica: 'purple',
}

export const ejeLabels: Record<EjePrincipal, string> = {
  ser: 'Ser',
  saber: 'Saber',
  hacer: 'Hacer',
}

export const ejeColors: Record<EjePrincipal, string> = {
  ser: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  saber: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  hacer: 'bg-green-500/20 text-green-400 border-green-500/30',
}

// =====================================================
// INTERFACES DE DATOS
// =====================================================

export interface Talento {
  id: string
visuel: string
  nombre: string
  cargo: string
  area: string
  equipo: string
  vicepresidencia: string
  liderId: string
  email: string
}

export interface Lider {
  id: string
  nombre: string
  cargo: string
  area: string
  equipo: string
  vicepresidencia: string
  email: string
  tribus: string[]
}

export interface Actividad {
  id: string
  eje: EjePrincipal
  tema: string
  hallazgoAsociado: string
  objetivoEspecifico: string
  compromiso: string
  responsable: string
  fechaInicio: string
  fechaCompromiso: string
  indicador: string
  evidenciaEsperada: string
  estado: ActividadEstado
  comentarios: ComentarioActividad[]
  novedades: NovedadActividad[]
  seguimientos: SeguimientoActividad[]
}

export interface ComentarioActividad {
  id: string
  fecha: string
  autor: string
  autorRol: RoleType
  texto: string
}

export interface NovedadActividad {
  id: string
  fecha: string
  autor: string
  texto: string
}

export interface SeguimientoActividad {
  id: string
  semana: number
  fecha: string
  estado: ActividadEstado
  observacion: string
  avance: number
  responsable: string
  proximaFecha: string
}

export interface Seguimiento {
  id: string
  semana: number
  fecha: string
  tipo: 'general' | 'actividad'
  actividadId?: string
  observacionGeneral: string
  acuerdos: string
  avanceEstimado: number
  responsable: string
  okLider: boolean
  okTalento: boolean
  proximaFecha: string
  evidencias: string[]
}

export interface SolicitudForPlus {
  id: string
  estado: ForPlusEstado
  competencia: string
  tipo: string
  justificacion: string
  prioridad: 'baja' | 'media' | 'alta'
  fechaSugerida: string
  comentarios: string
  novedadesFor: string[]
}

export interface Plan {
  id: string
  tipo: PlanType
  subtipo: string
  origen: string
  talentoId: string
  talento: Talento
  liderId: string
  lider: Lider
  responsableAdicional?: string
  fechaInicio: string
  fechaFinInicial: string
  fechaCierreReal?: string
  estado: PlanStatus
  version: string
  criticidad: Criticidad
  ejePrincipal: EjePrincipal
  ejes?: EjePrincipal[] // Multiseleccion de ejes
  avance: number
  // Paso 2: Motivo y contexto
  hallazgos: string
  dondeNace?: string
  antecedentes?: string
  impactoObservado?: string
  reglasIniciales?: string
  reglasAcuerdos?: string
  beneficioEsperado?: string
  adjuntosIniciales: string[]
  // Paso 3: Meta y criterio
  metaTrazada: string
  objetivoSmart: string
  indicadores: { nombre: string; meta: string; unidad: string; fechaObjetivo: string; responsable: string }[]
  criterioCierre: string
  tiempoPrudente: string
  riesgosSinMejora: string
  // Paso 4: Actividades
  actividades: Actividad[]
  // Paso 5: For+
  solicitudForPlus?: SolicitudForPlus
  // Seguimientos
  seguimientos: Seguimiento[]
  // Comentarios del talento
  comentariosTalento: { id: string; fecha: string; texto: string; relacionadoCon: 'plan' | 'actividad' | 'seguimiento'; actividadId?: string; seguimientoId?: string }[]
  // Historial
  historial: { id: string; fecha: string; accion: string; autor: string; detalles: string }[]
  // Ampliaciones
  ampliaciones: { id: string; fecha: string; nuevaFecha: string; motivo: string; riesgo: string; comentarios: string }[]
  // Cierre
  cierreInfo?: {
    resultado: 'superado' | 'no_superado'
    fechaCierre: string
    resumenFinal: string
    cumplimientoMeta: 'si' | 'parcial' | 'no'
    criterioCumplido: 'si' | 'parcial' | 'no'
    recomendacionPosterior: string
    comentariosFinales: string
  }
  // Metadatos
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Notification {
  id: string
  tipo: string
  titulo: string
  mensaje: string
  fecha: string
  leida: boolean
  rol: RoleType
  planId?: string
  talentoId?: string
}

// =====================================================
// MOCK DATA
// =====================================================

const lideres: Lider[] = [
  { id: 'l1', nombre: 'Maria Lopez', cargo: 'Engineering Manager', area: 'Tecnologia', equipo: 'Backend', vicepresidencia: 'VP Tecnologia', email: 'maria.lopez@sistecredito.com', tribus: ['Backend', 'Frontend'] },
  { id: 'l2', nombre: 'Sebastian Marino', cargo: 'Product Lead', area: 'Producto', equipo: 'Core', vicepresidencia: 'VP Producto', email: 'sebastian.marino@sistecredito.com', tribus: ['Core', 'Growth'] },
  { id: 'l3', nombre: 'Laura Roldan', cargo: 'Design Lead', area: 'Diseno', equipo: 'UX', vicepresidencia: 'VP Producto', email: 'laura.roldan@sistecredito.com', tribus: ['UX', 'Research'] },
]

const talentos: Talento[] = [
  { id: 't1', visuel: 'AG', nombre: 'Ana Garcia', cargo: 'Backend Developer', area: 'Tecnologia', equipo: 'Backend', vicepresidencia: 'VP Tecnologia', liderId: 'l1', email: 'ana.garcia@sistecredito.com' },
  { id: 't2', visuel: 'JR', nombre: 'Juan Ramos', cargo: 'Frontend Developer', area: 'Tecnologia', equipo: 'Frontend', vicepresidencia: 'VP Tecnologia', liderId: 'l1', email: 'juan.ramos@sistecredito.com' },
  { id: 't3', visuel: 'CM', nombre: 'Carlos Mendez', cargo: 'Senior Developer', area: 'Tecnologia', equipo: 'Backend', vicepresidencia: 'VP Tecnologia', liderId: 'l1', email: 'carlos.mendez@sistecredito.com' },
  { id: 't4', visuel: 'LT', nombre: 'Laura Torres', cargo: 'Product Manager', area: 'Producto', equipo: 'Core', vicepresidencia: 'VP Producto', liderId: 'l2', email: 'laura.torres@sistecredito.com' },
  { id: 't5', visuel: 'NP', nombre: 'Nicolas Perez', cargo: 'QA Engineer', area: 'Tecnologia', equipo: 'QA', vicepresidencia: 'VP Tecnologia', liderId: 'l1', email: 'nicolas.perez@sistecredito.com' },
  { id: 't6', visuel: 'VF', nombre: 'Valentina Florez', cargo: 'UX Designer', area: 'Diseno', equipo: 'UX', vicepresidencia: 'VP Producto', liderId: 'l3', email: 'valentina.florez@sistecredito.com' },
  { id: 't7', visuel: 'MT', nombre: 'Mateo Toro', cargo: 'Data Analyst', area: 'Datos', equipo: 'Analytics', vicepresidencia: 'VP Tecnologia', liderId: 'l1', email: 'mateo.toro@sistecredito.com' },
  { id: 't8', visuel: 'SR', nombre: 'Sandra Roldan', cargo: 'Scrum Master', area: 'Agilidad', equipo: 'Agile', vicepresidencia: 'VP Producto', liderId: 'l2', email: 'sandra.roldan@sistecredito.com' },
  { id: 't9', visuel: 'CJ', nombre: 'Catalina Jaramillo', cargo: 'DevOps Engineer', area: 'Tecnologia', equipo: 'Infra', vicepresidencia: 'VP Tecnologia', liderId: 'l1', email: 'catalina.jaramillo@sistecredito.com' },
  { id: 't10', visuel: 'AG', nombre: 'Andres Gomez', cargo: 'Mobile Developer', area: 'Tecnologia', equipo: 'Mobile', vicepresidencia: 'VP Tecnologia', liderId: 'l1', email: 'andres.gomez@sistecredito.com' },
]

const peopleOps = [
  { id: 'po1', nombre: 'Carolina Campo', tribus: ['Backend', 'Frontend', 'QA', 'Infra', 'Mobile'] },
  { id: 'po2', nombre: 'Deisy Restrepo', tribus: ['Core', 'Growth', 'UX', 'Research', 'Agile', 'Analytics'] },
]

const ghUser = { id: 'gh1', nombre: 'Luisa Cano' }

function createMockPlans(): Plan[] {
  const plans: Plan[] = []
  
  // Plan 1: Mejora por desempeno - En riesgo
  plans.push({
    id: 'p1',
    tipo: 'mejora',
    subtipo: 'Plan de mejora por desempeno',
    origen: 'Evaluacion de desempeno',
    talentoId: 't2',
    talento: talentos[1],
    liderId: 'l1',
    lider: lideres[0],
    fechaInicio: '2026-04-01',
    fechaFinInicial: '2026-06-30',
    estado: 'en_riesgo',
    version: '1.0',
    criticidad: 'alta',
    ejePrincipal: 'hacer',
    avance: 45,
    hallazgos: 'Bajo cumplimiento en entregas y poca autonomia para resolver problemas. En la evaluacion de desempeno se identifico que el talento no cumple con las fechas comprometidas y depende mucho de otros para avanzar.',
    dondeNace: 'Evaluacion de desempeno trimestral',
    antecedentes: 'Se ha conversado en 1:1 sobre las entregas sin mejora visible.',
    impactoObservado: 'Retraso en sprints y dependencia del equipo.',
    reglasIniciales: 'Reuniones semanales de seguimiento. Registro de compromisos en Jira.',
    beneficioEsperado: 'Mejorar cumplimiento de entregas al 90% y autonomia en resolucion de problemas.',
    adjuntosIniciales: [],
    metaTrazada: 'Cumplir el 90% de las entregas en fecha y resolver al menos 3 problemas de forma autonoma por sprint.',
    objetivoSmart: 'Entregar el 90% de las historias de usuario asignadas en fecha durante los proximos 3 meses, documentando el proceso de resolucion de al menos 3 problemas por sprint.',
    indicadores: [
      { nombre: 'Cumplimiento de entregas', meta: '90%', unidad: 'Porcentaje', fechaObjetivo: '2026-06-30', responsable: 'Juan Ramos' },
      { nombre: 'Problemas resueltos autonomamente', meta: '3 por sprint', unidad: 'Cantidad', fechaObjetivo: '2026-06-30', responsable: 'Juan Ramos' },
    ],
    criterioCierre: 'Alcanzar el 90% de cumplimiento de entregas durante 2 sprints consecutivos y documentar resolucion autonoma de problemas.',
    tiempoPrudente: '3 meses',
    riesgosSinMejora: 'Posible no renovacion de contrato o cambio de rol.',
    actividades: [
      { id: 'a1', eje: 'hacer', tema: 'Cumplimiento de entregas', hallazgoAsociado: 'Bajo cumplimiento en entregas', objetivoEspecifico: 'Entregar historias de usuario en fecha', compromiso: 'Documentar compromisos del sprint y entregar en fecha', responsable: 'Juan Ramos', fechaInicio: '2026-04-01', fechaCompromiso: '2026-06-30', indicador: '90% de entregas a tiempo', evidenciaEsperada: 'Reportes de Jira', estado: 'en_progreso', comentarios: [], novedades: [], seguimientos: [] },
      { id: 'a2', eje: 'hacer', tema: 'Autonomia', hallazgoAsociado: 'Poca autonomia', objetivoEspecifico: 'Buscar informacion antes de escalar', compromiso: 'Buscar informacion de forma autonoma antes de escalar', responsable: 'Juan Ramos', fechaInicio: '2026-04-01', fechaCompromiso: '2026-06-30', indicador: '3 problemas resueltos por sprint', evidenciaEsperada: 'Documentacion de resolucion', estado: 'en_riesgo', comentarios: [], novedades: [], seguimientos: [] },
      { id: 'a3', eje: 'saber', tema: 'Conocimiento tecnico', hallazgoAsociado: 'Brechas tecnicas', objetivoEspecifico: 'Fortalecer conocimiento en arquitectura', compromiso: 'Completar curso de arquitectura de software', responsable: 'Juan Ramos', fechaInicio: '2026-04-15', fechaCompromiso: '2026-05-30', indicador: 'Curso completado', evidenciaEsperada: 'Certificado', estado: 'pendiente', comentarios: [], novedades: [], seguimientos: [] },
    ],
    seguimientos: [
      { id: 's1', semana: 1, fecha: '2026-04-08', tipo: 'general', observacionGeneral: 'Primera semana de plan. Se revisaron compromisos y expectativas.', acuerdos: 'Documentar cada tarea antes de iniciar.', avanceEstimado: 10, responsable: 'Maria Lopez', okLider: true, okTalento: true, proximaFecha: '2026-04-15', evidencias: [] },
      { id: 's2', semana: 2, fecha: '2026-04-15', tipo: 'general', observacionGeneral: 'Mejora leve pero aun hay dependencia. Entreg 2 de 3 tareas.', acuerdos: 'Pedir ayuda solo despues de intentar 30 min.', avanceEstimado: 25, responsable: 'Maria Lopez', okLider: true, okTalento: false, proximaFecha: '2026-04-22', evidencias: [] },
    ],
    comentariosTalento: [
      { id: 'ct1', fecha: '2026-04-10', texto: 'Estoy trabajando en mejorar pero a veces las tareas no estan bien definidas.', relacionadoCon: 'plan' },
    ],
    historial: [
      { id: 'h1', fecha: '2026-04-01', accion: 'Plan creado', autor: 'Maria Lopez', detalles: 'Plan de mejora creado por bajo desempeno.' },
      { id: 'h2', fecha: '2026-04-08', accion: 'Seguimiento registrado', autor: 'Maria Lopez', detalles: 'Semana 1 completada.' },
    ],
    ampliaciones: [],
    createdAt: '2026-04-01',
    updatedAt: '2026-04-15',
    createdBy: 'Maria Lopez',
  })

  // Plan 2: Mejora habilidades blandas - Activo
  plans.push({
    id: 'p2',
    tipo: 'mejora',
    subtipo: 'Plan de mejora por comportamientos',
    origen: 'Feedback del lider',
    talentoId: 't4',
    talento: talentos[3],
    liderId: 'l2',
    lider: lideres[1],
    fechaInicio: '2026-03-15',
    fechaFinInicial: '2026-06-15',
    estado: 'activo',
    version: '1.0',
    criticidad: 'media',
    ejePrincipal: 'ser',
    avance: 60,
    hallazgos: 'Fortalecer comunicacion asertiva y manejo emocional en situaciones de presion.',
    dondeNace: 'Feedback en 1:1 y observacion en reuniones',
    antecedentes: 'En ocasiones las respuestas son cortantes y generan tension.',
    impactoObservado: 'Afecta la dinamica del equipo en momentos criticos.',
    reglasIniciales: 'Espacios de feedback semanal con lider.',
    beneficioEsperado: 'Mejorar comunicacion y clima del equipo.',
    adjuntosIniciales: [],
    metaTrazada: 'Demostrar comunicacion asertiva en el 100% de las reuniones criticas.',
    objetivoSmart: 'Participar en mentoria de comunicacion y liderar al menos 4 reuniones con acuerdos documentados.',
    indicadores: [
      { nombre: 'Reuniones lideradas', meta: '4', unidad: 'Cantidad', fechaObjetivo: '2026-06-15', responsable: 'Laura Torres' },
    ],
    criterioCierre: 'Feedback positivo del equipo y lider sobre comunicacion.',
    tiempoPrudente: '3 meses',
    riesgosSinMejora: 'Continuar afectando dinamica de equipo.',
    actividades: [
      { id: 'a4', eje: 'ser', tema: 'Comunicacion asertiva', hallazgoAsociado: 'Comunicacion cortante', objetivoEspecifico: 'Mejorar comunicacion en reuniones', compromiso: 'Participar en mentoria de comunicacion', responsable: 'Laura Torres', fechaInicio: '2026-03-15', fechaCompromiso: '2026-05-15', indicador: 'Mentoria completada', evidenciaEsperada: 'Registro de sesiones', estado: 'cumplido', comentarios: [], novedades: [], seguimientos: [] },
      { id: 'a5', eje: 'ser', tema: 'Liderazgo de reuniones', hallazgoAsociado: 'Tension en reuniones', objetivoEspecifico: 'Liderar reuniones con acuerdos', compromiso: 'Liderar reunion semanal documentando acuerdos', responsable: 'Laura Torres', fechaInicio: '2026-03-20', fechaCompromiso: '2026-06-15', indicador: '4 reuniones lideradas', evidenciaEsperada: 'Actas de reunion', estado: 'en_progreso', comentarios: [], novedades: [], seguimientos: [] },
    ],
    solicitudForPlus: { id: 'sf1', estado: 'solicitada', competencia: 'Comunicacion efectiva', tipo: 'Habilidades blandas', justificacion: 'Fortalecer habilidades de comunicacion asertiva.', prioridad: 'media', fechaSugerida: '2026-05-01', comentarios: 'Formacion grupal preferiblemente.', novedadesFor: [] },
    seguimientos: [],
    comentariosTalento: [],
    historial: [],
    ampliaciones: [],
    createdAt: '2026-03-15',
    updatedAt: '2026-04-20',
    createdBy: 'Sebastian Marino',
  })

  // Plan 3: Desarrollo por potencial - Activo
  plans.push({
    id: 'p3',
    tipo: 'desarrollo',
    subtipo: 'Plan para potenciar talento',
    origen: 'Potencial de liderazgo',
    talentoId: 't6',
    talento: talentos[5],
    liderId: 'l3',
    lider: lideres[2],
    fechaInicio: '2026-02-01',
    fechaFinInicial: '2026-07-31',
    estado: 'activo',
    version: '1.0',
    criticidad: 'baja',
    ejePrincipal: 'saber',
    avance: 70,
    hallazgos: 'Valentina muestra alto potencial de liderazgo tecnico. Se busca prepararla para rol senior.',
    dondeNace: 'Identificacion de potencial en evaluacion',
    antecedentes: 'Consistentemente supera expectativas y ayuda a companeros.',
    impactoObservado: 'Positivo en el equipo.',
    reglasIniciales: 'Mentoria mensual con Design Lead.',
    beneficioEsperado: 'Preparar para ascenso a Senior UX Designer.',
    adjuntosIniciales: [],
    metaTrazada: 'Completar ruta de desarrollo para Senior UX.',
    objetivoSmart: 'Liderar 2 iniciativas internas y documentar aprendizajes para el equipo.',
    indicadores: [
      { nombre: 'Iniciativas lideradas', meta: '2', unidad: 'Cantidad', fechaObjetivo: '2026-07-31', responsable: 'Valentina Florez' },
    ],
    criterioCierre: 'Completar iniciativas y recibir feedback positivo.',
    tiempoPrudente: '6 meses',
    riesgosSinMejora: 'Ninguno critico.',
    actividades: [
      { id: 'a6', eje: 'saber', tema: 'Liderazgo tecnico', hallazgoAsociado: 'Potencial de liderazgo', objetivoEspecifico: 'Liderar iniciativa interna', compromiso: 'Liderar rediseno del design system', responsable: 'Valentina Florez', fechaInicio: '2026-02-15', fechaCompromiso: '2026-05-31', indicador: 'Proyecto completado', evidenciaEsperada: 'Documentacion y presentacion', estado: 'cumplido', comentarios: [], novedades: [], seguimientos: [] },
      { id: 'a7', eje: 'saber', tema: 'Mentoria', hallazgoAsociado: 'Preparacion para ascenso', objetivoEspecifico: 'Recibir mentoria tecnica', compromiso: 'Sesiones mensuales con Design Lead', responsable: 'Valentina Florez', fechaInicio: '2026-02-01', fechaCompromiso: '2026-07-31', indicador: '6 sesiones completadas', evidenciaEsperada: 'Registro de sesiones', estado: 'en_progreso', comentarios: [], novedades: [], seguimientos: [] },
    ],
    seguimientos: [],
    comentariosTalento: [],
    historial: [],
    ampliaciones: [],
    createdAt: '2026-02-01',
    updatedAt: '2026-04-15',
    createdBy: 'Laura Roldan',
  })

  // Plan 4: Desarrollo por ascenso - En progreso
  plans.push({
    id: 'p4',
    tipo: 'desarrollo',
    subtipo: 'Plan de desarrollo por ascenso',
    origen: 'Compromisos derivados de ascenso',
    talentoId: 't3',
    talento: talentos[2],
    liderId: 'l1',
    lider: lideres[0],
    fechaInicio: '2026-03-01',
    fechaFinInicial: '2026-08-31',
    estado: 'en_progreso',
    version: '1.0',
    criticidad: 'media',
    ejePrincipal: 'saber',
    avance: 50,
    hallazgos: 'Carlos fue ascendido a Senior Developer. Se requiere fortalecer conocimientos en arquitectura.',
    dondeNace: 'Ascenso a Senior Developer',
    antecedentes: 'Excelente desempeno tecnico, necesita ampliar vision arquitectonica.',
    impactoObservado: 'Positivo, ya aporta en decisiones tecnicas.',
    reglasIniciales: 'Revisiones quincenales con Tech Lead.',
    beneficioEsperado: 'Consolidar rol de Senior con capacidad de decision arquitectonica.',
    adjuntosIniciales: [],
    metaTrazada: 'Dominar patrones de arquitectura y liderar decision tecnica.',
    objetivoSmart: 'Completar formacion en arquitectura y liderar 1 decision arquitectonica importante.',
    indicadores: [
      { nombre: 'Formacion completada', meta: '100%', unidad: 'Porcentaje', fechaObjetivo: '2026-06-30', responsable: 'Carlos Mendez' },
    ],
    criterioCierre: 'Formacion completada y decision arquitectonica documentada.',
    tiempoPrudente: '6 meses',
    riesgosSinMejora: 'Dificultad para consolidar rol senior.',
    actividades: [
      { id: 'a8', eje: 'saber', tema: 'Arquitectura de software', hallazgoAsociado: 'Brecha en arquitectura', objetivoEspecifico: 'Completar formacion en arquitectura', compromiso: 'Curso de arquitectura de microservicios', responsable: 'Carlos Mendez', fechaInicio: '2026-03-15', fechaCompromiso: '2026-05-31', indicador: 'Curso completado', evidenciaEsperada: 'Certificado', estado: 'en_progreso', comentarios: [], novedades: [], seguimientos: [] },
    ],
    seguimientos: [],
    comentariosTalento: [],
    historial: [],
    ampliaciones: [],
    createdAt: '2026-03-01',
    updatedAt: '2026-04-10',
    createdBy: 'Maria Lopez',
  })

  // Plan 5: Mejora por prorroga - Ampliado
  plans.push({
    id: 'p5',
    tipo: 'mejora',
    subtipo: 'Plan de mejora por prorroga de contrato',
    origen: 'Prorroga de contrato',
    talentoId: 't5',
    talento: talentos[4],
    liderId: 'l1',
    lider: lideres[0],
    fechaInicio: '2026-01-15',
    fechaFinInicial: '2026-04-15',
    estado: 'ampliado',
    version: '1.1',
    criticidad: 'alta',
    ejePrincipal: 'hacer',
    avance: 65,
    hallazgos: 'Bajo cumplimiento en cobertura de pruebas y documentacion de casos.',
    dondeNace: 'Evaluacion de prorroga de contrato',
    antecedentes: 'Prorroga de 3 meses para demostrar mejora.',
    impactoObservado: 'Bugs en produccion por falta de cobertura.',
    reglasIniciales: 'Seguimiento semanal obligatorio.',
    beneficioEsperado: 'Alcanzar 80% de cobertura de pruebas.',
    adjuntosIniciales: [],
    metaTrazada: 'Cobertura de pruebas al 80%.',
    objetivoSmart: 'Incrementar cobertura de pruebas del 50% al 80% en 3 meses.',
    indicadores: [
      { nombre: 'Cobertura de pruebas', meta: '80%', unidad: 'Porcentaje', fechaObjetivo: '2026-05-15', responsable: 'Nicolas Perez' },
    ],
    criterioCierre: 'Cobertura sostenida al 80% por 2 sprints.',
    tiempoPrudente: '3 meses',
    riesgosSinMejora: 'No renovacion de contrato.',
    actividades: [
      { id: 'a9', eje: 'hacer', tema: 'Cobertura de pruebas', hallazgoAsociado: 'Baja cobertura', objetivoEspecifico: 'Aumentar cobertura', compromiso: 'Escribir pruebas para cada historia', responsable: 'Nicolas Perez', fechaInicio: '2026-01-15', fechaCompromiso: '2026-05-15', indicador: '80% cobertura', evidenciaEsperada: 'Reportes de SonarQube', estado: 'en_progreso', comentarios: [], novedades: [], seguimientos: [] },
    ],
    seguimientos: [],
    comentariosTalento: [],
    historial: [],
    ampliaciones: [
      { id: 'amp1', fecha: '2026-04-10', nuevaFecha: '2026-05-15', motivo: 'Necesita mas tiempo para consolidar mejora.', riesgo: 'Medio', comentarios: 'Se extiende 1 mes adicional.' },
    ],
    createdAt: '2026-01-15',
    updatedAt: '2026-04-10',
    createdBy: 'Maria Lopez',
  })

  // Plan 6: Cerrado superado
  plans.push({
    id: 'p6',
    tipo: 'mejora',
    subtipo: 'Plan de mejora por desempeno',
    origen: 'Observacion del lider',
    talentoId: 't1',
    talento: talentos[0],
    liderId: 'l1',
    lider: lideres[0],
    fechaInicio: '2025-10-01',
    fechaFinInicial: '2025-12-31',
    fechaCierreReal: '2025-12-20',
    estado: 'cerrado_superado',
    version: '1.0',
    criticidad: 'media',
    ejePrincipal: 'hacer',
    avance: 100,
    hallazgos: 'Dificultad inicial con nuevas tecnologias del stack.',
    dondeNace: 'Observacion en primeros sprints',
    antecedentes: 'Recien incorporada al equipo.',
    impactoObservado: 'Lentitud en entregas iniciales.',
    reglasIniciales: 'Pair programming y mentorias.',
    beneficioEsperado: 'Dominio del stack tecnologico.',
    adjuntosIniciales: [],
    metaTrazada: 'Dominar stack y entregar de forma autonoma.',
    objetivoSmart: 'Completar 10 historias de usuario de forma autonoma.',
    indicadores: [],
    criterioCierre: 'Entregas autonomas consistentes.',
    tiempoPrudente: '3 meses',
    riesgosSinMejora: 'Ninguno.',
    actividades: [],
    seguimientos: [],
    comentariosTalento: [],
    historial: [],
    ampliaciones: [],
    cierreInfo: {
      resultado: 'superado',
      fechaCierre: '2025-12-20',
      resumenFinal: 'Ana logro dominar el stack y ahora entrega de forma autonoma y con calidad.',
      cumplimientoMeta: 'si',
      criterioCumplido: 'si',
      recomendacionPosterior: 'Sin accion',
      comentariosFinales: 'Excelente progreso.',
    },
    createdAt: '2025-10-01',
    updatedAt: '2025-12-20',
    createdBy: 'Maria Lopez',
  })

  // Plan 7: Cerrado no superado
  plans.push({
    id: 'p7',
    tipo: 'mejora',
    subtipo: 'Plan de mejora por comportamientos',
    origen: 'Feedback de cliente interno',
    talentoId: 't7',
    talento: talentos[6],
    liderId: 'l1',
    lider: lideres[0],
    fechaInicio: '2025-09-01',
    fechaFinInicial: '2025-11-30',
    fechaCierreReal: '2025-11-30',
    estado: 'cerrado_no_superado',
    version: '1.0',
    criticidad: 'alta',
    ejePrincipal: 'ser',
    avance: 40,
    hallazgos: 'Dificultad para trabajar en equipo y recibir feedback.',
    dondeNace: 'Feedback de cliente interno',
    antecedentes: 'Multiples conversaciones sin mejora.',
    impactoObservado: 'Tension con stakeholders.',
    reglasIniciales: 'Coaching y seguimiento semanal.',
    beneficioEsperado: 'Mejorar trabajo en equipo.',
    adjuntosIniciales: [],
    metaTrazada: 'Demostrar mejora en colaboracion.',
    objetivoSmart: 'Recibir feedback positivo en 3 de 4 proyectos.',
    indicadores: [],
    criterioCierre: 'Feedback positivo de stakeholders.',
    tiempoPrudente: '3 meses',
    riesgosSinMejora: 'Escalar a Relaciones Laborales.',
    actividades: [],
    seguimientos: [],
    comentariosTalento: [],
    historial: [],
    ampliaciones: [],
    cierreInfo: {
      resultado: 'no_superado',
      fechaCierre: '2025-11-30',
      resumenFinal: 'No se logro la mejora esperada en trabajo en equipo.',
      cumplimientoMeta: 'no',
      criterioCumplido: 'no',
      recomendacionPosterior: 'Escalar a GH',
      comentariosFinales: 'Se recomienda evaluar continuidad o cambio de rol.',
    },
    createdAt: '2025-09-01',
    updatedAt: '2025-11-30',
    createdBy: 'Maria Lopez',
  })

  // Agregar mas planes para completar 18
  // Plan 8-18: Combinacion de mejora y desarrollo con diferentes estados
  const additionalPlans: Partial<Plan>[] = [
    { id: 'p8', tipo: 'desarrollo', subtipo: 'Plan por liderazgo tecnico', origen: 'Necesidad del lider', talentoId: 't8', estado: 'activo', criticidad: 'baja', ejePrincipal: 'saber', avance: 35 },
    { id: 'p9', tipo: 'mejora', subtipo: 'Plan derivado de evaluacion', origen: 'Evaluacion de desempeno', talentoId: 't9', estado: 'activo', criticidad: 'media', ejePrincipal: 'hacer', avance: 55 },
    { id: 'p10', tipo: 'desarrollo', subtipo: 'Plan por especializacion tecnica', origen: 'Brecha tecnica', talentoId: 't10', estado: 'en_progreso', criticidad: 'baja', ejePrincipal: 'saber', avance: 40 },
    { id: 'p11', tipo: 'mejora', subtipo: 'Plan de mejora por resultados', origen: 'Bajo cumplimiento de objetivos', talentoId: 't1', estado: 'seguimiento_vencido', criticidad: 'alta', ejePrincipal: 'hacer', avance: 30 },
    { id: 'p12', tipo: 'desarrollo', subtipo: 'Plan por habilidades blandas', origen: 'Necesidad del talento', talentoId: 't4', estado: 'cerrado_superado', criticidad: 'baja', ejePrincipal: 'ser', avance: 100 },
    { id: 'p13', tipo: 'mejora', subtipo: 'Plan derivado de radar', origen: 'Radar de competencias', talentoId: 't2', estado: 'borrador', criticidad: 'media', ejePrincipal: 'saber', avance: 0 },
    { id: 'p14', tipo: 'desarrollo', subtipo: 'Plan por metodologia', origen: 'Brecha comportamental', talentoId: 't6', estado: 'cerrado_superado', criticidad: 'baja', ejePrincipal: 'saber', avance: 100 },
    { id: 'p15', tipo: 'mejora', subtipo: 'Plan de mejora por desempeno', origen: 'Solicitud GH / PeopleOps', talentoId: 't3', estado: 'en_riesgo', criticidad: 'critica', ejePrincipal: 'hacer', avance: 25 },
    { id: 'p16', tipo: 'desarrollo', subtipo: 'Plan por gestion de producto', origen: 'Ascenso', talentoId: 't8', estado: 'cerrado_no_superado', criticidad: 'media', ejePrincipal: 'saber', avance: 45 },
    { id: 'p17', tipo: 'mejora', subtipo: 'Plan de mejora por comportamientos', origen: 'Comportamiento observado', talentoId: 't5', estado: 'activo', criticidad: 'alta', ejePrincipal: 'ser', avance: 50 },
    { id: 'p18', tipo: 'desarrollo', subtipo: 'Otro', origen: 'Potenciar talento', talentoId: 't7', estado: 'activo', criticidad: 'baja', ejePrincipal: 'saber', avance: 65 },
  ]

  additionalPlans.forEach((p, i) => {
    const talento = talentos.find(t => t.id === p.talentoId) || talentos[0]
    const lider = lideres.find(l => l.id === talento.liderId) || lideres[0]
    plans.push({
      id: p.id!,
      tipo: p.tipo!,
      subtipo: p.subtipo!,
      origen: p.origen!,
      talentoId: p.talentoId!,
      talento,
      liderId: lider.id,
      lider,
      fechaInicio: '2026-03-01',
      fechaFinInicial: '2026-06-30',
      estado: p.estado!,
      version: '1.0',
      criticidad: p.criticidad!,
      ejePrincipal: p.ejePrincipal!,
      avance: p.avance!,
      hallazgos: 'Hallazgos del plan para ' + talento.nombre,
      dondeNace: p.origen!,
      antecedentes: 'Antecedentes del caso.',
      impactoObservado: 'Impacto observado.',
      reglasIniciales: 'Reglas de seguimiento.',
      beneficioEsperado: 'Beneficio esperado del plan.',
      adjuntosIniciales: [],
      metaTrazada: 'Meta del plan.',
      objetivoSmart: 'Objetivo SMART del plan.',
      indicadores: [],
      criterioCierre: 'Criterio de cierre.',
      tiempoPrudente: '3 meses',
      riesgosSinMejora: 'Riesgos.',
      actividades: [
        { id: `a${10 + i}`, eje: p.ejePrincipal!, tema: 'Tema principal', hallazgoAsociado: 'Hallazgo', objetivoEspecifico: 'Objetivo', compromiso: 'Compromiso', responsable: talento.nombre, fechaInicio: '2026-03-01', fechaCompromiso: '2026-06-30', indicador: 'Indicador', evidenciaEsperada: 'Evidencia', estado: 'pendiente', comentarios: [], novedades: [], seguimientos: [] },
      ],
      seguimientos: [],
      comentariosTalento: [],
      historial: [],
      ampliaciones: [],
      createdAt: '2026-03-01',
      updatedAt: '2026-04-01',
      createdBy: lider.nombre,
    })
  })

  return plans
}

const mockNotifications: Notification[] = [
  { id: 'n1', tipo: 'seguimiento', titulo: 'Seguimiento pendiente', mensaje: 'El plan de Juan Ramos requiere seguimiento esta semana.', fecha: '2026-04-20', leida: false, rol: 'lider', planId: 'p1', talentoId: 't2' },
  { id: 'n2', tipo: 'riesgo', titulo: 'Plan en riesgo', mensaje: 'El plan de Juan Ramos esta en riesgo por bajo avance.', fecha: '2026-04-19', leida: false, rol: 'gh', planId: 'p1', talentoId: 't2' },
  { id: 'n3', tipo: 'forplus', titulo: 'Solicitud For+ enviada', mensaje: 'Se envio solicitud de formacion para Laura Torres.', fecha: '2026-04-18', leida: true, rol: 'lider', planId: 'p2', talentoId: 't4' },
  { id: 'n4', tipo: 'vencimiento', titulo: 'Plan proximo a vencer', mensaje: 'El plan de Nicolas Perez vence en 7 dias.', fecha: '2026-04-17', leida: false, rol: 'lider', planId: 'p5', talentoId: 't5' },
  { id: 'n5', tipo: 'comentario', titulo: 'Nuevo comentario', mensaje: 'Juan Ramos dejo un comentario en su plan.', fecha: '2026-04-16', leida: true, rol: 'lider', planId: 'p1', talentoId: 't2' },
]

// =====================================================
// STORE
// =====================================================

interface AppState {
  currentRole: RoleType
  currentModule: ModuleId
  sidebarCollapsed: boolean
  
  // Data
  talentos: Talento[]
  lideres: Lider[]
  planes: Plan[]
  notifications: Notification[]
  
  // Para simular usuario actual
  currentUserId: string
  currentUserTribus: string[]
  
  // Actions
  setRole: (role: RoleType) => void
  setModule: (module: ModuleId) => void
  toggleSidebar: () => void
  
  // Plan actions
  addPlan: (plan: Plan) => void
  updatePlan: (planId: string, updates: Partial<Plan>) => void
  addSeguimiento: (planId: string, seguimiento: Seguimiento) => void
  addComentarioTalento: (planId: string, comentario: Plan['comentariosTalento'][0]) => void
  addNotification: (notification: Notification) => void
  markNotificationRead: (notificationId: string) => void
  
  // Helpers
  canAccessModule: (module: ModuleId) => boolean
  getAccessibleModules: () => ModuleId[]
  getPlanPermissions: () => PlanPermissions
  getFilteredPlans: () => Plan[]
  getUnreadNotifications: () => Notification[]
}

export const useForgeStore = create<AppState>((set, get) => ({
  currentRole: 'gh',
  currentModule: 'dashboard',
  sidebarCollapsed: false,
  
  talentos,
  lideres,
  planes: createMockPlans(),
  notifications: mockNotifications,
  
  // Simular usuario actual segun rol
  currentUserId: 'gh1',
  currentUserTribus: ['Backend', 'Frontend'],
  
  setRole: (role) => {
    let userId = 'gh1'
    let tribus: string[] = []
    
    if (role === 'lider') {
      userId = 'l1'
      tribus = lideres[0].tribus
    } else if (role === 'peopleops') {
      userId = 'po1'
      tribus = peopleOps[0].tribus
    } else if (role === 'talento') {
      userId = 't2' // Juan Ramos como talento de ejemplo
      tribus = []
    }
    
    set({ currentRole: role, currentUserId: userId, currentUserTribus: tribus })
  },
  
  setModule: (module) => {
    const canAccess = get().canAccessModule(module)
    if (canAccess) {
      set({ currentModule: module })
    }
  },
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  addPlan: (plan) => set((state) => ({ planes: [...state.planes, plan] })),
  
  updatePlan: (planId, updates) => set((state) => ({
    planes: state.planes.map(p => p.id === planId ? { ...p, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : p)
  })),
  
  addSeguimiento: (planId, seguimiento) => set((state) => ({
    planes: state.planes.map(p => p.id === planId ? { ...p, seguimientos: [...p.seguimientos, seguimiento] } : p)
  })),
  
  addComentarioTalento: (planId, comentario) => set((state) => ({
    planes: state.planes.map(p => p.id === planId ? { ...p, comentariosTalento: [...p.comentariosTalento, comentario] } : p)
  })),
  
  addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),
  
  markNotificationRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(n => n.id === notificationId ? { ...n, leida: true } : n)
  })),
  
  canAccessModule: (module) => {
    const { currentRole } = get()
    return roleModuleAccess[currentRole].includes(module)
  },
  
  getAccessibleModules: () => {
    const { currentRole } = get()
    return roleModuleAccess[currentRole]
  },
  
  getPlanPermissions: () => {
    const { currentRole } = get()
    return rolePlanPermissions[currentRole]
  },
  
  getFilteredPlans: () => {
    const { currentRole, currentUserId, currentUserTribus, planes, talentos: allTalentos } = get()
    const permissions = rolePlanPermissions[currentRole]
    
    if (permissions.verTodo) {
      return planes
    }
    
    if (permissions.verTribus) {
      return planes.filter(p => currentUserTribus.includes(p.talento.equipo))
    }
    
    if (permissions.verSoloEquipo) {
      return planes.filter(p => p.liderId === currentUserId)
    }
    
    if (permissions.verSoloPropios) {
      return planes.filter(p => p.talentoId === currentUserId)
    }
    
    return planes
  },
  
  getUnreadNotifications: () => {
    const { notifications, currentRole } = get()
    return notifications.filter(n => !n.leida && (n.rol === currentRole || n.rol === 'gh'))
  },
}))

// =====================================================
// TIPOS PARA ENCUESTAS/EVALUACIONES
// =====================================================

export type TipoEncuesta = 'lider_colaborador' | 'lider_lider' | 'colaborador_lider' | 'autoevaluacion' | 'area_interaccion' | 'transversal' | 'prorroga' | '4d_triadas'

export type TipoPregunta = 'escala_5' | 'escala_likert' | 'texto_abierto' | 'seleccion_unica' | 'seleccion_multiple' | 'si_no' | 'porcentaje'

export type EstadoEncuesta = 'borrador' | 'activa' | 'programada' | 'en_curso' | 'cerrada' | 'archivada'

export type EstadoLanzamiento = 'pendiente' | 'en_curso' | 'cerrado' | 'cancelado'

export interface PreguntaEncuesta {
  id: string
  pilar: 'ser' | 'saber_hacer' | 'especifico'
  objetivoEstrategico?: string
  texto: string
  tipoPregunta: TipoPregunta
  pesoPregunta: number // Porcentaje (ej: 10.5)
  totalPilar?: number // Porcentaje total del pilar (ej: 20 o 40)
  opciones?: string[] // Para seleccion unica/multiple
  escalaCalificacion?: { valor: number; porcentaje: number }[] // Para escala
  requerida: boolean
  orden: number
}

export interface Encuesta {
  id: string
  nombre: string
  descripcion: string
  tipo: TipoEncuesta
  version: string
  estado: EstadoEncuesta
  preguntas: PreguntaEncuesta[]
  createdAt: string
  updatedAt: string
  createdBy: string
  esPlantilla: boolean
  // Configuracion de publicos
  aplicaVP?: string[]
  aplicaAreas?: string[]
  aplicaEquipos?: string[]
  aplicaRoles?: ('lider' | 'colaborador')[]
}

export interface RespuestaEncuesta {
  id: string
  preguntaId: string
  valor: number | string | string[]
  comentario?: string
}

export interface ParticipanteLanzamiento {
  id: string
  talentoId: string
  talento: Talento
  evaluadorId?: string
  evaluador?: Talento
  estado: 'pendiente' | 'en_progreso' | 'completado'
  fechaInicio?: string
  fechaCompletado?: string
  respuestas: RespuestaEncuesta[]
  puntajeTotal?: number
  requierePlanMejora?: boolean
  planMejoraCreado?: boolean
  planMejoraId?: string
}

export interface LanzamientoEncuesta {
  id: string
  encuestaId: string
  encuesta?: Encuesta
  nombre: string
  fechaInicio: string
  fechaFin: string
  estado: EstadoLanzamiento
  recordatorios: { fecha: string; enviado: boolean }[]
  participantes: ParticipanteLanzamiento[]
  filtroVP?: string[]
  filtroArea?: string[]
  filtroEquipo?: string[]
  createdAt: string
  createdBy: string
}

// Datos mock de encuestas
export function getEncuestasMock(): Encuesta[] {
  const encuestas: Encuesta[] = []
  
  // Encuesta Lider-Colaborador (Seguridad de la Informacion - Eddy)
  encuestas.push({
    id: 'enc1',
    nombre: 'Evaluacion Lider-Colaborador - Seguridad de la Informacion',
    descripcion: 'Evaluacion del lider a sus colaboradores en el area de seguridad de la informacion.',
    tipo: 'lider_colaborador',
    version: '1.0',
    estado: 'activa',
    esPlantilla: false,
    aplicaAreas: ['Seguridad de la Informacion'],
    preguntas: [
      { id: 'p1', pilar: 'ser', texto: 'En que grado la persona es ejemplo de los valores de la organizacion y, a traves de sus comportamientos diarios, inspira y fortalece una cultura de integridad, colaboracion y excelencia.', tipoPregunta: 'escala_5', pesoPregunta: 20, totalPilar: 20, escalaCalificacion: [{ valor: 5, porcentaje: 20 }, { valor: 4, porcentaje: 16 }, { valor: 3, porcentaje: 12 }, { valor: 2, porcentaje: 8 }, { valor: 1, porcentaje: 4 }], requerida: true, orden: 1 },
      { id: 'p2', pilar: 'saber_hacer', objetivoEstrategico: 'Transformacion de procesos y sostenibilidad financiera', texto: 'En que medida la persona contribuye a identificar, proponer o aplicar mejoras en los procesos que aseguren eficiencia y un uso responsable de los recursos de la organizacion.', tipoPregunta: 'escala_5', pesoPregunta: 10.5, totalPilar: 40, escalaCalificacion: [{ valor: 5, porcentaje: 10.5 }, { valor: 4, porcentaje: 8.4 }, { valor: 3, porcentaje: 6.3 }, { valor: 2, porcentaje: 4.2 }, { valor: 1, porcentaje: 2.1 }], requerida: true, orden: 2 },
      { id: 'p3', pilar: 'saber_hacer', objetivoEstrategico: 'Excelencia en el modelo de servicio', texto: 'En que grado la persona aporta a brindar experiencias claras, oportunas y de calidad a los clientes internos o externos.', tipoPregunta: 'escala_5', pesoPregunta: 9.5, escalaCalificacion: [{ valor: 5, porcentaje: 9.5 }, { valor: 4, porcentaje: 7.6 }, { valor: 3, porcentaje: 5.7 }, { valor: 2, porcentaje: 3.8 }, { valor: 1, porcentaje: 1.9 }], requerida: true, orden: 3 },
      { id: 'p4', pilar: 'saber_hacer', objetivoEstrategico: 'Fortalecimiento de productos digitales y tecnologia', texto: 'En que medida la persona apoya, promueve o utiliza de manera efectiva las herramientas digitales y tecnologicas para mejorar su labor y los resultados de la empresa.', tipoPregunta: 'escala_5', pesoPregunta: 9.5, escalaCalificacion: [{ valor: 5, porcentaje: 9.5 }, { valor: 4, porcentaje: 7.6 }, { valor: 3, porcentaje: 5.7 }, { valor: 2, porcentaje: 3.8 }, { valor: 1, porcentaje: 1.9 }], requerida: true, orden: 4 },
      { id: 'p5', pilar: 'saber_hacer', objetivoEstrategico: 'Cultura de excelencia y desarrollo del talento', texto: 'En que grado la persona, a traves de la calidad de su trabajo y su disposicion a compartir conocimientos, impulsa la mejora continua y el desarrollo propio y de los demas dentro de la organizacion.', tipoPregunta: 'escala_5', pesoPregunta: 10.5, escalaCalificacion: [{ valor: 5, porcentaje: 10.5 }, { valor: 4, porcentaje: 8.4 }, { valor: 3, porcentaje: 6.3 }, { valor: 2, porcentaje: 4.2 }, { valor: 1, porcentaje: 2.1 }], requerida: true, orden: 5 },
      { id: 'p6', pilar: 'especifico', objetivoEstrategico: 'Implementacion y mejora de mecanismos de seguridad', texto: 'Con que frecuencia la persona ha contribuido en la busqueda, implementacion y/o mejora de mecanismos, soluciones o medidas de tratamiento que mitiguen los riesgos en el manejo de la informacion?', tipoPregunta: 'escala_5', pesoPregunta: 7, totalPilar: 40, escalaCalificacion: [{ valor: 5, porcentaje: 7 }, { valor: 4, porcentaje: 6 }, { valor: 3, porcentaje: 4 }, { valor: 2, porcentaje: 3 }, { valor: 1, porcentaje: 1 }], requerida: true, orden: 6 },
      { id: 'p7', pilar: 'especifico', objetivoEstrategico: 'Inclusion de la seguridad en el diseno de iniciativas', texto: 'En que medida la persona, ha logrado involucrarse o involucrar a otras personas de la compania en la incorporacion de la seguridad desde el diseno de iniciativas y productos que soportan el modelo de negocio?', tipoPregunta: 'escala_5', pesoPregunta: 11, escalaCalificacion: [{ valor: 5, porcentaje: 11 }, { valor: 4, porcentaje: 9 }, { valor: 3, porcentaje: 7 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 7 },
      { id: 'p8', pilar: 'especifico', objetivoEstrategico: 'Gestion de riesgos y sostenibilidad organizacional', texto: 'En que proporcion la persona ha aportado a la sostenibilidad de Sistecredito al notificar o gestionar riesgos relacionados con la proteccion de la informacion?', tipoPregunta: 'escala_5', pesoPregunta: 11, escalaCalificacion: [{ valor: 5, porcentaje: 11 }, { valor: 4, porcentaje: 9 }, { valor: 3, porcentaje: 7 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 8 },
      { id: 'p9', pilar: 'especifico', objetivoEstrategico: 'Fortalecimiento del conocimiento y cultura en seguridad', texto: 'En que grado la persona ha trabajado por aumentar o mejorar sus conocimientos y habilidades en materia de seguridad de la informacion?', tipoPregunta: 'escala_5', pesoPregunta: 11, escalaCalificacion: [{ valor: 5, porcentaje: 11 }, { valor: 4, porcentaje: 9 }, { valor: 3, porcentaje: 7 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 9 },
    ],
    createdAt: '2026-01-15',
    updatedAt: '2026-04-01',
    createdBy: 'Deisy Restrepo',
  })
  
  // Encuesta Lider al Lider - Presidencia (Alvaro Villegas)
  encuestas.push({
    id: 'enc2',
    nombre: 'Evaluacion Lider al Lider - Presidencia',
    descripcion: 'Evaluacion del presidente a sus lideres directos.',
    tipo: 'lider_lider',
    version: '1.0',
    estado: 'activa',
    esPlantilla: false,
    aplicaAreas: ['Presidencia'],
    preguntas: [
      { id: 'p10', pilar: 'ser', texto: 'En que medida actua de forma coherente con la cultura organizacional y es ejemplo de los valores de la compania en sus decisiones y comportamientos diarios, promoviendo y reconociendo conductas alineadas?', tipoPregunta: 'escala_5', pesoPregunta: 20, totalPilar: 20, escalaCalificacion: [{ valor: 5, porcentaje: 20 }, { valor: 4, porcentaje: 16 }, { valor: 3, porcentaje: 12 }, { valor: 2, porcentaje: 8 }, { valor: 1, porcentaje: 4 }], requerida: true, orden: 1 },
      { id: 'p11', pilar: 'saber_hacer', objetivoEstrategico: 'Transformacion de procesos y sostenibilidad financiera', texto: 'En que medida lidera la identificacion y ejecucion de mejoras y automatizaciones de procesos, moviliza al equipo para adoptarlas de forma agil, colaborativa, hace seguimiento a KPIs de eficiencia?', tipoPregunta: 'escala_5', pesoPregunta: 10.5, totalPilar: 40, escalaCalificacion: [{ valor: 5, porcentaje: 10.5 }, { valor: 4, porcentaje: 8.4 }, { valor: 3, porcentaje: 6.3 }, { valor: 2, porcentaje: 4.2 }, { valor: 1, porcentaje: 2.1 }], requerida: true, orden: 2 },
      { id: 'p12', pilar: 'saber_hacer', objetivoEstrategico: 'Excelencia en el modelo de servicio', texto: 'En que grado conecta al equipo con el proposito de brindar una experiencia excepcional al cliente, comunica y empodera para cumplir ANS y elevar NPS/eNPS de manera sostenida?', tipoPregunta: 'escala_5', pesoPregunta: 9.5, escalaCalificacion: [{ valor: 5, porcentaje: 9.5 }, { valor: 4, porcentaje: 7.6 }, { valor: 3, porcentaje: 5.7 }, { valor: 2, porcentaje: 3.8 }, { valor: 1, porcentaje: 1.9 }], requerida: true, orden: 3 },
      { id: 'p13', pilar: 'saber_hacer', objetivoEstrategico: 'Fortalecimiento de productos digitales y tecnologia', texto: 'En que medida fortalece y evoluciona las capacidades, herramientas y procesos de su area alineando metas de valor para el negocio y el cliente?', tipoPregunta: 'escala_5', pesoPregunta: 9.5, escalaCalificacion: [{ valor: 5, porcentaje: 9.5 }, { valor: 4, porcentaje: 7.6 }, { valor: 3, porcentaje: 5.7 }, { valor: 2, porcentaje: 3.8 }, { valor: 1, porcentaje: 1.9 }], requerida: true, orden: 4 },
      { id: 'p14', pilar: 'saber_hacer', objetivoEstrategico: 'Cultura de excelencia y desarrollo del talento', texto: 'En que medida desarrolla y reconoce el talento en su equipo, promoviendo el aprendizaje continuo, la colaboracion y la mejora profesional?', tipoPregunta: 'escala_5', pesoPregunta: 10.5, escalaCalificacion: [{ valor: 5, porcentaje: 10.5 }, { valor: 4, porcentaje: 8.4 }, { valor: 3, porcentaje: 6.3 }, { valor: 2, porcentaje: 4.2 }, { valor: 1, porcentaje: 2.1 }], requerida: true, orden: 5 },
      { id: 'p15', pilar: 'especifico', objetivoEstrategico: 'Alineacion estrategica y priorizacion ejecutiva', texto: 'En que medida traduce las directrices de la Presidencia en planes de accion claros, prioriza correctamente las iniciativas de su area y asegura que los esfuerzos se enfoquen en los temas de mayor impacto?', tipoPregunta: 'escala_5', pesoPregunta: 12, totalPilar: 40, escalaCalificacion: [{ valor: 5, porcentaje: 12 }, { valor: 4, porcentaje: 10 }, { valor: 3, porcentaje: 7 }, { valor: 2, porcentaje: 5 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 6 },
      { id: 'p16', pilar: 'especifico', objetivoEstrategico: 'Gobierno, control y cumplimiento organizacional', texto: 'En que medida establece, monitorea y ajusta mecanismos de control que aseguran el cumplimiento normativo, la gestion adecuada de riesgos y la transparencia?', tipoPregunta: 'escala_5', pesoPregunta: 8, escalaCalificacion: [{ valor: 5, porcentaje: 8 }, { valor: 4, porcentaje: 6 }, { valor: 3, porcentaje: 5 }, { valor: 2, porcentaje: 3 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 7 },
      { id: 'p17', pilar: 'especifico', objetivoEstrategico: 'Articulacion interareas y toma de decisiones corporativas', texto: 'En que medida coordina su gestion con otras areas de la organizacion, participa activamente en decisiones de nivel corporativo y contribuye a soluciones integrales?', tipoPregunta: 'escala_5', pesoPregunta: 10, escalaCalificacion: [{ valor: 5, porcentaje: 10 }, { valor: 4, porcentaje: 8 }, { valor: 3, porcentaje: 6 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 8 },
      { id: 'p18', pilar: 'especifico', objetivoEstrategico: 'Seguimiento a resultados y rendicion de cuentas', texto: 'En que medida realiza seguimiento periodico a los compromisos de su area, analiza desviaciones, implementa acciones correctivas y rinde cuentas claras?', tipoPregunta: 'escala_5', pesoPregunta: 10, escalaCalificacion: [{ valor: 5, porcentaje: 10 }, { valor: 4, porcentaje: 8 }, { valor: 3, porcentaje: 6 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 9 },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-03-20',
    createdBy: 'Luisa Cano',
  })
  
  // Encuesta Lider-Colaborador - Auditoria (Anyelli Piedrahita)
  encuestas.push({
    id: 'enc3',
    nombre: 'Evaluacion Lider-Colaborador - Auditoria',
    descripcion: 'Evaluacion del lider a colaboradores del area de Auditoria.',
    tipo: 'lider_colaborador',
    version: '1.0',
    estado: 'activa',
    esPlantilla: false,
    aplicaAreas: ['Auditoria'],
    preguntas: [
      { id: 'p19', pilar: 'ser', texto: 'En que grado la persona es ejemplo de los valores de la organizacion y, a traves de sus comportamientos diarios, inspira y fortalece una cultura de integridad, colaboracion y excelencia.', tipoPregunta: 'escala_5', pesoPregunta: 20, totalPilar: 20, escalaCalificacion: [{ valor: 5, porcentaje: 20 }, { valor: 4, porcentaje: 16 }, { valor: 3, porcentaje: 12 }, { valor: 2, porcentaje: 8 }, { valor: 1, porcentaje: 4 }], requerida: true, orden: 1 },
      { id: 'p20', pilar: 'saber_hacer', objetivoEstrategico: 'Transformacion de procesos y sostenibilidad financiera', texto: 'En que medida la persona contribuye a identificar, proponer o aplicar mejoras en los procesos que aseguren eficiencia y un uso responsable de los recursos de la organizacion.', tipoPregunta: 'escala_5', pesoPregunta: 10.5, totalPilar: 40, escalaCalificacion: [{ valor: 5, porcentaje: 10.5 }, { valor: 4, porcentaje: 8.4 }, { valor: 3, porcentaje: 6.3 }, { valor: 2, porcentaje: 4.2 }, { valor: 1, porcentaje: 2.1 }], requerida: true, orden: 2 },
      { id: 'p21', pilar: 'especifico', objetivoEstrategico: 'Conocimiento tecnico y actualizacion profesional', texto: 'En que medida la persona demuestra conocimiento actualizado sobre normativas, riesgos y mejores practicas en auditoria, y su aplicacion en sus actividades diarias?', tipoPregunta: 'escala_5', pesoPregunta: 10, totalPilar: 40, escalaCalificacion: [{ valor: 5, porcentaje: 10 }, { valor: 4, porcentaje: 8 }, { valor: 3, porcentaje: 6 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 6 },
      { id: 'p22', pilar: 'especifico', objetivoEstrategico: 'Aporte a la mejora y toma de decisiones estrategicas', texto: 'En que grado la persona contribuye con sus recomendaciones a la mejora de procesos internos y a la toma de decisiones estrategicas dentro de la organizacion?', tipoPregunta: 'escala_5', pesoPregunta: 10, escalaCalificacion: [{ valor: 5, porcentaje: 10 }, { valor: 4, porcentaje: 8 }, { valor: 3, porcentaje: 6 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 7 },
      { id: 'p23', pilar: 'especifico', objetivoEstrategico: 'Ejecucion y seguimiento del plan de auditoria', texto: 'En que medida la persona es eficiente en la planificacion, ejecucion y seguimiento de auditorias, asegurando calidad, oportunidad y cumplimiento de los objetivos del plan anual?', tipoPregunta: 'escala_5', pesoPregunta: 10, escalaCalificacion: [{ valor: 5, porcentaje: 10 }, { valor: 4, porcentaje: 8 }, { valor: 3, porcentaje: 6 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 8 },
      { id: 'p24', pilar: 'especifico', objetivoEstrategico: 'Etica, cumplimiento y cultura de transparencia', texto: 'En que grado la persona promueve comportamientos eticos, el cumplimiento de politicas internas y el fortalecimiento de una cultura de transparencia y mejora continua?', tipoPregunta: 'escala_5', pesoPregunta: 10, escalaCalificacion: [{ valor: 5, porcentaje: 10 }, { valor: 4, porcentaje: 8 }, { valor: 3, porcentaje: 6 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 9 },
    ],
    createdAt: '2026-02-01',
    updatedAt: '2026-04-10',
    createdBy: 'Deisy Restrepo',
  })
  
  // Encuesta Lider-Colaborador - Sostenibilidad (Sandra Roldan y Deissy Carmona)
  encuestas.push({
    id: 'enc4',
    nombre: 'Evaluacion Lider-Colaborador - Sostenibilidad',
    descripcion: 'Evaluacion del lider a colaboradores del area de Sostenibilidad y RSE.',
    tipo: 'lider_colaborador',
    version: '1.0',
    estado: 'activa',
    esPlantilla: false,
    aplicaAreas: ['Sostenibilidad'],
    preguntas: [
      { id: 'p25', pilar: 'ser', texto: 'En que grado la persona es ejemplo de los valores de la organizacion y, a traves de sus comportamientos diarios, inspira y fortalece una cultura de integridad, colaboracion y excelencia.', tipoPregunta: 'escala_5', pesoPregunta: 20, totalPilar: 20, escalaCalificacion: [{ valor: 5, porcentaje: 20 }, { valor: 4, porcentaje: 16 }, { valor: 3, porcentaje: 12 }, { valor: 2, porcentaje: 8 }, { valor: 1, porcentaje: 4 }], requerida: true, orden: 1 },
      { id: 'p26', pilar: 'especifico', objetivoEstrategico: 'Cumplimiento y apoyo en la ejecucion', texto: 'En que medida contribuyes a la correcta implementacion de programas e iniciativas del Sostenibilidad y RSE, asegurando el cumplimiento de los objetivos y actividades asignadas?', tipoPregunta: 'escala_5', pesoPregunta: 10, totalPilar: 40, escalaCalificacion: [{ valor: 5, porcentaje: 10 }, { valor: 4, porcentaje: 8 }, { valor: 3, porcentaje: 6 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 6 },
      { id: 'p27', pilar: 'especifico', objetivoEstrategico: 'Seguimiento y calidad de la informacion', texto: 'En que medida la persona contribuye a la recopilacion, organizacion y reporte oportuno de informacion que facilite la toma de decisiones y garantice la transparencia?', tipoPregunta: 'escala_5', pesoPregunta: 10, escalaCalificacion: [{ valor: 5, porcentaje: 10 }, { valor: 4, porcentaje: 8 }, { valor: 3, porcentaje: 6 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 7 },
      { id: 'p28', pilar: 'especifico', objetivoEstrategico: 'Conocimiento en sostenibilidad y RSE', texto: 'En que medida la persona demuestra apropiacion de los conocimientos en sostenibilidad y responsabilidad social empresarial (RSE) y los aplica de manera efectiva?', tipoPregunta: 'escala_5', pesoPregunta: 10, escalaCalificacion: [{ valor: 5, porcentaje: 10 }, { valor: 4, porcentaje: 8 }, { valor: 3, porcentaje: 6 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 8 },
      { id: 'p29', pilar: 'especifico', objetivoEstrategico: 'Comunicacion y trabajo colaborativo en sostenibilidad', texto: 'En que grado la persona establece relaciones de colaboracion con otros equipos para asegurar la correcta ejecucion de proyectos y promover la movilizacion cultural en torno a la RSE?', tipoPregunta: 'escala_5', pesoPregunta: 10, escalaCalificacion: [{ valor: 5, porcentaje: 10 }, { valor: 4, porcentaje: 8 }, { valor: 3, porcentaje: 6 }, { valor: 2, porcentaje: 4 }, { valor: 1, porcentaje: 2 }], requerida: true, orden: 9 },
    ],
    createdAt: '2026-02-15',
    updatedAt: '2026-04-05',
    createdBy: 'Deisy Restrepo',
  })
  
  // Plantilla base - Autoevaluacion
  encuestas.push({
    id: 'enc5',
    nombre: 'Autoevaluacion - Plantilla Base',
    descripcion: 'Plantilla base para autoevaluaciones de desempeno.',
    tipo: 'autoevaluacion',
    version: '1.0',
    estado: 'activa',
    esPlantilla: true,
    preguntas: [
      { id: 'p30', pilar: 'ser', texto: 'Como evaluas tu alineacion con los valores y cultura organizacional en tu trabajo diario?', tipoPregunta: 'escala_5', pesoPregunta: 20, totalPilar: 20, escalaCalificacion: [{ valor: 5, porcentaje: 20 }, { valor: 4, porcentaje: 16 }, { valor: 3, porcentaje: 12 }, { valor: 2, porcentaje: 8 }, { valor: 1, porcentaje: 4 }], requerida: true, orden: 1 },
      { id: 'p31', pilar: 'saber_hacer', texto: 'Como calificas tu contribucion a la mejora de procesos y eficiencia en tu area?', tipoPregunta: 'escala_5', pesoPregunta: 20, totalPilar: 40, escalaCalificacion: [{ valor: 5, porcentaje: 20 }, { valor: 4, porcentaje: 16 }, { valor: 3, porcentaje: 12 }, { valor: 2, porcentaje: 8 }, { valor: 1, porcentaje: 4 }], requerida: true, orden: 2 },
      { id: 'p32', pilar: 'saber_hacer', texto: 'Como evaluas la calidad de tu trabajo y cumplimiento de objetivos?', tipoPregunta: 'escala_5', pesoPregunta: 20, escalaCalificacion: [{ valor: 5, porcentaje: 20 }, { valor: 4, porcentaje: 16 }, { valor: 3, porcentaje: 12 }, { valor: 2, porcentaje: 8 }, { valor: 1, porcentaje: 4 }], requerida: true, orden: 3 },
      { id: 'p33', pilar: 'especifico', texto: 'Que fortalezas consideras que te destacan en tu rol actual?', tipoPregunta: 'texto_abierto', pesoPregunta: 20, totalPilar: 40, requerida: true, orden: 4 },
      { id: 'p34', pilar: 'especifico', texto: 'En que areas consideras que necesitas mejorar o desarrollarte?', tipoPregunta: 'texto_abierto', pesoPregunta: 20, requerida: true, orden: 5 },
    ],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    createdBy: 'Sistema',
  })
  
  return encuestas
}

export function getLanzamientosMock(encuestas: Encuesta[], talentos: Talento[]): LanzamientoEncuesta[] {
  const lanzamientos: LanzamientoEncuesta[] = []
  
  // Lanzamiento 1 - Evaluacion Seguridad Q1 2026
  lanzamientos.push({
    id: 'lanz1',
    encuestaId: 'enc1',
    encuesta: encuestas.find(e => e.id === 'enc1'),
    nombre: 'Evaluacion Seguridad Q1 2026',
    fechaInicio: '2026-03-01',
    fechaFin: '2026-03-31',
    estado: 'cerrado',
    recordatorios: [
      { fecha: '2026-03-15', enviado: true },
      { fecha: '2026-03-25', enviado: true },
    ],
    filtroArea: ['Seguridad de la Informacion'],
    participantes: [
      { id: 'part1', talentoId: 't1', talento: talentos[0], evaluadorId: 'l1', evaluador: talentos.find(t => t.id === 'l1')!, estado: 'completado', fechaInicio: '2026-03-05', fechaCompletado: '2026-03-20', respuestas: [{ id: 'r1', preguntaId: 'p1', valor: 4 }, { id: 'r2', preguntaId: 'p2', valor: 3 }], puntajeTotal: 75, requierePlanMejora: false },
      { id: 'part2', talentoId: 't2', talento: talentos[1], evaluadorId: 'l1', evaluador: talentos.find(t => t.id === 'l1')!, estado: 'completado', fechaInicio: '2026-03-10', fechaCompletado: '2026-03-22', respuestas: [{ id: 'r3', preguntaId: 'p1', valor: 5 }, { id: 'r4', preguntaId: 'p2', valor: 4 }], puntajeTotal: 88, requierePlanMejora: false },
      { id: 'part3', talentoId: 't3', talento: talentos[2], evaluadorId: 'l1', evaluador: talentos.find(t => t.id === 'l1')!, estado: 'completado', fechaInicio: '2026-03-08', fechaCompletado: '2026-03-18', respuestas: [{ id: 'r5', preguntaId: 'p1', valor: 3 }, { id: 'r6', preguntaId: 'p2', valor: 2 }], puntajeTotal: 58, requierePlanMejora: true, planMejoraCreado: true, planMejoraId: 'p1' },
    ],
    createdAt: '2026-02-25',
    createdBy: 'Deisy Restrepo',
  })
  
  // Lanzamiento 2 - Evaluacion Lider al Lider Q1 2026
  lanzamientos.push({
    id: 'lanz2',
    encuestaId: 'enc2',
    encuesta: encuestas.find(e => e.id === 'enc2'),
    nombre: 'Evaluacion Lider al Lider Q1 2026',
    fechaInicio: '2026-04-01',
    fechaFin: '2026-04-30',
    estado: 'en_curso',
    recordatorios: [
      { fecha: '2026-04-15', enviado: true },
      { fecha: '2026-04-25', enviado: false },
    ],
    filtroArea: ['Presidencia'],
    participantes: [
      { id: 'part4', talentoId: 'l1', talento: talentos.find(t => t.id === 'l1')!, evaluadorId: 'pres1', estado: 'completado', fechaInicio: '2026-04-05', fechaCompletado: '2026-04-12', respuestas: [], puntajeTotal: 82, requierePlanMejora: false },
      { id: 'part5', talentoId: 'l2', talento: talentos.find(t => t.id === 'l2')!, evaluadorId: 'pres1', estado: 'en_progreso', fechaInicio: '2026-04-10', respuestas: [], requierePlanMejora: false },
      { id: 'part6', talentoId: 'l3', talento: talentos.find(t => t.id === 'l3')!, evaluadorId: 'pres1', estado: 'pendiente', respuestas: [], requierePlanMejora: false },
    ],
    createdAt: '2026-03-25',
    createdBy: 'Luisa Cano',
  })
  
  // Lanzamiento 3 - Evaluacion Auditoria Q2 2026
  lanzamientos.push({
    id: 'lanz3',
    encuestaId: 'enc3',
    encuesta: encuestas.find(e => e.id === 'enc3'),
    nombre: 'Evaluacion Auditoria Q2 2026',
    fechaInicio: '2026-05-01',
    fechaFin: '2026-05-31',
    estado: 'pendiente',
    recordatorios: [],
    filtroArea: ['Auditoria'],
    participantes: [],
    createdAt: '2026-04-20',
    createdBy: 'Deisy Restrepo',
  })
  
  return lanzamientos
}
