"use client"
import { cn } from "@/lib/utils"
function Checkbox({ checked, onCheckedChange, className, ...props }: {
  checked?: boolean; onCheckedChange?: (v: boolean) => void; className?: string; [k:string]:any
}) {
  return (
    <button role="checkbox" aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn("h-4 w-4 rounded border-2 flex items-center justify-center transition-all",
        checked ? "bg-primary border-primary" : "border-border bg-transparent", className)} {...props}>
      {checked && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>
  )
}
export { Checkbox }
