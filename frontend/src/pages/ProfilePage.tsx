import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { PostCard } from '@/components/posts/PostCard'
import { api } from '@/lib/api'
import { useUserPosts } from '@/hooks/usePosts'
import { ACCOUNT_TYPE_LABELS } from '@/lib/utils'

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const clean = username?.replace('@', '') || ''

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', clean],
    queryFn: () => api.get(`/users/${clean}`).then((r) => r.data),
    enabled: !!clean,
  })

  const { data: posts, isLoading: postsLoading } = useUserPosts(clean)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-6 space-y-3">
            <Skeleton className="h-14 w-14 rounded-full -mt-10" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-semibold">Usuário não encontrado</h2>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ProfileHeader profile={profile} />

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Matérias</TabsTrigger>
          <TabsTrigger value="about">Sobre</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-4">
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </Card>
              ))}
            </div>
          ) : posts?.items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma matéria publicada ainda.
            </div>
          ) : (
            posts?.items.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </TabsContent>

        <TabsContent value="about" className="mt-4">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Tipo de conta</h3>
              <p className="text-sm text-muted-foreground">{ACCOUNT_TYPE_LABELS[profile.account_type]}</p>
            </div>
            {profile.bio && (
              <div>
                <h3 className="font-semibold mb-1">Bio</h3>
                <p className="text-sm whitespace-pre-line">{profile.bio}</p>
              </div>
            )}
            {profile.interests.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Interesses</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((i: { id: number; label: string; slug: string }) => (
                    <span key={i.id} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {i.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
