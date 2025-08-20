import React from 'react'
import { Editor } from 'slate'
import { ToggleButton } from '@/components/ui/ToggleButton'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  editor: Editor
  className?: string
}

const Toolbar: React.FC<ToolbarProps> = ({ editor, className }) => {
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

  return (
    <div className={cn(
      'flex items-center gap-1 p-3 bg-muted/30 border-b border-border',
      className
    )}>
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
      </div>
    </div>
  )
}

export default Toolbar
