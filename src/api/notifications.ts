import { api } from './client'

interface NotificationDTO {
  id: number
  title?: string | null
  text: string
  type?: number | null
  created_at: string
  readed_at: string | null
  icon?: string | null
}

export interface ApiNotification {
  id: number
  title?: string
  text: string
  /** 1 = sucesso, 2 = erro */
  type?: number
  createdAt: string
  /** Sem `readedAt` a notificação é nova e não lida */
  read: boolean
  /** Nome do ícone lucide em PascalCase ou kebab-case (ex.: "ShieldCheck") */
  icon?: string
}

export async function listNotifications(): Promise<ApiNotification[]> {
  const data = await api.get<{ notifications: NotificationDTO[] }>('/api/notifications')
  return (data.notifications ?? []).map(n => ({ id: n.id, title: n.title || undefined, text: n.text, type: n.type ?? undefined, createdAt: n.created_at, read: n.readed_at != null, icon: n.icon || undefined }))
}

/** Marca a notificação como lida (204 sem corpo) */
export function markNotificationRead(id: number): Promise<void> {
  return api.patch<void>(`/api/notifications/${id}/read`)
}
