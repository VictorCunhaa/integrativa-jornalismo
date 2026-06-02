import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuthStore } from '@/lib/auth'
import { api } from '@/lib/api'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type FormData = z.infer<typeof schema>

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function LoginPage() {
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: FormData) {
    try {
      const res = await api.post('/auth/login', data)
      login(res.data.user, res.data.access_token, res.data.refresh_token)
      toast.success(`Bem-vindo(a), ${res.data.user.display_name}!`)
      navigate('/')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message || 'Credenciais inválidas.'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Coluna esquerda — imagem */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/auth-imagem.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      {/* Coluna direita — formulário */}
      <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Voltar ao feed */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao feed
        </button>
        {/* Branding */}
        <div className="flex items-center gap-3 mb-10">
          <img src="/uniplac-logo.png" alt="Uniplac" className="h-12 w-auto" />
          <span className="text-3xl font-bold text-foreground">Apura</span>
        </div>

        <div className="w-full max-w-sm space-y-6">
          {/* Título */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
            <p className="text-sm text-muted-foreground">Acesse sua conta para continuar</p>
          </div>

          {/* Formulário */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>

          {/* Separador */}
          <div className="flex items-center gap-2">
            <hr className="flex-1 border-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <hr className="flex-1 border-border" />
          </div>

          {/* Botão Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={() => toast('Autenticação com Google em breve')}
          >
            <GoogleIcon />
            Continuar com Google
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Demo: ana.silva@demo.br / demo1234
          </p>

          {/* Usuários demo */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground text-center">Entrar como demo</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Estudante', email: 'ana.silva@demo.br' },
                { label: 'Professor', email: 'carlos.mendes@demo.br' },
                { label: 'Egresso', email: 'joao.egresso@demo.br' },
                { label: 'Profissional', email: 'maria.jornalista@demo.br' },
              ].map(({ label, email }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => form.reset({ email, password: 'demo1234' })}
                  className="text-xs px-3 py-2 rounded-md border border-border bg-muted hover:bg-accent transition-colors text-left"
                >
                  <span className="font-medium block">{label}</span>
                  <span className="text-muted-foreground truncate block">{email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
