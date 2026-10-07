import { mockProfiles } from '../data/mock'
import type { CreatorStats, Media, User } from '../types'
import { addDays, brlToFt } from '../utils/format'

export function buildStats(seed: string, priceBRL: number): CreatorStats {
  let s = [...seed].reduce((a, c) => a + c.charCodeAt(0), 7)
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const now = new Date()
  let subs = 4 + Math.floor(rand() * 6)
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    subs = Math.max(1, subs + Math.floor(rand() * 9) - 2)
    return {
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      subscribers: subs,
      revenueFt: subs * brlToFt(priceBRL),
    }
  })
  return { monthly, pendingFt: Math.round(monthly[5].revenueFt * 0.4) }
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

export function seedAccounts(): User[] {
  const isa = mockProfiles[0]
  const demo: User = {
    id: 'u-demo',
    name: 'Rafael',
    email: 'demo@myfoot.com',
    handle: 'rafael',
    password: '123456',
    createdAt: daysAgo(40),
    balanceFt: 1200,
    creatorStatus: 'none',
    posts: [],
    subscriptions: [
      { profileId: isa.id, handle: isa.handle, avatar: isa.avatar, startedAt: daysAgo(10), expiresAt: addDays(new Date(), 20).toISOString() },
    ],
    transactions: [
      { id: 't1', kind: 'subscription', description: `Assinatura de @${isa.handle}`, amountFt: -brlToFt(isa.priceBRL), date: daysAgo(10) },
      { id: 't2', kind: 'recharge', description: 'Recarga via PIX', amountFt: brlToFt(70), date: daysAgo(11) },
    ],
    notifications: [
      { id: 'n1', message: 'Bem-vindo(a) ao My Foot! Explore os perfis em destaque.', date: daysAgo(40), read: true },
    ],
  }

  const helenaPosts: Media[] = Array.from({ length: 10 }, (_, i) => ({
    id: `helena-${i}`,
    type: i % 4 === 1 ? 'video' : 'photo',
    url: `https://picsum.photos/seed/helena-${i}/600/600`,
    caption: 'Conteúdo novo no perfil ✨',
    paid: i % 3 !== 0,
    createdAt: daysAgo(i * 2 + 1),
    duration: i % 4 === 1 ? '1:24' : undefined,
  }))

  const creator: User = {
    id: 'u-creator',
    name: 'Helena Martins',
    email: 'criadora@myfoot.com',
    handle: 'helena.pes',
    password: '123456',
    createdAt: daysAgo(200),
    balanceFt: 8640,
    creatorStatus: 'verified',
    creator: {
      country: 'Brasil',
      cpf: '529.982.247-25',
      legalName: 'Helena Martins de Souza',
      birthDate: '1996-04-12',
      priceBRL: 32.9,
      bio: 'Criadora verificada. Fotos e vídeos exclusivos toda semana, com muito cuidado e estética.',
      instagram: 'helena.pes',
      tiktok: 'helenapes',
      avatar: 'https://i.pravatar.cc/300?img=47',
      cover: 'https://picsum.photos/seed/cover-helena/1200/400',
      stats: buildStats('helena.pes', 32.9),
    },
    posts: helenaPosts,
    subscriptions: [],
    transactions: [
      { id: 'c1', kind: 'earning', description: 'Assinatura recebida de @marcos_88', amountFt: brlToFt(32.9), date: daysAgo(1) },
      { id: 'c2', kind: 'withdraw', description: 'Resgate via PIX', amountFt: -3000, date: daysAgo(6) },
      { id: 'c3', kind: 'earning', description: 'Assinatura recebida de @joao.pedro', amountFt: brlToFt(32.9), date: daysAgo(8) },
    ],
    notifications: [
      { id: 'cn1', message: 'Você tem 3 novos assinantes esta semana!', date: daysAgo(1), read: false },
    ],
  }
  return [demo, creator]
}
