import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getMe, mediaUrl, updateMe, uploadCover } from '../api'
import { EmojiTextarea } from '../components/EmojiTextarea'
import { Field } from '../components/Field'
import { ImageUpload } from '../components/ImageUpload'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { Alert, Button, Card, NarrowContainer, Stack } from '../components/ui'
import { useApp, useAuthedUser } from '../store/AppContext'

export default function EditProfileMedia() {
  const user = useAuthedUser()
  const { updateProfile } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    bio: user.creator?.bio ?? '',
    cover: user.creator?.cover ?? '',
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    setFormError('')
    setSaving(true)
    let cover = form.cover
    try {
      if (form.bio !== (user.creator?.bio ?? '')) await updateMe({ description: form.bio })
      // só envia a capa quando uma nova imagem foi escolhida (data URL)
      if (form.cover.startsWith('data:')) {
        await uploadCover(form.cover)
        const me = await getMe().catch(() => undefined)
        cover = mediaUrl(me?.cover_photo) ?? cover
      }
    } catch (err) {
      setSaving(false)
      return setFormError(err instanceof Error ? err.message : 'Não foi possível salvar as alterações.')
    }
    setSaving(false)
    const r = updateProfile({ bio: form.bio, cover })
    if (!r.ok) return setFormError(r.error)
    toast({ title: 'Dados atualizados', tone: 'success' })
    navigate('/conta/editar')
  }

  return (
    <NarrowContainer>
      <PageHeader title="Foto de capa e biografia" back="/conta/editar" />
      <form onSubmit={submit} noValidate>
        <Stack $gap={16}>
          {formError && <Alert $tone="danger" role="alert"><AlertCircle size={18} /> {formError}</Alert>}
          <Card>
            <ImageUpload hideLabel label="Foto de capa" shape="cover" crop value={form.cover} onChange={cover => setForm(f => ({ ...f, cover }))} />
          </Card>
          <Card>
            <Stack>
              <Field label="Biografia" hint={`${form.bio.length}/500`}>
                <EmojiTextarea value={form.bio} maxLength={500} onChange={bio => setForm(f => ({ ...f, bio }))} />
              </Field>
            </Stack>
          </Card>
          <Button type="submit" $size="lg" $block disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</Button>
        </Stack>
      </form>
    </NarrowContainer>
  )
}
