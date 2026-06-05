"use client"
import { cn } from "@/lib/utils"
import { createContext, useContext, useState, useRef, useEffect } from "react"

interface SelectCtx {
  value: string
  onValueChange: (v: string) => void
  open: boolean
  setOpen: (v: boolean) => void
  labelMap: Record<string, string>
  setLabelMap: (m: Record<string, string>) => void
}
const SelectContext = createContext<SelectCtx>({
  value: '', onValueChange: () => {}, open: false, setOpen: () => {},
  labelMap: {}, setLabelMap: () => {}
})

function Select({ value, defaultValue, onValueChange, children }: {
  value?: string; defaultValue?: string
  onValueChange?: (v: string) => void; children?: React.ReactNode
}) {
  const [internal, setInternal] = useState(defaultValue || '')
  const [open, setOpen] = useState(false)
  const [labelMap, setLabelMap] = useState<Record<string, string>>({})
  const current = value !== undefined ? value : internal

  const handleChange = (v: string) => {
    setInternal(v)
    onValueChange?.(v)
    setOpen(false)
  }

  // Close on outside click
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <SelectContext.Provider value={{ value: current, onValueChange: handleChange, open, setOpen, labelMap, setLabelMap }}>
      <div ref={ref} style={{ position: 'relative' }}>{children}</div>
    </SelectContext.Provider>
  )
}

function SelectTrigger({ children, className, ...props }: {
  children?: React.ReactNode; className?: string; [k: string]: any
}) {
  const { open, setOpen } = useContext(SelectContext)
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-3 focus:outline-none focus:ring-1 focus:ring-primary/50",
        className
      )}
      {...props}
    >
      {children}
      <svg
        style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
        width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="opacity-60"
      >
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
      </svg>
    </button>
  )
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value, labelMap } = useContext(SelectContext)
  const label = labelMap[value]
  if (value && label) return <span className="truncate flex-1 text-left">{label}</span>
  if (value && !label) return <span className="truncate flex-1 text-left">{value}</span>
  return <span className="truncate flex-1 text-left text-muted-foreground">{placeholder || 'Seleccionar...'}</span>
}

function SelectContent({ children, className, ...props }: {
  children?: React.ReactNode; className?: string; [k: string]: any
}) {
  const { open } = useContext(SelectContext)
  if (!open) return null
  return (
    <div
      style={{
        position: 'absolute', zIndex: 9000, top: 'calc(100% + 4px)', left: 0, right: 0,
        borderRadius: '12px', border: '1px solid hsl(222, 30%, 20%)',
        background: 'hsl(222, 47%, 9%)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}
      {...props}
    >
      <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '4px' }}>{children}</div>
    </div>
  )
}

function SelectItem({ value, children, className, ...props }: {
  value: string; children?: React.ReactNode; className?: string; [k: string]: any
}) {
  const ctx = useContext(SelectContext)
  const active = ctx.value === value

  // Register label
  useEffect(() => {
    if (typeof children === 'string' || typeof children === 'number') {
      ctx.setLabelMap({ ...ctx.labelMap, [value]: String(children) })
    }
  }, [value, children])

  return (
    <div
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors select-none",
        active ? "bg-primary/20 text-primary font-medium" : "hover:bg-surface-2 text-foreground",
        className
      )}
      {...props}
    >
      {active && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {!active && <span style={{ width: 12, flexShrink: 0 }}/>}
      {children}
    </div>
  )
}

function SelectLabel({ children, className, ...props }: {
  children?: React.ReactNode; className?: string; [k: string]: any
}) {
  return (
    <div className={cn("px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", className)} {...props}>
      {children}
    </div>
  )
}

function SelectSeparator({ className, ...props }: { className?: string; [k: string]: any }) {
  return <div className={cn("my-1 h-px bg-border", className)} {...props}/>
}

export { Select, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue }
