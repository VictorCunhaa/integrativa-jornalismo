import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Post } from '@/hooks/usePosts'

export interface UserSearchResult {
  id: number
  username: string
  display_name: string
  account_type: string
  avatar_url: string | null
  bio: string | null
  cover_url: string | null
  created_at: string
  interests: Array<{ id: number; slug: string; label: string }>
  post_count: number
  post_editorias: Array<{ id: number; slug: string; label: string }>
}

export interface SearchResponse {
  profiles: UserSearchResult[]
  posts: Post[]
  total_profiles: number
  total_posts: number
}

export function useSearch(q: string) {
  const [debouncedQ, setDebouncedQ] = useState(q)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(timer)
  }, [q])

  return useQuery<SearchResponse>({
    queryKey: ['search', debouncedQ],
    queryFn: async () => {
      const { data } = await api.get(`/search?q=${encodeURIComponent(debouncedQ)}`)
      return data
    },
    enabled: debouncedQ.trim().length > 0,
  })
}
