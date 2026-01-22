import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90":
              variant === "default",
            "bg-slate-100 text-slate-900 hover:bg-slate-100/80":
              variant === "secondary",
            "bg-red-500 text-slate-50 hover:bg-red-500/90":
              variant === "destructive",
            "border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900":
              variant === "outline",
            "hover:bg-slate-100 hover:text-slate-900": variant === "ghost",
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-md px-8": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
