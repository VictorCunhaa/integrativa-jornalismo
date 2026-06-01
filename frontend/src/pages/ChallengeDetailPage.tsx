import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, ExternalLink, Download, Trophy,
  Star, User as UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useChallenge, useSubmitPost, useGradeSubmission, Submission } from '@/hooks/useGroups'
import { useAuthStore } from '@/lib/auth'
import { CountdownTimer } from '@/components/groups/CountdownTimer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useUserPosts } from '@/hooks/useGroups'

export function ChallengeDetailPage() {
  const { groupId, challengeId } = useParams<{ groupId: string; challengeId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const gId = Number(groupId)
  const cId = Number(challengeId)

  const { data: challenge, isLoading } = useChallenge(gId, cId)
  const submitPost = useSubmitPost(gId, cId)
  const gradeSubmission = useGradeSubmission(gId, cId)

  const isOwner = challenge?.creator?.id === user?.id

  const isExpired = challenge?.due_at
    ? new Date(challenge.due_at) < new Date()
    : false

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!challenge) return null

  async function handleExport() {
    const res = await api.get(`/groups/${gId}/challenges/${cId}/export`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `desafio_${cId}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportado!')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/groups/${gId}`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold">{challenge.title}</h1>
            {isExpired && <Badge variant="secondary">Encerrado</Badge>}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
            {challenge.due_at && !isExpired && (
              <>
                <span className="text-foreground font-medium">Tempo restante:</span>
                <CountdownTimer dueAt={challenge.due_at} className="text-sm" />
              </>
            )}
            {challenge.due_at && (
              <span>
                Prazo: {format(new Date(challenge.due_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>
        {isOwner && (
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Description */}
      {challenge.description_html && (
        <Card>
          <CardContent className="py-4">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: challenge.description_html }}
            />
          </CardContent>
        </Card>
      )}

      {/* Student: submit post */}
      {!isOwner && (
        <SubmitSection
          groupId={gId}
          challengeId={cId}
          mySubmission={challenge.my_submission}
          isExpired={isExpired}
          onSubmit={(postId) => submitPost.mutateAsync(postId)}
          isPending={submitPost.isPending}
        />
      )}

      {/* Professor: submissions table */}
      {isOwner && (
        <SubmissionsTable
          submissions={challenge.submissions || []}
          groupId={gId}
          challengeId={cId}
          onGrade={(subId, grade) => gradeSubmission.mutateAsync({ submissionId: subId, grade })}
          isGrading={gradeSubmission.isPending}
        />
      )}
    </div>
  )
}

// ─── Submit Section ────────────────────────────────────────────────────────

function SubmitSection({
  groupId, challengeId, mySubmission, isExpired, onSubmit, isPending,
}: {
  groupId: number
  challengeId: number
  mySubmission: Submission | null
  isExpired: boolean
  onSubmit: (postId: number) => Promise<unknown>
  isPending: boolean
}) {
  const { user } = useAuthStore()
  const { data: feed } = useUserPosts()
  const [selectedPostId, setSelectedPostId] = useState<string>('')

  const myPosts = (feed?.items || []).filter((p) => p.author.username === user?.username)

  if (mySubmission) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-700 dark:text-green-400">Desafio entregue!</p>
              <Link
                to={`/post/${mySubmission.post_id}`}
                className="text-sm text-primary flex items-center gap-1 mt-1 hover:underline"
              >
                Ver post vinculado
                <ExternalLink className="w-3 h-3" />
              </Link>
              {mySubmission.grade != null && (
                <div className="mt-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-lg">{mySubmission.grade.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">/ 10</span>
                </div>
              )}
              {mySubmission.grade == null && (
                <p className="text-xs text-muted-foreground mt-1">Aguardando avaliação do professor</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Sua submissão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isExpired ? (
          <p className="text-muted-foreground text-sm">O prazo deste desafio encerrou.</p>
        ) : (
          <>
            {/* Link existing post */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Vincular post existente</p>
              <div className="flex gap-2">
                <Select value={selectedPostId} onValueChange={setSelectedPostId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um post seu..." />
                  </SelectTrigger>
                  <SelectContent>
                    {myPosts.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={!selectedPostId || isPending}
                  onClick={() => onSubmit(Number(selectedPostId))}
                >
                  {isPending ? 'Enviando...' : 'Vincular'}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">ou</span>
              <Separator className="flex-1" />
            </div>

            {/* Create new post */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Criar post novo</p>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/post/new?challenge=${challengeId}&group=${groupId}`}>
                  Criar e vincular post
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Após publicar, volte aqui para vincular o post ao desafio.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Submissions Table (professor view) ───────────────────────────────────

function SubmissionsTable({
  submissions, groupId, challengeId, onGrade, isGrading,
}: {
  submissions: Submission[]
  groupId: number
  challengeId: number
  onGrade: (subId: number, grade: number) => Promise<unknown>
  isGrading: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          Submissões ({submissions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {submissions.length === 0 && (
          <p className="text-muted-foreground text-sm px-6 pb-4">
            Nenhuma submissão ainda.
          </p>
        )}
        <div className="divide-y">
          {submissions.map((sub) => (
            <SubmissionRow
              key={sub.id}
              submission={sub}
              onGrade={(grade) => onGrade(sub.id, grade)}
              isGrading={isGrading}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SubmissionRow({
  submission, onGrade, isGrading,
}: {
  submission: Submission
  onGrade: (grade: number) => Promise<unknown>
  isGrading: boolean
}) {
  const [gradeInput, setGradeInput] = useState(
    submission.grade != null ? String(submission.grade) : ''
  )
  const [editing, setEditing] = useState(false)

  async function handleSave() {
    const g = parseFloat(gradeInput)
    if (isNaN(g) || g < 0 || g > 10) {
      toast.error('Nota deve ser entre 0 e 10')
      return
    }
    await onGrade(g)
    setEditing(false)
  }

  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={submission.student.avatar_url || undefined} />
        <AvatarFallback>{submission.student.display_name[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate">{submission.student.display_name}</p>
          <span className="text-xs text-muted-foreground">@{submission.student.username}</span>
        </div>
        <Link
          to={`/post/${submission.post_id}`}
          className="text-xs text-primary flex items-center gap-1 mt-0.5 hover:underline"
        >
          {submission.post.title}
          <ExternalLink className="w-3 h-3" />
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">
          Enviado {format(new Date(submission.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      </div>

      {/* Grade */}
      <div className="shrink-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={gradeInput}
              onChange={(e) => setGradeInput(e.target.value)}
              className="w-20 text-sm"
              placeholder="0–10"
            />
            <Button size="sm" onClick={handleSave} disabled={isGrading}>
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              ✕
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 group"
            title="Clique para avaliar"
          >
            {submission.grade != null ? (
              <span className="text-lg font-bold text-primary group-hover:text-primary/80">
                {submission.grade.toFixed(1)}
                <span className="text-xs text-muted-foreground font-normal ml-0.5">/10</span>
              </span>
            ) : (
              <Badge
                variant="outline"
                className="text-xs cursor-pointer group-hover:bg-accent"
              >
                <Star className="w-3 h-3 mr-1" />
                Avaliar
              </Badge>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
