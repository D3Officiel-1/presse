import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-2xl border border-neutral-200/80 bg-white/70 backdrop-blur-sm px-5 py-3 text-base font-medium ring-offset-background transition-all duration-300 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:border-primary focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
