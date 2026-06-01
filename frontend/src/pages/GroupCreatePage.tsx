import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCreateGroup } from '@/hooks/useGroups'

export function GroupCreatePage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateGroup()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inviteRaw, setInviteRaw] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const invite_usernames = inviteRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const group = await mutateAsync({ name, description: description || undefined, invite_usernames })
    navigate(`/groups/${group.id}`)
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Novo Grupo</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações do grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do grupo *</Label>
              <Input
                id="name"
                placeholder="Ex: Jornalismo 2025 — Turma A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o objetivo do grupo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite">Convidar membros (opcional)</Label>
              <Input
                id="invite"
                placeholder="usuario1, usuario2, usuario3"
                value={inviteRaw}
                onChange={(e) => setInviteRaw(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Digite os usernames separados por vírgula. Você também pode gerar um link de convite depois.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || !name.trim()}>
                {isPending ? 'Criando...' : 'Criar grupo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
