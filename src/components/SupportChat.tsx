import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Headset, Send, X } from 'lucide-react'
import styled, { keyframes } from 'styled-components'
import { eventName, getMe, listMessages, markMessagesRead, sendMessage, subscribeEvents, type ApiMessage } from '../api'
import { supportUnreadKey, useApp } from '../store/AppContext'
import { load as loadStored, save } from '../store/storage'
import { mq } from '../styles/theme'

interface Msg {
  id: number
  from: 'agent' | 'user'
  text: string
  time: string
}

const fmtTime = (iso?: string) =>
  (iso ? new Date(iso) : new Date()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

const toMsg = (m: ApiMessage): Msg => ({ id: m.id, from: m.mine ? 'user' : 'agent', text: m.text, time: fmtTime(m.createdAt) })

const pop = keyframes`from { transform: translateY(12px) scale(.96); opacity: 0 } to { transform: none; opacity: 1 }`

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 175, 240, 0.55); }
  50% { box-shadow: 0 0 0 10px rgba(0, 175, 240, 0); }
`

const Fab = styled.button<{ $unread?: boolean }>`
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 90;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  outline: none;
  display: grid;
  place-items: center;
  box-shadow: 0 4px 10px rgba(0,0,0,.2), 0 2px 4px rgba(0,0,0,.15);
  transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
  animation: ${({ $unread }) => ($unread ? pulse : 'none')} 1.6s ease-in-out infinite;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; transform: scale(1.05); box-shadow: 0 6px 14px rgba(0,0,0,.24), 0 3px 6px rgba(0,0,0,.18); }
  ${mq.md} { right: 24px; bottom: 24px; }
`

const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ theme }) => theme.colors.white};
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  box-sizing: border-box;
`

const Panel = styled.section`
  position: fixed;
  right: 16px;
  bottom: 84px;
  z-index: 90;
  width: min(320px, calc(100vw - 32px));
  height: min(420px, calc(100vh - 120px));
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.lg};
  overflow: hidden;
  animation: ${pop} 0.2s ease-out;
  ${mq.md} { right: 24px; bottom: 92px; }
`

const Top = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
`

const AgentIcon = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: grid;
  place-items: center;
  flex-shrink: 0;
`

const Who = styled.div`
  flex: 1;
  min-width: 0;
  strong { display: block; font-family: ${({ theme }) => theme.fontDisplay}; font-size: 15px; }
  span { font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 6px; }
  span::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #5CF2B0; }
`

const Close = styled.button`
  color: ${({ theme }) => theme.colors.dark};
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  border: none;
  outline: none;
  transition: background-color 0.15s ease;
  &:hover { background: ${({ theme }) => theme.colors.white}; }
`

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: ${({ theme }) => theme.colors.light};
`

const Bubble = styled.div<{ $mine: boolean }>`
  align-self: ${({ $mine }) => ($mine ? 'flex-end' : 'flex-start')};
  max-width: 82%;
  padding: 9px 12px;
  border-radius: 16px;
  border-bottom-right-radius: ${({ $mine }) => ($mine ? '4px' : '16px')};
  border-bottom-left-radius: ${({ $mine }) => ($mine ? '16px' : '4px')};
  background: ${({ $mine, theme }) => ($mine ? theme.colors.primary : theme.colors.white)};
  color: ${({ $mine, theme }) => ($mine ? theme.colors.white : theme.colors.dark)};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  font-size: 14px;
  line-height: 1.4;
  overflow-wrap: anywhere;
  .text { white-space: pre-wrap; }
  small { display: block; margin-top: 4px; font-size: 11px; opacity: 0.7; text-align: right; }
`

const Form = styled.form`
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.white};
  input {
    flex: 1;
    min-width: 0;
    height: 42px;
    padding: 0 14px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.pill};
    font-size: 16px;
    &:focus { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: -1px; }
  }
  button {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    &:disabled { opacity: 0.5; cursor: default; }
  }
`

export function SupportChat() {
  const { user } = useApp()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const endRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)
  const openRef = useRef(open)
  openRef.current = open
  const email = user?.email

  // carrega as mensagens e marca como lidas
  const load = useCallback(() => {
    getMe()
      .then((me) => listMessages(me.id))
      .then((list) => setMsgs(list.map(toMsg)))
      .catch(() => {})
    markMessagesRead().catch(() => {})
  }, [])

  useEffect(() => {
    if (open) {
      setUnread(0)
      if (email) save(supportUnreadKey(email), false)
      load()
    }
  }, [open, load, email])

  // usuário recém-cadastrado: chat de suporte com mensagem não lida
  useEffect(() => {
    if (email && !openRef.current && loadStored<boolean>(supportUnreadKey(email), false)) setUnread(1)
  }, [email])

  // nova mensagem recebida pelo WebSocket
  useEffect(() => {
    if (!email) return
    return subscribeEvents((data) => {
      if (eventName(data) !== 'new_message') return
      if (openRef.current) load()
      else setUnread(1)
    })
  }, [email, load])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (panelRef.current?.contains(t) || fabRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' })
  }, [open, msgs])

  const send = async (e: FormEvent) => {
    e.preventDefault()
    const value = text.trim()
    if (!value || sending) return
    setSending(true)
    try {
      await sendMessage(value)
      setMsgs((m) => [...m, { id: Date.now(), from: 'user', text: value, time: fmtTime() }])
      setText('')
    } catch {
      /* mantém o texto para tentar de novo */
    } finally {
      setSending(false)
    }
  }

  if (!user) return null

  return (
    <>
      {open && (
        <Panel ref={panelRef} aria-label="Chat de suporte">
          <Top>
            <AgentIcon><Headset size={20} /></AgentIcon>
            <Who>
              <strong>Suporte</strong>
              <span>Online agora</span>
            </Who>
            <Close type="button" onClick={() => setOpen(false)} aria-label="Fechar chat"><X size={20} /></Close>
          </Top>
          <List>
            {msgs.map((m) => (
              <Bubble key={m.id} $mine={m.from === 'user'}>
                <span className="text">{m.text.split(/\\n|\n/).map(l => l.trim()).join('\n')}</span>
                <small>{m.time}</small>
              </Bubble>
            ))}
            <div ref={endRef} />
          </List>
          <Form onSubmit={send}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Digite sua mensagem..." aria-label="Mensagem" />
            <button type="submit" disabled={!text.trim() || sending} aria-label="Enviar"><Send size={18} /></button>
          </Form>
        </Panel>
      )}
      <Fab ref={fabRef} type="button" $unread={!open && unread > 0} onClick={() => setOpen((o) => !o)} aria-label={open ? 'Fechar suporte' : 'Abrir suporte'}>
        {open ? <X size={24} /> : <Headset size={24} />}
        {!open && unread > 0 && <Badge aria-label={`${unread} mensagens não lidas`}>{unread}</Badge>}
      </Fab>
    </>
  )
}
