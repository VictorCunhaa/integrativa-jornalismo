import { Camera, FileText, Layers, Mic, Video } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type PostFormat = 'text' | 'photo' | 'audio' | 'video' | 'mixed'

interface FormatPickerModalProps {
  open: boolean
  onSelect: (format: PostFormat) => void
  onClose: () => void
}

const FORMATS: { value: PostFormat; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'text',
    label: 'Matéria',
    description: 'Texto com editor rico, imagens e links',
    icon: <FileText className="h-8 w-8" />,
  },
  {
    value: 'audio',
    label: 'Podcast',
    description: 'Áudio com waveform, trim e link externo',
    icon: <Mic className="h-8 w-8" />,
  },
  {
    value: 'video',
    label: 'Reportagem em Vídeo',
    description: 'Upload de vídeo, trim ou link do YouTube',
    icon: <Video className="h-8 w-8" />,
  },
  {
    value: 'photo',
    label: 'Fotorreportagem',
    description: 'Galeria de fotos com legendas e créditos',
    icon: <Camera className="h-8 w-8" />,
  },
  {
    value: 'mixed',
    label: 'Multimídia',
    description: 'Texto combinado com vídeo, áudio e imagens',
    icon: <Layers className="h-8 w-8" />,
  },
]

export function FormatPickerModal({ open, onSelect, onClose }: FormatPickerModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">O que você vai criar hoje?</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => onSelect(f.value)}
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-transparent bg-muted/50 p-4 text-center hover:border-primary hover:bg-primary/5 transition-all"
            >
              <span className="text-primary">{f.icon}</span>
              <span className="font-semibold text-sm">{f.label}</span>
              <span className="text-xs text-muted-foreground leading-snug">{f.description}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
