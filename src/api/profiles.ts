import { API_URL } from './config'
import { api } from './client'

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
