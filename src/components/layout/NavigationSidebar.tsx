import React from 'react'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarSection, 
  SidebarItem 
} from './Sidebar'

interface NavigationSidebarProps {
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  className,
  collapsible = true,
  defaultCollapsed = false,
}) => {
  return (
    <Sidebar
      position="left"
      size="md"
      collapsible={collapsible}
      defaultCollapsed={defaultCollapsed}
      className={className}
      header={
        <div>
          <h3 className="text-lg font-semibold text-foreground">My Chord App</h3>
          <p className="text-xs text-muted-foreground">Text Editor</p>
        </div>
      }
    >
      <SidebarContent>
        <SidebarSection title="Documents">
          <SidebarItem 
            icon="📄" 
            active={true}
          >
            Untitled Document
          </SidebarItem>
          <SidebarItem icon="📁">
            Recent Files
          </SidebarItem>
          <SidebarItem icon="🗂️">
            Drafts
          </SidebarItem>
        </SidebarSection>

        <SidebarSection title="Tools">
          <SidebarItem icon="🔍">
            Search
          </SidebarItem>
          <SidebarItem icon="📊">
            Statistics
          </SidebarItem>
          <SidebarItem icon="🎨">
            Themes
          </SidebarItem>
        </SidebarSection>

        <SidebarSection title="Settings">
          <SidebarItem icon="⚙️">
            Preferences
          </SidebarItem>
          <SidebarItem icon="⌨️">
            Shortcuts
          </SidebarItem>
          <SidebarItem icon="🔗">
            Integrations
          </SidebarItem>
        </SidebarSection>
      </SidebarContent>
    </Sidebar>
  )
}

export default NavigationSidebar
