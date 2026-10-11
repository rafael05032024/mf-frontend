import { useId, useState, type ReactElement, cloneElement, type FocusEvent } from 'react'
import styled, { css } from 'styled-components'
import { FieldError, Hint } from './ui'

const FloatWrap = styled.div<{ $active: boolean; $filled: boolean; $invalid: boolean; $hasIcon: boolean }>`
  position: relative;

  .field-label {
    position: absolute;
    left: ${({ $hasIcon }) => ($hasIcon ? '44px' : '16px')};
    top: 50%;
    transform: translateY(-50%);
    font-size: 15px;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.gray};
    pointer-events: none;
    transition: top 0.2s ease, transform 0.2s ease, font-size 0.2s ease,
      font-weight 0.2s ease, color 0.2s ease, left 0.2s ease,
      background 0.2s ease, padding 0.2s ease;
    z-index: 1;
    line-height: 1;
    background: transparent;
    padding: 0;
  }

  ${({ $active, $filled, $invalid, theme }) =>
    ($active || $filled) &&
    css`
      .field-label {
        top: 0;
        transform: translateY(-50%);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: ${$invalid ? theme.colors.danger : $active ? theme.colors.primary : theme.colors.grayText};
        background: ${theme.colors.white};
        padding: 0 6px;
        left: 10px;
      }
    `}

  input, select, textarea {
    &::placeholder {
      opacity: ${({ $active, $filled }) => ($active || $filled ? 1 : 0)};
      transition: opacity 0.15s ease;
    }
  }
`

const StaticLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 6px;
  letter-spacing: 0.01em;
`

interface Props {
  label: string
  hideLabel?: boolean
  error?: string
  hint?: string
  float?: boolean
  children: ReactElement<Record<string, unknown>>
}

function getDisplayName(child: ReactElement<Record<string, unknown>>): string | undefined {
  const type = child.type as { displayName?: string } | string
  return typeof type === 'string' ? type : type?.displayName
}

function hasLeftIcon(child: ReactElement<Record<string, unknown>>): boolean {
  const name = getDisplayName(child)
  if (name === 'InputGroup') return !!(child.props as Record<string, unknown>).leftIcon
  if (name === 'PasswordInput') return true
  return false
}

function shouldDisableFloat(child: ReactElement<Record<string, unknown>>): boolean {
  const name = getDisplayName(child)
  return name === 'EmojiTextarea'
}

function extractValue(child: ReactElement<Record<string, unknown>>): unknown {
  const props = child.props as Record<string, unknown>
  if (props.value !== undefined) return props.value
  const name = getDisplayName(child)
  if (name === 'InputGroup') {
    const inner = props.children as ReactElement<Record<string, unknown>> | undefined
    if (inner && typeof inner === 'object' && 'props' in inner) {
      return (inner.props as Record<string, unknown>).value
    }
  }
  return undefined
}

const srOnly: React.CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }

export function Field({ label, hideLabel, error, hint, float: floatProp, children }: Props) {
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  const [focused, setFocused] = useState(false)

  const shouldFloat = floatProp ?? !shouldDisableFloat(children)

  const childProps: Record<string, unknown> = {
    id,
    'aria-invalid': !!error || undefined,
    'aria-describedby': describedBy,
  }

  if (shouldFloat) {
    childProps.onFocus = (e: FocusEvent) => {
      setFocused(true)
      const orig = (children.props as Record<string, unknown>).onFocus as ((e: FocusEvent) => void) | undefined
      orig?.(e)
    }
    childProps.onBlur = (e: FocusEvent) => {
      setFocused(false)
      const orig = (children.props as Record<string, unknown>).onBlur as ((e: FocusEvent) => void) | undefined
      orig?.(e)
    }
  }

  const value = extractValue(children)
  const filled = value !== undefined && value !== ''
  const iconLeft = hasLeftIcon(children)

  const footer = error
    ? <FieldError id={`${id}-err`} role="alert">{error}</FieldError>
    : hint
      ? <Hint id={`${id}-hint`}>{hint}</Hint>
      : null

  if (!shouldFloat) {
    return (
      <div>
        <StaticLabel htmlFor={id} style={hideLabel ? srOnly : undefined}>{label}</StaticLabel>
        {cloneElement(children, childProps)}
        {footer}
      </div>
    )
  }

  return (
    <div>
      <FloatWrap $active={focused} $filled={!!filled} $invalid={!!error} $hasIcon={iconLeft}>
        {cloneElement(children, childProps)}
        <label className="field-label" htmlFor={id} style={hideLabel ? srOnly : undefined}>{label}</label>
      </FloatWrap>
      {footer}
    </div>
  )
}
