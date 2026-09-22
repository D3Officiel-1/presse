"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "mb-4 overflow-hidden rounded-[24px]",
      "bg-white/40 dark:bg-black/40 backdrop-blur-2xl",
      "border border-white/20 dark:border-white/10",
      "shadow-[0_8px_32px_rgba(0,0,0,0.06)]",
      "transition-all duration-500 ease-in-out",
      "data-[state=open]:shadow-[0_20px_50px_rgba(0,0,0,0.12)]",
      "data-[state=open]:border-primary/20",
      className
    )}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between px-6 py-5",
        "text-[17px] font-semibold tracking-[-0.02em] text-left",
        "transition-all duration-300 ease-out",
        "hover:bg-white/20 dark:hover:bg-white/5",
        "active:scale-[0.98] outline-none",
        "group [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex-1 pr-4 overflow-hidden text-ellipsis">{children}</span>
      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm"
    {...props}
  >
    <div className={cn("px-6 pb-6 pt-0 text-[15px] leading-relaxed text-muted-foreground/90", className)}>
      <motion.div
        initial={{ opacity: 0, y: -10, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ 
          duration: 0.5, 
          ease: [0.33, 1, 0.68, 1]
        }}
      >
        {children}
      </motion.div>
    </div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
