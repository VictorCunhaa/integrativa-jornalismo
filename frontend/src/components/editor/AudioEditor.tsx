import { useEffect, useRef, useState } from 'react'
import { Mic, Pause, Play, Scissors, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUploadAudio } from '@/hooks/useUpload'
import { UPLOADS_BASE } from '@/lib/utils'
import { toast } from 'sonner'
import ReactPlayer from 'react-player'

export interface AudioMedia {
  url: string
  mediaType: 'audio' | 'embed'
}

interface AudioEditorProps {
  value: AudioMedia | null
  onChange: (media: AudioMedia | null) => void
}

export function AudioEditor({ value, onChange }: AudioEditorProps) {
  const [tab, setTab] = useState<'upload' | 'link'>('upload')
  const [localFile, setLocalFile] = useState<File | null>(null)
  const [localUrl, setLocalUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isTrimming, setIsTrimming] = useState(false)
  const [trimmedBlob, setTrimmedBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [externalUrl, setExternalUrl] = useState('')

  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<any>(null)
  const regionRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAudio = useUploadAudio()

  // Initialize WaveSurfer when file is loaded
  useEffect(() => {
    if (!localUrl || !waveformRef.current) return

    let ws: any
    let destroyed = false

    async function init() {
      const WaveSurfer = (await import('wavesurfer.js')).default
      const RegionsPlugin = (await import('wavesurfer.js/dist/plugins/regions.esm.js')).default

      if (destroyed) return

      // Destroy previous instance
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy()
        wavesurferRef.current = null
      }

      const regionsPlugin = RegionsPlugin.create()

      ws = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: '#94a3b8',
        progressColor: '#3b82f6',
        cursorColor: '#1d4ed8',
        height: 80,
        plugins: [regionsPlugin],
      })

      ws.on('ready', () => {
        const dur = ws.getDuration()
        setDuration(dur)
        setTrimStart(0)
        setTrimEnd(dur)

        // Add initial region covering full audio
        const region = regionsPlugin.addRegion({
          start: 0,
          end: dur,
          color: 'rgba(59, 130, 246, 0.15)',
          drag: true,
          resize: true,
        })
        regionRef.current = region

        region.on('update-end', () => {
          setTrimStart(region.start)
          setTrimEnd(region.end)
        })
      })

      ws.on('play', () => setIsPlaying(true))
      ws.on('pause', () => setIsPlaying(false))
      ws.on('finish', () => setIsPlaying(false))

      ws.load(localUrl)
      wavesurferRef.current = ws
    }

    init()

    return () => {
      destroyed = true
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy()
        wavesurferRef.current = null
      }
    }
  }, [localUrl])

  function handleFileSelect(files: FileList | null) {
    if (!files?.[0]) return
    const file = files[0]
    setLocalFile(file)
    setTrimmedBlob(null)
    const url = URL.createObjectURL(file)
    setLocalUrl(url)
  }

  async function handleTrim() {
    if (!localFile && !trimmedBlob) return
    setIsTrimming(true)
    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util')

      const ffmpeg = new FFmpeg()
      ffmpeg.on('progress', ({ progress }: { progress: number }) => {
        // progress is 0-1
        if (progress === 1) setIsTrimming(false)
      })

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      const sourceBlob = trimmedBlob || localFile!
      const ext = localFile?.name.split('.').pop() || 'mp3'
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
      const blob = new Blob([data], { type: sourceBlob.type || 'audio/mpeg' })
      setTrimmedBlob(blob)

      // Update preview
      const newUrl = URL.createObjectURL(blob)
      setLocalUrl(newUrl)
      toast.success('Corte aplicado! Verifique o preview antes de confirmar.')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao processar áudio. Tente novamente.')
    } finally {
      setIsTrimming(false)
    }
  }

  async function handleConfirmUpload() {
    const source = trimmedBlob || localFile
    if (!source) return
    setIsUploading(true)
    try {
      const file = source instanceof File ? source : new File([source], localFile?.name || 'audio.mp3', { type: source.type })
      const result = await uploadAudio.mutateAsync(file)
      onChange({ url: result.url, mediaType: 'audio' })
      toast.success('Áudio salvo!')
    } catch {
      toast.error('Erro ao enviar o áudio.')
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
        <div className="rounded-xl border bg-muted/30 p-4">
          {value.mediaType === 'audio' ? (
            <audio controls className="w-full" src={`${UPLOADS_BASE}${value.url}`} />
          ) : (
            <ReactPlayer url={value.url} controls width="100%" height="60px" />
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => onChange(null)}>
          Substituir áudio
        </Button>
      </div>
    )
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as 'upload' | 'link')}>
      <TabsList className="mb-4">
        <TabsTrigger value="upload">Upload de arquivo</TabsTrigger>
        <TabsTrigger value="link">Link externo</TabsTrigger>
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
            <Mic className="h-8 w-8" />
            <p className="text-sm font-medium">Clique ou arraste o arquivo de áudio</p>
            <p className="text-xs">MP3, WAV, OGG, M4A</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Waveform */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <div ref={waveformRef} className="w-full" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Corte: {formatTime(trimStart)} → {formatTime(trimEnd)}</span>
                <span>Duração total: {formatTime(duration)}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => wavesurferRef.current?.playPause()}
                  className="gap-1.5"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? 'Pausar' : 'Reproduzir'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTrim}
                  disabled={isTrimming || trimStart === 0 && trimEnd === duration}
                  className="gap-1.5"
                >
                  <Scissors className="h-4 w-4" />
                  {isTrimming ? 'Processando…' : 'Aplicar Corte'}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className="gap-1.5"
              >
                <UploadCloud className="h-4 w-4" />
                {isUploading ? 'Enviando…' : 'Confirmar áudio'}
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

      {/* Link tab */}
      <TabsContent value="link" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ext-url">URL do áudio (Spotify, YouTube, SoundCloud…)</Label>
          <Input
            id="ext-url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://open.spotify.com/episode/..."
          />
        </div>
        {externalUrl && ReactPlayer.canPlay(externalUrl) && (
          <div className="rounded-xl overflow-hidden border">
            <ReactPlayer url={externalUrl} controls width="100%" height="80px" />
          </div>
        )}
        <Button
          onClick={() => { onChange({ url: externalUrl, mediaType: 'embed' }); toast.success('Link salvo!') }}
          disabled={!externalUrl}
        >
          Confirmar link
        </Button>
      </TabsContent>
    </Tabs>
  )
}
