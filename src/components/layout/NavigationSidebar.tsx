import React from 'react'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarSection, 
  SidebarItem 
} from './Sidebar'
import type { AppView } from '../../App'

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
  currentView = 'chords',
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
          <h3 className="text-lg font-semibold text-foreground">Chortex</h3>
          <p className="text-xs text-muted-foreground">Music Theory Engine</p>
        </div>
      }
    >
      <SidebarContent>
        <SidebarSection title="Learn">
          <SidebarItem 
            icon="🎹" 
            active={currentView === 'chords'}
            onClick={() => onViewChange?.('chords')}
          >
            Chord Library
          </SidebarItem>
          <SidebarItem 
            icon="🔍" 
            active={currentView === 'identify'}
            onClick={() => onViewChange?.('identify')}
          >
            Chord Identifier
          </SidebarItem>
        </SidebarSection>

        <SidebarSection title="Explore">
          <SidebarItem 
            icon="🎼" 
            active={currentView === 'scales'}
            onClick={() => onViewChange?.('scales')}
          >
            Scale Explorer
          </SidebarItem>
          <SidebarItem 
            icon="🔢"
            active={currentView === 'roman-numerals'}
            onClick={() => onViewChange?.('roman-numerals')}
          >
            Roman Numerals
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
        </SidebarSection>
      </SidebarContent>
    </Sidebar>
  )
}

export default NavigationSidebar
