import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  student: 'Estudante',
  professor: 'Professor',
  professional: 'Profissional',
  alumni: 'Egresso',
}

export const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  student: 'bg-slate-100 text-slate-700',
  professor: 'bg-blue-100 text-blue-700',
  alumni: 'bg-purple-100 text-purple-700',
  professional: 'bg-green-100 text-green-700',
}

export const FORMAT_LABELS: Record<string, string> = {
  text: 'Texto',
  photo: 'Foto',
  audio: 'Áudio',
  video: 'Vídeo',
  mixed: 'Multimídia',
}

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
export const UPLOADS_BASE = API_BASE.replace('/api/v1', '')
