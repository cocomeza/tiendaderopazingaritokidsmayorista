import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variantClasses = {
    default: "border-transparent bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    destructive: "border-transparent bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    outline: "text-gray-900 border-gray-200",
    success: "border-transparent bg-green-500 text-white hover:bg-green-600 focus:ring-green-500",
    warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500",
    info: "border-transparent bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
  }

  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)} 
      {...props} 
    />
  )
}

export { Badge }