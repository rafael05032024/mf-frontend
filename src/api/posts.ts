import { api } from './client'

/** Publica uma mídia (multipart). `is_private` = true para conteúdo pago, false para gratuito */
export function createPost(payload: { midia: File; description: string; isPrivate: boolean }): Promise<void> {
  const form = new FormData()
  form.append('midia', payload.midia)
  form.append('is_private', String(payload.isPrivate))
  form.append('description', payload.description)
  return api.post<void>('/api/posts', form)
}

export function deletePost(id: string): Promise<void> {
  return api.delete<void>(`/api/posts/${encodeURIComponent(id)}`)
}

/** Edita um post (multipart). `midia` é opcional: sem ela, a mídia atual é mantida */
export function updatePost(id: string, payload: { midia?: File | null; description: string; isPrivate: boolean }): Promise<void> {
  const form = new FormData()
  if (payload.midia) form.append('midia', payload.midia)
  form.append('is_private', String(payload.isPrivate))
  form.append('description', payload.description)
  return api.put<void>(`/api/posts/${encodeURIComponent(id)}`, form)
}
