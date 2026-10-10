import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import styled from 'styled-components'
import { Input } from './ui'

const Row = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`

const Box = styled(Input)`
  width: 100%;
  max-width: 52px;
  min-width: 0;
  height: 60px;
  padding: 0;
  text-align: center;
  font-size: 24px;
  font-weight: 800;
`

interface Props {
  value: string
  onChange: (value: string) => void
  length?: number
  autoFocus?: boolean
}

/** Código numérico dividido em caixas, com avanço automático, backspace e suporte a colar */
export function CodeInput({ value, onChange, length = 6, autoFocus }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const focus = (i: number) => refs.current[Math.min(Math.max(i, 0), length - 1)]?.focus()

  const fill = (i: number, digits: string) => {
    if (!digits) return
    const chars = value.padEnd(length, ' ').split('')
    for (let k = 0; k < digits.length && i + k < length; k++) chars[i + k] = digits[k]
    onChange(chars.join('').replace(/ /g, '').slice(0, length))
    focus(i + digits.length)
  }

  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i]) {
      e.preventDefault()
      onChange(value.slice(0, Math.max(i - 1, 0)) + value.slice(i))
      focus(i - 1)
    } else if (e.key === 'ArrowLeft') focus(i - 1)
    else if (e.key === 'ArrowRight') focus(i + 1)
  }

  const onPaste = (i: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    fill(i, e.clipboardData.getData('text').replace(/\D/g, ''))
  }

  return (
    <Row role="group" aria-label="Código de verificação">
      {Array.from({ length }, (_, i) => (
        <Box
          key={i}
          ref={el => { refs.current[i] = el }}
          value={value[i] ?? ''}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          autoFocus={autoFocus && i === 0}
          aria-label={`Dígito ${i + 1}`}
          onFocus={e => e.target.select()}
          onChange={e => {
            const digits = e.target.value.replace(/\D/g, '')
            if (!digits) return onChange(value.slice(0, i) + value.slice(i + 1))
            fill(i, digits)
          }}
          onKeyDown={onKeyDown(i)}
          onPaste={onPaste(i)}
        />
      ))}
    </Row>
  )
}
