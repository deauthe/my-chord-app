import React, { useMemo, useState, useCallback } from 'react'
import { createEditor, Descendant, Editor, Transforms, Path, Element as SlateElement } from 'slate'
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from 'slate-react'
import { withHistory } from 'slate-history'
import { cn } from '@/lib/utils'
import Toolbar from './Toolbar'

// Define custom types for our editor
type CustomElement = {
  type: 'paragraph' | 'heading-one' | 'heading-two' | 'block-quote' | 'chord-line'
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

// Initial value for chord mode - every line has a chord line
const chordModeInitialValue: Descendant[] = [
  {
    type: 'chord-line',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Welcome to Chord Mode! Every line automatically gets a chord line.' }],
  },
  {
    type: 'chord-line',
    children: [{ text: 'C       Am      F       G' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Amazing grace how sweet the sound' }],
  },
  {
    type: 'chord-line',
    children: [{ text: 'C       Am      F       C' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'That saved a wretch like me' }],
  },
  {
    type: 'chord-line',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Navigation: Ctrl/Cmd + Shift + ↑/↓ jumps between chord lines' }],
  },
  {
    type: 'chord-line',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Missing chord lines are automatically created when navigating!' }],
  },
]

// Initial value for regular mode
const regularModeInitialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Welcome to Regular Mode! Add chord lines manually where needed.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
  {
    type: 'chord-line',
    children: [{ text: 'C       Am      F       G' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Amazing grace how sweet the sound' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'That saved a wretch like me (no chords here)' }],
  },
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Use Alt + C to insert chord lines where you want them.' }],
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
    case 'chord-line':
      return (
        <div 
          {...attributes} 
          className="chord-line"
          contentEditable={true}
        >
          {children}
        </div>
      )
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
  const [chordMode, setChordMode] = useState(true) // Default to chord mode
  const [value, setValue] = useState<Descendant[]>(chordMode ? chordModeInitialValue : regularModeInitialValue)
  
  // Create the editor object - stable reference
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  // Helper functions for chord line navigation
  const findNextChordLine = useCallback((currentPath: Path): Path | null => {
    const nodes = Array.from(Editor.nodes(editor, { at: [] }))
    let foundCurrent = false
    
    for (const [node, path] of nodes) {
      if (foundCurrent && SlateElement.isElement(node) && node.type === 'chord-line') {
        return path
      }
      if (Path.equals(path, currentPath)) {
        foundCurrent = true
      }
    }
    return null
  }, [editor])

  const findPreviousChordLine = useCallback((currentPath: Path): Path | null => {
    const nodes = Array.from(Editor.nodes(editor, { at: [] }))
    let lastChordPath: Path | null = null
    
    for (const [node, path] of nodes) {
      if (Path.equals(path, currentPath)) {
        return lastChordPath
      }
      if (SlateElement.isElement(node) && node.type === 'chord-line') {
        lastChordPath = path
      }
    }
    return null
  }, [editor])

  // Function to ensure chord structure is maintained (only when explicitly called)
  const ensureChordStructure = useCallback(() => {
    if (!chordMode) return

    const children = editor.children
    const nodesToInsert: { path: Path; chordLine: any }[] = []
    
    // Check each child node to see if paragraphs need chord lines
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      
      if (SlateElement.isElement(node) && node.type === 'paragraph') {
        // Check if this paragraph should have a chord line before it
        const prevIndex = i - 1
        const hasPrevChordLine = prevIndex >= 0 && 
          SlateElement.isElement(children[prevIndex]) && 
          children[prevIndex].type === 'chord-line'
        
        // Insert chord line if this is the first node or previous node is not a chord line
        if (!hasPrevChordLine) {
          const chordLine = {
            type: 'chord-line' as const,
            children: [{ text: '' }],
          }
          nodesToInsert.push({ path: [i], chordLine })
        }
      }
    }

    // Insert chord lines (in reverse order to maintain path stability)
    if (nodesToInsert.length > 0) {
      Editor.withoutNormalizing(editor, () => {
        for (let i = nodesToInsert.length - 1; i >= 0; i--) {
          const { path, chordLine } = nodesToInsert[i]
          Transforms.insertNodes(editor, chordLine, { at: path })
        }
      })
    }
  }, [editor, chordMode])

  const insertChordLine = useCallback(() => {
    const chordLine = {
      type: 'chord-line' as const,
      children: [{ text: '' }],
    }
    
    Transforms.insertNodes(editor, chordLine)
  }, [editor])

  const toggleChordMode = useCallback(() => {
    const newMode = !chordMode
    setChordMode(newMode)
    
    // Reset editor content based on mode
    const newInitialValue = newMode ? chordModeInitialValue : regularModeInitialValue
    
    // Clear editor and set new content
    Transforms.removeNodes(editor, { at: [] })
    Transforms.insertNodes(editor, newInitialValue)
    
    // Reset cursor to beginning
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 }
    })
    
    setValue(newInitialValue)
  }, [chordMode, editor])

  const navigateToChordLine = useCallback((direction: 'up' | 'down') => {
    const { selection } = editor
    if (!selection) return

    const currentPath = selection.anchor.path.slice(0, -1)
    const nodes = Array.from(Editor.nodes(editor, { at: [] }))
    
    if (chordMode) {
      // In chord mode, navigate between chord-line/paragraph pairs
      let targetPath: Path | null = null
      
      for (let i = 0; i < nodes.length; i++) {
        const [, path] = nodes[i]
        if (Path.equals(path, currentPath)) {
          if (direction === 'down') {
            // Find next chord line (skip the current pair)
            for (let j = i + 1; j < nodes.length; j++) {
              const [nextNode, nextPath] = nodes[j]
              if (SlateElement.isElement(nextNode) && nextNode.type === 'chord-line') {
                targetPath = nextPath
                break
              }
            }
          } else {
            // Find previous chord line
            for (let j = i - 1; j >= 0; j--) {
              const [prevNode, prevPath] = nodes[j]
              if (SlateElement.isElement(prevNode) && prevNode.type === 'chord-line') {
                targetPath = prevPath
                break
              }
            }
          }
          break
        }
      }
      
      if (!targetPath && chordMode) {
        // If no chord line found, create one for the next paragraph
        const currentIndex = nodes.findIndex(([, path]) => Path.equals(path, currentPath))
        const nextParagraphIndex = direction === 'down' 
          ? nodes.slice(currentIndex + 1).findIndex(([node]) => 
              SlateElement.isElement(node) && node.type === 'paragraph')
          : nodes.slice(0, currentIndex).reverse().findIndex(([node]) => 
              SlateElement.isElement(node) && node.type === 'paragraph')
        
        if (nextParagraphIndex !== -1) {
          const realIndex = direction === 'down' 
            ? currentIndex + 1 + nextParagraphIndex 
            : currentIndex - nextParagraphIndex - 1
          
          if (realIndex >= 0 && realIndex < nodes.length) {
            const [, paragraphPath] = nodes[realIndex]
            
            // Insert chord line before this paragraph
            const chordLine = {
              type: 'chord-line' as const,
              children: [{ text: '' }],
            }
            Transforms.insertNodes(editor, chordLine, { at: paragraphPath })
            targetPath = paragraphPath
          }
        }
      }
      
      if (targetPath) {
        Transforms.select(editor, {
          anchor: { path: [...targetPath, 0], offset: 0 },
          focus: { path: [...targetPath, 0], offset: 0 }
        })
      }
    } else {
      // Regular mode - use original navigation
      const targetPath = direction === 'up' 
        ? findPreviousChordLine(currentPath)
        : findNextChordLine(currentPath)
      
      if (targetPath) {
        Transforms.select(editor, {
          anchor: { path: [...targetPath, 0], offset: 0 },
          focus: { path: [...targetPath, 0], offset: 0 }
        })
      }
    }
  }, [editor, findNextChordLine, findPreviousChordLine, chordMode])

  // Handle keyboard shortcuts
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Handle chord line navigation shortcuts
    if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
      switch (event.key) {
        case 'ArrowUp': {
          event.preventDefault()
          navigateToChordLine('up')
          return
        }
        case 'ArrowDown': {
          event.preventDefault()
          navigateToChordLine('down')
          return
        }
      }
    }

    // Handle chord line insertion
    if (event.altKey && event.key === 'c') {
      event.preventDefault()
      insertChordLine()
      return
    }

    // Handle chord structure fix (Alt + Shift + C)
    if (event.altKey && event.shiftKey && event.key === 'C') {
      event.preventDefault()
      if (chordMode) {
        ensureChordStructure()
      }
      return
    }

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
  }, [editor, navigateToChordLine, insertChordLine, chordMode, ensureChordStructure])

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      <Slate 
        editor={editor} 
        initialValue={value} 
        onValueChange={(newValue) => {
          setValue(newValue)
        }}
      >
        <Toolbar 
          editor={editor} 
          chordMode={chordMode} 
          onToggleChordMode={toggleChordMode}
          onFixChordStructure={ensureChordStructure}
        />
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
