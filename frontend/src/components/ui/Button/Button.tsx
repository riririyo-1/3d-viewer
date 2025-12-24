import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2",
          {
            "bg-slate-900 text-white hover:bg-slate-900/90 shadow":
              variant === "default",
            "border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100":
              variant === "outline",
            "hover:bg-slate-100 hover:text-slate-900": variant === "ghost",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
