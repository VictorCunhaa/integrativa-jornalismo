import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileSidebar } from '@/components/profile/ProfileSidebar'
import { ProfilePostFeed } from '@/components/profile/ProfilePostFeed'
import { useLayoutContext } from '@/components/layout/AppLayout'
import { useAuthStore } from '@/lib/auth'
import { api } from '@/lib/api'

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const clean = username || ''
  const { setRightPanel, clearRightPanel } = useLayoutContext()
  const { user: currentUser } = useAuthStore()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', clean],
    queryFn: () => api.get(`/users/${clean}`).then((r) => r.data),
    enabled: !!clean,
  })

  // Inject ProfileSidebar into AppLayout's right slot; restore on unmount
  useEffect(() => {
    if (profile) {
      const isOwner = currentUser?.id === profile.id
      setRightPanel(
        <ProfileSidebar
          interests={profile.interests ?? []}
          postEditorias={profile.post_editorias ?? []}
          username={profile.username}
          isOwner={isOwner}
        />
      )
    }
    return () => clearRightPanel()
  }, [profile, currentUser])

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
      <ProfilePostFeed username={clean} />
    </div>
  )
}
