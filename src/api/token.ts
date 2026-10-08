const KEY = 'myfoot:token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(KEY, token)
    else localStorage.removeItem(KEY)
  } catch {
    /* storage indisponível */
  }
  syncCookie(token)
}

// A mídia (<img src>) não envia o header Authorization, então o token também
// vai no cookie `Token`, que o navegador anexa às requisições de /api/midia.
export function syncCookie(token: string | null) {
  try {
    document.cookie = token
      ? `Token=${token}; path=/; SameSite=Lax`
      : 'Token=; path=/; max-age=0; SameSite=Lax'
  } catch {
    /* cookies indisponíveis */
  }
}

// sessão já salva de visitas anteriores: garante o cookie para a mídia
syncCookie(getToken())
