import { VideoPlayer } from './VideoPlayer'
import { AudioPlayerComponent } from './AudioPlayer'
import { UPLOADS_BASE } from '@/lib/utils'
import type { Post } from '@/hooks/usePosts'

export function MediaGallery({ media }: { media: Post['media'] }) {
  if (!media || media.length === 0) return null

  return (
    <div className="space-y-4 mt-6">
      {media.map((item) => {
        if (item.media_type === 'image') {
          return (
            <figure key={item.id}>
              <img
                src={`${UPLOADS_BASE}${item.url}`}
                alt={item.caption || ''}
                className="w-full rounded-lg object-cover"
              />
              {item.caption && (
                <figcaption className="text-xs text-muted-foreground mt-1 text-center">
                  {item.caption}{item.credit && ` — Foto: ${item.credit}`}
                </figcaption>
              )}
            </figure>
          )
        }
        if (item.media_type === 'video' || item.media_type === 'embed') {
          return <VideoPlayer key={item.id} url={item.url} caption={item.caption} />
        }
        if (item.media_type === 'audio') {
          return <AudioPlayerComponent key={item.id} url={item.url} caption={item.caption} />
        }
        return null
      })}
    </div>
  )
}
