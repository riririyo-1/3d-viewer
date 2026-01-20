import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface GlowCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        ref={ref}
        className={cn(
          "group relative rounded-2xl transition-all duration-700 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]",
          className
        )}
        {...props}
      />
    )
  }
)
GlowCard.displayName = "GlowCard"

export { GlowCard }
