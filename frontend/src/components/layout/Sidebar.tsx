import { Link, useNavigate } from 'react-router-dom'
import { Home, User, PenSquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/auth'
import { getInitials, ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_COLORS, UPLOADS_BASE } from '@/lib/utils'
import { useTaxonomies } from '@/hooks/usePosts'

export function LeftSidebar({ onNewPost }: { onNewPost?: () => void }) {
  const { user, isAuthenticated } = useAuthStore()

  return (
    <div className="flex flex-col gap-4">
      {isAuthenticated && user && (
        <Card className="overflow-hidden">
          <div className="h-12 bg-sky-700 relative overflow-hidden">
            {user.cover_url && (
              <img
                src={`${UPLOADS_BASE}${user.cover_url}`}
                alt="Capa"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="px-4 pb-4">
            <Link to={`/profile/${user.username}`}>
              <Avatar className="-mt-6 size-14 ring-4 ring-background hover:opacity-80 transition">
                <AvatarImage src={user.avatar_url ? `${UPLOADS_BASE}${user.avatar_url}` : undefined} />
                <AvatarFallback className="text-base">{getInitials(user.display_name)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="mt-2">
              <Link to={`/profile/${user.username}`} className="font-semibold text-sm hover:underline">{user.display_name}</Link>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
              <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full ${ACCOUNT_TYPE_COLORS[user.account_type]}`}>
                {ACCOUNT_TYPE_LABELS[user.account_type]}
              </span>
            </div>
          </div>
        </Card>
      )}

      <nav className="flex flex-col gap-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent transition">
          <Home className="h-4 w-4" /> Início
        </Link>
        {isAuthenticated && (
          <>
            <Link to={`/profile/${user?.username}`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent transition">
              <User className="h-4 w-4" /> Perfil
            </Link>
            <button
              onClick={onNewPost}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent transition text-left"
            >
              <PenSquare className="h-4 w-4" /> Nova Matéria
            </button>
          </>
        )}
      </nav>
    </div>
  )
}

export function RightSidebar() {
  const { editorias } = useTaxonomies()

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Editorias</h3>
        <div className="flex flex-col gap-1">
          {(editorias.data || []).map((e: { id: number; slug: string; label: string }) => (
            <Link
              key={e.id}
              to={`/?editoria=${e.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1 rounded transition"
            >
              {e.label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
