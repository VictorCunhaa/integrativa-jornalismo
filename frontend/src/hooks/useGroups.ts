import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Post } from './usePosts'

// ─── Types ────────────────────────────────────────────────────────────────

export interface GroupMember {
  id: number
  role: 'owner' | 'member'
  joined_at: string
  user: {
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
}

export interface Submission {
  id: number
  challenge_id: number
  post_id: number
  user_id: number
  grade: number | null
  graded_by: number | null
  graded_at: string | null
  created_at: string
  student: GroupMember['user']
  post: Post
}

export interface Challenge {
  id: number
  group_id: number
  title: string
  description_html: string
  due_at: string | null
  created_at: string
  creator?: GroupMember['user']
  submission_count?: number
  my_submission: Submission | null
  submissions?: Submission[]
}

export interface Group {
  id: number
  name: string
  description: string | null
  invite_token: string
  created_at: string
  creator: GroupMember['user']
  member_count?: number
  members?: GroupMember[]
  challenges?: Challenge[]
}

// ─── Groups ───────────────────────────────────────────────────────────────

export function useMyGroups() {
  return useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then((r) => r.data),
  })
}

export function useGroup(groupId: number | undefined) {
  return useQuery<Group>({
    queryKey: ['group', groupId],
    queryFn: () => api.get(`/groups/${groupId}`).then((r) => r.data),
    enabled: !!groupId,
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description?: string; invite_usernames?: string[] }) =>
      api.post('/groups', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] })
      toast.success('Grupo criado com sucesso!')
    },
    onError: () => toast.error('Erro ao criar grupo'),
  })
}

export function useInviteUsers(groupId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (usernames: string[]) =>
      api.post(`/groups/${groupId}/members`, { usernames }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group', groupId] })
      toast.success('Membros adicionados!')
    },
    onError: () => toast.error('Erro ao convidar membros'),
  })
}

export function useRegenerateInvite(groupId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api.post(`/groups/${groupId}/invite/regenerate`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group', groupId] })
      toast.success('Link de convite regenerado!')
    },
  })
}

export function useRemoveMember(groupId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) =>
      api.delete(`/groups/${groupId}/members/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group', groupId] })
      toast.success('Membro removido')
    },
    onError: () => toast.error('Erro ao remover membro'),
  })
}

export function useJoinGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (token: string) =>
      api.get(`/groups/join/${token}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

// ─── Challenges ───────────────────────────────────────────────────────────

export function useChallenge(groupId: number, challengeId: number | undefined) {
  return useQuery<Challenge>({
    queryKey: ['challenge', groupId, challengeId],
    queryFn: () =>
      api.get(`/groups/${groupId}/challenges/${challengeId}`).then((r) => r.data),
    enabled: !!challengeId,
    refetchInterval: 30_000, // keep timer fresh
  })
}

export function useCreateChallenge(groupId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; description_html: string; due_at?: string | null }) =>
      api.post(`/groups/${groupId}/challenges`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group', groupId] })
      toast.success('Desafio criado!')
    },
    onError: () => toast.error('Erro ao criar desafio'),
  })
}

export function useSubmitPost(groupId: number, challengeId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (post_id: number) =>
      api.post(`/groups/${groupId}/challenges/${challengeId}/submit`, { post_id }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challenge', groupId, challengeId] })
      qc.invalidateQueries({ queryKey: ['group', groupId] })
      toast.success('Post vinculado ao desafio!')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || 'Erro ao submeter post'
      toast.error(msg)
    },
  })
}

export function useGradeSubmission(groupId: number, challengeId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ submissionId, grade }: { submissionId: number; grade: number }) =>
      api
        .patch(`/groups/${groupId}/challenges/${challengeId}/submissions/${submissionId}/grade`, { grade })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challenge', groupId, challengeId] })
      toast.success('Nota salva!')
    },
    onError: () => toast.error('Erro ao salvar nota'),
  })
}

export function useUserPosts() {
  return useQuery<{ items: Post[] }>({
    queryKey: ['my-posts-all'],
    queryFn: async () => {
      const { data } = await api.get('/posts?size=100&page=1')
      // filter only current user's posts handled below
      return data
    },
    staleTime: 30_000,
  })
}
