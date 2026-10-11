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
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.grayText};
  transition: background-color 0.18s ease, color 0.18s ease;
  &:hover { background: ${({ theme }) => theme.colors.light}; color: ${({ theme }) => theme.colors.dark}; }
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
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 6px;
  letter-spacing: 0.01em;
`

const fieldBase = css`
  width: 100%;
  min-height: 52px;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.white};
  font-size: 16px;
  cursor: text;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  &::placeholder { color: ${({ theme }) => theme.colors.gray}; }
  &:hover:not(:focus):not(:read-only):not([aria-invalid='true']) {
    border-color: ${({ theme }) => theme.colors.gray};
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
  &[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.colors.danger};
    &:focus { box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.dangerSoft}; }
  }
  &:read-only:not(select) {
    background: ${({ theme }) => theme.colors.light};
    color: ${({ theme }) => theme.colors.grayText};
    cursor: not-allowed;
  }
`

export const Input = styled.input`
  ${fieldBase}
  &[type='date'] {
    color-scheme: light;
    &::-webkit-date-and-time-value { text-align: left; }
    &::-webkit-calendar-picker-indicator {
      opacity: 0.5;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: opacity 0.18s ease;
      &:hover { opacity: 0.8; }
    }
  }
`
export const Select = styled.select`
  ${fieldBase}
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A8A8A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
`
export const Textarea = styled.textarea`
  ${fieldBase}
  resize: vertical;
  min-height: 110px;
  line-height: 1.5;
`

export const FieldError = styled.p`
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.danger};
`

export const Hint = styled.p`
  margin-top: 4px;
  font-size: 12px;
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
