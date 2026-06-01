import { create } from 'zustand'

export interface AuthUser {
  id: number
  email: string
  username: string
  display_name: string
  account_type: string
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
  interests: Array<{ id: number; slug: string; label: string }>
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  initializing: boolean
  setUser: (user: AuthUser | null) => void
  setInitializing: (v: boolean) => void
  login: (user: AuthUser, access_token: string, refresh_token: string) => void
  logout: () => void
  updateUser: (partial: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  initializing: !!localStorage.getItem('access_token'), // true se tem token salvo

  setUser: (user) => set({ user, isAuthenticated: !!user, initializing: false }),

  setInitializing: (v) => set({ initializing: v }),

  login: (user, access_token, refresh_token) => {
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    set({ user, isAuthenticated: true, initializing: false })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, isAuthenticated: false, initializing: false })
  },

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),
}))
