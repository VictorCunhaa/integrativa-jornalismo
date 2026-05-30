import ReactPlayer from 'react-player'

interface VideoPlayerProps {
  url: string
  caption?: string | null
}

export function VideoPlayer({ url, caption }: VideoPlayerProps) {
  return (
    <figure className="my-4">
      <div className="rounded-lg overflow-hidden aspect-video bg-black">
        <ReactPlayer url={url} width="100%" height="100%" controls />
      </div>
      {caption && <figcaption className="text-xs text-muted-foreground mt-1 text-center">{caption}</figcaption>}
    </figure>
  )
}
