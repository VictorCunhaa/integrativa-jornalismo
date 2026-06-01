import { Link } from 'react-router-dom'
import { Edit } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/auth'
import { getInitials, ACCOUNT_TYPE_LABELS, UPLOADS_BASE } from '@/lib/utils'
import { getRankInfo } from '@/lib/ranks'

interface ProfileUser {
  id: number
  username: string
  display_name: string
  account_type: string
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
  post_count: number
  interests: Array<{ id: number; slug: string; label: string }>
}

// Pontos fixos de exemplo — substituir por dado real da API futuramente
const EXAMPLE_POINTS: Record<string, number> = {}
function getExamplePoints(username: string): number {
  if (!(username in EXAMPLE_POINTS)) {
    // Gera um valor estável baseado no username para não variar entre renders
    let hash = 0
    for (let i = 0; i < username.length; i++) hash = (hash * 31 + username.charCodeAt(i)) & 0xffff
    EXAMPLE_POINTS[username] = (hash % 1400) + 50
  }
  return EXAMPLE_POINTS[username]
}

export function ProfileHeader({ profile }: { profile: ProfileUser }) {
  const { user: currentUser } = useAuthStore()
  const isOwner = currentUser?.id === profile.id

  const points = getExamplePoints(profile.username)
  const rankInfo = getRankInfo(points)

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      {/* Cover */}
      <div className="h-48 bg-sky-700 relative overflow-hidden">
        {profile.cover_url && (
          <img
            src={`${UPLOADS_BASE}${profile.cover_url}`}
            alt="Capa"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="px-6 pb-6">
        {/* Avatar + actions row */}
        <div className="flex items-end justify-between -mt-12 mb-4">
          <Avatar className="size-24 ring-4 ring-background">
            <AvatarImage src={profile.avatar_url ? `${UPLOADS_BASE}${profile.avatar_url}` : undefined} />
            <AvatarFallback className="text-2xl">{getInitials(profile.display_name)}</AvatarFallback>
          </Avatar>
          {isOwner && (
            <Button variant="outline" size="sm" asChild className="mb-1">
              <Link to="/me/edit">
                <Edit className="h-4 w-4" /> Editar perfil
              </Link>
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div>
            <h1 className="text-xl font-bold">{profile.display_name}</h1>
            <p className="text-muted-foreground text-sm">@{profile.username}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{ACCOUNT_TYPE_LABELS[profile.account_type]}</Badge>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              {rankInfo.current.title}
            </Badge>
            <span className="text-sm text-muted-foreground">{profile.post_count} matérias</span>
          </div>

          {/* Barra de progressão de rank */}
          <div className="space-y-1 pt-0.5">
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${rankInfo.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {rankInfo.next
                ? `${rankInfo.current.title} → ${rankInfo.next.title}`
                : rankInfo.current.title}
            </p>
          </div>

          {profile.bio && (
            <p className="text-sm text-foreground whitespace-pre-line">{profile.bio}</p>
          )}

          {profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.interests.map((i) => (
                <Link
                  key={i.id}
                  to={`/?editoria=${i.slug}`}
                  className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition"
                >
                  {i.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
