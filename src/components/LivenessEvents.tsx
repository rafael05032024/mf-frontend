import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { eventName, getMe, mediaUrl, subscribeEvents } from '../api'
import { useApp } from '../store/AppContext'
import { Modal } from './Modal'
import { Button, Muted } from './ui'

const Notice = styled.div<{ $tone: 'ok' | 'error' }>`
  padding: 28px 20px 24px;
  text-align: center;
  display: grid;
  gap: 8px;
  justify-items: center;
  h2 { font-size: 20px; }
  .icon {
    display: grid;
    place-items: center;
    width: 80px;
    height: 80px;
    margin-bottom: 4px;
    border-radius: 50%;
    color: ${({ $tone, theme }) => ($tone === 'ok' ? theme.colors.primaryText : theme.colors.danger)};
    background: ${({ $tone, theme }) => ($tone === 'ok' ? theme.colors.primarySoft : theme.colors.light)};
  }
  button { margin-top: 8px; }
`

/** Escuta o resultado da verificação de documentos (prova de vida) enviado pelo WebSocket */
export function LivenessEvents() {
  const { user, applyVerified, applyProfile } = useApp()
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null)
  const email = user?.email
  const navigate = useNavigate()
  const pathRef = useRef('')
  pathRef.current = useLocation().pathname

  useEffect(() => {
    if (!email) return
    return subscribeEvents(data => {
      const name = eventName(data)
      if (name === 'liveness_request_rejected') setResult('rejected')
      else if (name === 'liveness_request_approved') {
        setResult('approved')
        if (pathRef.current === '/conta/criador') navigate('/', { replace: true })
        // a conta passa a ter verified = true
        getMe()
          .then(me => {
            applyVerified(email, me.verified === true)
            // atualiza nome, @ e foto de perfil e capa (header, /conta e /conta/editar)
            applyProfile(email, me.profile.replace(/^@/, ''), { name: me.name, avatar: mediaUrl(me.thumb), cover: mediaUrl(me.cover_photo) })
          })
          .catch(() => {})
      }
    })
  }, [email, applyVerified, applyProfile, navigate])

  return (
    <>
      <Modal open={result === 'rejected'} onClose={() => setResult(null)} label="Verificação recusada" width={380}>
        <Notice $tone="error">
          <span className="icon"><XCircle size={44} aria-hidden /></span>
          <h2>Verificação recusada</h2>
          <Muted>A verificação dos seus documentos foi recusada. Revise os dados cadastrados e tente novamente.</Muted>
          <Button onClick={() => setResult(null)}>Fechar</Button>
        </Notice>
      </Modal>
      <Modal open={result === 'approved'} onClose={() => setResult(null)} label="Documentos aceitos" width={380}>
        <Notice $tone="ok">
          <span className="icon"><CheckCircle2 size={44} aria-hidden /></span>
          <h2>Documentos aceitos</h2>
          <Muted>Seus documentos foram aceitos. Você já pode vender conteúdos na plataforma.</Muted>
          <Button onClick={() => setResult(null)}>Continuar</Button>
        </Notice>
      </Modal>
    </>
  )
}
