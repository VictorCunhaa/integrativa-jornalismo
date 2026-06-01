import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PostCard } from '@/components/posts/PostCard'
import { useUserPosts } from '@/hooks/usePosts'
import type { Post } from '@/hooks/usePosts'

interface ProfilePostFeedProps {
  username: string
}

export function ProfilePostFeed({ username }: ProfilePostFeedProps) {
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<Post[]>([])

  const { data, isLoading, isFetching } = useUserPosts(username, page)

  const currentItems: Post[] = data?.items ?? []
  const hasMore = data ? page < data.pages : false

  // Merge new page into accumulated list
  const posts: Post[] =
    page === 1
      ? currentItems
      : [...accumulated, ...currentItems.filter((p) => !accumulated.some((a) => a.id === p.id))]

  function loadMore() {
    setAccumulated(posts)
    setPage((p) => p + 1)
  }

  if (isLoading && page === 1) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
      </div>
    )
  }

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Nenhuma publicação ainda.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={isFetching}
          >
            {isFetching ? 'Carregando...' : 'Ver mais'}
          </Button>
        </div>
      )}
    </div>
  )
}
