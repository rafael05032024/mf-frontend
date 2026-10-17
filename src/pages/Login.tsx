import { useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Field } from '../components/Field'
import { InputGroup } from '../components/InputGroup'
import { PasswordInput } from '../components/PasswordInput'
import { useToast } from '../components/Toast'
import { Button, Input, Muted, Stack, Title } from '../components/ui'
import { useSignIn } from '../store/useSignIn'
import { isEmail } from '../utils/format'
import { AuthShell } from './AuthShell'

export default function Login() {
  const signIn = useSignIn()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!email.trim() || !password) return toast({ title: 'Preencha e-mail e senha.', tone: 'danger' })
    if (!isEmail(email)) return toast({ title: 'Informe um e-mail válido.', tone: 'danger' })
    setLoading(true)
    const r = await signIn(email, password)
    setLoading(false)
    if (!r.ok) return toast({ title: r.error, tone: 'danger' })
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
          <Field label="E-mail">
            <InputGroup leftIcon={<Mail size={18} />}>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" placeholder="voce@email.com" />
            </InputGroup>
          </Field>
          <Field label="Senha">
            <PasswordInput value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </Field>
          <Muted style={{ textAlign: 'right', marginTop: -8 }}>
            <Link to="/esqueci-senha"><b>Esqueceu a senha?</b></Link>
          </Muted>
          <Button type="submit" $block $size="lg" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
          <Muted style={{ textAlign: 'center' }}>
            Ainda não tem conta? <Link to="/cadastro"><b>Cadastre-se</b></Link>
          </Muted>
        </Stack>
      </form>
    </AuthShell>
  )
}
