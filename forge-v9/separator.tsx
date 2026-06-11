"use client"
import { cn } from "@/lib/utils"
function Separator({ orientation='horizontal', className, ...props }: { orientation?: 'horizontal'|'vertical'; className?: string; [k:string]:any }) {
  return <div className={cn("bg-border", orientation==='horizontal'?"h-px w-full":"h-full w-px", className)} {...props}/>
}
export { Separator }
