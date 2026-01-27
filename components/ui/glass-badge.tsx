import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const glassBadgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-[var(--duration-fast)]',
  {
    variants: {
      variant: {
        default: 'glass-light border-glass text-foreground',
        primary: 'glass-primary border-glass text-primary',
        success:
          'bg-success/10 border border-success/20 text-success backdrop-blur-sm',
        warning:
          'bg-warning/10 border border-warning/20 text-warning backdrop-blur-sm',
        destructive:
          'bg-destructive/10 border border-destructive/20 text-destructive backdrop-blur-sm',
        outline: 'border-glass-strong bg-transparent',
      },
      size: {
        sm: 'px-2.5 py-0.5 text-[11px]',
        default: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface GlassBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof glassBadgeVariants> {}

const GlassBadge = React.forwardRef<HTMLSpanElement, GlassBadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        className={cn(glassBadgeVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassBadge.displayName = 'GlassBadge'

export { GlassBadge, glassBadgeVariants }
