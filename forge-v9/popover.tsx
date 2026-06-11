"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
function Popover({ children }: { children: React.ReactNode }) { return <div className="relative">{children}</div> }
function PopoverTrigger({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean; [k:string]:any }) {
  return <span {...props}>{children}</span>
}
function PopoverContent({ children, className, ...props }: { children?: React.ReactNode; className?: string; [k:string]:any }) {
  return (
    <div className={cn("absolute z-50 mt-2 rounded-xl border border-border bg-surface shadow-lg p-4 min-w-[200px]", className)} {...props}>
      {children}
    </div>
  )
}
export { Popover, PopoverTrigger, PopoverContent }
