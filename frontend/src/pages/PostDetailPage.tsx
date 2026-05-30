import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { MediaGallery } from '@/components/posts/MediaGallery'
import { CommentList } from '@/components/posts/CommentList'
import { usePost, useDeletePost } from '@/hooks/usePosts'
import { useAuthStore } from '@/lib/auth'
import { getInitials, formatDate, ACCOUNT_TYPE_LABELS, UPLOADS_BASE } from '@/lib/utils'
import { toast } from 'sonner'

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: post, isLoading } = usePost(Number(id))
  const { user } = useAuthStore()
  const deletePost = useDeletePost()
  const navigate = useNavigate()

  const isOwner = user?.id === post?.author.id

  async function handleDelete() {
    if (!confirm('Excluir esta matéria?')) return
    await deletePost.mutateAsync(Number(id))
    toast.success('Matéria excluída.')
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 py-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-6 w-3/5" />
        <div className="flex gap-3 items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-semibold">Matéria não encontrada</h2>
        <Button variant="link" asChild><Link to="/">Voltar ao início</Link></Button>
      </div>
    )
  }

  return (
    <article className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Button variant="ghost" size="sm" className="gap-1 px-2" asChild>
          <Link to="/"><ChevronLeft className="h-4 w-4" /> Início</Link>
        </Button>
        <span>›</span>
        <Link to={`/?editoria=${post.editoria.slug}`} className="hover:text-foreground transition">
          {post.editoria.label}
        </Link>
      </div>

      {/* Headline */}
      <header className="space-y-3 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{post.title}</h1>
        {post.subtitle && (
          <p className="text-xl text-muted-foreground font-serif italic">{post.subtitle}</p>
        )}

        <div className="flex items-center justify-between flex-wrap gap-4">
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
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{ACCOUNT_TYPE_LABELS[post.author.account_type]}</span>
                <span>•</span>
                <span>{post.published_at ? formatDate(post.published_at) : 'Rascunho'}</span>
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/post/${post.id}/edit`}><Edit className="h-4 w-4" /> Editar</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Cover */}
      {post.cover_url && (
        <div className="mb-8">
          <img
            src={`${UPLOADS_BASE}${post.cover_url}`}
            alt={post.title}
            className="w-full rounded-xl object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Body */}
      <div
        className="prose prose-lg max-w-none font-serif prose-headings:font-sans prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: post.content_html }}
      />

      {/* Attached media */}
      <MediaGallery media={post.media} />

      <Separator className="my-8" />

      {/* Comments */}
      <CommentList postId={post.id} />
    </article>
  )
}
