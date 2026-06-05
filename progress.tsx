"use client"
import { cn } from "@/lib/utils"
function Progress({ value=0, className, ...props }: { value?: number; className?: string; [k:string]:any }) {
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-surface-3", className)} {...props}>
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(Math.max(value,0),100)}%` }}/>
    </div>
  )
}
export { Progress }
