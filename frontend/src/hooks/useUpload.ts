import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post('/uploads/image', form)
      return data as { url: string; thumb_url: string; width: number; height: number }
    },
    onError: () => toast.error('Erro ao enviar imagem.'),
  })
}

export function useUploadVideo() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post('/uploads/video', form)
      return data as { url: string; mime_type: string; size_bytes: number }
    },
    onError: () => toast.error('Erro ao enviar vídeo.'),
  })
}

export function useUploadAudio() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post('/uploads/audio', form)
      return data as { url: string; mime_type: string; size_bytes: number }
    },
    onError: () => toast.error('Erro ao enviar áudio.'),
  })
}
