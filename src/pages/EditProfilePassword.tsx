import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Field } from '../components/Field'
import { PageHeader } from '../components/PageHeader'
import { PasswordInput } from '../components/PasswordInput'
import { useToast } from '../components/Toast'
import { Alert, Button, Card, NarrowContainer, Stack } from '../components/ui'
import { resetPassword } from '../api'

type Errors = Partial<Record<'next' | 'confirm', string>>

export default function EditProfilePassword() {
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ next: '', confirm: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    const er: Errors = {}
    if (form.next.length < 6) er.next = 'A senha deve ter pelo menos 6 caracteres.'
    if (form.confirm !== form.next) er.confirm = 'As senhas não coincidem.'
    setErrors(er)
    setFormError('')
    if (Object.keys(er).length) return
    setLoading(true)
    try {
      await resetPassword(form.next)
    } catch (err) {
      setLoading(false)
      return setFormError(err instanceof Error && err.message ? err.message : 'Não foi possível alterar a senha.')
    }
    setLoading(false)
    toast({ title: 'Senha alterada', tone: 'success' })
    navigate('/conta/editar')
  }

  return (
    <NarrowContainer>
      <PageHeader title="Alterar senha" back="/conta/editar" />
      <form onSubmit={submit} noValidate>
        <Stack $gap={16}>
          {formError && <Alert $tone="danger" role="alert"><AlertCircle size={18} /> {formError}</Alert>}
          <Card>
            <Stack>
              <Field label="Nova senha" error={errors.next} hint="Mínimo de 6 caracteres">
                <PasswordInput value={form.next} onChange={set('next')} autoComplete="new-password" />
              </Field>
              <Field label="Confirmar nova senha" error={errors.confirm}>
                <PasswordInput value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
              </Field>
            </Stack>
          </Card>
          <Button type="submit" $size="lg" $block disabled={loading}>{loading ? 'Salvando...' : 'Salvar alterações'}</Button>
        </Stack>
      </form>
    </NarrowContainer>
  )
}
