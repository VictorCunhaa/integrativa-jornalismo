import { Link } from 'react-router-dom'
import { MessageCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  getInitials, formatRelativeDate, ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_COLORS,
  FORMAT_LABELS, UPLOADS_BASE,
} from '@/lib/utils'
import { useAuthStore } from '@/lib/auth'
import { useDeletePost } from '@/hooks/usePosts'
import type { Post } from '@/hooks/usePosts'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuthStore()
  const deletePost = useDeletePost()
  const navigate = useNavigate()
  const isOwner = user?.id === post.author.id

  async function handleDelete() {
    if (!confirm('Excluir esta matéria?')) return
    await deletePost.mutateAsync(post.id)
    toast.success('Matéria excluída.')
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <Link to={`/@${post.author.username}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar_url ? `${UPLOADS_BASE}${post.author.avatar_url}` : undefined} />
              <AvatarFallback>{getInitials(post.author.display_name)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link to={`/@${post.author.username}`} className="font-semibold text-sm hover:underline">
              {post.author.display_name}
            </Link>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${ACCOUNT_TYPE_COLORS[post.author.account_type]}`}>
                {ACCOUNT_TYPE_LABELS[post.author.account_type]}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <Link
                to={`/?editoria=${post.editoria.slug}`}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {post.editoria.label}
              </Link>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {post.published_at ? formatRelativeDate(post.published_at) : 'Rascunho'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs hidden sm:flex">
            {FORMAT_LABELS[post.format]}
          </Badge>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/post/${post.id}/edit`)}>
                  <Pencil className="h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <Link to={`/post/${post.id}`}>
          <h2 className="font-bold text-lg leading-snug hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
          {post.subtitle && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{post.subtitle}</p>
          )}
          {post.content_snippet && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{post.content_snippet}</p>
          )}
        </Link>
      </div>

      {/* Cover image */}
      {post.cover_url && (
        <Link to={`/post/${post.id}`} className="block mx-4 mb-3">
          <img
            src={`${UPLOADS_BASE}${post.cover_url}`}
            alt={post.title}
            className="w-full aspect-video object-cover rounded-md"
          />
        </Link>
      )}

      <Separator />

      {/* Footer */}
      <div className="flex items-center gap-1 px-3 py-1.5">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link to={`/post/${post.id}#comments`}>
            <MessageCircle className="h-4 w-4" />
            {post.comment_count > 0 && <span>{post.comment_count}</span>}
            <span>Comentar</span>
          </Link>
        </Button>
      </div>
    </Card>
  )
}
