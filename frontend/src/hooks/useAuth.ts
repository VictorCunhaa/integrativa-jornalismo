import { useEffect } from 'react'
import { useAuthStore } from '@/lib/auth'
import { api } from '@/lib/api'

export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token && !store.user) {
      api.get('/auth/me').then((res) => {
        store.setUser(res.data)
      }).catch(() => {
        store.logout()
      })
    } else if (!token) {
      store.setInitializing(false)
    }
  }, [])

  return store
}
