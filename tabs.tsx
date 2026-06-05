"use client"

import { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
  value: string
  onValueChange: (v: string) => void
}
const TabsContext = createContext<TabsContextType>({ value: '', onValueChange: () => {} })

function Tabs({ value, defaultValue, onValueChange, children, className, ...props }: {
  value?: string; defaultValue?: string; onValueChange?: (v: string) => void
  children: React.ReactNode; className?: string; [k: string]: any
}) {
  const [internal, setInternal] = useState(defaultValue || '')
  const current = value ?? internal
  const onChange = (v: string) => { setInternal(v); onValueChange?.(v) }
  return (
    <TabsContext.Provider value={{ value: current, onValueChange: onChange }}>
      <div className={cn("space-y-0", className)} {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({ children, className, ...props }: { children: React.ReactNode; className?: string; [k: string]: any }) {
  return (
    <div className={cn("flex items-center gap-1 p-1 rounded-lg bg-surface-2 border border-border w-fit", className)} {...props}>
      {children}
    </div>
  )
}

function TabsTrigger({ value, children, className, ...props }: { value: string; children: React.ReactNode; className?: string; [k: string]: any }) {
  const ctx = useContext(TabsContext)
  const active = ctx.value === value
  return (
    <button
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap",
        active ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, children, className, ...props }: { value: string; children: React.ReactNode; className?: string; [k: string]: any }) {
  const ctx = useContext(TabsContext)
  if (ctx.value !== value) return null
  return <div className={cn("mt-4", className)} {...props}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
