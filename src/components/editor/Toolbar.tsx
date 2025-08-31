import React from 'react'
import { Editor, Transforms } from 'slate'
import { ToggleButton } from '@/components/ui/ToggleButton'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  editor: Editor
  className?: string
  chordMode?: boolean
  onToggleChordMode?: () => void
  onFixChordStructure?: () => void
}

const Toolbar: React.FC<ToolbarProps> = ({ editor, className, chordMode = false, onToggleChordMode, onFixChordStructure }) => {
  // Helper functions for formatting
  const toggleBold = () => {
    const isActive = Editor.marks(editor)?.bold
    if (isActive) {
      Editor.removeMark(editor, 'bold')
    } else {
      Editor.addMark(editor, 'bold', true)
    }
  }

  const toggleItalic = () => {
    const isActive = Editor.marks(editor)?.italic
    if (isActive) {
      Editor.removeMark(editor, 'italic')
    } else {
      Editor.addMark(editor, 'italic', true)
    }
  }

  const toggleUnderline = () => {
    const isActive = Editor.marks(editor)?.underline
    if (isActive) {
      Editor.removeMark(editor, 'underline')
    } else {
      Editor.addMark(editor, 'underline', true)
    }
  }

  const isFormatActive = (format: string) => {
    const marks = Editor.marks(editor)
    return marks ? !!marks[format as keyof typeof marks] : false
  }

  const insertChordLine = () => {
    const chordLine = {
      type: 'chord-line' as const,
      children: [{ text: '' }],
    }
    
    Transforms.insertNodes(editor, chordLine)
  }

  return (
    <div className={cn(
      'flex items-center gap-1 p-3 bg-muted/30 border-b border-border',
      className
    )}>
      {/* Document Mode Toggle */}
      <div className="flex items-center gap-1 mr-2">
        <ToggleButton
          variant="outline"
          size="sm"
          pressed={chordMode}
          onPressedChange={onToggleChordMode}
          title={chordMode ? "Chord Mode (every line has chords)" : "Regular Mode (manual chord lines)"}
          className={chordMode ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300" : ""}
        >
          <span className="text-xs font-mono mr-1">♪</span>
          {chordMode ? "Chord Mode" : "Regular Mode"}
        </ToggleButton>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Text formatting */}
      <div className="flex items-center gap-1">
        <ToggleButton
          variant="outline"
          size="sm"
          pressed={isFormatActive('bold')}
          onPressedChange={toggleBold}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToggleButton>
        
        <ToggleButton
          variant="outline"
          size="sm"
          pressed={isFormatActive('italic')}
          onPressedChange={toggleItalic}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToggleButton>
        
        <ToggleButton
          variant="outline"
          size="sm"
          pressed={isFormatActive('underline')}
          onPressedChange={toggleUnderline}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </ToggleButton>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Block formatting */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          title="Heading 1"
        >
          H1
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          title="Heading 2"
        >
          H2
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          title="Quote"
        >
          <span className="text-xs">❝</span>
        </Button>
        
        {!chordMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={insertChordLine}
            title="Insert Chord Line (Alt+C)"
          >
            <span className="text-xs font-mono">♪</span>
          </Button>
        )}
        
        {chordMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFixChordStructure}
            title="Fix Chord Structure - Add missing chord lines (Alt+Shift+C)"
          >
            <span className="text-xs font-mono">⚡</span>
          </Button>
        )}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Additional actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          title="Clear formatting"
        >
          <span className="text-xs">✕</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          title={chordMode 
            ? "Chord Mode Shortcuts: Ctrl+Shift+↑/↓ (Navigate), Alt+Shift+C (Fix chord structure)" 
            : "Regular Mode Shortcuts: Alt+C (Insert chord line), Ctrl+Shift+↑/↓ (Navigate between existing chord lines)"}
        >
          <span className="text-xs">?</span>
        </Button>
      </div>
    </div>
  )
}

export default Toolbar
