import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Field } from '../components/Field'
import { PasswordInput } from '../components/PasswordInput'
import { Alert, Button, Input, Muted, Stack, Title } from '../components/ui'
import { useApp } from '../store/AppContext'
import { HANDLE_RE, isEmail, normalizeHandle } from '../utils/format'
import { AuthShell } from './AuthShell'

type Errors = Partial<Record<'name' | 'email' | 'handle' | 'password', string>>

export default function Register() {
  const { register, handleAvailable } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', handle: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = k === 'handle' ? normalizeHandle(e.target.value) : e.target.value
    setForm(f => ({ ...f, [k]: value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }))
  }

  const validate = (): Errors => {
    const er: Errors = {}
    if (form.name.trim().length < 2) er.name = 'Informe seu nome.'
    if (!isEmail(form.email)) er.email = 'Informe um e-mail válido.'
    if (!HANDLE_RE.test(form.handle)) er.handle = 'Use 3 a 20 caracteres: letras minúsculas, números, "." ou "_".'
    else if (!handleAvailable(form.handle)) er.handle = 'Este perfil já está em uso.'
    if (form.password.length < 6) er.password = 'A senha deve ter pelo menos 6 caracteres.'
    return er
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er = validate()
    setErrors(er)
    if (Object.keys(er).length) return
    const r = register(form)
    if (!r.ok) return setFormError(r.error)
    navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true })
  }

  return (
    <AuthShell>
      <form onSubmit={submit} noValidate>
        <Stack $gap={18}>
          <div>
            <Title>Criar conta</Title>
            <Muted>Leva menos de um minuto.</Muted>
          </div>
          {formError && (
            <Alert $tone="danger" role="alert">
              <AlertCircle size={18} /> {formError}
            </Alert>
          )}
          <Field label="Nome" error={errors.name}>
            <Input value={form.name} onChange={set('name')} autoComplete="name" placeholder="Como você se chama?" />
          </Field>
          <Field label="E-mail" error={errors.email}>
            <Input type="email" inputMode="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="voce@email.com" />
          </Field>
          <Field label="Perfil" error={errors.handle} hint="Seu @ na plataforma. Ex.: @rafael_22">
            <Input value={form.handle} onChange={set('handle')} autoCapitalize="none" autoComplete="username" placeholder="seu.perfil" />
          </Field>
          <Field label="Senha" error={errors.password} hint="Mínimo de 6 caracteres">
            <PasswordInput value={form.password} onChange={set('password')} autoComplete="new-password" />
          </Field>
          <Button type="submit" $block $size="lg">Criar conta</Button>
          <Muted style={{ textAlign: 'center' }}>
            Já tem conta? <Link to="/login"><b>Entrar</b></Link>
          </Muted>
        </Stack>
      </form>
    </AuthShell>
  )
}
