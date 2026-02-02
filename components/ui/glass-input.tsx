import * as React from 'react'
import { cn } from '@/lib/utils'

export interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl px-4 py-2 text-sm',
          'glass-light border-glass',
          'placeholder:text-muted-foreground/60',
          'transition-all duration-[var(--duration-normal)] ease-[var(--ease-liquid)]',
          'focus:glass-medium focus:border-primary/40 focus:shadow-glass-glow focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassInput.displayName = 'GlassInput'

export interface GlassTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const GlassTextarea = React.forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex w-full rounded-xl px-4 py-2 text-sm resize-none',
          'glass-light border-glass',
          'placeholder:text-muted-foreground/60',
          'transition-all duration-[var(--duration-normal)] ease-[var(--ease-liquid)]',
          'focus:glass-medium focus:border-primary/40 focus:shadow-glass-glow focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassTextarea.displayName = 'GlassTextarea'

export interface GlassSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const GlassSelect = React.forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-11 w-full rounded-xl px-4 py-2 text-sm',
          'glass-light border-glass',
          'transition-all duration-[var(--duration-normal)] ease-[var(--ease-liquid)]',
          'focus:glass-medium focus:border-primary/40 focus:shadow-glass-glow focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
GlassSelect.displayName = 'GlassSelect'

export interface GlassToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  'aria-label'?: string
  className?: string
}

function GlassToggle({
  checked,
  onCheckedChange,
  disabled,
  'aria-label': ariaLabel,
  className,
}: GlassToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-muted',
        className
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 rounded-full bg-background dark:bg-foreground shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-1'
        )}
      />
    </button>
  )
}
GlassToggle.displayName = 'GlassToggle'

export { GlassInput, GlassTextarea, GlassSelect, GlassToggle }
