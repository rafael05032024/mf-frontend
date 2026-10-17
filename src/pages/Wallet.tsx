import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Banknote, BanknoteX, Info, Plus, Receipt } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { getWallet, type TransactionType, type Wallet as WalletData } from '../api'
import { PageHeader } from '../components/PageHeader'
import { Button, Card, Muted, NarrowContainer, SectionTitle, Stack } from '../components/ui'
import { useAuthedUser } from '../store/AppContext'
import { mq } from '../styles/theme'
import { formatBRL, formatFt, ftToBrl } from '../utils/format'

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

type TxTone = 'in' | 'out' | 'info' | 'failed'

const TxIcon = styled.span<{ $tone: TxTone }>`
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $tone, theme }) => ({
    in: theme.colors.successSoft,
    out: theme.colors.dangerSoft,
    info: theme.colors.primarySoft,
    failed: theme.colors.dangerSoft,
  }[$tone])};
  color: ${({ $tone, theme }) => ({
    in: theme.colors.success,
    out: theme.colors.danger,
    info: theme.colors.primaryText,
    failed: theme.colors.danger,
  }[$tone])};
`

const Amount = styled.span<{ $tone: TxTone }>`
  font-weight: 700;
  font-size: 15px;
  white-space: nowrap;
  color: ${({ $tone, theme }) => ({
    in: theme.colors.success,
    out: theme.colors.danger,
    info: theme.colors.primaryText,
    failed: theme.colors.danger,
  }[$tone])};
`

const TX_TONE: Record<TransactionType, TxTone> = { 1: 'in', 2: 'out', 3: 'info', 4: 'failed' }

const TX_ICON: Record<TxTone, typeof Info> = {
  in: ArrowDownLeft,
  out: ArrowUpRight,
  info: Info,
  failed: BanknoteX,
}

/** Prefixo e rótulo acessível do valor; types 3 e 4 não movimentam saldo */
const TX_SIGN: Record<TxTone, { prefix: string; label: string }> = {
  in: { prefix: '+ ', label: 'entrada de' },
  out: { prefix: '− ', label: 'saída de' },
  info: { prefix: '', label: 'valor de' },
  failed: { prefix: '', label: 'valor não efetivado de' },
}

const Empty = styled.div`
  text-align: center;
  padding: 32px 0 12px;
  svg { color: ${({ theme }) => theme.colors.gray}; margin: 0 auto 8px; }
`

export default function Wallet() {
  const user = useAuthedUser()
  const navigate = useNavigate()
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [error, setError] = useState<string>()
  const isCreator = user.creatorStatus === 'verified'

  useEffect(() => {
    let active = true
    getWallet()
      .then(w => active && setWallet(w))
      .catch(e => active && setError(e instanceof Error ? e.message : 'Erro ao carregar a carteira'))
    return () => { active = false }
  }, [user.id])

  return (
    <NarrowContainer>
      <PageHeader title="Carteira" back="/conta" />
      <Stack $gap={20}>
        <BalanceCard aria-label="Saldo em carteira">
          <span>Saldo disponível</span>
          <strong>{wallet ? formatFt(wallet.balance) : error ? 'Indisponível' : '...'}</strong>
          <small>{wallet ? `≈ ${formatBRL(ftToBrl(wallet.balance))} · ` : ''}R$ 1,00 = 3 ft</small>
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
          {!wallet ? (
            <Empty>
              <Muted>{error ?? 'Carregando...'}</Muted>
            </Empty>
          ) : wallet.transactions.length === 0 ? (
            <Empty>
              <Receipt size={32} aria-hidden />
              <Muted>Nenhuma transação ainda.</Muted>
            </Empty>
          ) : (
            <TxList>
              {wallet.transactions.map(t => {
                const tone = TX_TONE[t.type] ?? 'out'
                const Icon = TX_ICON[tone]
                const sign = TX_SIGN[tone]
                return (
                  <li key={t.id}>
                    <TxIcon $tone={tone} aria-hidden>
                      <Icon size={20} />
                    </TxIcon>
                    <div>
                      <strong>{t.description}</strong>
                    </div>
                    <Amount $tone={tone}>
                      <span className="sr-only">{sign.label}</span>
                      {sign.prefix}{formatFt(t.amountFt)}
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
