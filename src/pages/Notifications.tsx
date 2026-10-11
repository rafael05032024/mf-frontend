import { Bell } from 'lucide-react'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { Button, Muted, NarrowContainer } from '../components/ui'
import { useApp } from '../store/AppContext'
import type { AppNotification } from '../types'
import { formatDateTime, notificationColors, relativeTime, toIconName } from '../utils/format'

const Item = styled.button<{ $unread: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border: 0;
  background: ${({ $unread, theme }) => ($unread ? theme.colors.primarySoft : theme.colors.white)};
  &:hover { background: ${({ theme }) => theme.colors.light}; }
  > div { flex: 1; min-width: 0; }
  strong { display: block; font-weight: 700; }
  p { margin: 2px 0 0; font-size: 14px; }
  small { display: block; margin-top: 4px; color: ${({ theme }) => theme.colors.grayText}; font-size: 12px; }
`

const Cards = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  li + li { border-top: 1px solid ${({ theme }) => theme.colors.border}; }
`

const Icon = styled.span<{ $type?: number }>`
  flex: none;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: ${({ $type, theme }) => notificationColors($type, theme.colors).color};
  background: ${({ $type, theme }) => notificationColors($type, theme.colors).background};
`

const Detail = styled.div`
  padding: 28px 20px 24px;
  display: grid;
  gap: 10px;
  justify-items: center;
  text-align: center;
  h2 { font-size: 20px; }
  p { margin: 0; white-space: pre-line; overflow-wrap: anywhere; }
  small { color: ${({ theme }) => theme.colors.grayText}; font-size: 13px; }
  button { margin-top: 8px; }
`

const Empty = styled.div`
  text-align: center;
  padding: 48px 16px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px dashed ${({ theme }) => theme.colors.border};
`

const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max).trimEnd()}...` : text)

function NotifIcon({ n, size }: { n: AppNotification; size: number }) {
  return n.icon ? (
    <DynamicIcon name={toIconName(n.icon) as IconName} size={size} fallback={() => <Bell size={size} />} />
  ) : (
    <Bell size={size} />
  )
}

export default function Notifications() {
  const { notifications, readNotification } = useApp()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<AppNotification | null>(null)

  return (
    <NarrowContainer>
      <PageHeader title="Notificações" back="/conta" />
      {notifications.length === 0 ? (
        <Empty>
          <Muted>Nenhuma notificação por aqui.</Muted>
        </Empty>
      ) : (
        <Cards>
          {notifications.map(n => (
            <li key={n.id}>
              <Item $unread={!n.read} onClick={() => {
                  setSelected(n)
                  readNotification(n.id)
                }}>
                <Icon $type={n.type} aria-hidden>
                  <NotifIcon n={n} size={20} />
                </Icon>
                <div>
                  {n.title && <strong>{n.title}</strong>}
                  <p>{truncate(n.message, 50)}</p>
                  <small>{relativeTime(n.date)}</small>
                </div>
              </Item>
            </li>
          ))}
        </Cards>
      )}
      <Modal open={!!selected} onClose={() => setSelected(null)} label={selected?.title ?? 'Notificação'} width={400}>
        {selected && (
          <Detail>
            <Icon $type={selected.type} aria-hidden style={{ width: 64, height: 64 }}>
              <NotifIcon n={selected} size={32} />
            </Icon>
            {selected.title && <h2>{selected.title}</h2>}
            <p>{selected.message}</p>
            <small>
              {formatDateTime(selected.date)} · {notifications.find(n => n.id === selected.id)?.read ?? selected.read ? 'Lida' : 'Nova'}
            </small>
            {selected.link ? (
              <Button
                onClick={() => {
                  navigate(selected.link!)
                  setSelected(null)
                }}
              >
                Abrir
              </Button>
            ) : (
              <Button onClick={() => setSelected(null)}>Fechar</Button>
            )}
          </Detail>
        )}
      </Modal>
    </NarrowContainer>
  )
}
