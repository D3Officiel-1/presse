import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'glass' | 'interactive' | 'premium' }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[32px] border transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative overflow-hidden",
      variant === 'default' && "bg-card text-card-foreground shadow-sm border-border",
      variant === 'glass' && "bg-white/40 dark:bg-black/40 backdrop-blur-[50px] border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
      variant === 'interactive' && "bg-card text-card-foreground shadow-sm border-border hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] cursor-pointer",
      variant === 'premium' && "bg-white/60 dark:bg-black/60 backdrop-blur-[60px] border-white/30 dark:border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.12)]",
      className
    )}
    {...props}
  >
    {(variant === 'glass' || variant === 'premium') && (
      <span className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-[32px] z-20" />
    )}
    <div className="relative z-10 h-full">{props.children}</div>
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-black tracking-tighter leading-none",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-60", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
