import { useId, type ReactElement, cloneElement } from 'react'
import { FieldError, Hint, Label } from './ui'

interface Props {
  label: string
  hideLabel?: boolean
  error?: string
  hint?: string
  children: ReactElement<Record<string, unknown>>
}

/** Envolve um input com label visível, dica e erro ligados via aria. */
export function Field({ label, hideLabel, error, hint, children }: Props) {
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <Label htmlFor={id} style={hideLabel ? { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' } : undefined}>{label}</Label>
      {cloneElement(children, { id, 'aria-invalid': !!error, 'aria-describedby': describedBy })}
      {error ? <FieldError id={`${id}-err`} role="alert">{error}</FieldError> : hint && <Hint id={`${id}-hint`}>{hint}</Hint>}
    </div>
  )
}
