import { api } from './client'
import { mediaUrl } from './profiles'
import { setToken } from './token'

export interface RegisterPayload {
  name: string
  email: string
  profile: string
  password: string
  /** Código de 6 dígitos enviado por e-mail */
  code: string
}

/** Envia o código de verificação de cadastro por e-mail */
export function sendVerificationCode(name: string, email: string) {
  return api.post<unknown>('/api/accounts/verification-code', { name, email })
}

export function createAccount(payload: RegisterPayload) {
  return api.post<unknown>('/api/accounts', payload)
}

export interface Me {
  name: string
  profile: string
  thumb: string | null
  cover_photo?: string | null
  balance: number
  subscriptions: number
  /** Valor da assinatura do publicador, em reais */
  plan_value?: number | null
  /** Nível da conta: 1 = usuário comum; maior que 1 = publicador de conteúdo */
  level?: number
}

export function getMe() {
  return api.get<Me>('/api/accounts/me')
}

export async function login(email: string, password: string) {
  const { token } = await api.post<{ token: string }>('/api/login', { email, password })
  setToken(token)
  // perfil (@), nome e nível (level) vêm de /accounts/me; falha aqui não deve impedir o login
  const me = await getMe().catch(() => undefined)
  return { token, level: me?.level ?? 1, profile: me?.profile.replace(/^@/, ''), name: me?.name, avatar: mediaUrl(me?.thumb), cover: mediaUrl(me?.cover_photo) }
}

export interface UpdateMePayload {
  document?: string
  real_name?: string
  birthdate?: string
  name?: string
  profile?: string
  description?: string
  instagram?: string | null
  tiktok?: string | null
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

/** Atualiza o valor do plano de assinatura. `value` em reais */
export function updatePlan(value: number) {
  return api.put<void>('/api/plans', { value })
}

/** Pré-cadastro como parceiro (publicador) sem concluir a verificação de documentos */
export function preRegisterPartner() {
  return api.post<void>('/api/partners/pre-registration')
}

/** Inicia a sessão de verificação de documentos; retorna o link do provedor externo (exibido como QRCode) */
export async function createLiveness(): Promise<string> {
  const { verificationUrl } = await api.post<{ id: number; verificationUrl: string }>('/api/liveness')
  return verificationUrl
}
