import { useState, type FormEvent } from 'react'
import { AlertCircle, Mail } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSignIn } from '../store/useSignIn'
import { Field } from './Field'
import { InputGroup } from './InputGroup'
import { Modal } from './Modal'
import { PasswordInput } from './PasswordInput'
import { Alert, Button, Input, Muted, Stack, Title } from './ui'
import { isEmail } from '../utils/format'

interface Props {
  open: boolean
  onClose: () => void
}

export function LoginModal({ open, onClose }: Props) {
  const signIn = useSignIn()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!email.trim() || !password) return setError('Preencha e-mail e senha.')
    if (!isEmail(email)) return setError('Informe um e-mail válido.')
    setError('')
    setLoading(true)
    const r = await signIn(email, password)
    setLoading(false)
    if (!r.ok) return setError(r.error)
    setEmail('')
    setPassword('')
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} label="Entrar para assinar">
      <form onSubmit={submit} noValidate style={{ padding: 24 }}>
        <Stack $gap={18}>
          <div>
            <Title>Entre para assinar</Title>
            <Muted>Faça login para continuar com a assinatura.</Muted>
          </div>
          {error && (
            <Alert $tone="danger" role="alert">
              <AlertCircle size={18} /> {error}
            </Alert>
          )}
          <Field label="E-mail">
            <InputGroup leftIcon={<Mail size={18} />}>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" placeholder="voce@email.com" />
            </InputGroup>
          </Field>
          <Field label="Senha">
            <PasswordInput value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </Field>
          <Button type="submit" $block $size="lg" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
          <Button type="button" $block $variant="outline" onClick={() => navigate('/cadastro', { state: { from: location.pathname } })}>
            Sou novo aqui
          </Button>
        </Stack>
      </form>
    </Modal>
  )
}
