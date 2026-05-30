import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/lib/auth'
import { useComments, useCreateComment } from '@/hooks/usePosts'
import { getInitials, formatRelativeDate, UPLOADS_BASE } from '@/lib/utils'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function CommentList({ postId }: { postId: number }) {
  const { user, isAuthenticated } = useAuthStore()
  const [content, setContent] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useComments(postId, page)
  const createComment = useCreateComment()
  const qc = useQueryClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    await createComment.mutateAsync({ postId, content })
    setContent('')
    toast.success('Comentário publicado!')
  }

  async function handleDelete(commentId: number) {
    await api.delete(`/comments/${commentId}`)
    qc.invalidateQueries({ queryKey: ['comments', postId] })
    toast.success('Comentário excluído.')
  }

  return (
    <div id="comments" className="space-y-6 pt-6">
      <h3 className="font-bold text-lg">
        Comentários {data?.total ? `(${data.total})` : ''}
      </h3>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={user?.avatar_url ? `${UPLOADS_BASE}${user.avatar_url}` : undefined} />
            <AvatarFallback>{getInitials(user?.display_name || 'U')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva um comentário..."
              rows={2}
              className="resize-none"
            />
            <Button type="submit" size="sm" disabled={!content.trim() || createComment.isPending}>
              Publicar
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(data?.items || []).map((comment: { id: number; content: string; created_at: string; author: { id: number; username: string; display_name: string; avatar_url: string | null } }) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={comment.author.avatar_url ? `${UPLOADS_BASE}${comment.author.avatar_url}` : undefined} />
                <AvatarFallback>{getInitials(comment.author.display_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{comment.author.display_name}</span>
                  <span className="text-xs text-muted-foreground">{formatRelativeDate(comment.created_at)}</span>
                  {(user?.id === comment.author.id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-auto text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
            </div>
          ))}

          {data && data.total > data.size && (
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
              Ver mais comentários
            </Button>
          )}

          {data?.total === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
