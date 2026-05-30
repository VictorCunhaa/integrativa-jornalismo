import AudioPlayer from 'react-h5-audio-player'
import { UPLOADS_BASE } from '@/lib/utils'

interface AudioPlayerProps {
  url: string
  caption?: string | null
}

export function AudioPlayerComponent({ url, caption }: AudioPlayerProps) {
  const src = url.startsWith('http') ? url : `${UPLOADS_BASE}${url}`
  return (
    <figure className="my-4">
      <AudioPlayer src={src} showJumpControls={false} layout="horizontal-reverse" />
      {caption && <figcaption className="text-xs text-muted-foreground mt-1 text-center">{caption}</figcaption>}
    </figure>
  )
}
