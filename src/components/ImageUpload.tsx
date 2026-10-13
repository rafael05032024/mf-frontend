import { useId, useRef, useState } from 'react'
import { Camera, ImagePlus, Loader2, Upload } from 'lucide-react'
import styled, { css, keyframes } from 'styled-components'
import { mq } from '../styles/theme'
import { readImage } from '../utils/files'
import { Button, FieldError, Label } from './ui'
import { ImageCropper } from './ImageCropper'

type Shape = 'avatar' | 'cover' | 'doc'

const spin = keyframes`to { transform: rotate(360deg) }`

const Drop = styled.button<{ $shape: Shape; $invalid?: boolean; $size?: number; $dragging?: boolean }>`
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 0;
  border: 2px dashed ${({ $invalid, theme }) => ($invalid ? theme.colors.danger : theme.colors.border)};
  background: ${({ theme }) => theme.colors.light};
  color: ${({ theme }) => theme.colors.grayText};
  transition: border-color .18s ease, background-color .18s ease, color .18s ease;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; background: ${({ theme }) => theme.colors.primarySoft}; }
  ${({ $dragging, theme }) =>
    $dragging &&
    css`
      border-style: solid;
      border-color: ${theme.colors.primary};
      background: ${theme.colors.primarySoft};
      color: ${theme.colors.primaryText};
    `}
  ${({ $shape, $size, theme }) =>
    $shape === 'avatar'
      ? css`width: ${$size ?? 112}px; height: ${$size ?? 112}px; border-radius: 50%;`
      : $shape === 'cover'
        ? css`width: 100%; aspect-ratio: 3 / 1; border-radius: ${theme.radius.md};`
        : css`width: 100%; aspect-ratio: 4 / 3; border-radius: ${theme.radius.md};`}
  img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .hint { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; padding: 8px; text-align: center; }
  .edit {
    position: absolute;
    right: 8px;
    bottom: 8px;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    box-shadow: ${({ theme }) => theme.shadow.md};
  }
  ${({ $shape }) => $shape === 'avatar' && css`.edit { right: 2px; bottom: 2px; }`}
  .spin { animation: ${spin} 1s linear infinite; }
`

const Panel = styled.div<{ $invalid?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: 18px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ $invalid, theme }) => ($invalid ? theme.colors.danger : `${theme.colors.primary}33`)};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primarySoft} 0%, ${({ theme }) => theme.colors.white} 100%);
  ${mq.sm} { flex-direction: row; text-align: left; gap: 20px; }

  /* o recorte tem tamanho fixo: não deve ser comprimido pelo texto ao lado */
  > button { flex-shrink: 0; }

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    ${mq.sm} { align-items: flex-start; }
  }
  .title {
    margin-bottom: 0;
    font-family: ${({ theme }) => theme.fontDisplay};
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: ${({ theme }) => theme.colors.dark};
  }
  .desc {
    font-size: 13px;
    line-height: 1.45;
    color: ${({ theme }) => theme.colors.grayText};
  }
  .msg { margin-top: 0; }
  .spin { animation: ${spin} 1s linear infinite; }
`

interface Props {
  label: string
  value?: string
  onChange: (dataUrl: string) => void
  shape?: Shape
  hint?: string
  error?: string
  maxSize?: number
  hideLabel?: boolean
  size?: number
  center?: boolean
  crop?: boolean
  /** 'panel': moldura com rótulo visível, orientação e botão de envio ao lado da miniatura */
  layout?: 'plain' | 'panel'
  description?: string
}

export function ImageUpload({ label, value, onChange, shape = 'doc', hint, error, maxSize, hideLabel, size, center, crop, layout = 'plain', description }: Props) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [readError, setReadError] = useState('')
  const [cropSrc, setCropSrc] = useState('')
  const [dragging, setDragging] = useState(false)

  const pick = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setReadError('Selecione um arquivo de imagem.')
    setReadError('')
    setLoading(true)
    try {
      // recorte usa o arquivo original: evita uma recompressão JPEG antes do corte final
      if (crop) setCropSrc(URL.createObjectURL(file))
      else onChange(await readImage(file, maxSize ?? (shape === 'avatar' ? 400 : 1200)))
    } catch {
      setReadError('Não foi possível ler a imagem.')
    } finally {
      setLoading(false)
    }
  }

  const closeCrop = () => {
    URL.revokeObjectURL(cropSrc)
    setCropSrc('')
  }

  const err = error || readError
  const describedBy = err ? `${id}-err` : layout === 'panel' && description ? `${id}-desc` : undefined

  const dropZone = (
    <Drop
      type="button"
      $shape={shape}
      $invalid={!!err}
      $size={size}
      $dragging={dragging}
      onClick={() => input.current?.click()}
      aria-labelledby={`${id}-label`}
      aria-describedby={describedBy}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault()
        setDragging(false)
        pick(e.dataTransfer.files[0])
      }}
    >
      {value && <img src={value} alt="" />}
      {loading ? (
        <Loader2 className="spin" size={28} />
      ) : value ? (
        <span className="edit" aria-hidden><Camera size={18} /></span>
      ) : (
        <span className="hint">
          <ImagePlus size={26} aria-hidden />
          {/* no layout em moldura a instrução fica no botão ao lado, não dentro do recorte */}
          {layout === 'panel' ? null : hint ?? 'Toque para enviar'}
        </span>
      )}
    </Drop>
  )

  const filePicker = (
    <>
      <input ref={input} type="file" accept="image/*" hidden onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }} />
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          outputSize={maxSize ?? (shape === 'avatar' ? 800 : 2400)}
          aspect={shape === 'avatar' ? 1 : shape === 'cover' ? 3 : 4 / 3}
          onCancel={closeCrop}
          onConfirm={v => { onChange(v); closeCrop() }}
        />
      )}
    </>
  )

  if (layout === 'panel')
    return (
      <Panel $invalid={!!err}>
        {dropZone}
        <div className="info">
          <Label as="span" className="title" id={`${id}-label`}>{label}</Label>
          {err ? (
            <FieldError className="msg" id={`${id}-err`} role="alert">{err}</FieldError>
          ) : description ? (
            <span className="desc" id={`${id}-desc`}>{description}</span>
          ) : null}
          <Button type="button" $variant="outline" $size="sm" onClick={() => input.current?.click()} disabled={loading}>
            {loading ? <><Loader2 className="spin" size={16} /> Carregando…</>
              : value ? <><Camera size={16} /> Trocar foto</>
                : <><Upload size={16} /> {hint ?? 'Enviar foto'}</>}
          </Button>
        </div>
        {filePicker}
      </Panel>
    )

  return (
    <div style={center ? { display: 'flex', flexDirection: 'column', alignItems: 'center' } : undefined}>
      <Label as="span" id={`${id}-label`} style={hideLabel ? { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' } : undefined}>{label}</Label>
      {dropZone}
      {filePicker}
      {err && <FieldError id={`${id}-err`} role="alert">{err}</FieldError>}
    </div>
  )
}
