"use client"
import { cn } from "@/lib/utils"
function RadioGroup({ children, value, onValueChange, className, ...props }: { children?: React.ReactNode; value?: string; onValueChange?: (v:string)=>void; className?: string; [k:string]:any }) {
  return <div className={cn("flex flex-col gap-2", className)} {...props}>{children}</div>
}
function RadioGroupItem({ value, id, className, ...props }: { value: string; id?: string; className?: string; [k:string]:any }) {
  return <input type="radio" id={id} value={value} className={cn("h-4 w-4 accent-primary", className)} {...props}/>
}
export { RadioGroup, RadioGroupItem }
