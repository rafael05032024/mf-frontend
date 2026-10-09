import { api } from './client'

// Endpoints assumidos: a API identifica a mídia pelo caminho do conteúdo (`content`)
export function deletePost(content: string): Promise<void> {
  return api.delete<void>(`/api/posts/${encodeURIComponent(content)}`)
}

export function updatePost(content: string, patch: { caption: string; is_private: boolean }): Promise<void> {
  return api.patch<void>(`/api/posts/${encodeURIComponent(content)}`, patch)
}
