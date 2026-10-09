import { api } from './client'
import { mediaUrl } from './profiles'

interface SignatureCountDTO {
  subscriptions: number
  subscribers: number
}

/** Quantidade de assinaturas ativas do usuário */
export async function getActiveSubscriptionsCount(): Promise<number> {
  const data = await api.get<SignatureCountDTO>('/api/signatures/count')
  return data.subscriptions
}

interface SignatureDTO {
  profile: string
  thumb: string | null
  expire_at: string
}

export interface Signature {
  handle: string
  avatar?: string
  expiresAt: string
}

export async function listSignatures(): Promise<Signature[]> {
  const data = await api.get<SignatureDTO[]>('/api/signatures')
  return data.map(s => ({
    handle: s.profile,
    avatar: mediaUrl(s.thumb),
    expiresAt: s.expire_at,
  }))
}
