import { ArrowDownLeft, ArrowUpRight, Banknote, Plus, Receipt } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { PageHeader } from '../components/PageHeader'
import { Button, Card, Muted, NarrowContainer, SectionTitle, Stack } from '../components/ui'
import { useAuthedUser } from '../store/AppContext'
import { mq } from '../styles/theme'
import { formatBRL, formatDateTime, formatFt, ftToBrl } from '../utils/format'

const BalanceCard = styled.section`
  padding: 24px 20px;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  span { font-size: 14px; font-weight: 600; opacity: .95; }
  strong { display: block; font-size: 36px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; margin: 4px 0; }
  small { font-size: 14px; opacity: .95; }
`

const Actions = styled.div<{ $single?: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 20px;
  ${mq.sm} { grid-template-columns: ${({ $single }) => ($single ? '1fr' : 'repeat(2, 1fr)')}; }
  button { background: ${({ theme }) => theme.colors.white}; color: ${({ theme }) => theme.colors.primaryText}; }
  button:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primarySoft}; }
  button.alt { background: transparent; color: ${({ theme }) => theme.colors.white}; border-color: ${({ theme }) => theme.colors.white}; }
  button.alt:hover:not(:disabled) { background: rgba(255,255,255,.12); }
`

const TxList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  li { display: flex; align-items: center; gap: 12px; padding: 14px 0; }
  li + li { border-top: 1px solid ${({ theme }) => theme.colors.light}; }
  div { flex: 1; min-width: 0; }
  strong { display: block; font-size: 15px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  small { font-size: 13px; color: ${({ theme }) => theme.colors.grayText}; }
`

const TxIcon = styled.span<{ $in: boolean }>`
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $in, theme }) => ($in ? theme.colors.successSoft : theme.colors.light)};
  color: ${({ $in, theme }) => ($in ? theme.colors.success : theme.colors.dark)};
`

const Amount = styled.span<{ $in: boolean }>`
  font-weight: 700;
  font-size: 15px;
  white-space: nowrap;
  color: ${({ $in, theme }) => ($in ? theme.colors.success : theme.colors.black)};
`

const Empty = styled.div`
  text-align: center;
  padding: 32px 0 12px;
  svg { color: ${({ theme }) => theme.colors.gray}; margin: 0 auto 8px; }
`

export default function Wallet() {
  const user = useAuthedUser()
  const navigate = useNavigate()
  const isCreator = user.creatorStatus === 'verified'

  return (
    <NarrowContainer>
      <PageHeader title="Carteira" back="/conta" />
      <Stack $gap={20}>
        <BalanceCard aria-label="Saldo em carteira">
          <span>Saldo disponível</span>
          <strong>{formatFt(user.balanceFt)}</strong>
          <small>≈ {formatBRL(ftToBrl(user.balanceFt))} · R$ 1,00 = 30 ft</small>
          <Actions $single={!isCreator}>
            <Button $block onClick={() => navigate('/conta/carteira/recarregar')}>
              <Plus size={18} strokeWidth={2.6} /> Recarregar
            </Button>
            {isCreator && (
              <Button $block className="alt" onClick={() => navigate('/conta/carteira/resgatar')}>
                <Banknote size={18} /> Resgatar
              </Button>
            )}
          </Actions>
        </BalanceCard>

        <Card>
          <SectionTitle>Últimas transações</SectionTitle>
          {user.transactions.length === 0 ? (
            <Empty>
              <Receipt size={32} aria-hidden />
              <Muted>Nenhuma transação ainda.</Muted>
            </Empty>
          ) : (
            <TxList>
              {user.transactions.slice(0, 30).map(t => {
                const incoming = t.amountFt > 0
                return (
                  <li key={t.id}>
                    <TxIcon $in={incoming} aria-hidden>
                      {incoming ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </TxIcon>
                    <div>
                      <strong>{t.description}</strong>
                      <small>{formatDateTime(t.date)}</small>
                    </div>
                    <Amount $in={incoming}>
                      <span className="sr-only">{incoming ? 'entrada de' : 'saída de'}</span>
                      {incoming ? '+' : '−'} {formatFt(Math.abs(t.amountFt))}
                    </Amount>
                  </li>
                )
              })}
            </TxList>
          )}
        </Card>
      </Stack>
    </NarrowContainer>
  )
}
