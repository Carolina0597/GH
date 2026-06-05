"use client"
import { cn } from "@/lib/utils"
import { createContext, useContext, useState, useRef, useEffect } from "react"

interface SelectCtx { value: string; onValueChange: (v:string)=>void; open:boolean; setOpen:(v:boolean)=>void }
const SelectContext = createContext<SelectCtx>({ value:'', onValueChange:()=>{}, open:false, setOpen:()=>{} })

function Select({ value, defaultValue, onValueChange, children }: { value?:string; defaultValue?:string; onValueChange?:(v:string)=>void; children?:React.ReactNode }) {
  const [internal, setInternal] = useState(defaultValue||'')
  const [open, setOpen] = useState(false)
  const current = value ?? internal
  const onChange = (v:string) => { setInternal(v); onValueChange?.(v); setOpen(false) }
  return (
    <SelectContext.Provider value={{ value:current, onValueChange:onChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

function SelectTrigger({ children, className, ...props }: { children?:React.ReactNode; className?:string; [k:string]:any }) {
  const { open, setOpen } = useContext(SelectContext)
  return (
    <button onClick={()=>setOpen(!open)} type="button"
      className={cn("flex w-full items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-3 focus:outline-none focus:ring-1 focus:ring-primary/50", className)} {...props}>
      {children}
      <svg className="h-4 w-4 opacity-50 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
    </button>
  )
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useContext(SelectContext)
  const [label, setLabel] = useState<string>('')
  // Label gets set by SelectItem when it matches
  if (value && label) return <span>{label}</span>
  if (value) return <span>{value}</span>
  return <span className="text-muted-foreground">{placeholder||'Seleccionar'}</span>
}

function SelectContent({ children, className, ...props }: { children?:React.ReactNode; className?:string; [k:string]:any }) {
  const { open, setOpen } = useContext(SelectContext)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e:MouseEvent) => { if (ref.current && !ref.current.closest('[data-select]')?.contains(e.target as Node)) setOpen(false) }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, setOpen])
  if (!open) return null
  return (
    <div ref={ref} className={cn("absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-xl overflow-hidden", className)} {...props}>
      <div className="max-h-60 overflow-y-auto p-1">{children}</div>
    </div>
  )
}

function SelectItem({ value, children, className, ...props }: { value:string; children?:React.ReactNode; className?:string; [k:string]:any }) {
  const ctx = useContext(SelectContext)
  const active = ctx.value === value
  return (
    <div onClick={()=>ctx.onValueChange(value)}
      className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors",
        active ? "bg-primary/15 text-primary" : "hover:bg-surface-2 text-foreground", className)} {...props}>
      {active && <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      {children}
    </div>
  )
}

function SelectLabel({ children, className, ...props }: { children?:React.ReactNode; className?:string; [k:string]:any }) {
  return <div className={cn("px-3 py-1.5 text-xs font-semibold text-muted-foreground", className)} {...props}>{children}</div>
}
function SelectSeparator({ className, ...props }: { className?:string; [k:string]:any }) {
  return <div className={cn("my-1 h-px bg-border", className)} {...props}/>
}

export { Select, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue }
