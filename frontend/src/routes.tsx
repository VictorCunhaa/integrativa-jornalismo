import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/auth'

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initializing } = useAuthStore()
  if (initializing) return null  // aguarda auth resolver — sem redirect prematuro
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initializing } = useAuthStore()
  if (initializing) return null
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}
