import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSignIn } from '../store/useSignIn'
import { Field } from './Field'
import { Modal } from './Modal'
import { PasswordInput } from './PasswordInput'
import { Alert, Button, Input, Muted, Stack, Title } from './ui'

interface Props {
  open: boolean
  onClose: () => void
}

export function LoginModal({ open, onClose }: Props) {
  const signIn = useSignIn()
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!identifier.trim() || !password) return setError('Preencha e-mail/perfil e senha.')
    setError('')
    setLoading(true)
    const r = await signIn(identifier, password)
    setLoading(false)
    if (!r.ok) return setError(r.error)
    setIdentifier('')
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
          <Field label="E-mail ou perfil">
            <Input value={identifier} onChange={e => setIdentifier(e.target.value)} autoComplete="username" placeholder="voce@email.com ou @perfil" />
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
