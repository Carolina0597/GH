"use client"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

type Variant = 'default'|'primary'|'secondary'|'outline'|'ghost'|'destructive'
type Size = 'default'|'sm'|'lg'|'icon'

const base = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
const variants: Record<Variant,string> = {
  default:     "bg-primary text-white hover:bg-primary/90",
  primary:     "bg-primary text-white hover:bg-primary/90",
  secondary:   "bg-surface-2 text-foreground border border-border hover:bg-surface-3",
  outline:     "bg-transparent text-foreground border border-border hover:bg-surface-2",
  ghost:       "bg-transparent text-muted-foreground hover:bg-surface-2 hover:text-foreground",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
}
const sizes: Record<Size,string> = {
  default: "h-9 px-4 text-sm",
  sm:      "h-7 px-3 text-xs",
  lg:      "h-11 px-6 text-base",
  icon:    "h-9 w-9",
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; asChild?: boolean
}
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant='default', size='default', asChild, ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}/>
  )
)
Button.displayName = "Button"
export { Button }
