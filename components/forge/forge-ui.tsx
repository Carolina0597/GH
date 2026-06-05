import { cn } from '@/lib/utils'

interface ForgeCardProps {
  children: React.ReactNode
  className?: string
}

export function ForgeCard({ children, className }: ForgeCardProps) {
  return (
    <div className={cn('bg-card border border-border rounded-2xl p-5', className)}>
      {children}
    </div>
  )
}

interface ForgeCardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function ForgeCardHeader({ title, subtitle, action }: ForgeCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-[15px] font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  meta?: string
  trend?: { value: string; direction: 'up' | 'down' }
  color?: 'primary' | 'warning' | 'accent' | 'success' | 'emerald' | 'amber' | 'blue' | 'purple' | 'red' | 'slate'
  icon?: React.ReactNode
}

export function StatCard({ label, value, meta, trend, color = 'primary', icon }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    primary: 'text-primary',
    warning: 'text-warning',
    accent: 'text-accent',
    success: 'text-success',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    red: 'text-red-400',
    slate: 'text-slate-400',
  }
  
  const bgClasses: Record<string, string> = {
    primary: 'bg-primary/20',
    warning: 'bg-warning/20',
    accent: 'bg-accent/20',
    success: 'bg-success/20',
    emerald: 'bg-emerald-500/20',
    amber: 'bg-amber-500/20',
    blue: 'bg-blue-500/20',
    purple: 'bg-purple-500/20',
    red: 'bg-red-500/20',
    slate: 'bg-slate-500/20',
  }

  return (
    <ForgeCard className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        {icon && (
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', bgClasses[color], colorClasses[color])}>
            {icon}
          </div>
        )}
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <span className={cn('text-2xl font-bold tracking-tight', colorClasses[color])}>{value}</span>
      {trend && (
        <span className={cn('text-xs font-semibold', trend.direction === 'up' ? 'text-success' : 'text-destructive')}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
        </span>
      )}
      {meta && <span className="text-xs text-muted-foreground/70">{meta}</span>}
    </ForgeCard>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  icon?: string
}

export function PageHeader({ title, subtitle, actions, icon }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 items-center">{actions}</div>}
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'primary' | 'success' | 'warning' | 'destructive'
  className?: string
}

export function ProgressBar({ value, max = 100, color = 'primary', className }: ProgressBarProps) {
  const percent = (value / max) * 100
  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
  }

  return (
    <div className={cn('h-1.5 bg-surface-3 rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colorClasses[color])}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

interface CompetencyScoreProps {
  name: string
  score: number
  maxScore?: number
}

export function CompetencyScore({ name, score, maxScore = 5 }: CompetencyScoreProps) {
  const percent = (score / maxScore) * 100
  let color: 'primary' | 'success' | 'warning' = 'primary'
  if (score >= 4) color = 'success'
  else if (score < 3) color = 'warning'

  const colorText = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
  }

  return (
    <div className="flex items-center gap-3 mb-2.5">
      <span className="text-sm flex-1">{name}</span>
      <div className="flex-[2]">
        <ProgressBar value={percent} color={color} />
      </div>
      <span className={cn('text-sm font-bold w-8 text-right', colorText[color])}>{score.toFixed(1)}</span>
    </div>
  )
}

interface ForgeBadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gray'
}

export function ForgeBadge({ children, variant = 'gray' }: ForgeBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full', `badge-${variant}`)}>
      {children}
    </span>
  )
}

// Badge component with className support for custom styling
export interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-primary/20 text-primary border-primary/30',
    secondary: 'bg-surface-2 text-muted-foreground border-border',
    destructive: 'bg-red-500/20 text-red-300 border-red-500/30',
    outline: 'bg-transparent border-border text-foreground',
  }
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}

interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-6">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm text-muted-foreground mb-1.5">{title}</p>
      {description && <p className="text-xs text-muted-foreground/70">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
