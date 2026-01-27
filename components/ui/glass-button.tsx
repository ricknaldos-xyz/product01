import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const glassButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-[var(--duration-normal)] ease-[var(--ease-liquid)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'glass-medium border-glass-strong text-foreground hover:glass-heavy hover:shadow-glass-lg active:scale-[0.98]',
        primary:
          'glass-primary border-glass shadow-glass-glow text-primary hover:bg-primary/20 active:scale-[0.98]',
        solid:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-glass-glow active:scale-[0.98]',
        ghost:
          'glass-ultralight border-transparent hover:glass-light hover:border-glass',
        outline: 'border-glass-strong bg-transparent hover:glass-light',
        destructive:
          'bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 active:scale-[0.98]',
      },
      size: {
        sm: 'h-10 px-4 text-xs',
        default: 'h-11 px-6',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(glassButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassButton.displayName = 'GlassButton'

export { GlassButton, glassButtonVariants }
