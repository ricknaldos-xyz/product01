import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const glassCardVariants = cva(
  'rounded-[var(--radius-card)] transition-all duration-[var(--duration-normal)]',
  {
    variants: {
      intensity: {
        ultralight: 'bg-background shadow-[var(--glass-shadow-sm)]',
        light: 'bg-secondary/50 shadow-[var(--glass-shadow-sm)]',
        medium: 'bg-secondary shadow-[var(--glass-shadow-md)]',
        heavy: 'bg-secondary border border-border shadow-[var(--glass-shadow-md)]',
        primary: 'bg-primary/5 border border-primary/10 shadow-[var(--glass-shadow-sm)]',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      hover: {
        none: '',
        lift: 'hover:translate-y-[-2px] hover:shadow-[var(--glass-shadow-lg)] cursor-pointer',
        glow: 'hover:shadow-[var(--glass-shadow-md)] hover:border-primary/20 cursor-pointer',
        scale: 'hover:scale-[1.02] cursor-pointer',
      },
    },
    defaultVariants: {
      intensity: 'light',
      padding: 'lg',
      hover: 'none',
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  asChild?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, intensity, padding, hover, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        className={cn(glassCardVariants({ intensity, padding, hover, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassCard.displayName = 'GlassCard'

export { GlassCard, glassCardVariants }
