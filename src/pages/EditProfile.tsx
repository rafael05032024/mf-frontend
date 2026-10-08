import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { EmojiTextarea } from '../components/EmojiTextarea'
import { Field } from '../components/Field'
import { ImageUpload } from '../components/ImageUpload'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import styled from 'styled-components'
import { Alert, Button, Card, Input, NarrowContainer, Stack } from '../components/ui'
import { useApp, useAuthedUser } from '../store/AppContext'
import { formatBRL, formatDate, HANDLE_RE, normalizeHandle } from '../utils/format'

const Images = styled.div`
  position: relative;
  margin-bottom: 56px;
`

const AvatarSlot = styled.div`
  position: absolute;
  left: 16px;
  bottom: -56px;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.white};
`

export default function EditProfile() {
  const user = useAuthedUser()
  const { updateProfile, handleAvailable } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const isCreator = user.creatorStatus === 'verified' && !!user.creator
  const [form, setForm] = useState({
    name: user.name,
    handle: user.handle,
    bio: user.creator?.bio ?? '',
    avatar: user.creator?.avatar ?? '',
    cover: user.creator?.cover ?? '',
  })
  const [errors, setErrors] = useState<{ name?: string; handle?: string; bio?: string }>({})
  const [formError, setFormError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: typeof errors = {}
    if (form.name.trim().length < 2) er.name = 'Informe um nome.'
    if (!HANDLE_RE.test(form.handle)) er.handle = 'Use 3 a 20 caracteres: letras minúsculas, números, "." ou "_".'
    else if (form.handle !== user.handle && !handleAvailable(form.handle)) er.handle = 'Este perfil já está em uso.'
    if (isCreator && form.bio.trim().length < 10) er.bio = 'A biografia deve ter pelo menos 10 caracteres.'
    setErrors(er)
    if (Object.keys(er).length) return
    const r = updateProfile(isCreator ? form : { name: form.name, handle: form.handle })
    if (!r.ok) return setFormError(r.error)
    toast({ title: 'Dados atualizados', tone: 'success' })
    navigate('/conta')
  }

  const readonly: [string, string][] = [
    ['E-mail', user.email],
    ['Membro desde', formatDate(user.createdAt)],
  ]
  if (isCreator && user.creator) {
    readonly.push(
      ['Nome completo', user.creator.legalName],
      ['CPF', user.creator.cpf],
      ['País', user.creator.country],
      ['Data de nascimento', formatDate(user.creator.birthDate + 'T12:00:00')],
      ['Valor da assinatura', `${formatBRL(user.creator.priceBRL)}/mês`],
    )
  }

  return (
    <NarrowContainer>
      <PageHeader title="Alterar dados" back="/conta" />
      <form onSubmit={submit} noValidate>
        <Stack $gap={16}>
          {formError && <Alert $tone="danger" role="alert"><AlertCircle size={18} /> {formError}</Alert>}

          {isCreator && (
            <Card>
              <Images>
                <ImageUpload hideLabel label="Foto de capa" shape="cover" value={form.cover} onChange={cover => setForm(f => ({ ...f, cover }))} />
                <AvatarSlot>
                  <ImageUpload hideLabel label="Foto de perfil" shape="avatar" value={form.avatar} onChange={avatar => setForm(f => ({ ...f, avatar }))} />
                </AvatarSlot>
              </Images>
            </Card>
          )}

          <Card>
            <Stack>
              <Field label={isCreator ? 'Nome do perfil' : 'Nome'} error={errors.name}>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoComplete="name" />
              </Field>
              <Field label={isCreator ? 'Identificador na plataforma' : 'Nome de perfil'} error={errors.handle} hint="Seu @ na plataforma">
                <Input value={form.handle} onChange={e => setForm(f => ({ ...f, handle: normalizeHandle(e.target.value) }))} autoCapitalize="none" />
              </Field>
              {isCreator && (
                <Field label="Biografia" error={errors.bio} hint={`${form.bio.length}/500`}>
                  <EmojiTextarea value={form.bio} maxLength={500} onChange={bio => setForm(f => ({ ...f, bio }))} />
                </Field>
              )}
              {readonly.map(([label, value]) => (
                <Field key={label} label={label}>
                  <Input value={value} readOnly aria-readonly="true" />
                </Field>
              ))}
            </Stack>
          </Card>

          <Button type="submit" $size="lg" $block>Salvar alterações</Button>
        </Stack>
      </form>
    </NarrowContainer>
  )
}
