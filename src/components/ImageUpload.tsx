import { useId, useRef, useState } from 'react'
import { Camera, ImagePlus, Loader2 } from 'lucide-react'
import styled, { css, keyframes } from 'styled-components'
import { readImage } from '../utils/files'
import { FieldError, Label } from './ui'
import { ImageCropper } from './ImageCropper'

type Shape = 'avatar' | 'cover' | 'doc'

const spin = keyframes`to { transform: rotate(360deg) }`

const Drop = styled.button<{ $shape: Shape; $invalid?: boolean; $size?: number }>`
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 0;
  border: 2px dashed ${({ $invalid, theme }) => ($invalid ? theme.colors.danger : theme.colors.border)};
  background: ${({ theme }) => theme.colors.light};
  color: ${({ theme }) => theme.colors.grayText};
  transition: border-color .18s ease, background-color .18s ease;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; background: ${({ theme }) => theme.colors.primarySoft}; }
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
}

export function ImageUpload({ label, value, onChange, shape = 'doc', hint, error, maxSize, hideLabel, size, center, crop }: Props) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [readError, setReadError] = useState('')
  const [cropSrc, setCropSrc] = useState('')

  const pick = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setReadError('Selecione um arquivo de imagem.')
    setReadError('')
    setLoading(true)
    try {
      if (crop) setCropSrc(await readImage(file, 1600, 0.92))
      else onChange(await readImage(file, maxSize ?? (shape === 'avatar' ? 400 : 1200)))
    } catch {
      setReadError('Não foi possível ler a imagem.')
    } finally {
      setLoading(false)
    }
  }

  const err = error || readError
  return (
    <div style={center ? { display: 'flex', flexDirection: 'column', alignItems: 'center' } : undefined}>
      <Label as="span" id={`${id}-label`} style={hideLabel ? { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' } : undefined}>{label}</Label>
      <Drop
        type="button"
        $shape={shape}
        $invalid={!!err}
        $size={size}
        onClick={() => input.current?.click()}
        aria-labelledby={`${id}-label`}
        aria-describedby={err ? `${id}-err` : undefined}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
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
            {hint ?? 'Toque para enviar'}
          </span>
        )}
      </Drop>
      <input ref={input} type="file" accept="image/*" hidden onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }} />
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          outputSize={maxSize ?? (shape === 'avatar' ? 400 : 1200)}
          aspect={shape === 'avatar' ? 1 : shape === 'cover' ? 3 : 4 / 3}
          onCancel={() => setCropSrc('')}
          onConfirm={v => { onChange(v); setCropSrc('') }}
        />
      )}
      {err && <FieldError id={`${id}-err`} role="alert">{err}</FieldError>}
    </div>
  )
}
