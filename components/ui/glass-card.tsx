import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const glassCardVariants = cva(
  'rounded-2xl border transition-all duration-[var(--duration-normal)]',
  {
    variants: {
      intensity: {
        ultralight: 'glass-ultralight border-glass shadow-glass',
        light: 'glass-light border-glass shadow-glass',
        medium: 'glass-medium border-glass-strong shadow-glass-lg',
        heavy: 'glass-heavy border-glass-strong shadow-glass-lg',
        primary: 'glass-primary border-glass shadow-glass-glow',
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
        lift: 'hover:translate-y-[-2px] hover:shadow-glass-lg cursor-pointer',
        glow: 'hover:shadow-glass-glow hover:border-primary/30 cursor-pointer',
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
