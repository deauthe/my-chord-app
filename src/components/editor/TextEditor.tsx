import React, { useMemo, useState, useCallback } from 'react'
import { createEditor, Descendant, Editor } from 'slate'
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from 'slate-react'
import { withHistory } from 'slate-history'
import { cn } from '@/lib/utils'
import Toolbar from './Toolbar'

// Define custom types for our editor
type CustomElement = {
  type: 'paragraph' | 'heading-one' | 'heading-two' | 'block-quote'
  children: CustomText[]
}

type CustomText = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement
    Text: CustomText
  }
}

// Initial value for the editor
const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Start typing your text here...' }],
  },
]

// Component to render different element types
const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'heading-one':
      return <h1 {...attributes} className="prose-editor">{children}</h1>
    case 'heading-two':
      return <h2 {...attributes} className="prose-editor">{children}</h2>
    case 'block-quote':
      return <blockquote {...attributes} className="prose-editor">{children}</blockquote>
    default:
      return <p {...attributes} className="prose-editor">{children}</p>
  }
}

// Component to render text with formatting
const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong className="prose-editor">{children}</strong>
  }

  if (leaf.italic) {
    children = <em className="prose-editor">{children}</em>
  }

  if (leaf.underline) {
    children = <u className="prose-editor">{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

interface TextEditorProps {
  className?: string
}

const TextEditor: React.FC<TextEditorProps> = ({ className }) => {
  const [, setValue] = useState<Descendant[]>(initialValue)
  
  // Create the editor object
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  // Handle keyboard shortcuts
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!event.ctrlKey && !event.metaKey) {
      return
    }

    switch (event.key) {
      case 'b': {
        event.preventDefault()
        const isActive = Editor.marks(editor)?.bold
        if (isActive) {
          Editor.removeMark(editor, 'bold')
        } else {
          Editor.addMark(editor, 'bold', true)
        }
        break
      }
      case 'i': {
        event.preventDefault()
        const isActive = Editor.marks(editor)?.italic
        if (isActive) {
          Editor.removeMark(editor, 'italic')
        } else {
          Editor.addMark(editor, 'italic', true)
        }
        break
      }
      case 'u': {
        event.preventDefault()
        const isActive = Editor.marks(editor)?.underline
        if (isActive) {
          Editor.removeMark(editor, 'underline')
        } else {
          Editor.addMark(editor, 'underline', true)
        }
        break
      }
    }
  }, [editor])

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      <Slate editor={editor} initialValue={initialValue} onValueChange={setValue}>
        <Toolbar editor={editor} />
        <div className="flex-1 overflow-hidden">
          <Editable
            className={cn(
              'h-full p-6 text-base leading-relaxed outline-none overflow-y-auto',
              'prose prose-slate max-w-none',
              'focus:outline-none focus:ring-0'
            )}
            renderElement={Element}
            renderLeaf={Leaf}
            onKeyDown={onKeyDown}
            placeholder="Start typing..."
            spellCheck
          />
        </div>
      </Slate>
    </div>
  )
}

export default TextEditor
