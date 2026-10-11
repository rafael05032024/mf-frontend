import { useEffect, useRef, useState, type TextareaHTMLAttributes } from 'react'
import { Smile } from 'lucide-react'
import styled from 'styled-components'
import { Textarea } from './ui'

const CATEGORIES = [
  {
    key: 'smileys', icon: '😀', label: 'Carinhas',
    emojis: ['😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😎', '🥰', '😉', '🤩', '🥳', '😇', '🤗', '🤭', '😏', '😌', '😴', '🤔', '😅', '😢', '😭', '😡', '🥺', '😈', '🙄', '😜', '😋', '🤤', '😳'],
  },
  {
    key: 'gestures', icon: '👍', label: 'Gestos',
    emojis: ['👍', '👏', '🙌', '🙏', '💪', '🤝', '👋', '✌️', '🤞', '👀', '💋', '🫶', '👅', '👄', '🤙', '👌', '🫦', '💃', '🕺', '🙈'],
  },
  {
    key: 'hearts', icon: '❤️', label: 'Corações',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💕', '💞', '💘', '💝', '💯', '🔥', '✨', '⭐', '🌟', '💫', '💥'],
  },
  {
    key: 'objects', icon: '🎉', label: 'Objetos',
    emojis: ['🎉', '🎁', '🎶', '📸', '🎬', '🌹', '🌴', '☀️', '🌙', '🍷', '🍸', '☕', '🍕', '🍓', '🏋️', '✈️', '💎', '👑', '💸', '🔞', '📍', '👙', '👠', '🛍️'],
  },
]

const Wrap = styled.div`
  position: relative;
`

const Box = styled.div`
  position: relative;
`

const Toggle = styled.button<{ $active: boolean }>`
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: ${({ $active, theme }) => ($active ? theme.colors.primarySoft : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.primaryText : theme.colors.grayText)};
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.light}; }
`

const Panel = styled.div`
  position: absolute;
  z-index: 20;
  right: 0;
  top: 100%;
  margin-top: 6px;
  width: min(340px, 100%);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadow.lg};
  overflow: hidden;
`

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.light};
`

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  height: 42px;
  border: 0;
  border-bottom: 3px solid ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  opacity: ${({ $active }) => ($active ? 1 : 0.6)};
  &:hover { opacity: 1; }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 2px;
  max-height: 210px;
  overflow-y: auto;
  padding: 8px;
`

const EmojiBtn = styled.button`
  height: 40px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  &:hover, &:focus-visible { background: ${({ theme }) => theme.colors.light}; outline: none; }
`

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & {
  value: string
  onChange: (value: string) => void
}

function EmojiTextareaInner({ value, onChange, maxLength, ...rest }: Props) {
  const [open, setOpen] = useState(false)
  const [cat, setCat] = useState(CATEGORIES[0].key)
  const ref = useRef<HTMLTextAreaElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const insert = (emoji: string) => {
    const el = ref.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    const next = value.slice(0, start) + emoji + value.slice(end)
    if (maxLength && next.length > maxLength) return
    onChange(next)
    const pos = start + emoji.length
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(pos, pos)
    })
  }

  const current = CATEGORIES.find(c => c.key === cat) ?? CATEGORIES[0]

  return (
    <Wrap ref={wrapRef}>
      <Box>
        <Textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          onChange={e => onChange(e.target.value)}
          style={{ paddingRight: 52 }}
          {...rest}
        />
        <Toggle
          type="button"
          $active={open}
          aria-label="Abrir emojis"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <Smile size={22} aria-hidden />
        </Toggle>
      </Box>
      {open && (
        <Panel>
          <Tabs role="tablist">
            {CATEGORIES.map(c => (
              <Tab
                key={c.key}
                type="button"
                role="tab"
                aria-selected={c.key === cat}
                aria-label={c.label}
                $active={c.key === cat}
                onClick={() => setCat(c.key)}
              >
                {c.icon}
              </Tab>
            ))}
          </Tabs>
          <Grid>
            {current.emojis.map(e => (
              <EmojiBtn key={e} type="button" onClick={() => insert(e)} aria-label={`Inserir ${e}`}>
                {e}
              </EmojiBtn>
            ))}
          </Grid>
        </Panel>
      )}
    </Wrap>
  )
}

EmojiTextareaInner.displayName = 'EmojiTextarea'

export const EmojiTextarea = EmojiTextareaInner
