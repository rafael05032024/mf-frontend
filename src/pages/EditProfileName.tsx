import { useState, type FormEvent } from 'react'
import { AlertCircle, AtSign, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Field } from '../components/Field'
import { InputGroup } from '../components/InputGroup'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { Alert, Button, Card, Input, NarrowContainer, Stack } from '../components/ui'
import { useApp, useAuthedUser } from '../store/AppContext'

export default function EditProfileName() {
  const user = useAuthedUser()
  const { updateProfile } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState(user.name)
  const [handle, setHandle] = useState(user.handle)
  const [nameError, setNameError] = useState('')
  const [formError, setFormError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return setNameError('Informe um nome.')
    setNameError('')
    const r = updateProfile({ name, handle })
    if (!r.ok) return setFormError(r.error)
    toast({ title: 'Dados atualizados', tone: 'success' })
    navigate('/conta/editar')
  }

  return (
    <NarrowContainer>
      <PageHeader title="Nome e identificador" back="/conta/editar" />
      <form onSubmit={submit} noValidate>
        <Stack $gap={16}>
          {formError && <Alert $tone="danger" role="alert"><AlertCircle size={18} /> {formError}</Alert>}
          <Card>
            <Stack>
              <Field label="Nome do perfil" error={nameError}>
                <InputGroup leftIcon={<User size={18} />}>
                  <Input value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
                </InputGroup>
              </Field>
              <Field label="Identificador" hint="Seu @ no perfil">
                <InputGroup leftIcon={<AtSign size={18} />}>
                  <Input value={handle} onChange={e => setHandle(e.target.value)} autoCapitalize="none" autoComplete="username" />
                </InputGroup>
              </Field>
            </Stack>
          </Card>
          <Button type="submit" $size="lg" $block>Salvar alterações</Button>
        </Stack>
      </form>
    </NarrowContainer>
  )
}
