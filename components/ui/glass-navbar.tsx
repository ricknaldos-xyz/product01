import * as React from 'react'
import { cn } from '@/lib/utils'

export interface GlassNavbarProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean
}

const GlassNavbar = React.forwardRef<HTMLElement, GlassNavbarProps>(
  ({ className, sticky = true, children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          sticky && 'sticky top-0',
          'z-50 w-full',
          'bg-background/95 backdrop-blur-sm border-b border-border',
          className
        )}
        {...props}
      >
        {children}
      </header>
    )
  }
)
GlassNavbar.displayName = 'GlassNavbar'

export { GlassNavbar }
