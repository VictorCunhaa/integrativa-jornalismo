import { useRef, useState } from 'react'
import { Scissors, UploadCloud, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUploadVideo } from '@/hooks/useUpload'
import { UPLOADS_BASE } from '@/lib/utils'
import { toast } from 'sonner'
import ReactPlayer from 'react-player'

export interface VideoMedia {
  url: string
  mediaType: 'video' | 'embed'
}

interface VideoEditorProps {
  value: VideoMedia | null
  onChange: (media: VideoMedia | null) => void
}

export function VideoEditor({ value, onChange }: VideoEditorProps) {
  const [tab, setTab] = useState<'upload' | 'link'>('upload')
  const [localFile, setLocalFile] = useState<File | null>(null)
  const [localUrl, setLocalUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [isTrimming, setIsTrimming] = useState(false)
  const [trimmedBlob, setTrimmedBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadVideo = useUploadVideo()

  function handleFileSelect(files: FileList | null) {
    if (!files?.[0]) return
    const file = files[0]
    setLocalFile(file)
    setTrimmedBlob(null)
    setLocalUrl(URL.createObjectURL(file))
  }

  function handleVideoLoaded() {
    const dur = videoRef.current?.duration || 0
    setDuration(dur)
    setTrimStart(0)
    setTrimEnd(dur)
  }

  function seekTo(time: number) {
    if (videoRef.current) videoRef.current.currentTime = time
  }

  async function handleTrim() {
    if (!localFile && !trimmedBlob) return
    setIsTrimming(true)
    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util')

      const ffmpeg = new FFmpeg()

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      const sourceBlob = trimmedBlob || localFile!
      const ext = localFile?.name.split('.').pop() || 'mp4'
      const inputName = `input.${ext}`
      const outputName = `output.${ext}`

      await ffmpeg.writeFile(inputName, await fetchFile(sourceBlob))
      await ffmpeg.exec([
        '-ss', String(trimStart),
        '-to', String(trimEnd),
        '-i', inputName,
        '-c', 'copy',
        outputName,
      ])

      const data = await ffmpeg.readFile(outputName) as Uint8Array
      const blob = new Blob([data], { type: sourceBlob.type || 'video/mp4' })
      setTrimmedBlob(blob)

      const newUrl = URL.createObjectURL(blob)
      setLocalUrl(newUrl)
      toast.success('Corte aplicado! Verifique o preview antes de confirmar.')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao processar vídeo. Tente novamente.')
    } finally {
      setIsTrimming(false)
    }
  }

  async function handleConfirmUpload() {
    const source = trimmedBlob || localFile
    if (!source) return
    setIsUploading(true)
    try {
      const file = source instanceof File ? source : new File([source], localFile?.name || 'video.mp4', { type: source.type })
      const result = await uploadVideo.mutateAsync(file)
      onChange({ url: result.url, mediaType: 'video' })
      toast.success('Vídeo salvo!')
    } catch {
      toast.error('Erro ao enviar o vídeo.')
    } finally {
      setIsUploading(false)
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // If there's already a saved value, show it
  if (value && !localFile) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border overflow-hidden aspect-video">
          {value.mediaType === 'video' ? (
            <video controls className="w-full h-full" src={`${UPLOADS_BASE}${value.url}`} />
          ) : (
            <ReactPlayer url={value.url} controls width="100%" height="100%" />
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => onChange(null)}>
          Substituir vídeo
        </Button>
      </div>
    )
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as 'upload' | 'link')}>
      <TabsList className="mb-4">
        <TabsTrigger value="upload">Upload de arquivo</TabsTrigger>
        <TabsTrigger value="link">YouTube / Link</TabsTrigger>
      </TabsList>

      {/* Upload tab */}
      <TabsContent value="upload" className="space-y-4">
        {!localUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files) }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 p-10 text-muted-foreground hover:border-primary/50 hover:bg-muted/30 transition-colors"
          >
            <Video className="h-8 w-8" />
            <p className="text-sm font-medium">Clique ou arraste o arquivo de vídeo</p>
            <p className="text-xs">MP4, WebM</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Video preview */}
            <div className="rounded-xl border overflow-hidden aspect-video bg-black">
              <video
                ref={videoRef}
                src={localUrl}
                className="w-full h-full"
                onLoadedMetadata={handleVideoLoaded}
                controls
              />
            </div>

            {/* Trim controls */}
            {duration > 0 && (
              <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                <p className="text-sm font-medium">Cortar vídeo</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Início: {formatTime(trimStart)}</span>
                    <span>Fim: {formatTime(trimEnd)}</span>
                    <span>Duração: {formatTime(trimEnd - trimStart)}</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Início do corte</Label>
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={trimStart}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value)
                        if (v < trimEnd) { setTrimStart(v); seekTo(v) }
                      }}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Fim do corte</Label>
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={trimEnd}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value)
                        if (v > trimStart) { setTrimEnd(v); seekTo(v) }
                      }}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTrim}
                  disabled={isTrimming || (trimStart === 0 && trimEnd === duration)}
                  className="gap-1.5"
                >
                  <Scissors className="h-4 w-4" />
                  {isTrimming ? 'Processando…' : 'Aplicar Corte'}
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleConfirmUpload} disabled={isUploading} className="gap-1.5">
                <UploadCloud className="h-4 w-4" />
                {isUploading ? 'Enviando…' : 'Confirmar vídeo'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setLocalFile(null); setLocalUrl(null); setTrimmedBlob(null) }}
              >
                Trocar arquivo
              </Button>
            </div>
          </div>
        )}
      </TabsContent>

      {/* YouTube / link tab */}
      <TabsContent value="link" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="yt-url">URL do YouTube ou vídeo</Label>
          <Input
            id="yt-url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        {youtubeUrl && ReactPlayer.canPlay(youtubeUrl) && (
          <div className="rounded-xl overflow-hidden border aspect-video">
            <ReactPlayer url={youtubeUrl} controls width="100%" height="100%" />
          </div>
        )}
        <Button
          onClick={() => { onChange({ url: youtubeUrl, mediaType: 'embed' }); toast.success('Link salvo!') }}
          disabled={!youtubeUrl}
        >
          Confirmar link
        </Button>
      </TabsContent>
    </Tabs>
  )
}
