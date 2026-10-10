import { connectEvents, getToken, setToken } from '../api'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { mockProfiles } from '../data/mock'
import type { CreatorInfo, Media, Profile, User } from '../types'
import { addDays, brlToFt, formatBRL, formatFt, HANDLE_RE, normalizeHandle, uid } from '../utils/format'
import { buildStats, seedAccounts } from './seed'
import { load, save } from './storage'

const ACCOUNTS_KEY = 'myfoot:accounts'
const SESSION_KEY = 'myfoot:session'

type Result = { ok: true } | { ok: false; error: string }

export interface RegisterInput {
  name: string
  email: string
  handle: string
  password: string
}

export interface CreatorSubmission extends Omit<CreatorInfo, 'stats'> {
  displayName: string
  handle: string
}

interface AppState {
  user: User | null
  profiles: Profile[]
  getProfile: (handle: string) => Profile | undefined
  isSubscribed: (profileId: string) => boolean
  login: (identifier: string, password: string) => Result
  register: (input: RegisterInput) => Result
  logout: () => void
  updateProfile: (patch: Partial<Pick<User, 'name' | 'handle'>> & Partial<Pick<CreatorInfo, 'bio' | 'avatar' | 'cover' | 'priceBRL'>>) => Result
  subscribe: (profile: Profile) => Result
  recharge: (brl: number) => void
  withdraw: (ft: number) => Result
  submitCreator: (data: CreatorSubmission) => Result
  addPost: (post: Omit<Media, 'id' | 'createdAt'>) => Result
  markNotificationsRead: () => void
  handleAvailable: (handle: string) => boolean
  /** Aplica o flag `verified` do login: true exibe a plataforma na visão de publicador */
  applyVerified: (email: string, verified: boolean) => void
  /** Sincroniza o @ da conta local com o perfil retornado pela API no login */
  applyProfile: (email: string, profile: string, extra?: { name?: string; avatar?: string; cover?: string }) => void
}

const AppContext = createContext<AppState | null>(null)

export function userToProfile(u: User): Profile | undefined {
  if (u.creatorStatus !== 'verified' || !u.creator) return undefined
  return {
    id: u.id,
    name: u.name,
    handle: u.handle,
    avatar: u.creator.avatar,
    cover: u.creator.cover,
    verified: true,
    bio: u.creator.bio,
    instagram: u.creator.instagram,
    tiktok: u.creator.tiktok,
    priceBRL: u.creator.priceBRL,
    media: u.posts,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<User[]>(() => load<User[] | null>(ACCOUNTS_KEY, null) ?? seedAccounts())
  const [sessionId, setSessionId] = useState<string | null>(() => load<string | null>(SESSION_KEY, null))

  useEffect(() => {
    save(ACCOUNTS_KEY, accounts)
  }, [accounts])
  useEffect(() => {
    save(SESSION_KEY, sessionId)
  }, [sessionId])

  const user = accounts.find(a => a.id === sessionId) ?? null
  const eventProfile = user && getToken() ? user.handle : null

  // WebSocket de eventos do perfil, aberto enquanto houver sessão autenticada na API
  useEffect(() => {
    if (!eventProfile) return
    return connectEvents(eventProfile, data => console.debug('[event]', data))
  }, [eventProfile])

  const patchUser = useCallback((id: string, fn: (u: User) => User) => {
    setAccounts(prev => prev.map(a => (a.id === id ? fn(a) : a)))
  }, [])

  const profiles = useMemo(() => {
    const creators = accounts.map(userToProfile).filter((p): p is Profile => !!p)
    return [...mockProfiles, ...creators]
  }, [accounts])

  const getProfile = useCallback(
    (handle: string) => profiles.find(p => p.handle === normalizeHandle(handle)),
    [profiles],
  )

  const handleAvailable = useCallback(
    (handle: string) => {
      const h = normalizeHandle(handle)
      return !mockProfiles.some(p => p.handle === h) && !accounts.some(a => a.handle === h && a.id !== sessionId)
    },
    [accounts, sessionId],
  )

  const isSubscribed = useCallback(
    (profileId: string) =>
      !!user?.subscriptions.some(s => s.profileId === profileId && new Date(s.expiresAt) > new Date()),
    [user],
  )

  const login: AppState['login'] = (identifier, password) => {
    const id = identifier.trim().toLowerCase()
    const acc = accounts.find(a => a.email.toLowerCase() === id || a.handle === normalizeHandle(id))
    if (!acc || acc.password !== password) return { ok: false, error: 'E-mail/perfil ou senha inválidos.' }
    setSessionId(acc.id)
    return { ok: true }
  }

  const register: AppState['register'] = input => {
    const email = input.email.trim().toLowerCase()
    const handle = normalizeHandle(input.handle)
    if (accounts.some(a => a.email.toLowerCase() === email)) return { ok: false, error: 'Este e-mail já está cadastrado.' }
    if (!handleAvailable(handle)) return { ok: false, error: 'Este perfil já está em uso.' }
    const now = new Date().toISOString()
    const u: User = {
      id: uid(),
      name: input.name.trim(),
      email,
      handle,
      password: input.password,
      createdAt: now,
      balanceFt: 0,
      creatorStatus: 'none',
      posts: [],
      subscriptions: [],
      transactions: [],
      notifications: [
        { id: uid(), message: 'Bem-vindo(a) ao My Foot! Recarregue sua carteira para assinar perfis.', date: now, read: false, link: '/conta/carteira' },
      ],
    }
    setAccounts(prev => [...prev, u])
    setSessionId(u.id)
    return { ok: true }
  }

  const applyProfile: AppState['applyProfile'] = (email, profile, extra) => {
    const id = email.trim().toLowerCase()
    const handle = normalizeHandle(profile)
    setAccounts(prev =>
      prev.map(a => {
        if (a.email.toLowerCase() !== id) return a
        const creator = a.creator && extra ? { ...a.creator, avatar: extra.avatar ?? '', cover: extra.cover ?? a.creator.cover } : a.creator
        return { ...a, handle, name: extra?.name || a.name, creator }
      }),
    )
  }

  const applyVerified: AppState['applyVerified'] = (email, verified) => {
    const id = email.trim().toLowerCase()
    setAccounts(prev =>
      prev.map(a => {
        if (a.email.toLowerCase() !== id) return a
        // /accounts/me é a fonte da verdade: perde o status de publicador se a API diz que não é verificado
        if (!verified) return a.creatorStatus === 'none' ? a : { ...a, creatorStatus: 'none' }
        if (a.creatorStatus === 'verified') return a
        return {
          ...a,
          creatorStatus: 'verified',
          creator: a.creator ?? {
            country: 'Brasil',
            cpf: '',
            legalName: a.name,
            birthDate: '',
            priceBRL: 29.9,
            bio: '',
            avatar: '',
            cover: '',
            stats: buildStats(a.email, 29.9), // dados mockados até a API fornecer métricas
          },
        }
      }),
    )
  }

  const logout = () => {
    setToken(null)
    setSessionId(null)
  }

  const updateProfile: AppState['updateProfile'] = patch => {
    if (!user) return { ok: false, error: 'Sessão expirada.' }
    const handle = patch.handle !== undefined ? normalizeHandle(patch.handle) : user.handle
    if (!HANDLE_RE.test(handle)) return { ok: false, error: 'Perfil inválido.' }
    if (handle !== user.handle && !handleAvailable(handle)) return { ok: false, error: 'Este perfil já está em uso.' }
    patchUser(user.id, u => ({
      ...u,
      name: patch.name?.trim() ?? u.name,
      handle,
      creator: u.creator
        ? {
            ...u.creator,
            bio: patch.bio ?? u.creator.bio,
            avatar: patch.avatar ?? u.creator.avatar,
            cover: patch.cover ?? u.creator.cover,
            priceBRL: patch.priceBRL ?? u.creator.priceBRL,
          }
        : u.creator,
    }))
    return { ok: true }
  }

  const subscribe: AppState['subscribe'] = profile => {
    if (!user) return { ok: false, error: 'Faça login para assinar.' }
    const cost = brlToFt(profile.priceBRL)
    if (user.balanceFt < cost) return { ok: false, error: 'Saldo insuficiente.' }
    const now = new Date()
    patchUser(user.id, u => ({
      ...u,
      balanceFt: u.balanceFt - cost,
      subscriptions: [
        {
          profileId: profile.id,
          handle: profile.handle,
          avatar: profile.avatar,
          startedAt: now.toISOString(),
          expiresAt: addDays(now, 30).toISOString(),
        },
        ...u.subscriptions.filter(s => s.profileId !== profile.id),
      ],
      transactions: [
        { id: uid(), kind: 'subscription', description: `Assinatura de @${profile.handle}`, amountFt: -cost, date: now.toISOString() },
        ...u.transactions,
      ],
      notifications: [
        { id: uid(), message: `Assinatura de @${profile.handle} confirmada por 30 dias.`, date: now.toISOString(), read: false, link: `/perfil/${profile.handle}` },
        ...u.notifications,
      ],
    }))
    // Se o perfil for de um criador real da plataforma, credita os ganhos
    const creatorAcc = accounts.find(a => a.id === profile.id)
    if (creatorAcc) {
      patchUser(creatorAcc.id, c => ({
        ...c,
        balanceFt: c.balanceFt + cost,
        transactions: [
          { id: uid(), kind: 'earning', description: `Assinatura recebida de @${user.handle}`, amountFt: cost, date: now.toISOString() },
          ...c.transactions,
        ],
        notifications: [
          { id: uid(), message: `@${user.handle} assinou seu perfil!`, date: now.toISOString(), read: false, link: '/conta/controle' },
          ...c.notifications,
        ],
      }))
    }
    return { ok: true }
  }

  const recharge: AppState['recharge'] = brl => {
    if (!user) return
    const ft = brlToFt(brl)
    const now = new Date().toISOString()
    patchUser(user.id, u => ({
      ...u,
      balanceFt: u.balanceFt + ft,
      transactions: [{ id: uid(), kind: 'recharge', description: `Recarga via PIX (${formatBRL(brl)})`, amountFt: ft, date: now }, ...u.transactions],
      notifications: [{ id: uid(), message: `Recarga de ${formatFt(ft)} confirmada.`, date: now, read: false, link: '/conta/carteira' }, ...u.notifications],
    }))
  }

  const withdraw: AppState['withdraw'] = ft => {
    if (!user) return { ok: false, error: 'Sessão expirada.' }
    if (ft <= 0) return { ok: false, error: 'Informe um valor válido.' }
    if (ft > user.balanceFt) return { ok: false, error: 'Valor maior que o saldo disponível.' }
    const now = new Date().toISOString()
    patchUser(user.id, u => ({
      ...u,
      balanceFt: u.balanceFt - ft,
      transactions: [{ id: uid(), kind: 'withdraw', description: 'Resgate via PIX', amountFt: -ft, date: now }, ...u.transactions],
    }))
    return { ok: true }
  }

  const submitCreator: AppState['submitCreator'] = data => {
    if (!user) return { ok: false, error: 'Sessão expirada.' }
    const handle = normalizeHandle(data.handle)
    if (handle !== user.handle && !handleAvailable(handle)) return { ok: false, error: 'Este perfil já está em uso.' }
    const { displayName, handle: _h, ...info } = data
    void _h
    patchUser(user.id, u => ({
      ...u,
      name: displayName.trim(),
      handle,
      creatorStatus: 'pending',
      creator: { ...info, stats: buildStats(handle, info.priceBRL) },
    }))
    return { ok: true }
  }

  const addPost: AppState['addPost'] = post => {
    if (!user || user.creatorStatus !== 'verified') return { ok: false, error: 'Apenas criadores verificados podem postar.' }
    const media: Media = { ...post, id: uid(), createdAt: new Date().toISOString() }
    const prev = accounts
    const next = accounts.map(a => (a.id === user.id ? { ...a, posts: [media, ...a.posts] } : a))
    if (!save(ACCOUNTS_KEY, next)) {
      save(ACCOUNTS_KEY, prev)
      return { ok: false, error: 'Armazenamento local cheio. Tente uma mídia menor.' }
    }
    setAccounts(next)
    return { ok: true }
  }

  const markNotificationsRead = () => {
    if (!user) return
    patchUser(user.id, u => ({ ...u, notifications: u.notifications.map(n => ({ ...n, read: true })) }))
  }

  const value: AppState = {
    user,
    profiles,
    getProfile,
    isSubscribed,
    login,
    register,
    logout,
    updateProfile,
    subscribe,
    recharge,
    withdraw,
    submitCreator,
    addPost,
    markNotificationsRead,
    handleAvailable,
    applyVerified,
    applyProfile,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider')
  return ctx
}

export function useAuthedUser() {
  const { user } = useApp()
  if (!user) throw new Error('Usuário não autenticado')
  return user
}
