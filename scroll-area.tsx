"use client"
import { cn } from "@/lib/utils"
function ScrollArea({ children, className, ...props }: { children?: React.ReactNode; className?: string; [k:string]:any }) {
  return <div className={cn("overflow-auto", className)} {...props}>{children}</div>
}
function ScrollBar({ className, ...props }: { className?: string; [k:string]:any }) { return null }
export { ScrollArea, ScrollBar }
