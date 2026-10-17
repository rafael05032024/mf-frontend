import { useEffect, useState, type FormEvent } from 'react'
import { Coins, Key } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { createWithdrawal, getBalance } from '../api'
import { Field } from '../components/Field'
import { InputGroup } from '../components/InputGroup'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { Button, Card, Input, Muted, NarrowContainer, Select, Stack } from '../components/ui'
import { formatBRL, formatFt, ftToBrl } from '../utils/format'

const Available = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  strong { font-size: 22px; font-weight: 800; }
  button { border: 0; background: none; color: ${({ theme }) => theme.colors.primaryText}; font-weight: 700; min-height: 44px; }
`

export default function Withdraw() {
  const toast = useToast()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [keyType, setKeyType] = useState('cpf')
  const [pixKey, setPixKey] = useState('')
  const [errors, setErrors] = useState<{ amount?: string; pixKey?: string }>({})
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceError, setBalanceError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    getBalance()
      .then(b => active && setBalance(b))
      .catch(() => active && setBalanceError(true))
    return () => { active = false }
  }, [])

  const ft = Math.floor(Number(amount) || 0)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const er: typeof errors = {}
    if (ft <= 0) er.amount = 'Informe um valor para resgate.'
    else if (balance !== null && ft > balance) er.amount = 'Valor maior que o saldo disponível.'
    if (pixKey.trim().length < 5) er.pixKey = 'Informe uma chave PIX válida.'
    setErrors(er)
    if (Object.keys(er).length) return
    setLoading(true)
    try {
      await createWithdrawal(ft, pixKey.trim())
      toast({ title: 'Resgate solicitado', message: 'Sua solicitação está sob análise e será atendida em até 24 horas.', tone: 'success' })
      navigate('/conta/carteira')
    } catch (e) {
      setErrors({ amount: e instanceof Error ? e.message : 'Não foi possível solicitar o resgate.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <NarrowContainer>
      <PageHeader title="Resgatar" back="/conta/carteira" />
      <form onSubmit={submit} noValidate>
        <Stack $gap={16}>
          <Card>
            <Available>
              <div>
                <Muted>Disponível para resgate</Muted>
                <strong>{balance !== null ? formatFt(balance) : balanceError ? 'Indisponível' : '...'}</strong>
              </div>
              <button type="button" disabled={balance === null} onClick={() => setAmount(String(balance))}>Resgatar tudo</button>
            </Available>
          </Card>
          <Card>
            <Stack>
              <Field label="Valor em FootCoins" error={errors.amount} hint={ft > 0 ? `Você receberá ${formatBRL(ftToBrl(ft))}` : undefined}>
                <InputGroup leftIcon={<Coins size={18} />}>
                  <Input inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="0" />
                </InputGroup>
              </Field>
              <Field label="Tipo de chave PIX" float={false}>
                <Select value={keyType} onChange={e => setKeyType(e.target.value)}>
                  <option value="cpf">CPF</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Chave aleatória</option>
                </Select>
              </Field>
              <Field label="Chave PIX" error={errors.pixKey}>
                <InputGroup leftIcon={<Key size={18} />}>
                  <Input value={pixKey} onChange={e => setPixKey(e.target.value)} autoCapitalize="none" />
                </InputGroup>
              </Field>
            </Stack>
          </Card>
          <Button type="submit" $size="lg" $block disabled={loading}>{loading ? 'Solicitando...' : 'Solicitar resgate'}</Button>
        </Stack>
      </form>
    </NarrowContainer>
  )
}
