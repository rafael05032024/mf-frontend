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
  verified?: boolean
}

export function getMe() {
  return api.get<Me>('/api/accounts/me')
}

export async function login(email: string, password: string) {
  const { token } = await api.post<{ token: string }>('/api/login', { email, password })
  setToken(token)
  // perfil (@), nome e flag de publicador (verified) vêm de /accounts/me; falha aqui não deve impedir o login
  const me = await getMe().catch(() => undefined)
  return { token, verified: me?.verified === true, profile: me?.profile.replace(/^@/, ''), name: me?.name, avatar: mediaUrl(me?.thumb) }
}

export interface UpdateMePayload {
  document?: string
  real_name?: string
  birthdate?: string
  name?: string
  profile?: string
  description?: string
  instagram?: string
  tiktok?: string
}

/** Atualização parcial dos dados da conta (cada etapa do cadastro de criador envia só os seus campos) */
export function updateMe(data: UpdateMePayload) {
  return api.patch<void>('/api/accounts/me', data)
}

function dataUrlToBlob(dataUrl: string) {
  const [head, b64] = dataUrl.split(',')
  const type = /data:([^;]+)/.exec(head)?.[1] ?? 'image/jpeg'
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type })
}

function uploadImage(path: string, dataUrl: string) {
  const form = new FormData()
  form.append('file', dataUrlToBlob(dataUrl), 'image.jpg')
  return api.post<void>(path, form)
}

export const uploadPhoto = (dataUrl: string) => uploadImage('/api/accounts/me/photo', dataUrl)
export const uploadCover = (dataUrl: string) => uploadImage('/api/accounts/me/cover', dataUrl)

/** Cria o plano de assinatura. `value` em reais */
export function createPlan(value: number) {
  return api.post<unknown>('/api/plans', { value })
}

/** Inicia a sessão de verificação de documento; retorna o link do provedor externo (exibido como QRCode) */
export async function createLiveness(): Promise<string> {
  const { verificationUrl } = await api.post<{ id: number; verificationUrl: string }>('/api/liveness')
  return verificationUrl
}
