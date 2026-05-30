import type { Editor } from '@tiptap/react'
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Link2, Image as ImageIcon, Video, Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { ImageUploadButton } from './ImageUploadButton'
import { EmbedDialog } from './EmbedDialog'

interface ToolbarProps {
  editor: Editor | null
}

export function EditorToolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  function setLink() {
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('URL do link:', prev)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5 bg-muted/30">
        <ToolBtn label="Negrito" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label="Itálico" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolBtn label="Título H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label="Título H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          <Heading3 className="h-4 w-4" />
        </ToolBtn>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolBtn label="Lista" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label="Citação" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
          <Quote className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label="Código" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
          <Code className="h-4 w-4" />
        </ToolBtn>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolBtn label="Link" onClick={setLink} active={editor.isActive('link')}>
          <Link2 className="h-4 w-4" />
        </ToolBtn>
        <ImageUploadButton editor={editor} />
        <EmbedDialog editor={editor} />
        <ToolBtn label="Divisória" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </ToolBtn>
      </div>
    </TooltipProvider>
  )
}

function ToolBtn({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={active ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
