"use client"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect, createContext, useContext } from "react"

interface DDCtx { open:boolean; setOpen:(v:boolean)=>void }
const DDContext = createContext<DDCtx>({ open:false, setOpen:()=>{} })

function DropdownMenu({ children }: { children?:React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e:MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return <DDContext.Provider value={{open,setOpen}}><div ref={ref} className="relative">{children}</div></DDContext.Provider>
}
function DropdownMenuTrigger({ children, className, asChild, ...props }: { children?:React.ReactNode; className?:string; asChild?:boolean; [k:string]:any }) {
  const { setOpen, open } = useContext(DDContext)
  return <button onClick={()=>setOpen(!open)} className={cn("cursor-pointer", className)} type="button" {...props}>{children}</button>
}
function DropdownMenuContent({ children, className, align='end', ...props }: { children?:React.ReactNode; className?:string; align?:string; [k:string]:any }) {
  const { open } = useContext(DDContext)
  if (!open) return null
  return (
    <div className={cn("absolute z-50 mt-1 min-w-[160px] rounded-xl border border-border bg-surface shadow-xl p-1",
      align==='end'?'right-0':'left-0', className)} {...props}>
      {children}
    </div>
  )
}
function DropdownMenuItem({ children, className, onClick, ...props }: { children?:React.ReactNode; className?:string; onClick?:()=>void; [k:string]:any }) {
  const { setOpen } = useContext(DDContext)
  return (
    <button className={cn("w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-2 transition-colors text-left", className)}
      onClick={()=>{ onClick?.(); setOpen(false) }} type="button" {...props}>
      {children}
    </button>
  )
}
function DropdownMenuLabel({ children, className, ...props }: { children?:React.ReactNode; className?:string; [k:string]:any }) {
  return <div className={cn("px-3 py-1.5 text-xs font-semibold text-muted-foreground", className)} {...props}>{children}</div>
}
function DropdownMenuSeparator({ className, ...props }: { className?:string; [k:string]:any }) {
  return <div className={cn("my-1 h-px bg-border", className)} {...props}/>
}
function DropdownMenuSub({ children }: { children?:React.ReactNode }) { return <>{children}</> }
function DropdownMenuSubTrigger({ children, className, ...props }: { children?:React.ReactNode; className?:string; [k:string]:any }) {
  return <button className={cn("w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-2 text-left", className)} type="button" {...props}>{children}</button>
}
function DropdownMenuSubContent({ children, className, ...props }: { children?:React.ReactNode; className?:string; [k:string]:any }) {
  return <div className={cn("absolute left-full top-0 z-50 min-w-[160px] rounded-xl border border-border bg-surface shadow-xl p-1", className)} {...props}>{children}</div>
}
function DropdownMenuCheckboxItem({ children, checked, onCheckedChange, className, ...props }: { children?:React.ReactNode; checked?:boolean; onCheckedChange?:(v:boolean)=>void; className?:string; [k:string]:any }) {
  return (
    <button className={cn("w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-2 text-left", className)}
      onClick={()=>onCheckedChange?.(!checked)} type="button" {...props}>
      <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center", checked?"bg-primary border-primary":"border-border")}>
        {checked && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      {children}
    </button>
  )
}
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuCheckboxItem }
