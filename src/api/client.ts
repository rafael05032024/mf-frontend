import { API_URL } from './config'
import { getToken } from './token'

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

type Query = Record<string, string | number | boolean | undefined | null>

interface RequestOptions extends Omit<RequestInit, 'body'> {
  query?: Query
  body?: unknown
}

// Chamado quando a API responde 401 (ex.: deslogar o usuário)
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(API_URL + path, window.location.origin)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

async function request<T>(path: string, { query, body, headers, ...init }: RequestOptions = {}): Promise<T> {
  if (!API_URL) throw new ApiError(0, 'URL da API não configurada (VITE_API_URL)')

  const isForm = body instanceof FormData
  const token = getToken()

  let res: Response
  try {
    res = await fetch(buildUrl(path, query), {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor')
  }

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    if (res.status === 401) onUnauthorized?.()
    const msg =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : `Erro ${res.status}`
    throw new ApiError(res.status, msg, data)
  }

  return data as T
}

export const api = {
  get: <T>(path: string, query?: Query, init?: RequestOptions) => request<T>(path, { ...init, query, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: RequestOptions) => request<T>(path, { ...init, body, method: 'POST' }),
  put: <T>(path: string, body?: unknown, init?: RequestOptions) => request<T>(path, { ...init, body, method: 'PUT' }),
  patch: <T>(path: string, body?: unknown, init?: RequestOptions) => request<T>(path, { ...init, body, method: 'PATCH' }),
  delete: <T>(path: string, init?: RequestOptions) => request<T>(path, { ...init, method: 'DELETE' }),
}
