import styled, { css } from 'styled-components'
import { mq } from '../styles/theme'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'

export const Button = styled.button<{ $variant?: Variant; $block?: boolean; $size?: 'sm' | 'md' | 'lg' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: ${({ $size }) => ($size === 'sm' ? '36px' : $size === 'lg' ? '52px' : '44px')};
  padding: 0 ${({ $size }) => ($size === 'sm' ? '14px' : '20px')};
  border-radius: ${({ theme }) => theme.radius.pill};
  border: 1.5px solid transparent;
  font-weight: 700;
  font-size: ${({ $size }) => ($size === 'sm' ? '14px' : '15px')};
  letter-spacing: 0.01em;
  width: ${({ $block }) => ($block ? '100%' : 'auto')};
  white-space: nowrap;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.1s ease;
  &:active:not(:disabled) { transform: scale(0.98); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }

  ${({ $variant = 'primary', theme }) => {
    const c = theme.colors
    switch ($variant) {
      case 'primary':
        return css`
          background: ${c.primary};
          color: ${c.white};
          &:hover:not(:disabled) { background: ${c.primaryHover}; }
        `
      case 'secondary':
        return css`
          background: ${c.primarySoft};
          color: ${c.primaryText};
          &:hover:not(:disabled) { background: #d3f0fc; }
        `
      case 'outline':
        return css`
          background: ${c.white};
          color: ${c.primaryText};
          border-color: ${c.primary};
          &:hover:not(:disabled) { background: ${c.primarySoft}; }
        `
      case 'danger':
        return css`
          background: ${c.danger};
          color: ${c.white};
        `
      case 'ghost':
        return css`
          background: transparent;
          color: ${c.dark};
          &:hover:not(:disabled) { background: ${c.light}; }
        `
    }
  }}
`

export const IconButton = styled.button`
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.dark};
  transition: background-color 0.18s ease;
  &:hover { background: ${({ theme }) => theme.colors.light}; }
`

export const Container = styled.main`
  width: 100%;
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 16px 16px calc(40px + env(safe-area-inset-bottom));
  ${mq.md} { padding: 24px 24px 56px; }
`

export const NarrowContainer = styled(Container)`
  max-width: 640px;
`

export const Card = styled.section<{ $pad?: boolean }>`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  ${({ $pad = true }) => $pad && css`padding: 20px; ${mq.md} { padding: 24px; }`}
`

export const Stack = styled.div<{ $gap?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 16 }) => $gap}px;
`

export const Row = styled.div<{ $gap?: number; $between?: boolean; $wrap?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ $gap = 12 }) => $gap}px;
  justify-content: ${({ $between }) => ($between ? 'space-between' : 'flex-start')};
  flex-wrap: ${({ $wrap }) => ($wrap ? 'wrap' : 'nowrap')};
`

export const Title = styled.h1`
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  ${mq.md} { font-size: 26px; }
`

export const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
`

export const Muted = styled.p`
  color: ${({ theme }) => theme.colors.grayText};
  font-size: 14px;
`

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 6px;
`

const fieldBase = css`
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.white};
  font-size: 16px; /* evita zoom automático no iOS */
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  &::placeholder { color: ${({ theme }) => theme.colors.gray}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
  &[aria-invalid='true'] { border-color: ${({ theme }) => theme.colors.danger}; }
  &:read-only:not(select) {
    background: ${({ theme }) => theme.colors.light};
    color: ${({ theme }) => theme.colors.grayText};
    cursor: not-allowed;
  }
`

export const Input = styled.input`${fieldBase}`
export const Select = styled.select`${fieldBase}`
export const Textarea = styled.textarea`
  ${fieldBase}
  resize: vertical;
  min-height: 110px;
  line-height: 1.5;
`

export const FieldError = styled.p`
  margin-top: 6px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.danger};
`

export const Hint = styled.p`
  margin-top: 6px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.grayText};
`

export const Alert = styled.div<{ $tone?: 'danger' | 'success' | 'warning' | 'info' }>`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: 500;
  ${({ $tone = 'info', theme }) => {
    const map = {
      danger: [theme.colors.dangerSoft, theme.colors.danger],
      success: [theme.colors.successSoft, theme.colors.success],
      warning: [theme.colors.warningSoft, theme.colors.warning],
      info: [theme.colors.primarySoft, theme.colors.primaryText],
    } as const
    const [bg, fg] = map[$tone]
    return css`background: ${bg}; color: ${fg};`
  }}
  svg { flex-shrink: 0; margin-top: 1px; }
`
