import { API_URL } from './config'
import { api } from './client'
import type { Profile } from '../types'

interface ProfileDTO {
  profile: string
  thumb: string | null
  cover_photo: string | null
  verified: boolean
  highlighted: boolean
}

export interface ProfileSummary {
  handle: string
  avatar?: string
  cover?: string
  verified: boolean
  highlighted: boolean
}

// O cookie `Token` (definido no login) acompanha a requisição da imagem
export function mediaUrl(media?: string | null) {
  return media ? `${API_URL}/api/midia/${media}` : undefined
}

export async function listProfiles(): Promise<ProfileSummary[]> {
  const data = await api.get<ProfileDTO[]>('/api/profiles')
  return data.map(p => ({
    handle: p.profile,
    avatar: mediaUrl(p.thumb),
    cover: mediaUrl(p.cover_photo),
    verified: p.verified,
    highlighted: p.highlighted,
  }))
}

interface ProfileDetailDTO {
  name: string
  profile: string
  description: string | null
  tiktok: string | null
  instagram: string | null
  verified: boolean
  thumb: string | null
  cover_photo: string | null
  posts: { content: string; type: 'image' | 'video'; is_private: boolean }[]
  plan_value: number
  signed: boolean
  counters: { private_midias: number; images: number; videos: number }
}

const stripAt = (v?: string | null) => v?.replace(/^@/, '') || undefined

// A API não expõe id: o handle identifica o perfil
export async function getProfile(handle: string): Promise<Profile> {
  const p = await api.get<ProfileDetailDTO>(`/api/profiles/${encodeURIComponent(handle)}`)
  return {
    id: p.profile,
    name: p.name,
    handle: p.profile,
    avatar: mediaUrl(p.thumb) ?? '',
    cover: mediaUrl(p.cover_photo) ?? '',
    verified: p.verified,
    bio: p.description ?? '',
    instagram: stripAt(p.instagram),
    tiktok: stripAt(p.tiktok),
    priceBRL: p.plan_value,
    signed: p.signed,
    counters: { photos: p.counters.images, videos: p.counters.videos, private: p.counters.private_midias },
    media: p.posts.map(m => ({
      id: m.content,
      type: m.type === 'video' ? 'video' : 'photo',
      url: mediaUrl(m.content) ?? '',
      caption: '',
      paid: m.is_private,
      createdAt: '',
    })),
  }
}

/** Assina o perfil (producer) debitando da carteira */
export function subscribeToProfile(producer: string): Promise<void> {
  return api.post<void>('/api/signatures', { producer })
}
