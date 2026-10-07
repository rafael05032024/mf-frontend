import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Field } from '../components/Field'
import { PasswordInput } from '../components/PasswordInput'
import { Alert, Button, Input, Muted, Stack, Title } from '../components/ui'
import { useApp } from '../store/AppContext'
import { AuthShell } from './AuthShell'

const Demo = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.grayText};
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 12px 14px;
  line-height: 1.6;
  code { color: ${({ theme }) => theme.colors.dark}; font-weight: 600; }
`

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password) return setError('Preencha e-mail/perfil e senha.')
    const r = login(identifier, password)
    if (!r.ok) return setError(r.error)
    navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true })
  }

  return (
    <AuthShell>
      <form onSubmit={submit} noValidate>
        <Stack $gap={20}>
          <div>
            <Title>Entrar</Title>
            <Muted>Que bom te ver de novo!</Muted>
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
          <Button type="submit" $block $size="lg">Entrar</Button>
          <Muted style={{ textAlign: 'center' }}>
            Ainda não tem conta? <Link to="/cadastro"><b>Cadastre-se</b></Link>
          </Muted>
          <Demo>
            Contas de demonstração (senha <code>123456</code>):<br />
            Usuário: <code>demo@myfoot.com</code><br />
            Criadora verificada: <code>criadora@myfoot.com</code>
          </Demo>
        </Stack>
      </form>
    </AuthShell>
  )
}
