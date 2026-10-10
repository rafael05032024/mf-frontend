import { useRef, useState } from 'react'
import { AlertCircle, Film, ImagePlus, Loader2, Lock, Play, Trash2, Unlock } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { EmojiTextarea } from '../components/EmojiTextarea'
import styled, { keyframes } from 'styled-components'
import { Field } from '../components/Field'
import { PageHeader } from '../components/PageHeader'
import { Switch } from '../components/Switch'
import { useToast } from '../components/Toast'
import { Alert, Button, Card, FieldError, IconButton, Label, NarrowContainer, Stack } from '../components/ui'
import { ApiError, createPost, updatePost } from '../api'
import { useAuthedUser } from '../store/AppContext'
import type { Media, MediaType } from '../types'
import { readImage, readVideoThumb } from '../utils/files'

const spin = keyframes`to { transform: rotate(360deg) }`

const Drop = styled.button<{ $invalid: boolean }>`
  width: 100%;
  aspect-ratio: 1;
  max-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 2px dashed ${({ $invalid, theme }) => ($invalid ? theme.colors.danger : theme.colors.border)};
  background: ${({ theme }) => theme.colors.light};
  color: ${({ theme }) => theme.colors.dark};
  transition: border-color .18s ease, background-color .18s ease;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; background: ${({ theme }) => theme.colors.primarySoft}; }
  svg { color: ${({ theme }) => theme.colors.primaryText}; }
  strong { font-size: 16px; }
  small { color: ${({ theme }) => theme.colors.grayText}; font-size: 13px; }
  .spin { animation: ${spin} 1s linear infinite; }
`

const Preview = styled.div`
  position: relative;
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.black};
  img, video { width: 100%; max-height: 420px; object-fit: contain; margin: 0 auto; }
  .remove { position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,.92); color: ${({ theme }) => theme.colors.danger}; }
  .badge {
    position: absolute; left: 10px; bottom: 10px;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 999px;
    background: rgba(0,0,0,.65); color: #fff; font-size: 13px; font-weight: 600;
  }
`

export default function Post() {
  const user = useAuthedUser()
  const toast = useToast()
  const navigate = useNavigate()
  const editing = (useLocation().state as { media?: Media } | null)?.media
  const input = useRef<HTMLInputElement>(null)
  const [media, setMedia] = useState<{ type: MediaType; url: string; duration?: string } | null>(editing ? { type: editing.type, url: editing.url } : null)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState(editing?.caption ?? '')
  const [paid, setPaid] = useState(editing?.paid ?? true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ media?: string; caption?: string; form?: string }>({})
  const [posting, setPosting] = useState(false)

  const pick = async (file?: File) => {
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    if (!isVideo && !file.type.startsWith('image/')) return setErrors({ media: 'Formato não suportado. Envie uma foto ou vídeo.' })
    setErrors({})
    setFile(file)
    setLoading(true)
    try {
      if (isVideo) {
        const { thumb, duration } = await readVideoThumb(file)
        setMedia({ type: 'video', url: thumb, duration })
      } else {
        setMedia({ type: 'photo', url: await readImage(file) })
      }
    } catch {
      setErrors({ media: 'Não foi possível ler o arquivo.' })
    } finally {
      setLoading(false)
    }
  }

  const submit = async () => {
    const er: typeof errors = {}
    if (!media || (!file && !editing)) er.media = 'Selecione uma mídia para postar.'
    if (caption.trim().length === 0) er.caption = 'Escreva uma legenda.'
    setErrors(er)
    if (Object.keys(er).length) return
    setPosting(true)
    try {
      if (editing) await updatePost(editing.id, { midia: file, description: caption.trim(), isPrivate: paid })
      else await createPost({ midia: file!, description: caption.trim(), isPrivate: paid })
    } catch (e) {
      setPosting(false)
      return setErrors({ form: e instanceof ApiError ? e.message : 'Não foi possível publicar. Tente novamente.' })
    }
    setPosting(false)
    toast({ title: editing ? 'Post atualizado!' : 'Publicado!', message: editing ? 'As alterações já estão no seu perfil.' : paid ? 'Sua mídia exclusiva já está disponível para assinantes.' : 'Sua mídia gratuita já está no seu perfil.', tone: 'success' })
    navigate(`/perfil/${user.handle}`)
  }

  return (
    <NarrowContainer>
      <PageHeader title={editing ? 'Editar postagem' : 'Nova postagem'} />
      <Stack $gap={16}>
        {errors.form && <Alert $tone="danger" role="alert"><AlertCircle size={18} /> {errors.form}</Alert>}
        <Card>
          <Stack>
            <div>
              <Label as="span">Mídia</Label>
              {media ? (
                <Preview>
                  {media.type === 'video' && !file
                    ? <video src={media.url} controls />
                    : <img src={media.url} alt="Pré-visualização da mídia" />}
                  {media.type === 'video' && file && <span className="badge"><Play size={12} fill="currentColor" /> Vídeo · {media.duration}</span>}
                  <IconButton className="remove" onClick={() => { setMedia(null); setFile(null) }} aria-label="Remover mídia">
                    <Trash2 size={20} />
                  </IconButton>
                </Preview>
              ) : (
                <Drop
                  type="button"
                  $invalid={!!errors.media}
                  onClick={() => input.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); pick(e.dataTransfer.files[0]) }}
                >
                  {loading ? <Loader2 className="spin" size={36} /> : (
                    <>
                      <span style={{ display: 'flex', gap: 8 }}><ImagePlus size={32} aria-hidden /><Film size={32} aria-hidden /></span>
                      <strong>Selecionar foto ou vídeo</strong>
                      <small>Toque ou arraste um arquivo aqui</small>
                    </>
                  )}
                </Drop>
              )}
              <input ref={input} type="file" accept="image/*,video/*" hidden onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }} />
              {errors.media && <FieldError role="alert">{errors.media}</FieldError>}
            </div>

            <Field label="Legenda" error={errors.caption} hint={`${caption.length}/500`}>
              <EmojiTextarea value={caption} maxLength={500} onChange={setCaption} placeholder="Escreva algo sobre esta mídia…" />
            </Field>
          </Stack>
        </Card>

        <Card>
          <Switch
            checked={paid}
            onChange={setPaid}
            label={paid ? 'Conteúdo pago' : 'Conteúdo gratuito'}
            description={paid ? 'Visível apenas para assinantes; aparece desfocado para os demais.' : 'Visível para todos os visitantes do seu perfil.'}
          />
        </Card>

        <Button $size="lg" $block onClick={submit} disabled={posting || loading}>
          {paid ? <Lock size={18} /> : <Unlock size={18} />} {editing ? 'Salvar' : 'Postar'}
        </Button>
      </Stack>
    </NarrowContainer>
  )
}
