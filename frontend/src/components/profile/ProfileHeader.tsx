import { Link } from 'react-router-dom'
import { Edit } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/auth'
import { getInitials, ACCOUNT_TYPE_LABELS, UPLOADS_BASE } from '@/lib/utils'

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

export function ProfileHeader({ profile }: { profile: ProfileUser }) {
  const { user: currentUser } = useAuthStore()
  const isOwner = currentUser?.id === profile.id

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      {/* Cover */}
      <div className="h-48 bg-gradient-to-r from-primary/30 to-primary/10 relative overflow-hidden">
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
            <span className="text-sm text-muted-foreground">{profile.post_count} matérias</span>
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
