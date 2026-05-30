import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Post {
  id: number
  title: string
  subtitle: string | null
  format: string
  cover_url: string | null
  visibility: string
  published_at: string | null
  created_at: string
  updated_at: string
  content_html: string
  content_json: unknown | null
  content_snippet?: string
  editoria: { id: number; slug: string; label: string }
  author: {
    id: number
    username: string
    display_name: string
    account_type: string
    avatar_url: string | null
    bio: string | null
    cover_url: string | null
    created_at: string
    interests: Array<{ id: number; slug: string; label: string }>
  }
  media: Array<{ id: number; media_type: string; url: string; caption: string | null; credit: string | null; position: number }>
  comment_count: number
}

export interface PostsPage {
  items: Post[]
  total: number
  page: number
  size: number
  pages: number
}

export function useFeed(editoria?: string, format?: string, page = 1) {
  return useQuery<PostsPage>({
    queryKey: ['feed', editoria, format, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (editoria) params.set('editoria', editoria)
      if (format) params.set('format', format)
      params.set('page', String(page))
      params.set('size', '20')
      const { data } = await api.get(`/posts?${params}`)
      return data
    },
  })
}

export function usePost(id: number) {
  return useQuery<Post>({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useUserPosts(username: string, page = 1) {
  return useQuery<PostsPage>({
    queryKey: ['user-posts', username, page],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}/posts?page=${page}&size=10`)
      return data
    },
    enabled: !!username,
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.post('/posts', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  })
}

export function useUpdatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) =>
      api.patch(`/posts/${id}`, data).then((r) => r.data),
    onSuccess: (post: Post) => {
      qc.invalidateQueries({ queryKey: ['feed'] })
      qc.invalidateQueries({ queryKey: ['post', post.id] })
    },
  })
}

export function usePublishPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.post(`/posts/${id}/publish`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/posts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  })
}

export function useComments(postId: number, page = 1) {
  return useQuery({
    queryKey: ['comments', postId, page],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${postId}/comments?page=${page}&size=20`)
      return data
    },
    enabled: !!postId,
  })
}

export function useCreateComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      api.post(`/posts/${postId}/comments`, { content }).then((r) => r.data),
    onSuccess: (_data, { postId }) => {
      qc.invalidateQueries({ queryKey: ['comments', postId] })
      qc.invalidateQueries({ queryKey: ['post', postId] })
    },
  })
}

export function useTaxonomies() {
  const editorias = useQuery({
    queryKey: ['editorias'],
    queryFn: () => api.get('/editorias').then((r) => r.data),
    staleTime: Infinity,
  })
  const interests = useQuery({
    queryKey: ['interests'],
    queryFn: () => api.get('/interests').then((r) => r.data),
    staleTime: Infinity,
  })
  return { editorias, interests }
}
