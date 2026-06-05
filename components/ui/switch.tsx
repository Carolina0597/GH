"use client"
import { cn } from "@/lib/utils"
function Switch({ checked, onCheckedChange, className, ...props }: {
  checked?: boolean; onCheckedChange?: (v: boolean) => void; className?: string; [k:string]:any
}) {
  return (
    <button role="switch" aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn("relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-primary" : "bg-surface-3", className)} {...props}>
      <span className={cn("pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-5" : "translate-x-0")}/>
    </button>
  )
}
export { Switch }
