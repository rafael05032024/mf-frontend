import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import styled from 'styled-components'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createAccount, loginRequest, sendVerificationCode } from '../api'
import { Modal } from '../components/Modal'
import { CodeInput } from '../components/CodeInput'
import { Field } from '../components/Field'
import { PasswordInput } from '../components/PasswordInput'
import { Alert, Button, Input, Muted, Stack, Title } from '../components/ui'
import { useApp } from '../store/AppContext'
import { HANDLE_RE, isEmail, normalizeHandle } from '../utils/format'
import { AuthShell } from './AuthShell'

const Countdown = styled.div`
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
  font-size: 28px;
  font-weight: 800;
`

type Errors = Partial<Record<'name' | 'email' | 'handle' | 'password', string>>

export default function Register() {
  const { register, login, handleAvailable } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', handle: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'code'>('form')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [resent, setResent] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [seconds, setSeconds] = useState(5)
  const timer = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    if (!redirecting) return
    const id = window.setInterval(() => setSeconds(n => Math.max(n - 1, 0)), 1000)
    return () => window.clearInterval(id)
  }, [redirecting])

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

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading || redirecting) return
    const er = validate()
    setErrors(er)
    if (Object.keys(er).length) return
    setFormError('')
    setLoading(true)
    try {
      await sendVerificationCode(form.name.trim(), form.email.trim())
    } catch (err) {
      setLoading(false)
      return setFormError(err instanceof Error ? err.message : 'Não foi possível enviar o código.')
    }
    setLoading(false)
    setCode('')
    setCodeError('')
    setStep('code')
  }

  const resend = async () => {
    if (loading) return
    setCodeError('')
    setResent(false)
    setLoading(true)
    try {
      await sendVerificationCode(form.name.trim(), form.email.trim())
      setResent(true)
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Não foi possível reenviar o código.')
    }
    setLoading(false)
  }

  const confirm = async (e: FormEvent) => {
    e.preventDefault()
    if (loading || redirecting) return
    if (!/^\d{6}$/.test(code)) return setCodeError('Digite os 6 dígitos do código.')
    setCodeError('')
    setLoading(true)
    try {
      await createAccount({ name: form.name.trim(), email: form.email.trim(), profile: form.handle, password: form.password, code })
      await loginRequest(form.email.trim(), form.password)
    } catch (err) {
      setLoading(false)
      return setCodeError(err instanceof Error ? err.message : 'Não foi possível criar a conta.')
    }
    setLoading(false)
    setRedirecting(true)
    const to = (location.state as { from?: string } | null)?.from ?? '/'
    // A sessão local só é criada no fim: GuestOnly redireciona quem já está logado e fecharia o modal
    timer.current = window.setTimeout(() => {
      const r = register(form)
      if (!r.ok) login(form.email, form.password)
      navigate(to, { replace: true })
    }, 5000)
  }

  return (
    <AuthShell>
      <Modal open={redirecting} onClose={() => {}} label="Conta criada" hideClose width={400}>
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <Stack $gap={14} style={{ alignItems: 'center' }}>
            <CheckCircle2 size={56} color="#16a34a" />
            <Title>Bem-vindo(a), {form.name.trim().split(' ')[0]}!</Title>
            <Muted>Sua conta foi criada com sucesso. Você será redirecionado para a plataforma em instantes...</Muted>
            <Countdown>{seconds}</Countdown>
          </Stack>
        </div>
      </Modal>
      {step === 'code' ? (
        <form onSubmit={confirm} noValidate>
          <Stack $gap={18}>
            <div>
              <Title>Verifique seu e-mail</Title>
              <Muted>Enviamos um código de 6 dígitos para <b>{form.email.trim()}</b>.</Muted>
            </div>
            {codeError && (
              <Alert $tone="danger" role="alert">
                <AlertCircle size={18} /> {codeError}
              </Alert>
            )}
            {resent && !codeError && <Alert $tone="success" role="status">Novo código enviado.</Alert>}
            <Field label="Código de verificação">
              <CodeInput value={code} onChange={v => { setCode(v); setCodeError('') }} autoFocus />
            </Field>
            <Button type="submit" $block $size="lg" disabled={loading || redirecting}>{loading ? 'Verificando...' : 'Confirmar e criar conta'}</Button>
            <Muted style={{ textAlign: 'center' }}>
              Não recebeu? <a href="#" onClick={e => { e.preventDefault(); resend() }}><b>Reenviar código</b></a>
              {' · '}
              <a href="#" onClick={e => { e.preventDefault(); setStep('form'); setResent(false); setCodeError('') }}><b>Voltar</b></a>
            </Muted>
          </Stack>
        </form>
      ) : (
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
          <Button type="submit" $block $size="lg" disabled={loading || redirecting}>{loading ? 'Enviando código...' : 'Continuar'}</Button>
          <Muted style={{ textAlign: 'center' }}>
            Já tem conta? <Link to="/login"><b>Entrar</b></Link>
          </Muted>
        </Stack>
      </form>
      )}
    </AuthShell>
  )
}
