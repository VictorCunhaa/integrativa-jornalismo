import { useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUploadImage } from '@/hooks/useUpload'
import { toast } from 'sonner'
import { UPLOADS_BASE } from '@/lib/utils'

export function ImageUploadButton({ editor }: { editor: Editor }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadImage()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    const toastId = toast.loading('Enviando imagem...')
    try {
      const result = await upload.mutateAsync(file)
      const url = `${UPLOADS_BASE}${result.url}`
      editor.chain().focus().setImage({ src: url, alt: file.name }).run()
      toast.success('Imagem inserida!', { id: toastId })
    } catch {
      toast.error('Erro ao enviar imagem.', { id: toastId })
    }
    e.target.value = ''
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => inputRef.current?.click()}>
            <ImageIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Inserir imagem</TooltipContent>
      </Tooltip>
    </>
  )
}
