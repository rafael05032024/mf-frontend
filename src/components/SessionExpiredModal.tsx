import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setUnauthorizedHandler } from '../api'
import { useApp } from '../store/AppContext'
import { Modal } from './Modal'
import { Button, Muted, Stack, Title } from './ui'

const SECONDS = 5

export function SessionExpiredModal() {
  const { logout } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [left, setLeft] = useState(SECONDS)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setOpen(current => {
        if (!current) setLeft(SECONDS)
        return true
      })
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  const finish = () => {
    setOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    if (!open) return
    if (left <= 0) return finish()
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, left])

  return (
    <Modal open={open} onClose={finish} label="Sessão expirada" width={400} hideClose>
      <Stack $gap={16} style={{ padding: 24, textAlign: 'center' }}>
        <Title as="h2">Sessão expirada</Title>
        <Muted>Sua sessão expirou. Será necessário fazer login novamente.</Muted>
        <Muted>Redirecionando em {left}s…</Muted>
        <Button $block onClick={finish}>Fazer login agora</Button>
      </Stack>
    </Modal>
  )
}
