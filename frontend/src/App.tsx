import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { PrivateRoute, GuestRoute } from '@/routes'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { ProfileEditPage } from '@/pages/ProfileEditPage'
import { PostNewPage } from '@/pages/PostNewPage'
import { PostDetailPage } from '@/pages/PostDetailPage'
import { PostEditPage } from '@/pages/PostEditPage'
import { GroupsPage } from '@/pages/GroupsPage'
import { GroupCreatePage } from '@/pages/GroupCreatePage'
import { GroupDetailPage } from '@/pages/GroupDetailPage'
import { GroupJoinPage } from '@/pages/GroupJoinPage'
import { ChallengeDetailPage } from '@/pages/ChallengeDetailPage'
import { ChallengeCreatePage } from '@/pages/ChallengeCreatePage'
import { SearchPage } from '@/pages/SearchPage'
import { useAuth } from '@/hooks/useAuth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 },
  },
})

function AuthInit({ children }: { children: React.ReactNode }) {
  useAuth()
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInit>
          <Routes>
            {/* Auth pages (no layout) */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

            {/* App layout */}
              <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/post/:id" element={<PostDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/me/edit" element={<PrivateRoute><ProfileEditPage /></PrivateRoute>} />
              <Route path="/post/new" element={<PrivateRoute><PostNewPage /></PrivateRoute>} />
              <Route path="/post/:id/edit" element={<PrivateRoute><PostEditPage /></PrivateRoute>} />
              {/* Groups */}
              <Route path="/groups" element={<PrivateRoute><GroupsPage /></PrivateRoute>} />
              <Route path="/groups/new" element={<PrivateRoute><GroupCreatePage /></PrivateRoute>} />
              <Route path="/groups/join/:token" element={<GroupJoinPage />} />
              <Route path="/groups/:groupId" element={<PrivateRoute><GroupDetailPage /></PrivateRoute>} />
              <Route path="/groups/:groupId/challenges/new" element={<PrivateRoute><ChallengeCreatePage /></PrivateRoute>} />
              <Route path="/groups/:groupId/challenges/:challengeId" element={<PrivateRoute><ChallengeDetailPage /></PrivateRoute>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthInit>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}
