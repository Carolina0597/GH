"use client"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { X } from "lucide-react"

function Dialog({ open, onOpenChange, children }: {
  open?: boolean
  onOpenChange?: (v: boolean) => void
  children?: React.ReactNode
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={() => onOpenChange?.(false)}
      />
      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 9999, width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

function DialogContent({ children, className, ...props }: {
  children?: React.ReactNode
  className?: string
  [k: string]: any
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-2xl w-full",
        className
      )}
      style={{ background: 'hsl(222, 47%, 9%)' }}
      onClick={e => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogHeader({ children, className, ...props }: {
  children?: React.ReactNode; className?: string; [k: string]: any
}) {
  return <div className={cn("mb-5", className)} {...props}>{children}</div>
}

function DialogTitle({ children, className, ...props }: {
  children?: React.ReactNode; className?: string; [k: string]: any
}) {
  return <h2 className={cn("text-xl font-bold", className)} {...props}>{children}</h2>
}

function DialogDescription({ children, className, ...props }: {
  children?: React.ReactNode; className?: string; [k: string]: any
}) {
  return <p className={cn("text-sm text-muted-foreground mt-1", className)} {...props}>{children}</p>
}

function DialogFooter({ children, className, ...props }: {
  children?: React.ReactNode; className?: string; [k: string]: any
}) {
  return <div className={cn("flex justify-end gap-3 mt-6 pt-4 border-t border-border", className)} {...props}>{children}</div>
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
