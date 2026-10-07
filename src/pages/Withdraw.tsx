import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Field } from '../components/Field'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { Button, Card, Input, Muted, NarrowContainer, Select, Stack } from '../components/ui'
import { useApp, useAuthedUser } from '../store/AppContext'
import { formatBRL, formatFt, ftToBrl } from '../utils/format'

const Available = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  strong { font-size: 22px; font-weight: 800; }
  button { border: 0; background: none; color: ${({ theme }) => theme.colors.primaryText}; font-weight: 700; min-height: 44px; }
`

const MIN_FT = 450 // R$ 15,00

export default function Withdraw() {
  const user = useAuthedUser()
  const { withdraw } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [keyType, setKeyType] = useState('cpf')
  const [pixKey, setPixKey] = useState('')
  const [errors, setErrors] = useState<{ amount?: string; pixKey?: string }>({})

  const ft = Math.floor(Number(amount) || 0)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: typeof errors = {}
    if (ft < MIN_FT) er.amount = `O resgate mínimo é ${formatFt(MIN_FT)}.`
    else if (ft > user.balanceFt) er.amount = 'Valor maior que o saldo disponível.'
    if (pixKey.trim().length < 5) er.pixKey = 'Informe uma chave PIX válida.'
    setErrors(er)
    if (Object.keys(er).length) return
    const r = withdraw(ft)
    if (!r.ok) return setErrors({ amount: r.error })
    toast({ title: 'Resgate solicitado', message: `${formatBRL(ftToBrl(ft))} serão enviados para sua chave PIX em até 1 dia útil.`, tone: 'success' })
    navigate('/conta/carteira')
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
                <strong>{formatFt(user.balanceFt)}</strong>
              </div>
              <button type="button" onClick={() => setAmount(String(user.balanceFt))}>Resgatar tudo</button>
            </Available>
          </Card>
          <Card>
            <Stack>
              <Field label="Valor em FootCoins" error={errors.amount} hint={ft > 0 ? `Você receberá ${formatBRL(ftToBrl(ft))}` : `Mínimo de ${formatFt(MIN_FT)}`}>
                <Input inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="0" />
              </Field>
              <Field label="Tipo de chave PIX">
                <Select value={keyType} onChange={e => setKeyType(e.target.value)}>
                  <option value="cpf">CPF</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Chave aleatória</option>
                </Select>
              </Field>
              <Field label="Chave PIX" error={errors.pixKey}>
                <Input value={pixKey} onChange={e => setPixKey(e.target.value)} autoCapitalize="none" />
              </Field>
            </Stack>
          </Card>
          <Button type="submit" $size="lg" $block>Solicitar resgate</Button>
        </Stack>
      </form>
    </NarrowContainer>
  )
}
