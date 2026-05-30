import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { InterestsPicker } from '@/components/profile/InterestsPicker'
import { useAuthStore } from '@/lib/auth'
import { api } from '@/lib/api'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  username: z.string().min(3, 'Mínimo 3 caracteres').max(50).regex(/^[a-z0-9_.]+$/, 'Use apenas letras, números, . e _'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  display_name: z.string().min(2, 'Nome obrigatório'),
  account_type: z.enum(['student', 'professor', 'professional', 'alumni']),
})

type FormData = z.infer<typeof schema>

const ACCOUNT_TYPES = [
  { value: 'student', label: 'Estudante' },
  { value: 'professor', label: 'Professor' },
  { value: 'alumni', label: 'Egresso' },
  { value: 'professional', label: 'Profissional' },
]

export function RegisterPage() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [interests, setInterests] = useState<number[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', username: '', password: '', display_name: '', account_type: 'student' },
  })

  async function onSubmit(data: FormData) {
    try {
      const res = await api.post('/auth/register', data)
      login(res.data.user, res.data.access_token, res.data.refresh_token)
      if (interests.length > 0) {
        await api.put('/users/me/interests', { interest_ids: interests })
      }
      toast.success('Conta criada com sucesso!')
      navigate('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Erro ao criar conta.'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl">
            <Newspaper className="h-6 w-6" /> Redação-Escola Digital
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>
              Já tem conta?{' '}
              <Link to="/login" className="text-primary hover:underline">Entrar</Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="display_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl><Input placeholder="João Silva" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input placeholder="joao.silva" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl><Input placeholder="joao@email.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl><Input type="password" placeholder="Mínimo 6 caracteres" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="account_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de conta</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-2 gap-2"
                      >
                        {ACCOUNT_TYPES.map((t) => (
                          <div key={t.value} className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-accent">
                            <RadioGroupItem value={t.value} id={`type-${t.value}`} />
                            <Label htmlFor={`type-${t.value}`} className="cursor-pointer">{t.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="space-y-2">
                  <Label>Interesses (opcional)</Label>
                  <InterestsPicker selected={interests} onChange={setInterests} />
                </div>

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
