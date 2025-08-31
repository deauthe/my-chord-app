import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const toggleButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-muted data-[state=on]:bg-muted data-[state=on]:text-foreground',
        outline:
          'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary',
      },
      size: {
        default: 'h-9 px-3',
        sm: 'h-8 px-2',
        lg: 'h-10 px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ToggleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleButtonVariants> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ className, variant, size, pressed = false, onPressedChange, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      onPressedChange?.(!pressed)
    }

    return (
      <button
        className={cn(toggleButtonVariants({ variant, size, className }))}
        ref={ref}
        data-state={pressed ? 'on' : 'off'}
        aria-pressed={pressed}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
ToggleButton.displayName = 'ToggleButton'

export { ToggleButton, toggleButtonVariants }
