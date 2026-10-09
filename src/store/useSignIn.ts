import { useCallback } from 'react'
import { loginRequest, setToken } from '../api'
import { isEmail, normalizeHandle } from '../utils/format'
import { useApp } from './AppContext'

type Result = { ok: true } | { ok: false; error: string }

// Login via API (gera e salva o token JWT) + sessão local do app.
// Identificadores que não são e-mail (@perfil) e as contas de demonstração usam só a base local.
export function useSignIn() {
  const { login, register, handleAvailable, applyVerified } = useApp()

  return useCallback(
    async (identifier: string, password: string): Promise<Result> => {
      const id = identifier.trim()
      if (!isEmail(id)) {
        setToken(null)
        return login(id, password)
      }

      let verified = false
      try {
        verified = (await loginRequest(id, password)).verified
      } catch {
        // API recusou ou indisponível: tenta a base local (ex.: contas de demonstração)
        setToken(null)
        return login(id, password)
      }

      const local = login(id, password)
      if (local.ok) {
        applyVerified(id, verified)
        return local
      }

      // Conta existe na API, mas não neste navegador: cria a sessão local
      const base = normalizeHandle(id.split('@')[0]).slice(0, 16) || 'usuario'
      let handle = base.length >= 3 ? base : base.padEnd(3, '_')
      for (let n = 1; !handleAvailable(handle); n++) handle = `${base}${n}`.slice(0, 20)
      const created = register({ name: id.split('@')[0], email: id, handle, password })
      if (created.ok) applyVerified(id, verified)
      return created
    },
    [login, register, handleAvailable, applyVerified],
  )
}
