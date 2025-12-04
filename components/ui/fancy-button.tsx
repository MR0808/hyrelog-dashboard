"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

interface FancyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glow"
  size?: "sm" | "md" | "lg"
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  asChild?: boolean
}

export const FancyButton = React.forwardRef<HTMLButtonElement, FancyButtonProps>(
  ({
    children,
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "right",
    className,
    asChild = false,
    ...props
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement)

    const handleMouseLeave = () => {
      setIsHovered(false)
    }

    const sizeClasses = {
      sm: "px-4 py-2 text-sm gap-1.5",
      md: "px-6 py-3 text-base gap-2",
      lg: "px-8 py-4 text-lg gap-2.5",
    }

    const baseClasses =
      "relative inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"

    const variantClasses = {
      primary: cn(
        "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white",
        "hover:shadow-lg hover:shadow-blue-500/50 hover:-translate-y-0.5 hover:from-blue-500 hover:via-indigo-500 hover:to-indigo-600",
        "active:translate-y-0 active:shadow-md active:from-blue-600 active:via-blue-500 active:to-indigo-600",
      ),
      secondary: cn(
        "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 border border-gray-300",
        "hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 hover:border-gray-400 hover:-translate-y-0.5",
        "active:translate-y-0",
      ),
      outline: cn(
        "border-2 border-blue-600 text-blue-600 bg-transparent",
        "hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:-translate-y-0.5",
        "active:translate-y-0",
      ),
      ghost: cn(
        "text-gray-700 bg-transparent",
        "hover:bg-gray-100 hover:-translate-y-0.5",
        "active:translate-y-0"
      ),
      glow: cn(
        "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white",
        "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
        "hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] hover:-translate-y-0.5 hover:from-blue-500 hover:via-indigo-500 hover:to-indigo-600",
        "active:translate-y-0 active:shadow-[0_0_15px_rgba(59,130,246,0.6)]",
      ),
    }

    // Shimmer effect removed per user request

    const content = (
      <span className="relative z-10 flex items-center">
        {icon && iconPosition === "left" && (
          <span className={cn("transition-transform duration-300", isHovered && "-translate-x-0.5")}>
            {icon}
          </span>
        )}
        <span>{children}</span>
        {icon && iconPosition === "right" && (
          <span className={cn("transition-transform duration-300", isHovered && "translate-x-0.5")}>
            {icon}
          </span>
        )}
      </span>
    )

    const combinedClassName = cn(baseClasses, sizeClasses[size], variantClasses[variant], className)

    if (asChild) {
      return (
        <Slot
          className={combinedClassName}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          ref={buttonRef}
          {...props}
        >
          <span className="relative inline-flex items-center justify-center">
            {content}
          </span>
        </Slot>
      )
    }

    return (
      <button
        ref={buttonRef}
        className={combinedClassName}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {content}
      </button>
    )
  }
)

FancyButton.displayName = "FancyButton"

