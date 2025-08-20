import React from 'react'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarSection, 
  SidebarItem 
} from './Sidebar'

interface QuickActionsSidebarProps {
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

const QuickActionsSidebar: React.FC<QuickActionsSidebarProps> = ({
  className,
  collapsible = true,
  defaultCollapsed = false,
}) => {
  return (
    <Sidebar
      position="right"
      size="sm"
      collapsible={collapsible}
      defaultCollapsed={defaultCollapsed}
      className={className}
      header={
        <h4 className="text-sm font-semibold text-foreground">Quick Actions</h4>
      }
      collapseIcon="▶"
      expandIcon="◀"
    >
      <SidebarContent>
        <SidebarSection title="Document">
          <SidebarItem icon="💾">
            Save
          </SidebarItem>
          <SidebarItem icon="📤">
            Export
          </SidebarItem>
          <SidebarItem icon="📋">
            Copy All
          </SidebarItem>
          <SidebarItem icon="🖨️">
            Print
          </SidebarItem>
        </SidebarSection>

        <SidebarSection title="Format">
          <SidebarItem icon="🎨">
            Themes
          </SidebarItem>
          <SidebarItem icon="📏">
            Word Count
          </SidebarItem>
          <SidebarItem icon="🔤">
            Font Size
          </SidebarItem>
          <SidebarItem icon="📐">
            Line Height
          </SidebarItem>
        </SidebarSection>

        <SidebarSection title="View">
          <SidebarItem icon="🔍">
            Zoom In
          </SidebarItem>
          <SidebarItem icon="🔎">
            Zoom Out
          </SidebarItem>
          <SidebarItem icon="📱">
            Focus Mode
          </SidebarItem>
        </SidebarSection>

        <SidebarSection title="Help">
          <SidebarItem icon="❓">
            Shortcuts
          </SidebarItem>
          <SidebarItem icon="📚">
            Guide
          </SidebarItem>
          <SidebarItem icon="🐛">
            Report Bug
          </SidebarItem>
        </SidebarSection>
      </SidebarContent>
    </Sidebar>
  )
}

export default QuickActionsSidebar
