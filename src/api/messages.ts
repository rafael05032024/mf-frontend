import { api } from './client'

interface MessageDTO {
  id: number
  from: number
  to: number
  text: string
  created_at?: string | null
  readed_at?: string | null
}

export interface ApiMessage {
  id: number
  text: string
  createdAt?: string
  /** true quando enviada pelo usuário logado; false quando recebida do suporte */
  mine: boolean
}

function toMessage(m: MessageDTO, userId: number): ApiMessage {
  return {
    id: m.id,
    text: m.text,
    createdAt: m.created_at ?? undefined,
    mine: m.from === userId,
  }
}

/** Histórico entre o usuário (`userId`) e o suporte, em ordem cronológica */
export async function listMessages(userId: number): Promise<ApiMessage[]> {
  const data = await api.get<{ messages?: MessageDTO[] } | MessageDTO[]>('/api/messages')
  const list = Array.isArray(data) ? data : data.messages ?? []
  return list.map(m => toMessage(m, userId))
}

export function sendMessage(text: string): Promise<unknown> {
  return api.post<unknown>('/api/messages', { text })
}

/** Marca as mensagens como lidas */
export function markMessagesRead(): Promise<void> {
  return api.patch<void>('/api/messages/read')
}
