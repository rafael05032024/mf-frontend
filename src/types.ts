export type MediaType = 'photo' | 'video'

export interface Media {
  id: string
  type: MediaType
  url: string // imagem ou thumbnail do vídeo
  caption: string
  paid: boolean
  createdAt: string
  duration?: string
}

export interface Profile {
  id: string
  name: string
  handle: string
  avatar: string
  cover: string
  verified: boolean
  bio: string
  instagram?: string
  tiktok?: string
  priceBRL: number
  /** Usuário logado tem assinatura ativa com o perfil (libera mídias privadas) */
  signed?: boolean
  featured?: boolean
  counters?: { photos: number; videos: number; private: number }
  media: Media[]
}

export type CreatorStatus = 'none' | 'pending' | 'verified'

export interface Subscription {
  profileId: string
  handle: string
  avatar: string
  startedAt: string
  expiresAt: string
}

export type TransactionKind = 'recharge' | 'subscription' | 'withdraw' | 'earning'

export interface Transaction {
  id: string
  kind: TransactionKind
  description: string
  amountFt: number // positivo = entrada, negativo = saída
  date: string
}

export interface AppNotification {
  id: string
  message: string
  date: string
  read: boolean
  link?: string
}

export interface CreatorInfo {
  country: string
  cpf: string
  legalName: string
  birthDate: string
  priceBRL: number
  bio: string
  instagram?: string
  tiktok?: string
  avatar: string
  cover: string
  stats: CreatorStats
}

export interface MonthlyStat {
  month: string // YYYY-MM
  revenueFt: number
  subscribers: number
}

export interface CreatorStats {
  monthly: MonthlyStat[]
  pendingFt: number // valor a receber (ainda não liberado)
}

export interface User {
  id: string
  name: string
  email: string
  handle: string
  password: string
  createdAt: string
  balanceFt: number
  creatorStatus: CreatorStatus
  creator?: CreatorInfo
  posts: Media[]
  subscriptions: Subscription[]
  transactions: Transaction[]
  notifications: AppNotification[]
}
