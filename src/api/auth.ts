import { api } from './client'
import { mediaUrl } from './profiles'
import { setToken } from './token'

export interface RegisterPayload {
  name: string
  email: string
  profile: string
  password: string
}

export function createAccount(payload: RegisterPayload) {
  return api.post<unknown>('/api/accounts', payload)
}

export interface Me {
  name: string
  profile: string
  thumb: string | null
  balance: number
  subscriptions: number
}

export function getMe() {
  return api.get<Me>('/api/accounts/me')
}

export async function login(email: string, password: string) {
  const { token, verified } = await api.post<{ token: string; verified?: boolean }>('/api/login', { email, password })
  setToken(token)
  // perfil (@) e nome reais da conta; falha aqui não deve impedir o login
  const me = await getMe().catch(() => undefined)
  return { token, verified: verified === true, profile: me?.profile.replace(/^@/, ''), name: me?.name, avatar: mediaUrl(me?.thumb) }
}
