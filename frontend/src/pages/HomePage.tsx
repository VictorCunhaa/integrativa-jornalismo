import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { PenSquare } from 'lucide-react'
import { PostCard } from '@/components/posts/PostCard'
import { Composer } from '@/components/posts/Composer'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFeed } from '@/hooks/usePosts'
import { useAuthStore } from '@/lib/auth'

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const editoria = searchParams.get('editoria') || undefined
  const [page, setPage] = useState(1)
  const { isAuthenticated } = useAuthStore()
  const { data, isLoading } = useFeed(editoria, undefined, page)

  function selectEditoria(slug: string | undefined) {
    setPage(1)
    if (slug) setSearchParams({ editoria: slug })
    else setSearchParams({})
  }

  return (
    <div className="space-y-4">
      {/* Composer (only when authenticated) */}
      {isAuthenticated && <Composer />}

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-40 w-full rounded-md" />
            </Card>
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <PenSquare className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-semibold text-lg">Nenhuma matéria ainda</h3>
          <p className="text-muted-foreground">
            {editoria ? 'Nenhuma matéria nessa editoria.' : 'Seja o primeiro a publicar!'}
          </p>
          {isAuthenticated && (
            <Button asChild>
              <Link to="/post/new">Criar matéria</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.items.map((post) => <PostCard key={post.id} post={post} />)}

          {data && data.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                Página {page} de {data.pages}
              </span>
              <Button variant="outline" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                Próxima
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
