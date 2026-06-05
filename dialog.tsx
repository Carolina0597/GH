"use client"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

function Dialog({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (v:boolean)=>void; children?: React.ReactNode }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={() => onOpenChange?.(false)}/>
      <div className="relative z-10 w-full max-w-lg mx-4">{children}</div>
    </div>
  )
}
function DialogContent({ children, className, ...props }: { children?: React.ReactNode; className?: string; [k:string]:any }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-6 shadow-2xl", className)} {...props}>
      {children}
    </div>
  )
}
function DialogHeader({ children, className, ...props }: { children?: React.ReactNode; className?: string; [k:string]:any }) {
  return <div className={cn("mb-4", className)} {...props}>{children}</div>
}
function DialogTitle({ children, className, ...props }: { children?: React.ReactNode; className?: string; [k:string]:any }) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props}>{children}</h2>
}
function DialogDescription({ children, className, ...props }: { children?: React.ReactNode; className?: string; [k:string]:any }) {
  return <p className={cn("text-sm text-muted-foreground mt-1", className)} {...props}>{children}</p>
}
function DialogFooter({ children, className, ...props }: { children?: React.ReactNode; className?: string; [k:string]:any }) {
  return <div className={cn("flex justify-end gap-2 mt-6", className)} {...props}>{children}</div>
}
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
