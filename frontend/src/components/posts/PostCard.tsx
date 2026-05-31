import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, MoreHorizontal, Pencil, Send, SendHorizonal, Share2, ThumbsUp, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  getInitials, formatRelativeDate, ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_COLORS,
  FORMAT_LABELS, UPLOADS_BASE,
} from '@/lib/utils'
import { useAuthStore } from '@/lib/auth'
import { useDeletePost, useCommentPreview, useCreateComment, useLike } from '@/hooks/usePosts'
import type { Post } from '@/hooks/usePosts'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { ShareModal } from './ShareModal'

export function PostCard({ post }: { post: Post }) {
  const { user, isAuthenticated } = useAuthStore()
  const deletePost = useDeletePost()
  const navigate = useNavigate()
  const isOwner = user?.id === post.author.id

  // Comment panel state
  const [showComments, setShowComments] = useState(false)
  const [body, setBody] = useState('')
  const [shareOpen, setShareOpen] = useState(false)

  const { data: commentData, isLoading: commentsLoading } = useCommentPreview(post.id, showComments)
  const createComment = useCreateComment()
  const like = useLike(post.id)

  async function handleDelete() {
    if (!confirm('Excluir esta matéria?')) return
    await deletePost.mutateAsync(post.id)
    toast.success('Matéria excluída.')
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    await createComment.mutateAsync({ postId: post.id, content: body.trim() })
    setBody('')
  }

  const comments: Array<{ id: number; content: string; created_at: string; author: { id: number; username: string; display_name: string; avatar_url: string | null } }> =
    commentData?.items ?? []

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
      <div className="flex items-center px-1 py-1">
        {/* Like */}
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 gap-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 ${post.liked_by_me ? 'text-blue-600 font-semibold' : ''}`}
          onClick={() => like.mutate()}
          disabled={like.isPending}
        >
          <ThumbsUp className={`h-4 w-4 ${post.liked_by_me ? 'fill-blue-600 text-blue-600' : ''}`} />
          {post.like_count > 0 && <span className="text-xs">{post.like_count}</span>}
          <span className="text-xs">Gostar</span>
        </Button>

        {/* Comment */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-1.5 text-muted-foreground"
          onClick={() => setShowComments(v => !v)}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs">
            {post.comment_count > 0
              ? `${post.comment_count} ${post.comment_count === 1 ? 'Comentário' : 'Comentários'}`
              : 'Comentar'}
          </span>
        </Button>

        {/* Share */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-1.5 text-muted-foreground"
          onClick={() => setShareOpen(true)}
        >
          <Share2 className="h-4 w-4" />
          <span className="text-xs">Compartilhar</span>
        </Button>

        {/* Send */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-1.5 text-muted-foreground"
        >
          <Send className="h-4 w-4" />
          <span className="text-xs">Enviar</span>
        </Button>
      </div>

      <ShareModal
        postUrl={`${window.location.origin}/post/${post.id}`}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />

      {/* Inline comment panel — shown on toggle */}
      {showComments && (
        <>
          <Separator />
          <div className="px-4 py-3 flex flex-col gap-3">

            {/* Comment list */}
            {commentsLoading ? (
              <div className="flex flex-col gap-3">
                {[0, 1].map(i => (
                  <div key={i} className="flex items-start gap-2">
                    <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                    <div className="flex flex-col gap-1 flex-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {comments.map(comment => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={comment.author.avatar_url ? `${UPLOADS_BASE}${comment.author.avatar_url}` : undefined} />
                      <AvatarFallback className="text-xs">{getInitials(comment.author.display_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">{comment.author.display_name}</span>
                      <span className="text-sm">{comment.content}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mostrar mais */}
            {post.comment_count > 2 && (
              <Button variant="link" size="sm" asChild className="p-0 h-auto self-start text-muted-foreground">
                <Link to={`/post/${post.id}#comments`}>Mostrar mais</Link>
              </Button>
            )}

            {/* Comment form (authenticated only) */}
            {isAuthenticated && (
              <form onSubmit={handleSubmitComment} className="flex items-end gap-2">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={user?.avatar_url ? `${UPLOADS_BASE}${user.avatar_url}` : undefined} />
                  <AvatarFallback className="text-xs">{getInitials(user?.display_name ?? '')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Adicionar comentário..."
                    value={body}
                    onChange={e => {
                      setBody(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                    rows={1}
                    className="resize-none text-sm rounded-full px-4 py-2 pr-10 min-h-0 overflow-hidden leading-5"
                    style={{ height: '36px' }}
                  />
                  {body.trim() && (
                    <button
                      type="submit"
                      disabled={createComment.isPending}
                      className="absolute right-3 bottom-2 text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
            )}

          </div>
        </>
      )}
    </Card>
  )
}
