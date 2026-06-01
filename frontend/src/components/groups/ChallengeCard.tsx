import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CountdownTimer } from './CountdownTimer'
import { Challenge } from '@/hooks/useGroups'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ChallengeCardProps {
  challenge: Challenge
  groupId: number
  isOwner: boolean
}

export function ChallengeCard({ challenge, groupId, isOwner }: ChallengeCardProps) {
  const isExpired = challenge.due_at
    ? new Date(challenge.due_at) < new Date()
    : false

  const submitted = !!challenge.my_submission

  return (
    <Link to={`/groups/${groupId}/challenges/${challenge.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="py-4 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm">{challenge.title}</p>
                {submitted && !isOwner && (
                  <Badge
                    variant="outline"
                    className="text-xs text-green-600 border-green-300 bg-green-50 dark:bg-green-950"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Entregue
                  </Badge>
                )}
                {submitted && challenge.my_submission?.grade != null && !isOwner && (
                  <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300">
                    Nota: {challenge.my_submission.grade.toFixed(1)}
                  </Badge>
                )}
                {isExpired && (
                  <Badge variant="secondary" className="text-xs">Encerrado</Badge>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                {challenge.due_at && !isExpired && (
                  <CountdownTimer dueAt={challenge.due_at} />
                )}
                {challenge.due_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Prazo: {format(new Date(challenge.due_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                )}
                {isOwner && (
                  <span>{challenge.submission_count ?? 0} submissões</span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
