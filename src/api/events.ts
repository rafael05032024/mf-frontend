import { API_URL } from './config'

function wsUrl(path: string) {
  const url = new URL(API_URL + path, window.location.origin)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.toString()
}

type Listener = (data: unknown) => void
const listeners = new Set<Listener>()

// Nome do evento: aceita string pura ou objeto com `event`/`type`/`name`
export function eventName(data: unknown): string | undefined {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    const n = d.event ?? d.type ?? d.name
    return typeof n === 'string' ? n : undefined
  }
}

// Escuta os eventos recebidos pelo WebSocket; retorna a função que remove o listener
export function subscribeEvents(listener: Listener): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

// Abre o WebSocket de eventos do perfil (/event/{profile}) e reconecta com
// backoff enquanto não for fechado. O token segue no cookie `Token`.
// Retorna a função que encerra a conexão.
export function connectEvents(profile: string, onEvent: (data: unknown) => void): () => void {
  let ws: WebSocket | null = null
  let timer: number | undefined
  let attempt = 0
  let closed = false

  const open = () => {
    ws = new WebSocket(wsUrl(`/event/${encodeURIComponent(profile)}`))
    ws.onopen = () => {
      attempt = 0
    }
    ws.onmessage = e => {
      let data: unknown = e.data
      try {
        data = JSON.parse(e.data)
      } catch {
        /* mensagem em texto puro */
      }
      onEvent(data)
      listeners.forEach(l => l(data))
    }
    ws.onclose = () => {
      if (closed) return
      timer = window.setTimeout(open, Math.min(30_000, 1000 * 2 ** attempt++))
    }
  }
  open()

  return () => {
    closed = true
    window.clearTimeout(timer)
    ws?.close()
  }
}
