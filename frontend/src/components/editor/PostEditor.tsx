import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import { EditorToolbar } from './EditorToolbar'

interface PostEditorProps {
  value?: { html: string; json: unknown }
  onChange: (val: { html: string; json: unknown }) => void
  placeholder?: string
}

export function PostEditor({ value, onChange, placeholder = 'Comece sua reportagem...' }: PostEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ controls: true, nocookie: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value?.json || value?.html || '',
    onUpdate: ({ editor }) => {
      onChange({ html: editor.getHTML(), json: editor.getJSON() })
    },
  })

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <EditorToolbar editor={editor} />
      <div className="p-4 min-h-[300px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
