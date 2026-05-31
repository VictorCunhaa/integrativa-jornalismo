import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUploadImage } from '@/hooks/useUpload'
import { UPLOADS_BASE } from '@/lib/utils'
import { toast } from 'sonner'

export interface PhotoItem {
  url: string
  caption: string
  credit: string
}

interface PhotoEditorProps {
  value: PhotoItem[]
  onChange: (items: PhotoItem[]) => void
}

export function PhotoEditor({ value, onChange }: PhotoEditorProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadImage = useUploadImage()

  async function handleFiles(files: FileList | null) {
    if (!files) return
    for (const file of Array.from(files)) {
      try {
        const result = await uploadImage.mutateAsync(file)
        onChange([...value, { url: result.url, caption: '', credit: '' }])
      } catch {
        toast.error(`Erro ao enviar ${file.name}`)
      }
    }
  }

  function updateItem(index: number, patch: Partial<PhotoItem>) {
    onChange(value.map((item, i) => i === index ? { ...item, ...patch } : item))
  }

  function removeItem(index: number) {
    const next = value.filter((_, i) => i !== index)
    onChange(next)
    if (selected === index) setSelected(null)
  }

  const selectedItem = selected !== null ? value[selected] : null

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 p-8 text-muted-foreground hover:border-primary/50 hover:bg-muted/30 transition-colors"
      >
        <ImagePlus className="h-8 w-8" />
        <p className="text-sm font-medium">Clique ou arraste imagens aqui</p>
        <p className="text-xs">JPEG, PNG, WebP — múltiplas imagens permitidas</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploadImage.isPending && (
        <p className="text-sm text-muted-foreground text-center animate-pulse">Enviando imagem…</p>
      )}

      {/* Gallery grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((item, i) => (
            <div
              key={i}
              onClick={() => setSelected(i === selected ? null : i)}
              className={`relative cursor-pointer rounded-lg overflow-hidden aspect-square ring-2 transition-all ${
                selected === i ? 'ring-primary' : 'ring-transparent hover:ring-muted-foreground/30'
              }`}
            >
              <img
                src={`${UPLOADS_BASE}${item.url}`}
                alt={item.caption || `Imagem ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => { e.stopPropagation(); removeItem(i) }}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Metadata panel for selected image */}
      {selectedItem !== null && selected !== null && (
        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Imagem {selected + 1} de {value.length}
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="caption" className="text-xs">Legenda</Label>
            <Input
              id="caption"
              value={selectedItem.caption}
              onChange={(e) => updateItem(selected, { caption: e.target.value })}
              placeholder="Descreva a imagem…"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="credit" className="text-xs">Crédito</Label>
            <Input
              id="credit"
              value={selectedItem.credit}
              onChange={(e) => updateItem(selected, { credit: e.target.value })}
              placeholder="Fotógrafo / Fonte"
              className="text-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
}
