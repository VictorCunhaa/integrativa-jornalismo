import { useNavigate } from 'react-router-dom'
import { Camera, Video, Mic, FileText, Layers } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/lib/auth'
import { getInitials, UPLOADS_BASE } from '@/lib/utils'

export function Composer() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  if (!user) return null

  const firstName = user.display_name.split(' ')[0]

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user.avatar_url ? `${UPLOADS_BASE}${user.avatar_url}` : undefined} />
          <AvatarFallback>{getInitials(user.display_name)}</AvatarFallback>
        </Avatar>
        <button
          onClick={() => navigate('/post/new')}
          className="flex-1 text-left rounded-full border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition"
        >
          O que você está apurando, {firstName}?
        </button>
      </div>
      <Separator className="my-3" />
      <div className="flex justify-around">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => navigate('/post/new?format=photo')}>
          <Camera className="h-4 w-4" /> Fotorreportagem
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => navigate('/post/new?format=video')}>
          <Video className="h-4 w-4" /> Vídeo
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => navigate('/post/new?format=audio')}>
          <Mic className="h-4 w-4" /> Podcast
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => navigate('/post/new?format=text')}>
          <FileText className="h-4 w-4" /> Matéria
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => navigate('/post/new?format=mixed')}>
          <Layers className="h-4 w-4" /> Multimídia
        </Button>
      </div>
    </Card>
  )
}
