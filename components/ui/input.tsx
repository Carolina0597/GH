"use client"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"
const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(
      "flex w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-50 transition-colors",
      className
    )} {...props}/>
  )
)
Input.displayName = "Input"
export { Input }
