import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, CloudUpload, Loader2, Lock, Play, Trash2, Unlock, Zap } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { EmojiTextarea } from '../components/EmojiTextarea'
import styled, { keyframes } from 'styled-components'
import { Field } from '../components/Field'
import { PageHeader } from '../components/PageHeader'
import { Switch } from '../components/Switch'
import { useToast } from '../components/Toast'
import { Alert, Button, Card, FieldError, IconButton, NarrowContainer, Stack } from '../components/ui'
import { ApiError, createPost, updatePost } from '../api'
import { useAuthedUser } from '../store/AppContext'
import type { Media, MediaType } from '../types'
import { readImage, readVideoThumb } from '../utils/files'
import { formatBytes } from '../utils/format'
import { compressVideo, VIDEO_COMPRESS_THRESHOLD, videoCompressMessage } from '../utils/video'

const spin = keyframes`to { transform: rotate(360deg) }`

const Drop = styled.button<{ $invalid: boolean }>`
  width: 100%;
  aspect-ratio: 4 / 3;
  max-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 2px dashed ${({ $invalid, theme }) => ($invalid ? theme.colors.danger : theme.colors.border)};
  background: ${({ theme }) => theme.colors.light};
  color: ${({ theme }) => theme.colors.dark};
  cursor: pointer;
  transition: border-color .18s ease, background-color .18s ease;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; background: ${({ theme }) => theme.colors.primarySoft}; }
  &:hover svg { color: ${({ theme }) => theme.colors.primary}; }
  svg { color: ${({ theme }) => theme.colors.gray}; transition: color .18s ease; }
  strong { font-size: 15px; font-weight: 600; }
  small { color: ${({ theme }) => theme.colors.grayText}; font-size: 13px; }
  .spin { animation: ${spin} 1s linear infinite; color: ${({ theme }) => theme.colors.primary}; }
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

const Compress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  padding: 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.primary}33;
  background: ${({ theme }) => theme.colors.primarySoft};

  .head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primaryText};
    svg { flex-shrink: 0; }
    strong { margin-left: auto; font-variant-numeric: tabular-nums; }
  }
  .track {
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.white};
  }
  .bar {
    height: 100%;
    border-radius: 3px;
    background: ${({ theme }) => theme.colors.primary};
    transition: width .3s ease;
  }
  small { font-size: 12px; color: ${({ theme }) => theme.colors.grayText}; }
  .done { color: ${({ theme }) => theme.colors.success}; }
  .spin { animation: ${spin} 1s linear infinite; }
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
  const [errors, setErrors] = useState<{ media?: string; form?: string }>({})
  const [posting, setPosting] = useState(false)
  // vídeos acima do limite são recomprimidos antes do upload; `from`/`to` alimentam o painel
  const [compressing, setCompressing] = useState<{ from: number; progress: number } | null>(null)
  const [compressed, setCompressed] = useState<{ from: number; to: number } | null>(null)
  const abort = useRef<AbortController | null>(null)

  // sair da tela no meio da compressão não deve deixar o worker rodando
  useEffect(() => () => abort.current?.abort(), [])

  const reset = () => {
    abort.current?.abort()
    setMedia(null)
    setFile(null)
    setCompressing(null)
    setCompressed(null)
  }

  /** Recomprime o vídeo no navegador (WebCodecs) e usa o resultado como arquivo do post. */
  const compress = async (original: File) => {
    const ctrl = new AbortController()
    abort.current = ctrl
    setCompressing({ from: original.size, progress: 0 })
    try {
      const out = await compressVideo(original, {
        signal: ctrl.signal,
        onProgress: progress => setCompressing(c => (c ? { ...c, progress } : c)),
      })
      setFile(out)
      setCompressed({ from: original.size, to: out.size })
    } catch (e) {
      // cancelamento é ação do usuário: limpa a seleção sem mensagem de erro
      if (e instanceof DOMException && e.name === 'AbortError') {
        setMedia(null)
        setFile(null)
        return
      }
      // sem compressão não enviamos o arquivo original: seriam dezenas/centenas de MB
      setMedia(null)
      setFile(null)
      setErrors({ media: videoCompressMessage(e) })
    } finally {
      setCompressing(null)
      abort.current = null
    }
  }

  const pick = async (picked?: File) => {
    if (!picked) return
    const isVideo = picked.type.startsWith('video/')
    if (!isVideo && !picked.type.startsWith('image/')) return setErrors({ media: 'Formato não suportado. Envie uma foto ou vídeo.' })
    setErrors({})
    setCompressed(null)
    setLoading(true)
    try {
      if (isVideo) {
        const { thumb, duration } = await readVideoThumb(picked)
        setMedia({ type: 'video', url: thumb, duration })
        setLoading(false)
        if (picked.size > VIDEO_COMPRESS_THRESHOLD) return await compress(picked)
      } else {
        setMedia({ type: 'photo', url: await readImage(picked) })
      }
      setFile(picked)
    } catch {
      setFile(null)
      setErrors({ media: 'Não foi possível ler o arquivo.' })
    } finally {
      setLoading(false)
    }
  }

  const submit = async () => {
    const er: typeof errors = {}
    if (!media || (!file && !editing)) er.media = 'Selecione uma mídia para postar.'
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
              {media ? (
                <Preview>
                  {media.type === 'video' && !file
                    ? <video src={media.url} controls />
                    : <img src={media.url} alt="Pré-visualização da mídia" />}
                  {media.type === 'video' && file && <span className="badge"><Play size={12} fill="currentColor" /> Vídeo · {media.duration}</span>}
                  <IconButton className="remove" onClick={reset} aria-label="Remover mídia">
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
                      <CloudUpload size={36} aria-hidden />
                      <strong>Selecionar foto ou vídeo</strong>
                      <small>Toque ou arraste um arquivo aqui</small>
                    </>
                  )}
                </Drop>
              )}
              {compressing && (
                <Compress>
                  <div className="head">
                    <Loader2 className="spin" size={16} aria-hidden />
                    Comprimindo vídeo…
                    <strong>{Math.round(compressing.progress * 100)}%</strong>
                  </div>
                  <div className="track" role="progressbar" aria-label="Progresso da compressão" aria-valuenow={Math.round(compressing.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="bar" style={{ width: `${Math.max(2, compressing.progress * 100)}%` }} />
                  </div>
                  <small>
                    {formatBytes(compressing.from)} · a compressão acontece no seu aparelho, deixando o envio muito mais rápido. Mantenha esta tela aberta.
                  </small>
                  <Button $variant="outline" $size="sm" onClick={() => abort.current?.abort()}>Cancelar</Button>
                </Compress>
              )}
              {compressed && !compressing && (
                <Compress>
                  <div className="head done">
                    <CheckCircle2 size={16} aria-hidden />
                    Vídeo comprimido
                    <strong>−{Math.round((1 - compressed.to / compressed.from) * 100)}%</strong>
                  </div>
                  <small>
                    <Zap size={12} style={{ display: 'inline', verticalAlign: '-2px' }} aria-hidden /> {formatBytes(compressed.from)} → {formatBytes(compressed.to)} · pronto para publicar.
                  </small>
                </Compress>
              )}
              <input ref={input} type="file" accept="image/*,video/*" hidden onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }} />
              {errors.media && <FieldError role="alert">{errors.media}</FieldError>}
            </div>

            <Field label="Legenda (opcional)" hint={`${caption.length}/500`}>
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

        <Button $size="lg" $block onClick={submit} disabled={posting || loading || !!compressing}>
          {paid ? <Lock size={18} /> : <Unlock size={18} />} {editing ? 'Salvar' : 'Postar'}
        </Button>
      </Stack>
    </NarrowContainer>
  )
}
