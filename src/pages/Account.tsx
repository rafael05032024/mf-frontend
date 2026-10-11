import { useEffect, useState } from 'react'
import { BarChart3, CreditCard, Eye, Bell, Hourglass, ListChecks, LogOut, Settings, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { getActiveSubscriptionsCount, getBalance } from '../api'
import { ActionItem, List } from '../components/ActionList'
import { Avatar } from '../components/Avatar'
import { VerifiedBadge } from '../components/icons'
import { Button, Muted, NarrowContainer, Stack } from '../components/ui'
import { useApp, useAuthedUser } from '../store/AppContext'
import { formatBRL, formatFt, ftToBrl } from '../utils/format'

const Head = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  padding: 8px 0 4px;
  h1 { display: flex; align-items: center; gap: 6px; font-size: 22px; font-weight: 800; margin-top: 10px; }
`

const Balance = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  span { font-size: 13px; font-weight: 600; opacity: 0.95; }
  strong { display: block; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }
  small { font-size: 13px; opacity: 0.95; }
  button { background: ${({ theme }) => theme.colors.white}; color: ${({ theme }) => theme.colors.primaryText}; }
  button:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primarySoft}; }
`

const Creator = styled.section`
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 18px;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  > svg { flex-shrink: 0; color: ${({ theme }) => theme.colors.primary}; }
  div { flex: 1; }
  strong { display: block; font-size: 16px; }
  p { font-size: 13px; opacity: 0.85; }
`

export default function Account() {
  const user = useAuthedUser()
  const { logout, notifications } = useApp()
  const unread = notifications.filter(n => !n.read).length
  const navigate = useNavigate()
  const isCreator = user.creatorStatus === 'verified'
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceError, setBalanceError] = useState(false)
  const [activeSubs, setActiveSubs] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    getBalance()
      .then(b => active && setBalance(b))
      .catch(() => active && setBalanceError(true))
    getActiveSubscriptionsCount()
      .then(n => active && setActiveSubs(n))
      .catch(() => {})
    return () => { active = false }
  }, [user.id])

  const balanceLabel = balance !== null ? formatFt(balance) : balanceError ? 'Indisponível' : '...'

  return (
    <NarrowContainer>
      <Stack $gap={20}>
        <Head>
          <Avatar name={user.name} src={isCreator ? user.creator?.avatar : undefined} size={96} />
          <h1>
            {user.name} {isCreator && <VerifiedBadge size={20} />}
          </h1>
          <Muted>@{user.handle}</Muted>
        </Head>

        <Balance aria-label="Saldo em carteira">
          <div>
            <span>Saldo em carteira</span>
            <strong>{balanceLabel}</strong>
            {balance !== null && <small>≈ {formatBRL(ftToBrl(balance))}</small>}
          </div>
          <Button $size="sm" onClick={() => navigate('/conta/carteira/recarregar')}>Recarregar</Button>
        </Balance>

        {user.creatorStatus === 'none' && (
          <Creator>
            <Sparkles size={28} />
            <div>
              <strong>Torne-se um criador</strong>
              <p>Monetize seu conteúdo com assinaturas mensais.</p>
            </div>
            <Button $size="sm" onClick={() => navigate('/conta/criador')}>Começar</Button>
          </Creator>
        )}

        <List>
          {isCreator && (
            <>
              <ActionItem icon={<Eye size={20} />} title="Ver perfil" subtitle="Veja seu perfil como seus assinantes" to={`/perfil/${user.handle}`} />
              <ActionItem icon={<BarChart3 size={20} />} title="Controle" subtitle="Faturamento, assinantes e valor a receber" to="/conta/controle" />
            </>
          )}
          {user.creatorStatus === 'pending' && (
            <ActionItem
              icon={<Hourglass size={20} />}
              tone="neutral"
              title="Perfil de criador em validação"
              subtitle="Estamos analisando seus documentos. Avisaremos por notificação."
            />
          )}
          <ActionItem icon={<CreditCard size={20} />} title="Carteira" subtitle={balanceLabel} to="/conta/carteira" />
          <ActionItem
            icon={<ListChecks size={20} />}
            title="Minhas assinaturas"
            subtitle={activeSubs === null ? '...' : activeSubs === 1 ? '1 assinatura ativa' : `${activeSubs} assinaturas ativas`}
            to="/conta/assinaturas"
          />
          <ActionItem
            icon={<Bell size={20} />}
            title="Notificações"
            subtitle={unread === 0 ? 'Nenhuma nova' : unread === 1 ? '1 não lida' : `${unread} não lidas`}
            to="/conta/notificacoes"
          />
          <ActionItem icon={<Settings size={20} />} title="Configurações do perfil" to="/conta/editar" />
        </List>

        <List>
          <ActionItem
            icon={<LogOut size={20} />}
            tone="danger"
            title="Sair"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          />
        </List>
      </Stack>
    </NarrowContainer>
  )
}
