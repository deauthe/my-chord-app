
import NavigationSidebar from '@/components/layout/NavigationSidebar'
import QuickActionsSidebar from '@/components/layout/QuickActionsSidebar'
import TextEditor from '@/components/editor/TextEditor'

function App() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Left Navigation Sidebar */}
      <NavigationSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <TextEditor />
      </main>

      {/* Right Quick Actions Sidebar */}
      <QuickActionsSidebar />
    </div>
  )
}

export default App