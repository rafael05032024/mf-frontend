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

// Abre o WebSocket de eventos do usuário (/event/{id}), identificado pelo id
// retornado em /accounts/me, e reconecta com backoff enquanto não for fechado.
// O token segue no cookie `Token`. Retorna a função que encerra a conexão.
export function connectEvents(userId: number, onEvent: (data: unknown) => void): () => void {
  // Só considera a conexão estável (e zera o backoff) depois de ficar aberta por esse tempo;
  // evita um loop de reconexão a cada ~1s quando o servidor aceita e fecha a conexão em seguida.
  const STABLE_MS = 10_000
  let ws: WebSocket | null = null
  let timer: number | undefined
  let attempt = 0
  let openedAt = 0
  let closed = false

  const open = () => {
    openedAt = 0
    ws = new WebSocket(wsUrl(`/event/${userId}`))
    ws.onopen = () => {
      openedAt = Date.now()
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
      attempt = openedAt && Date.now() - openedAt > STABLE_MS ? 0 : attempt + 1
      timer = window.setTimeout(open, Math.min(30_000, 1000 * 2 ** attempt))
    }
  }
  open()

  return () => {
    closed = true
    window.clearTimeout(timer)
    ws?.close()
  }
}
