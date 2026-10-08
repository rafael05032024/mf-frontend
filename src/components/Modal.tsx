import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import styled, { keyframes } from 'styled-components'
import { mq } from '../styles/theme'
import { IconButton } from './ui'

const fade = keyframes`from { opacity: 0 } to { opacity: 1 }`
const rise = keyframes`from { transform: translateY(24px); opacity: 0 } to { transform: none; opacity: 1 }`

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: ${({ theme }) => theme.colors.overlay};
  animation: ${fade} 0.2s ease;
  ${mq.sm} { align-items: center; padding: 24px; }
`

const Panel = styled.div<{ $width: number }>`
  position: relative;
  width: 100%;
  max-width: ${({ $width }) => $width}px;
  max-height: 92dvh;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.lg} ${({ theme }) => theme.radius.lg} 0 0;
  box-shadow: ${({ theme }) => theme.shadow.lg};
  padding-bottom: env(safe-area-inset-bottom);
  animation: ${rise} 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  &:focus { outline: none; }
  ${mq.sm} { border-radius: ${({ theme }) => theme.radius.lg}; }
`

const Close = styled(IconButton)`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: ${({ theme }) => theme.shadow.sm};
`

interface Props {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  width?: number
  hideClose?: boolean
}

export function Modal({ open, onClose, label, children, width = 440, hideClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const panel = panelRef.current!
    const focusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(
        el => !el.hasAttribute('disabled'),
      )
    ;(focusables().find(el => !el.dataset.close) ?? panel).focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
      if (e.key === 'Tab') {
        const els = focusables()
        if (!els.length) return
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [open])

  if (!open) return null
  return createPortal(
    <Backdrop onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <Panel ref={panelRef} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} $width={width}>
        {!hideClose && (
          <Close onClick={onClose} aria-label="Fechar" data-close="true">
            <X size={20} />
          </Close>
        )}
        {children}
      </Panel>
    </Backdrop>,
    document.body,
  )
}
