import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PostEditor } from '@/components/editor/PostEditor'
import { FormatPickerModal, type PostFormat } from '@/components/editor/FormatPickerModal'
import { PhotoEditor, type PhotoItem } from '@/components/editor/PhotoEditor'
import { AudioEditor, type AudioMedia } from '@/components/editor/AudioEditor'
import { VideoEditor, type VideoMedia } from '@/components/editor/VideoEditor'
import { useCreatePost, useAddMedia, useTaxonomies } from '@/hooks/usePosts'
import { useUploadImage } from '@/hooks/useUpload'
import { FORMAT_LABELS, UPLOADS_BASE } from '@/lib/utils'
import { toast } from 'sonner'

export function PostNewPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const createPost = useCreatePost()
  const addMedia = useAddMedia()
  const uploadImage = useUploadImage()
  const { editorias } = useTaxonomies()
  const coverInputRef = useRef<HTMLInputElement>(null)

  const initialFormat = (searchParams.get('format') as PostFormat) || null
  const [format, setFormat] = useState<PostFormat>(initialFormat || 'text')
  const [showFormatPicker, setShowFormatPicker] = useState(!initialFormat)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [editoriaId, setEditoriaId] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [coverUrl, setCoverUrl] = useState('')
  const [coverPreview, setCoverPreview] = useState('')

  // Format-specific media state
  const [content, setContent] = useState({ html: '', json: null as unknown })
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([])
  const [audioMedia, setAudioMedia] = useState<AudioMedia | null>(null)
  const [videoMedia, setVideoMedia] = useState<VideoMedia | null>(null)

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await uploadImage.mutateAsync(file)
    setCoverUrl(result.url)
    setCoverPreview(`${UPLOADS_BASE}${result.url}`)
  }

  async function save(publish: boolean) {
    if (!title.trim()) return toast.error('O título é obrigatório.')
    if (!editoriaId) return toast.error('Selecione uma editoria.')

    // Validate format-specific media
    if (format === 'audio' && !audioMedia) return toast.error('Adicione um áudio antes de salvar.')
    if (format === 'video' && !videoMedia) return toast.error('Adicione um vídeo antes de salvar.')

    try {
      const post = await createPost.mutateAsync({
        title,
        subtitle: subtitle || undefined,
        format,
        editoria_id: Number(editoriaId),
        content_html: content.html || '<p></p>',
        content_json: content.json,
        cover_url: coverUrl || undefined,
        visibility,
        published_at: publish ? new Date().toISOString() : undefined,
      })

      // Save format-specific media after post creation
      if (format === 'photo') {
        for (let i = 0; i < photoItems.length; i++) {
          const item = photoItems[i]
          await addMedia.mutateAsync({
            postId: post.id,
            media_type: 'image',
            url: item.url,
            caption: item.caption || undefined,
            credit: item.credit || undefined,
            position: i,
          })
        }
      } else if (format === 'audio' && audioMedia) {
        await addMedia.mutateAsync({
          postId: post.id,
          media_type: audioMedia.mediaType,
          url: audioMedia.url,
          position: 0,
        })
      } else if (format === 'video' && videoMedia) {
        await addMedia.mutateAsync({
          postId: post.id,
          media_type: videoMedia.mediaType,
          url: videoMedia.url,
          position: 0,
        })
      }

      toast.success(publish ? 'Matéria publicada!' : 'Rascunho salvo!')
      navigate(`/post/${post.id}`)
    } catch {
      toast.error('Erro ao salvar matéria.')
    }
  }

  const isSaving = createPost.isPending || addMedia.isPending

  return (
    <div className="max-w-5xl mx-auto">
      <FormatPickerModal
        open={showFormatPicker}
        onSelect={(f) => { setFormat(f); setShowFormatPicker(false) }}
        onClose={() => setShowFormatPicker(false)}
      />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {FORMAT_LABELS[format]}
          </span>
          <Button variant="outline" size="sm" onClick={() => save(false)} disabled={isSaving}>
            Salvar rascunho
          </Button>
          <Button size="sm" onClick={() => save(true)} disabled={isSaving}>
            Publicar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Editor area */}
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 resize-none"
          />
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Linha fina (opcional)"
            className="w-full text-lg bg-transparent border-none outline-none placeholder:text-muted-foreground/50 text-muted-foreground italic"
          />

          {/* Format-specific editor */}
          {(format === 'text' || format === 'mixed') && (
            <PostEditor value={{ html: content.html as string, json: content.json }} onChange={setContent} />
          )}
          {format === 'photo' && (
            <PhotoEditor value={photoItems} onChange={setPhotoItems} />
          )}
          {format === 'audio' && (
            <AudioEditor value={audioMedia} onChange={setAudioMedia} />
          )}
          {format === 'video' && (
            <VideoEditor value={videoMedia} onChange={setVideoMedia} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-4 space-y-4">
            {/* Format indicator + change button */}
            <div className="space-y-2">
              <Label>Formato</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{FORMAT_LABELS[format]}</span>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setShowFormatPicker(true)}>
                  Trocar
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Editoria</Label>
              <Select value={editoriaId} onValueChange={setEditoriaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {(editorias.data || []).map((e: { id: number; label: string }) => (
                    <SelectItem key={e.id} value={String(e.id)}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Capa</Label>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              {coverPreview ? (
                <div className="relative">
                  <img src={coverPreview} className="w-full rounded-md aspect-video object-cover" alt="Capa" />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => { setCoverUrl(''); setCoverPreview('') }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <button type="button" onClick={() => coverInputRef.current?.click()}
                  className="w-full border-2 border-dashed rounded-md p-4 text-sm text-muted-foreground hover:bg-accent transition flex items-center justify-center gap-2">
                  <Upload className="h-4 w-4" /> Adicionar capa
                </button>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Visibilidade</Label>
              <RadioGroup value={visibility} onValueChange={setVisibility} className="space-y-1">
                {[['public', 'Pública'], ['restricted', 'Restrita (logados)'], ['private', 'Privada']].map(([v, l]) => (
                  <div key={v} className="flex items-center gap-2">
                    <RadioGroupItem value={v} id={`vis-${v}`} />
                    <Label htmlFor={`vis-${v}`} className="font-normal cursor-pointer">{l}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
