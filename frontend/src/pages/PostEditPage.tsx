import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { PostEditor } from '@/components/editor/PostEditor'
import { PhotoEditor, type PhotoItem } from '@/components/editor/PhotoEditor'
import { AudioEditor, type AudioMedia } from '@/components/editor/AudioEditor'
import { VideoEditor, type VideoMedia } from '@/components/editor/VideoEditor'
import { usePost, useUpdatePost, usePublishPost, useAddMedia, useTaxonomies } from '@/hooks/usePosts'
import { useUploadImage } from '@/hooks/useUpload'
import { FORMAT_LABELS, UPLOADS_BASE } from '@/lib/utils'
import { toast } from 'sonner'

export function PostEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data: post, isLoading } = usePost(Number(id))
  const navigate = useNavigate()
  const updatePost = useUpdatePost()
  const publishPost = usePublishPost()
  const addMedia = useAddMedia()
  const uploadImage = useUploadImage()
  const { editorias } = useTaxonomies()
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [format, setFormat] = useState('text')
  const [editoriaId, setEditoriaId] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [coverUrl, setCoverUrl] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [content, setContent] = useState<{ html: string; json: unknown }>({ html: '', json: null })
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([])
  const [audioMedia, setAudioMedia] = useState<AudioMedia | null>(null)
  const [videoMedia, setVideoMedia] = useState<VideoMedia | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (post && !ready) {
      setTitle(post.title)
      setSubtitle(post.subtitle || '')
      setFormat(post.format)
      setEditoriaId(String(post.editoria.id))
      setVisibility(post.visibility)
      setCoverUrl(post.cover_url || '')
      setCoverPreview(post.cover_url ? `${UPLOADS_BASE}${post.cover_url}` : '')
      setContent({ html: post.content_html, json: post.content_json })

      // Seed media state from existing post.media
      if (post.format === 'photo') {
        setPhotoItems(post.media.map((m) => ({ url: m.url, caption: m.caption || '', credit: m.credit || '' })))
      } else if (post.format === 'audio') {
        const m = post.media[0]
        if (m) setAudioMedia({ url: m.url, mediaType: m.media_type as 'audio' | 'embed' })
      } else if (post.format === 'video') {
        const m = post.media[0]
        if (m) setVideoMedia({ url: m.url, mediaType: m.media_type as 'video' | 'embed' })
      }

      setReady(true)
    }
  }, [post, ready])

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await uploadImage.mutateAsync(file)
    setCoverUrl(result.url)
    setCoverPreview(`${UPLOADS_BASE}${result.url}`)
  }

  async function save(publish: boolean) {
    if (!title.trim()) return toast.error('O título é obrigatório.')
    try {
      await updatePost.mutateAsync({
        id: Number(id),
        data: {
          title,
          subtitle: subtitle || undefined,
          editoria_id: Number(editoriaId),
          content_html: content.html,
          content_json: content.json,
          cover_url: coverUrl || undefined,
          visibility,
        },
      })

      if (publish && !post?.published_at) {
        await publishPost.mutateAsync(Number(id))
      }

      toast.success(publish ? 'Matéria publicada!' : 'Alterações salvas!')
      navigate(`/post/${id}`)
    } catch {
      toast.error('Erro ao salvar matéria.')
    }
  }

  if (isLoading || !ready) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  const isSaving = updatePost.isPending

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {FORMAT_LABELS[format]}
          </span>
          <Button variant="outline" size="sm" onClick={() => save(false)} disabled={isSaving}>
            Salvar
          </Button>
          {!post?.published_at && (
            <Button size="sm" onClick={() => save(true)} disabled={isSaving}>
              Publicar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
            placeholder="Título"
          />
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Linha fina (opcional)"
            className="w-full text-lg bg-transparent border-none outline-none placeholder:text-muted-foreground/50 text-muted-foreground italic"
          />

          {ready && (
            <>
              {(format === 'text' || format === 'mixed') && (
                <PostEditor value={{ html: content.html, json: content.json }} onChange={setContent} />
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
            </>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Formato</Label>
              <p className="text-sm font-medium">{FORMAT_LABELS[format]}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Editoria</Label>
              <Select value={editoriaId} onValueChange={setEditoriaId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                {[['public', 'Pública'], ['restricted', 'Restrita'], ['private', 'Privada']].map(([v, l]) => (
                  <div key={v} className="flex items-center gap-2">
                    <RadioGroupItem value={v} id={`evis-${v}`} />
                    <Label htmlFor={`evis-${v}`} className="font-normal cursor-pointer">{l}</Label>
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
