import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
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
  const { user, applyLevel, applyProfile } = useApp()
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null)
  const email = user?.email
  const navigate = useNavigate()
  const pathRef = useRef('')
  const location = useLocation()
  pathRef.current = location.pathname
  const [limitsOpen, setLimitsOpen] = useState(false)

  // cadastro de publicador sem verificação (BecomeCreator): avisa os limites da conta na tela inicial
  const preRegistered = (location.state as { preRegistered?: boolean } | null)?.preRegistered === true
  useEffect(() => {
    if (!preRegistered) return
    setLimitsOpen(true)
    navigate(location.pathname, { replace: true, state: null })
  }, [preRegistered, location.pathname, navigate])

  useEffect(() => {
    if (!email) return
    return subscribeEvents(data => {
      const name = eventName(data)
      if (name === 'liveness_request_rejected') setResult('rejected')
      else if (name === 'liveness_request_approved') {
        setResult('approved')
        if (pathRef.current === '/conta/criador' || pathRef.current === '/conta/editar/verificar') navigate('/', { replace: true })
        // a conta passa a ter level maior que 1
        getMe()
          .then(me => {
            applyLevel(email, me.level ?? 1)
            // atualiza nome, @ e foto de perfil e capa (header, /conta e /conta/editar)
            applyProfile(email, me.profile.replace(/^@/, ''), { name: me.name, avatar: mediaUrl(me.thumb), cover: mediaUrl(me.cover_photo) })
          })
          .catch(() => {})
      }
    })
  }, [email, applyLevel, applyProfile, navigate])

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
      <Modal open={limitsOpen} onClose={() => setLimitsOpen(false)} label="Conta sem verificação" width={380}>
        <Notice $tone="ok">
          <span className="icon"><Info size={44} aria-hidden /></span>
          <h2>Conta sem verificação</h2>
          <Muted>
            Ao se cadastrar sem verificar seus documentos, sua conta terá limites no número de postagens e de assinaturas ao seu perfil.
            Conclua a verificação quando quiser para remover esses limites.
          </Muted>
          <Button onClick={() => setLimitsOpen(false)}>Entendi</Button>
        </Notice>
      </Modal>
      <Modal open={result === 'approved'} onClose={() => setResult(null)} label="Documentos aceitos" width={380}>
        <Notice $tone="ok">
          <span className="icon"><CheckCircle2 size={44} aria-hidden /></span>
          <h2>Documentos aceitos</h2>
          <Muted>Seus documentos foram aceitos.</Muted>
          <Button onClick={() => setResult(null)}>Continuar</Button>
        </Notice>
      </Modal>
    </>
  )
}
