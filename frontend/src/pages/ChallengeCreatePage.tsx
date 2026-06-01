import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateChallenge } from '@/hooks/useGroups'
import { format } from 'date-fns'

export function ChallengeCreatePage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const gId = Number(groupId)
  const { mutateAsync, isPending } = useCreateChallenge(gId)

  const [title, setTitle] = useState('')
  const [descriptionHtml, setDescriptionHtml] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('23:59')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let due_at: string | null = null
    if (dueDate) {
      due_at = new Date(`${dueDate}T${dueTime || '23:59'}:00`).toISOString()
    }
    const challenge = await mutateAsync({ title, description_html: descriptionHtml, due_at })
    navigate(`/groups/${gId}/challenges/${challenge.id}`)
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/groups/${gId}`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Novo Desafio</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurar desafio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Reportagem investigativa sobre mobilidade urbana"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição / Enunciado</Label>
              <textarea
                id="description"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                placeholder="Descreva o desafio, critérios de avaliação, fontes sugeridas..."
                value={descriptionHtml}
                onChange={(e) => setDescriptionHtml(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Suporte a HTML simples. O conteúdo será sanitizado.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Prazo (tempo limite)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="flex-1"
                />
                <Input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-28"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Deixe em branco para desafio sem prazo. O timer é exibido para os alunos.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(`/groups/${gId}`)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || !title.trim()}>
                {isPending ? 'Criando...' : 'Criar desafio'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
