"use client"
import { cn } from "@/lib/utils"
function TooltipProvider({ children }: { children: React.ReactNode }) { return <>{children}</> }
function Tooltip({ children }: { children: React.ReactNode }) { return <>{children}</> }
function TooltipTrigger({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean; [k:string]:any }) {
  return <span {...props}>{children}</span>
}
function TooltipContent({ children, className, ...props }: { children?: React.ReactNode; className?: string; [k:string]:any }) {
  return null // simplified - no tooltip popup
}
export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
