import React from 'react'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarSection, 
  SidebarItem 
} from './Sidebar'

type AppView = 'editor' | 'chords'

interface NavigationSidebarProps {
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  currentView?: AppView
  onViewChange?: (view: AppView) => void
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  className,
  collapsible = true,
  defaultCollapsed = false,
  currentView = 'editor',
  onViewChange,
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
        <SidebarSection title="Apps">
          <SidebarItem 
            icon="📝" 
            active={currentView === 'editor'}
            onClick={() => onViewChange?.('editor')}
          >
            Text Editor
          </SidebarItem>
          <SidebarItem 
            icon="🎼" 
            active={currentView === 'chords'}
            onClick={() => onViewChange?.('chords')}
          >
            Composition Manager
          </SidebarItem>
        </SidebarSection>

        <SidebarSection title="Documents">
          <SidebarItem 
            icon="📄" 
            active={false}
            disabled={true}
          >
            Untitled Document
          </SidebarItem>
          <SidebarItem 
            icon="📁"
            disabled={true}
          >
            Recent Files
          </SidebarItem>
          <SidebarItem 
            icon="🗂️"
            disabled={true}
          >
            Drafts
          </SidebarItem>
        </SidebarSection>

        <SidebarSection title="Tools">
          <SidebarItem 
            icon="🔍"
            disabled={true}
          >
            Search
          </SidebarItem>
          <SidebarItem 
            icon="📊"
            disabled={true}
          >
            Statistics
          </SidebarItem>
          <SidebarItem 
            icon="🎨"
            disabled={true}
          >
            Themes
          </SidebarItem>
        </SidebarSection>

        <SidebarSection title="Settings">
          <SidebarItem 
            icon="⚙️"
            disabled={true}
          >
            Preferences
          </SidebarItem>
          <SidebarItem 
            icon="⌨️"
            disabled={true}
          >
            Shortcuts
          </SidebarItem>
          <SidebarItem 
            icon="🔗"
            disabled={true}
          >
            Integrations
          </SidebarItem>
        </SidebarSection>
      </SidebarContent>
    </Sidebar>
  )
}

export default NavigationSidebar
