import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { getBalance } from '../api'
import type { Profile } from '../types'
import { brlToFt, formatBRL, formatFt } from '../utils/format'
import { Avatar } from './Avatar'
import { VerifiedBadge } from './icons'
import { Modal } from './Modal'
import { Alert, Button, Stack } from './ui'

const Cover = styled.div`
  height: 130px;
  background: ${({ theme }) => theme.colors.primarySoft};
  img { width: 100%; height: 100%; object-fit: cover; }
`

const Body = styled.div`
  padding: 0 20px 20px;
  text-align: center;
  > span:first-child { margin: -44px auto 10px; }
  h2 { display: flex; justify-content: center; align-items: center; gap: 6px; font-size: 20px; }
  p.handle { color: ${({ theme }) => theme.colors.grayText}; font-size: 14px; }
`

const PriceBox = styled.div`
  margin: 18px 0;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.light};
  text-align: left;
  display: grid;
  gap: 8px;
  div { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; color: ${({ theme }) => theme.colors.dark}; }
  div.total { font-size: 16px; font-weight: 800; color: ${({ theme }) => theme.colors.black}; padding-top: 8px; border-top: 1px solid ${({ theme }) => theme.colors.border}; }
`

interface ConfirmProps {
  profile: Profile
  open: boolean
  onClose: () => void
  onConfirm: () => void
  submitting?: boolean
  error?: string
}

export function SubscribeModal({ profile, open, onClose, onConfirm, submitting, error }: ConfirmProps) {
  const navigate = useNavigate()
  const [balanceFt, setBalanceFt] = useState<number | null>(null)
  const [balanceError, setBalanceError] = useState(false)
  const cost = brlToFt(profile.priceBRL)
  const insufficient = balanceFt !== null && balanceFt < cost

  // Busca o saldo real sempre que o modal abre
  useEffect(() => {
    if (!open) return
    let active = true
    setBalanceFt(null)
    setBalanceError(false)
    getBalance()
      .then(b => active && setBalanceFt(b))
      .catch(() => active && setBalanceError(true))
    return () => { active = false }
  }, [open])

  return (
    <Modal open={open} onClose={onClose} label={`Assinar @${profile.handle}`}>
      <Cover>
        <img src={profile.cover} alt="" />
      </Cover>
      <Body>
        <Avatar name={profile.name} src={profile.avatar} size={88} ring />
        <h2>
          {profile.name} {profile.verified && <VerifiedBadge />}
        </h2>
        <p className="handle">@{profile.handle}</p>

        <PriceBox>
          <div><span>Assinatura mensal</span><span>{formatBRL(profile.priceBRL)}</span></div>
          <div><span>Seu saldo</span><span>{balanceFt !== null ? formatFt(balanceFt) : balanceError ? 'Indisponível' : '...'}</span></div>
          <div className="total"><span>Total</span><span>{formatFt(cost)}</span></div>
        </PriceBox>

        <Stack $gap={12}>
          {error && (
            <Alert $tone="warning" role="alert" style={{ textAlign: 'left' }}>
              <AlertTriangle size={18} />
              {error}
            </Alert>
          )}
          {insufficient ? (
            <>
              <Alert $tone="warning" role="alert" style={{ textAlign: 'left' }}>
                <AlertTriangle size={18} />
                Saldo insuficiente. Faltam {formatFt(cost - (balanceFt ?? 0))} para assinar.
              </Alert>
              <Button $block $size="lg" onClick={() => navigate('/conta/carteira/recarregar')}>
                <Wallet size={18} /> Recarregar carteira
              </Button>
            </>
          ) : (
            <Button $block $size="lg" onClick={onConfirm} disabled={balanceFt === null || submitting}>
              {submitting ? 'Assinando...' : 'Confirmar assinatura'}
            </Button>
          )}
          <Button $variant="ghost" $block onClick={onClose} disabled={submitting}>Cancelar</Button>
        </Stack>
      </Body>
    </Modal>
  )
}

const shrink = keyframes`from { transform: scaleX(1) } to { transform: scaleX(0) }`
const pop = keyframes`0% { transform: scale(.6); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 }`

const Success = styled.div`
  position: relative;
  padding: 36px 24px 32px;
  text-align: center;
  overflow: hidden;
  > svg { color: ${({ theme }) => theme.colors.success}; margin: 0 auto 12px; animation: ${pop} .45s ease; }
  h2 { font-size: 22px; margin-bottom: 6px; }
  p { color: ${({ theme }) => theme.colors.dark}; }
`

const Progress = styled.span<{ $ms: number }>`
  position: absolute;
  left: 0;
  bottom: 0;
  height: 4px;
  width: 100%;
  transform-origin: left;
  background: ${({ theme }) => theme.colors.success};
  animation: ${shrink} ${({ $ms }) => $ms}ms linear forwards;
`

export function SuccessModal({ open, onClose, handle, duration = 5000 }: { open: boolean; onClose: () => void; handle: string; duration?: number }) {
  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(onClose, duration)
    return () => window.clearTimeout(t)
  }, [open, onClose, duration])

  return (
    <Modal open={open} onClose={onClose} label="Assinatura confirmada" width={380}>
      <Success role="status">
        <CheckCircle2 size={64} strokeWidth={1.8} aria-hidden />
        <h2>Assinatura confirmada!</h2>
        <p>Agora você tem acesso a todo o conteúdo exclusivo de <b>@{handle}</b> por 30 dias.</p>
        <Progress $ms={duration} />
      </Success>
    </Modal>
  )
}
