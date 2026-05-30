import { useRef } from 'react'
import { Camera } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/lib/auth'
import { useUploadImage } from '@/hooks/useUpload'
import { api } from '@/lib/api'
import { getInitials, UPLOADS_BASE } from '@/lib/utils'
import { toast } from 'sonner'

export function AvatarUpload() {
  const { user, updateUser } = useAuthStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadImage()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const toastId = toast.loading('Atualizando avatar...')
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post('/users/me/avatar', form)
      updateUser({ avatar_url: data.avatar_url })
      toast.success('Avatar atualizado!', { id: toastId })
    } catch {
      toast.error('Erro ao atualizar avatar.', { id: toastId })
    }
    e.target.value = ''
  }

  return (
    <div className="relative w-fit">
      <Avatar className="size-20">
        <AvatarImage src={user?.avatar_url ? `${UPLOADS_BASE}${user.avatar_url}` : undefined} />
        <AvatarFallback className="text-xl">{getInitials(user?.display_name || 'U')}</AvatarFallback>
      </Avatar>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 hover:bg-primary/90 transition"
      >
        <Camera className="h-3.5 w-3.5" />
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
