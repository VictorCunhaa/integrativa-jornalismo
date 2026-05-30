import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { InterestsPicker } from '@/components/profile/InterestsPicker'
import { useAuthStore } from '@/lib/auth'
import { api } from '@/lib/api'
import { toast } from 'sonner'

const schema = z.object({
  display_name: z.string().min(2, 'Nome obrigatório'),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

type FormData = z.infer<typeof schema>

export function ProfileEditPage() {
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [interests, setInterests] = useState<number[]>(user?.interests.map((i) => i.id) || [])
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { display_name: user?.display_name || '', bio: user?.bio || '' },
  })

  async function onSubmit(data: FormData) {
    try {
      const res = await api.patch('/users/me', data)
      await api.put('/users/me/interests', { interest_ids: interests })
      if (coverFile) {
        const form = new FormData()
        form.append('file', coverFile)
        const coverRes = await api.post('/users/me/cover', form)
        updateUser({ cover_url: coverRes.data.cover_url })
      }
      updateUser(res.data)
      toast.success('Perfil atualizado!')
      navigate(`/@${user?.username}`)
    } catch {
      toast.error('Erro ao atualizar perfil.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Editar perfil</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foto de perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUpload />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foto de capa</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg p-6 hover:bg-accent transition text-muted-foreground">
            <Upload className="h-5 w-5" />
            <span className="text-sm">{coverFile ? coverFile.name : 'Clique para selecionar uma imagem de capa'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="display_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de exibição</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Conte um pouco sobre você..."
                      maxLength={500}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground text-right">{(field.value || '').length}/500</p>
                  <FormMessage />
                </FormItem>
              )} />

              <Separator />

              <div className="space-y-2">
                <Label>Interesses</Label>
                <InterestsPicker selected={interests} onChange={setInterests} />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
