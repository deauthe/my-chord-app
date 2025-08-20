import React, { useState, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const sidebarVariants = cva(
  'flex flex-col bg-background border-border transition-all duration-300 ease-in-out overflow-hidden',
  {
    variants: {
      position: {
        left: 'border-r',
        right: 'border-l',
      },
      size: {
        sm: 'w-48',
        md: 'w-64',
        lg: 'w-80',
      },
    },
    defaultVariants: {
      position: 'left',
      size: 'md',
    },
  }
)

export interface SidebarProps extends VariantProps<typeof sidebarVariants> {
  children: ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  className?: string
  header?: ReactNode
  collapseIcon?: ReactNode
  expandIcon?: ReactNode
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
  position = 'left',
  size = 'md',
  collapsible = false,
  defaultCollapsed = false,
  onCollapsedChange,
  className,
  header,
  collapseIcon = '◀',
  expandIcon = '▶',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onCollapsedChange?.(newCollapsed)
  }

  return (
    <aside
      className={cn(
        sidebarVariants({ position, size }),
        {
          'w-12': isCollapsed && collapsible,
        },
        className
      )}
    >
      {/* Header with optional collapse button */}
      {(header || collapsible) && (
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/10">
          <div className={cn('flex-1', { 'opacity-0': isCollapsed })}>
            {header}
          </div>
          {collapsible && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleCollapse}
              className="h-6 w-6 flex-shrink-0"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? expandIcon : collapseIcon}
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn('flex-1 overflow-y-auto', { 'opacity-0': isCollapsed })}>
        {children}
      </div>
    </aside>
  )
}

// Sidebar content components
const SidebarHeader: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('px-4 py-3 border-b border-border bg-muted/5', className)}>
    {children}
  </div>
)

const SidebarContent: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('flex-1 p-4 space-y-4', className)}>
    {children}
  </div>
)

const SidebarSection: React.FC<{ 
  title: string 
  children: ReactNode
  className?: string
}> = ({ title, children, className }) => (
  <div className={cn('space-y-2', className)}>
    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {title}
    </h4>
    <div className="space-y-1">
      {children}
    </div>
  </div>
)

const SidebarItem: React.FC<{
  icon?: ReactNode
  children: ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}> = ({ icon, children, active = false, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center w-full px-2 py-2 text-sm text-left rounded-lg transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      {
        'bg-accent text-accent-foreground font-medium': active,
        'text-muted-foreground': !active,
      },
      className
    )}
  >
    {icon && (
      <span className="mr-3 flex-shrink-0">
        {icon}
      </span>
    )}
    <span className="flex-1">{children}</span>
  </button>
)

export { Sidebar, SidebarHeader, SidebarContent, SidebarSection, SidebarItem }
