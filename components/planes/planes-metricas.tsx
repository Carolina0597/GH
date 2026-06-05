'use client'

import { useMemo } from 'react'
import { useForgeStore, type Plan, roleLabels } from '@/lib/store'
import { ForgeCard, ForgeCardHeader, StatCard, ProgressBar, ForgeBadge } from '@/components/forge/forge-ui'
import { cn } from '@/lib/utils'
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle, Clock,
  Users, Target, GraduationCap, Building, BarChart3
} from 'lucide-react'

interface PlanesMetricasProps {
  planes: Plan[]
}

export function PlanesMetricas({ planes }: PlanesMetricasProps) {
  const { currentRole, talentos, lideres } = useForgeStore()
  
  const metricas = useMemo(() => {
    const activos = planes.filter(p => ['activo', 'en_progreso', 'ampliado'].includes(p.estado))
    const enRiesgo = planes.filter(p => p.estado === 'en_riesgo' || p.criticidad === 'critica')
    const cerradosSuperados = planes.filter(p => p.estado === 'cerrado_superado')
    const cerradosNoSuperados = planes.filter(p => p.estado === 'cerrado_no_superado')
    const mejora = planes.filter(p => p.tipo === 'mejora')
    const desarrollo = planes.filter(p => p.tipo === 'desarrollo')
    const ampliados = planes.filter(p => p.estado === 'ampliado')
    const conForPlus = planes.filter(p => p.solicitudForPlus && p.solicitudForPlus.estado !== 'no_solicitada')
    const seguimientosVencidos = planes.filter(p => p.estado === 'seguimiento_vencido')
    
    // Por eje
    const porEje = {
      ser: planes.filter(p => p.ejePrincipal === 'ser').length,
      saber: planes.filter(p => p.ejePrincipal === 'saber').length,
      hacer: planes.filter(p => p.ejePrincipal === 'hacer').length,
    }
    
    // Por criticidad
    const porCriticidad = {
      baja: planes.filter(p => p.criticidad === 'baja').length,
      media: planes.filter(p => p.criticidad === 'media').length,
      alta: planes.filter(p => p.criticidad === 'alta').length,
      critica: planes.filter(p => p.criticidad === 'critica').length,
    }
    
    // Por lider (top 5)
    const porLider = lideres.map(l => ({
      nombre: l.nombre,
      count: planes.filter(p => p.liderId === l.id && !p.estado.startsWith('cerrado')).length,
    })).sort((a, b) => b.count - a.count).slice(0, 5)
    
    // Por area
    const areas = [...new Set(planes.map(p => p.talento.area))]
    const porArea = areas.map(area => ({
      nombre: area,
      count: planes.filter(p => p.talento.area === area && !p.estado.startsWith('cerrado')).length,
    })).sort((a, b) => b.count - a.count)
    
    // Avance promedio
    const avancePromedio = activos.length > 0 
      ? Math.round(activos.reduce((acc, p) => acc + p.avance, 0) / activos.length) 
      : 0
    
    // Talentos que requieren atencion
    const talentosEnRiesgo = planes
      .filter(p => (p.estado === 'en_riesgo' || p.criticidad === 'alta' || p.criticidad === 'critica') && !p.estado.startsWith('cerrado'))
      .map(p => ({
        talento: p.talento.nombre,
        tipo: p.tipo,
        estado: p.estado,
        avance: p.avance,
        diasRestantes: Math.ceil((new Date(p.fechaFinInicial).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        planId: p.id,
      }))
      .slice(0, 10)
    
    return {
      total: planes.length,
      activos: activos.length,
      enRiesgo: enRiesgo.length,
      cerradosSuperados: cerradosSuperados.length,
      cerradosNoSuperados: cerradosNoSuperados.length,
      mejora: mejora.length,
      desarrollo: desarrollo.length,
      ampliados: ampliados.length,
      conForPlus: conForPlus.length,
      seguimientosVencidos: seguimientosVencidos.length,
      avancePromedio,
      porEje,
      porCriticidad,
      porLider,
      porArea,
      talentosEnRiesgo,
      tasaExito: cerradosSuperados.length + cerradosNoSuperados.length > 0
        ? Math.round((cerradosSuperados.length / (cerradosSuperados.length + cerradosNoSuperados.length)) * 100)
        : 0,
    }
  }, [planes, lideres])

  // Vista para Talento
  if (currentRole === 'talento') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Mis planes activos" value={metricas.activos} color="primary" />
          <StatCard label="Planes de mejora" value={metricas.mejora} color="warning" />
          <StatCard label="Planes de desarrollo" value={metricas.desarrollo} color="success" />
          <StatCard label="Avance promedio" value={`${metricas.avancePromedio}%`} color="primary" />
        </div>
        
        <ForgeCard>
          <ForgeCardHeader title="Progreso de mis planes" />
          <div className="space-y-4">
            {planes.filter(p => !p.estado.startsWith('cerrado')).map(plan => (
              <div key={plan.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{plan.subtipo}</span>
                    <span className="text-sm text-primary">{plan.avance}%</span>
                  </div>
                  <ProgressBar value={plan.avance} color={plan.avance >= 75 ? 'success' : plan.avance >= 50 ? 'primary' : 'warning'} />
                </div>
                <ForgeBadge variant={plan.tipo === 'mejora' ? 'yellow' : 'green'}>
                  {plan.tipo}
                </ForgeBadge>
              </div>
            ))}
          </div>
        </ForgeCard>
      </div>
    )
  }

  // Vista para Lider
  if (currentRole === 'lider') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard label="Planes de mi equipo" value={metricas.activos} color="primary" />
          <StatCard label="Planes de mejora" value={metricas.mejora} color="warning" />
          <StatCard label="Planes de desarrollo" value={metricas.desarrollo} color="success" />
          <StatCard label="En riesgo" value={metricas.enRiesgo} color="accent" />
          <StatCard label="Seguimientos pendientes" value={metricas.seguimientosVencidos} color="warning" />
          <StatCard label="Avance promedio" value={`${metricas.avancePromedio}%`} color="primary" />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <ForgeCard>
            <ForgeCardHeader title="Planes por tipo" />
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Mejora</span>
                  <span className="text-sm font-medium">{metricas.mejora}</span>
                </div>
                <ProgressBar value={(metricas.mejora / (metricas.total || 1)) * 100} color="warning" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Desarrollo</span>
                  <span className="text-sm font-medium">{metricas.desarrollo}</span>
                </div>
                <ProgressBar value={(metricas.desarrollo / (metricas.total || 1)) * 100} color="success" />
              </div>
            </div>
          </ForgeCard>
          
          <ForgeCard>
            <ForgeCardHeader title="Planes por eje" />
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Ser</span>
                  <span className="text-sm font-medium">{metricas.porEje.ser}</span>
                </div>
                <div className="h-2 bg-purple-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(metricas.porEje.ser / (metricas.total || 1)) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Saber</span>
                  <span className="text-sm font-medium">{metricas.porEje.saber}</span>
                </div>
                <div className="h-2 bg-blue-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(metricas.porEje.saber / (metricas.total || 1)) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Hacer</span>
                  <span className="text-sm font-medium">{metricas.porEje.hacer}</span>
                </div>
                <div className="h-2 bg-green-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${(metricas.porEje.hacer / (metricas.total || 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </ForgeCard>
        </div>
        
        {metricas.talentosEnRiesgo.length > 0 && (
          <ForgeCard>
            <ForgeCardHeader title="Talentos que requieren atencion" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Talento</th>
                    <th className="pb-2 font-medium text-muted-foreground">Tipo</th>
                    <th className="pb-2 font-medium text-muted-foreground">Estado</th>
                    <th className="pb-2 font-medium text-muted-foreground">Avance</th>
                    <th className="pb-2 font-medium text-muted-foreground">Dias restantes</th>
                  </tr>
                </thead>
                <tbody>
                  {metricas.talentosEnRiesgo.map((t, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 font-medium">{t.talento}</td>
                      <td className="py-2">
                        <ForgeBadge variant={t.tipo === 'mejora' ? 'yellow' : 'green'}>{t.tipo}</ForgeBadge>
                      </td>
                      <td className="py-2">
                        <ForgeBadge variant="red">{t.estado}</ForgeBadge>
                      </td>
                      <td className="py-2">{t.avance}%</td>
                      <td className={cn("py-2", t.diasRestantes <= 7 ? "text-warning" : t.diasRestantes <= 0 ? "text-destructive" : "")}>
                        {t.diasRestantes > 0 ? t.diasRestantes : `Vencido (${Math.abs(t.diasRestantes)})`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ForgeCard>
        )}
      </div>
    )
  }

  // Vista para GH y PeopleOps
  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard label="Total planes activos" value={metricas.activos} color="primary" />
        <StatCard label="Planes de mejora" value={metricas.mejora} color="warning" />
        <StatCard label="Planes de desarrollo" value={metricas.desarrollo} color="success" />
        <StatCard label="En riesgo" value={metricas.enRiesgo} color="accent" />
        <StatCard label="Cerrados superados" value={metricas.cerradosSuperados} color="success" />
        <StatCard label="Cerrados no superados" value={metricas.cerradosNoSuperados} color="accent" />
        <StatCard label="Tasa de exito" value={`${metricas.tasaExito}%`} color="primary" />
      </div>
      
      {/* Segunda fila de KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard label="Planes ampliados" value={metricas.ampliados} color="warning" />
        <StatCard label="Seguimientos vencidos" value={metricas.seguimientosVencidos} color="accent" />
        <StatCard label="Solicitudes For+" value={metricas.conForPlus} color="primary" />
        <StatCard label="Avance promedio" value={`${metricas.avancePromedio}%`} color="primary" />
        <StatCard label="Total historico" value={metricas.total} color="primary" />
      </div>
      
      {/* Graficas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Por tipo */}
        <ForgeCard>
          <ForgeCardHeader title="Planes por tipo" subtitle="Mejora vs Desarrollo" />
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">Mejora</span>
                </div>
                <span className="text-sm font-medium">{metricas.mejora} ({Math.round((metricas.mejora / (metricas.total || 1)) * 100)}%)</span>
              </div>
              <ProgressBar value={(metricas.mejora / (metricas.total || 1)) * 100} color="warning" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">Desarrollo</span>
                </div>
                <span className="text-sm font-medium">{metricas.desarrollo} ({Math.round((metricas.desarrollo / (metricas.total || 1)) * 100)}%)</span>
              </div>
              <ProgressBar value={(metricas.desarrollo / (metricas.total || 1)) * 100} color="success" />
            </div>
          </div>
        </ForgeCard>
        
        {/* Por eje */}
        <ForgeCard>
          <ForgeCardHeader title="Planes por eje" subtitle="Ser / Saber / Hacer" />
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-400">Ser</span>
                <span className="text-sm font-medium">{metricas.porEje.ser}</span>
              </div>
              <div className="h-2 bg-purple-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${(metricas.porEje.ser / (metricas.total || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-400">Saber</span>
                <span className="text-sm font-medium">{metricas.porEje.saber}</span>
              </div>
              <div className="h-2 bg-blue-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(metricas.porEje.saber / (metricas.total || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-400">Hacer</span>
                <span className="text-sm font-medium">{metricas.porEje.hacer}</span>
              </div>
              <div className="h-2 bg-green-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(metricas.porEje.hacer / (metricas.total || 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        </ForgeCard>
        
        {/* Por criticidad */}
        <ForgeCard>
          <ForgeCardHeader title="Planes por criticidad" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Baja</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${(metricas.porCriticidad.baja / (metricas.total || 1)) * 100}%` }} />
                </div>
                <span className="text-sm font-medium w-6">{metricas.porCriticidad.baja}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Media</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(metricas.porCriticidad.media / (metricas.total || 1)) * 100}%` }} />
                </div>
                <span className="text-sm font-medium w-6">{metricas.porCriticidad.media}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Alta</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${(metricas.porCriticidad.alta / (metricas.total || 1)) * 100}%` }} />
                </div>
                <span className="text-sm font-medium w-6">{metricas.porCriticidad.alta}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Critica</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(metricas.porCriticidad.critica / (metricas.total || 1)) * 100}%` }} />
                </div>
                <span className="text-sm font-medium w-6">{metricas.porCriticidad.critica}</span>
              </div>
            </div>
          </div>
        </ForgeCard>
      </div>
      
      {/* Tablas */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Por lider */}
        <ForgeCard>
          <ForgeCardHeader title="Planes por lider" subtitle="Top 5 con mas planes activos" />
          <div className="space-y-3">
            {metricas.porLider.map((l, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <span className="text-sm">{l.nombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-surface-3 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(l.count / (metricas.porLider[0]?.count || 1)) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium w-6">{l.count}</span>
                </div>
              </div>
            ))}
          </div>
        </ForgeCard>
        
        {/* Por area */}
        <ForgeCard>
          <ForgeCardHeader title="Planes por area" />
          <div className="space-y-3">
            {metricas.porArea.map((a, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{a.nombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-surface-3 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(a.count / (metricas.porArea[0]?.count || 1)) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium w-6">{a.count}</span>
                </div>
              </div>
            ))}
          </div>
        </ForgeCard>
      </div>
      
      {/* Alertas organizacionales */}
      {metricas.talentosEnRiesgo.length > 0 && (
        <ForgeCard>
          <ForgeCardHeader 
            title="Alertas organizacionales" 
            subtitle="Talentos con planes en riesgo o alta criticidad"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-muted-foreground">Talento</th>
                  <th className="pb-2 font-medium text-muted-foreground">Tipo</th>
                  <th className="pb-2 font-medium text-muted-foreground">Estado</th>
                  <th className="pb-2 font-medium text-muted-foreground">Avance</th>
                  <th className="pb-2 font-medium text-muted-foreground">Dias</th>
                  <th className="pb-2 font-medium text-muted-foreground">Accion recomendada</th>
                </tr>
              </thead>
              <tbody>
                {metricas.talentosEnRiesgo.map((t, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 font-medium">{t.talento}</td>
                    <td className="py-2">
                      <ForgeBadge variant={t.tipo === 'mejora' ? 'yellow' : 'green'}>{t.tipo}</ForgeBadge>
                    </td>
                    <td className="py-2">
                      <ForgeBadge variant="red">{t.estado}</ForgeBadge>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={t.avance} color={t.avance < 50 ? 'warning' : 'primary'} className="w-16" />
                        <span>{t.avance}%</span>
                      </div>
                    </td>
                    <td className={cn("py-2", t.diasRestantes <= 0 ? "text-destructive font-medium" : t.diasRestantes <= 7 ? "text-warning" : "")}>
                      {t.diasRestantes > 0 ? `${t.diasRestantes} dias` : `Vencido`}
                    </td>
                    <td className="py-2 text-xs">
                      {t.diasRestantes <= 0 
                        ? 'Agendar seguimiento urgente'
                        : t.avance < 30 
                          ? 'Revisar plan con lider'
                          : 'Monitorear avance'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ForgeCard>
      )}
      
      {currentRole === 'gh' && (
        <ForgeCard className="bg-blue-500/5 border-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-blue-400 mb-1">Nota de auditoria</h4>
              <p className="text-sm text-muted-foreground">
                Validar politica de retencion de informacion. El historico de desempeno podria requerir conservacion de largo plazo. 
                Los planes cerrados quedan guardados en historico y pueden descargarse para auditorias.
              </p>
            </div>
          </div>
        </ForgeCard>
      )}
    </div>
  )
}
