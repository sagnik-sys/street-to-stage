import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all",
  {
    variants: {
      status: {
        pending: "bg-warning-orange-light text-status-pending border border-status-pending/20",
        processing: "bg-civic-blue-light text-status-processing border border-status-processing/20",
        completed: "bg-government-green-light text-status-completed border border-status-completed/20",
        forwarded: "bg-muted text-muted-foreground border border-border",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, children, ...props }, ref) => {
    return (
      <div
        className={cn(statusBadgeVariants({ status, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { StatusBadge, statusBadgeVariants }