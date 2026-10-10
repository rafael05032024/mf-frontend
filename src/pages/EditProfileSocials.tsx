import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Field } from '../components/Field'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { Alert, Button, Card, Input, NarrowContainer, Stack } from '../components/ui'
import { useApp, useAuthedUser } from '../store/AppContext'
import { normalizeHandle } from '../utils/format'

export default function EditProfileSocials() {
  const user = useAuthedUser()
  const { updateProfile } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [instagram, setInstagram] = useState(user.creator?.instagram ?? '')
  const [tiktok, setTiktok] = useState(user.creator?.tiktok ?? '')
  const [formError, setFormError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const r = updateProfile({ instagram: normalizeHandle(instagram), tiktok: normalizeHandle(tiktok) })
    if (!r.ok) return setFormError(r.error)
    toast({ title: 'Redes sociais atualizadas', tone: 'success' })
    navigate('/conta/editar')
  }

  return (
    <NarrowContainer>
      <PageHeader title="Redes sociais" back="/conta/editar" />
      <form onSubmit={submit} noValidate>
        <Stack $gap={16}>
          {formError && <Alert $tone="danger" role="alert"><AlertCircle size={18} /> {formError}</Alert>}
          <Card>
            <Stack>
              <Field label="Instagram">
                <Input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="seu.instagram" autoCapitalize="none" />
              </Field>
              <Field label="TikTok">
                <Input value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="seu.tiktok" autoCapitalize="none" />
              </Field>
            </Stack>
          </Card>
          <Button type="submit" $size="lg" $block>Salvar alterações</Button>
        </Stack>
      </form>
    </NarrowContainer>
  )
}
