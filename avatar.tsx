"use client"
import { cn } from "@/lib/utils"
function Avatar({ children, className, ...props }: { children?: React.ReactNode; className?: string; [k:string]:any }) {
  return <div className={cn("relative flex shrink-0 overflow-hidden rounded-full", className)} {...props}>{children}</div>
}
function AvatarImage({ src, alt, className, ...props }: { src?: string; alt?: string; className?: string; [k:string]:any }) {
  return <img src={src} alt={alt} className={cn("aspect-square h-full w-full object-cover", className)} {...props}/>
}
function AvatarFallback({ children, className, ...props }: { children?: React.ReactNode; className?: string; [k:string]:any }) {
  return <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-bold", className)} {...props}>{children}</div>
}
export { Avatar, AvatarImage, AvatarFallback }
