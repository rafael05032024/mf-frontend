import { api } from './client'
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

export async function login(email: string, password: string) {
  const { token, verified } = await api.post<{ token: string; verified?: boolean }>('/api/login', { email, password })
  setToken(token)
  return { token, verified: verified === true }
}
