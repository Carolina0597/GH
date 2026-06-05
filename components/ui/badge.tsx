"use client"
import { cn } from "@/lib/utils"
function Badge({ children, className, variant='default', ...props }: { children?: React.ReactNode; className?: string; variant?: string; [k:string]:any }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border", className)} {...props}>
      {children}
    </span>
  )
}
export { Badge }
