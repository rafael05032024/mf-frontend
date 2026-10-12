import { useState, type FormEvent } from 'react'
import { CheckCircle2, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { resetPassword, sendPasswordResetCode, verifyPasswordResetCode } from '../api'
import { CodeInput } from '../components/CodeInput'
import { Field } from '../components/Field'
import { InputGroup } from '../components/InputGroup'
import { PasswordInput } from '../components/PasswordInput'
import { PasswordChecklist } from '../components/PasswordChecklist'
import { isPasswordValid, PASSWORD_ERROR } from '../utils/password'
import { useToast } from '../components/Toast'
import { Alert, Button, Input, Muted, Stack, Title } from '../components/ui'
import { isEmail } from '../utils/format'
import { AuthShell } from './AuthShell'

type Step = 'email' | 'code' | 'password' | 'done'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [code, setCode] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [resent, setResent] = useState(false)
  const [form, setForm] = useState({ next: '', confirm: '' })
  const [errors, setErrors] = useState<Partial<Record<'next' | 'confirm', string>>>({})
  const [loading, setLoading] = useState(false)

  const fail = (err: unknown, fallback: string) => toast({ title: err instanceof Error ? err.message : fallback, tone: 'danger' })

  const sendCode = async (e?: FormEvent) => {
    e?.preventDefault()
    if (loading) return
    if (!isEmail(email)) return setEmailError('Informe um e-mail válido.')
    setEmailError('')
    setResent(false)
    setLoading(true)
    try {
      await sendPasswordResetCode(email.trim())
    } catch (err) {
      setLoading(false)
      return fail(err, 'Não foi possível enviar o código.')
    }
    setLoading(false)
    if (step === 'email') {
      setCode('')
      setStep('code')
    } else setResent(true)
  }

  const confirmCode = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!/^\d{6}$/.test(code)) return toast({ title: 'Digite os 6 dígitos do código.', tone: 'danger' })
    setResent(false)
    setLoading(true)
    try {
      setSessionId(await verifyPasswordResetCode(email.trim(), code))
    } catch (err) {
      setLoading(false)
      return fail(err, 'Código inválido ou expirado.')
    }
    setLoading(false)
    setStep('password')
  }

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    const er: typeof errors = {}
    if (!isPasswordValid(form.next)) er.next = PASSWORD_ERROR
    if (form.confirm !== form.next) er.confirm = 'As senhas não coincidem.'
    setErrors(er)
    if (Object.keys(er).length) return
    setLoading(true)
    try {
      await resetPassword(form.next, sessionId)
    } catch (err) {
      setLoading(false)
      // sessão inválida/expirada: volta para o passo do código
      setCode('')
      setStep('code')
      return fail(err, 'Não foi possível alterar a senha.')
    }
    setLoading(false)
    setStep('done')
  }

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }))
  }

  return (
    <AuthShell>
      {step === 'email' && (
        <form onSubmit={sendCode} noValidate>
          <Stack $gap={20}>
            <div>
              <Title>Esqueceu a senha?</Title>
              <Muted>Informe seu e-mail e enviaremos um código de verificação.</Muted>
            </div>
            <Field label="E-mail" error={emailError}>
              <InputGroup leftIcon={<Mail size={18} />}>
                <Input type="email" inputMode="email" value={email} onChange={e => { setEmail(e.target.value); setEmailError('') }} autoComplete="email" placeholder="voce@email.com" autoFocus />
              </InputGroup>
            </Field>
            <Button type="submit" $block $size="lg" disabled={loading}>{loading ? 'Enviando código...' : 'Enviar código'}</Button>
            <Muted style={{ textAlign: 'center' }}>
              Lembrou a senha? <Link to="/login"><b>Entrar</b></Link>
            </Muted>
          </Stack>
        </form>
      )}
      {step === 'code' && (
        <form onSubmit={confirmCode} noValidate>
          <Stack $gap={18}>
            <div>
              <Title>Verifique seu e-mail</Title>
              <Muted>Enviamos um código de 6 dígitos para <b>{email.trim()}</b>.</Muted>
            </div>
            {resent && <Alert $tone="success" role="status">Novo código enviado.</Alert>}
            <Field label="Código de verificação" float={false}>
              <CodeInput value={code} onChange={setCode} autoFocus />
            </Field>
            <Button type="submit" $block $size="lg" disabled={loading}>{loading ? 'Verificando...' : 'Continuar'}</Button>
            <Muted style={{ textAlign: 'center' }}>
              Não recebeu? <a href="#" onClick={e => { e.preventDefault(); sendCode() }}><b>Reenviar código</b></a>
              {' · '}
              <a href="#" onClick={e => { e.preventDefault(); setStep('email'); setResent(false) }}><b>Voltar</b></a>
            </Muted>
          </Stack>
        </form>
      )}
      {step === 'password' && (
        <form onSubmit={submitPassword} noValidate>
          <Stack $gap={18}>
            <div>
              <Title>Nova senha</Title>
              <Muted>Escolha uma nova senha para sua conta.</Muted>
            </div>
            <Field label="Nova senha" error={errors.next}>
              <PasswordInput value={form.next} onChange={setField('next')} autoComplete="new-password" autoFocus />
            </Field>
            <PasswordChecklist value={form.next} />
            <Field label="Confirmar senha" error={errors.confirm}>
              <PasswordInput value={form.confirm} onChange={setField('confirm')} autoComplete="new-password" />
            </Field>
            <Button type="submit" $block $size="lg" disabled={loading}>{loading ? 'Alterando...' : 'Alterar senha'}</Button>
          </Stack>
        </form>
      )}
      {step === 'done' && (
        <Stack $gap={14} style={{ alignItems: 'center', textAlign: 'center' }}>
          <CheckCircle2 size={56} color="#16a34a" />
          <Title>Senha alterada!</Title>
          <Muted>Sua senha foi redefinida com sucesso. Entre com a nova senha.</Muted>
          <Button $block $size="lg" onClick={() => navigate('/login', { replace: true })}>Ir para o login</Button>
        </Stack>
      )}
    </AuthShell>
  )
}
