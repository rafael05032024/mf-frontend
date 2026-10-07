import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, Info, X } from 'lucide-react'
import styled, { keyframes } from 'styled-components'
import { mq } from '../styles/theme'

type Tone = 'success' | 'info'
interface ToastItem {
  id: number
  title: string
  message?: string
  tone: Tone
  duration: number
}

const Ctx = createContext<(t: Omit<ToastItem, 'id' | 'tone' | 'duration'> & { tone?: Tone; duration?: number }) => void>(() => {})

const slide = keyframes`from { transform: translateY(-12px); opacity: 0 } to { transform: none; opacity: 1 }`
const shrink = keyframes`from { transform: scaleX(1) } to { transform: scaleX(0) }`

const Region = styled.div`
  position: fixed;
  top: calc(${({ theme }) => theme.headerHeight} + 12px);
  left: 12px;
  right: 12px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  ${mq.sm} { left: auto; right: 24px; width: 380px; }
`

const Item = styled.div<{ $tone: Tone }>`
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 44px 16px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadow.lg};
  border-left: 4px solid ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.primary)};
  animation: ${slide} 0.25s ease;
  > svg { flex-shrink: 0; color: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.primaryText)}; }
  strong { display: block; font-size: 15px; }
  p { font-size: 14px; color: ${({ theme }) => theme.colors.dark}; margin-top: 2px; }
`

const Bar = styled.span<{ $ms: number }>`
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 100%;
  transform-origin: left;
  background: ${({ theme }) => theme.colors.primary};
  animation: ${shrink} ${({ $ms }) => $ms}ms linear forwards;
`

const Dismiss = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.grayText};
  &:hover { background: ${({ theme }) => theme.colors.light}; }
`

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const remove = (id: number) => setItems(prev => prev.filter(t => t.id !== id))

  const show = useCallback<React.ContextType<typeof Ctx>>(({ tone = 'info', duration = 4000, ...t }) => {
    const id = Date.now() + Math.random()
    setItems(prev => [...prev, { ...t, id, tone, duration }])
    window.setTimeout(() => remove(id), duration)
  }, [])

  return (
    <Ctx.Provider value={show}>
      {children}
      <Region role="status" aria-live="polite">
        {items.map(t => (
          <Item key={t.id} $tone={t.tone}>
            {t.tone === 'success' ? <CheckCircle2 size={22} /> : <Info size={22} />}
            <div>
              <strong>{t.title}</strong>
              {t.message && <p>{t.message}</p>}
            </div>
            <Dismiss onClick={() => remove(t.id)} aria-label="Fechar aviso">
              <X size={18} />
            </Dismiss>
            <Bar $ms={t.duration} />
          </Item>
        ))}
      </Region>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
