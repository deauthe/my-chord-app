
import { useState } from 'react'
import NavigationSidebar from '@/components/layout/NavigationSidebar'
import TextEditor from '@/components/editor/TextEditor'
import { DocumentManagerApp } from '@/components/document/DocumentManagerApp'

type AppView = 'editor' | 'chords'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('editor')

  const renderMainContent = () => {
    switch (currentView) {
      case 'chords':
        return <DocumentManagerApp />
      case 'editor':
      default:
        return <TextEditor />
    }
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Left Navigation Sidebar */}
      <NavigationSidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {renderMainContent()}
      </main>
    </div>
  )
}

export default App