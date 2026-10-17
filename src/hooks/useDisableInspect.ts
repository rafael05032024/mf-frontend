import { useEffect } from 'react'

const BLOCKED_KEYS = new Set(['F12', 'I', 'J', 'C', 'U'])

/** Bloqueia o menu de contexto e os atalhos de abertura do DevTools (dissuasório, não é proteção real) */
export function useDisableInspect() {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => e.preventDefault()
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      if (key === 'F12') return e.preventDefault()
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && BLOCKED_KEYS.has(key)) return e.preventDefault()
      if ((e.ctrlKey || e.metaKey) && key === 'U') return e.preventDefault()
    }
    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])
}
