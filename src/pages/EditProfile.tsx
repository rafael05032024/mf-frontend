import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AmountPicker, parseBRL, validateBRL } from '../components/AmountPicker'
import { EmojiTextarea } from '../components/EmojiTextarea'
import { Field } from '../components/Field'
import { ImageUpload } from '../components/ImageUpload'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import styled from 'styled-components'
import { Alert, Button, Card, Input, Muted, NarrowContainer, Stack } from '../components/ui'
import { useApp, useAuthedUser } from '../store/AppContext'

const Images = styled.div`
  position: relative;
  margin-bottom: 56px;
`

const HandleText = styled.div`
  position: absolute;
  left: 132px;
  right: 8px;
  bottom: -26px;
  font-weight: 400;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.grayText};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  const { updateProfile } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const isCreator = user.creatorStatus === 'verified' && !!user.creator
  const [form, setForm] = useState({
    name: user.name,
    handle: user.handle,
    bio: user.creator?.bio ?? '',
    avatar: user.creator?.avatar ?? '',
    cover: user.creator?.cover ?? '',
    price: String(user.creator?.priceBRL ?? ''),
  })
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({})
  const [formError, setFormError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: typeof errors = {}
    if (form.name.trim().length < 2) er.name = 'Informe um nome.'
    if (isCreator) er.price = validateBRL(form.price, true)
    Object.keys(er).forEach(k => er[k as keyof typeof er] || delete er[k as keyof typeof er])
    setErrors(er)
    if (Object.keys(er).length) return
    const r = updateProfile(isCreator ? { ...form, priceBRL: parseBRL(form.price) } : { name: form.name, handle: form.handle })
    if (!r.ok) return setFormError(r.error)
    toast({ title: 'Dados atualizados', tone: 'success' })
    navigate('/conta')
  }

  const readonly: [string, string][] = [
    ['E-mail', user.email],
  ]

  return (
    <NarrowContainer>
      <PageHeader title="Alterar dados" back="/conta" />
      <form onSubmit={submit} noValidate>
        <Stack $gap={16}>
          {formError && <Alert $tone="danger" role="alert"><AlertCircle size={18} /> {formError}</Alert>}

          {isCreator && (
            <Card>
              <Images>
                <ImageUpload hideLabel label="Foto de capa" shape="cover" crop value={form.cover} onChange={cover => setForm(f => ({ ...f, cover }))} />
                <AvatarSlot>
                  <ImageUpload hideLabel label="Foto de perfil" shape="avatar" crop value={form.avatar} onChange={avatar => setForm(f => ({ ...f, avatar }))} />
                </AvatarSlot>
                <HandleText>@{user.handle}</HandleText>
              </Images>
            </Card>
          )}

          <Card>
            <Stack>
              {!isCreator && <Muted>@{user.handle}</Muted>}
              <Field label={isCreator ? 'Nome do perfil' : 'Nome'} error={errors.name}>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoComplete="name" />
              </Field>
              {isCreator && (
                <Field label="Biografia" hint={`${form.bio.length}/500`}>
                  <EmojiTextarea value={form.bio} maxLength={500} onChange={bio => setForm(f => ({ ...f, bio }))} />
                </Field>
              )}
              {readonly.map(([label, value]) => (
                <Field key={label} label={label}>
                  <Input value={value} readOnly aria-readonly="true" />
                </Field>
              ))}
              {isCreator && (
                <AmountPicker
                  label="Valor da assinatura (mensal)"
                  value={form.price}
                  onChange={price => { setForm(f => ({ ...f, price })); setErrors(e => ({ ...e, price: undefined })) }}
                  error={errors.price}
                  presets={[15, 20, 30, 50, 100, 150]}
                  whole
                />
              )}
            </Stack>
          </Card>

          <Button type="submit" $size="lg" $block>Salvar alterações</Button>
        </Stack>
      </form>
    </NarrowContainer>
  )
}
