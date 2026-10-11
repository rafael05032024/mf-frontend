import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { useEffect, useRef, useState } from 'react'
import { Bell, ImagePlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useApp } from '../store/AppContext'
import { mq } from '../styles/theme'
import { notificationColors, relativeTime, toIconName } from '../utils/format'
import { Avatar } from './Avatar'
import { LogoMark } from './icons'
import { Button, IconButton } from './ui'

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  height: ${({ theme }) => theme.headerHeight};
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Inner = styled.div`
  height: 100%;
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 0 12px 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  ${mq.md} { padding: 0 24px; }
`

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: auto;
  color: ${({ theme }) => theme.colors.black};
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.03em;
  span b { color: ${({ theme }) => theme.colors.primary}; }
`

const PostButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  padding: 0 16px;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: background-color 0.18s ease, transform 0.1s ease, box-shadow 0.18s ease;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; box-shadow: 0 2px 8px rgba(0, 175, 240, 0.3); }
  &:active { transform: scale(0.96); }
  span { display: none; }
  ${mq.sm} { span { display: inline; } }
`

const Dot = styled.span`
  position: absolute;
  top: 2px;
  right: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.white};
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  border: 2px solid ${({ theme }) => theme.colors.white};
  box-sizing: content-box;
`

const Popover = styled.div`
  position: fixed;
  top: calc(${({ theme }) => theme.headerHeight} + 4px);
  left: 12px;
  right: 12px;
  max-height: 70dvh;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  ${mq.sm} { position: absolute; top: 52px; left: auto; right: 0; width: 360px; }
  h2 { font-size: 16px; padding: 14px 16px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  ul { list-style: none; margin: 0; padding: 0; }
  li + li { border-top: 1px solid ${({ theme }) => theme.colors.light}; }
`

const NotifItem = styled.button<{ $unread: boolean }>`
  display: flex;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  border: 0;
  background: ${({ $unread, theme }) => ($unread ? theme.colors.primarySoft : theme.colors.white)};
  font-size: 14px;
  &:hover { background: ${({ theme }) => theme.colors.light}; }
  small { display: block; color: ${({ theme }) => theme.colors.grayText}; margin-top: 2px; font-size: 12px; }
`

const NotifIcon = styled.span<{ $type?: number }>`
  flex: none;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: ${({ $type, theme }) => notificationColors($type, theme.colors).color};
  background: ${({ $type, theme }) => notificationColors($type, theme.colors).background};
`

const Empty = styled.p`
  padding: 24px 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.grayText};
  font-size: 14px;
`

const ProfileLink = styled(Link)`
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
`

const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max).trimEnd()}...` : text)

export function Header() {
  const { user, notifications, markNotificationsRead } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
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

  if (!user) {
    return (
      <Bar>
        <Inner>
          <Brand to="/" aria-label="My Foot — início">
            <LogoMark size={34} />
            <span>
              My <b>Foot</b>
            </span>
          </Brand>
          <Button $size="sm" onClick={() => navigate('/cadastro')}>
            Assinar Plataforma
          </Button>
        </Inner>
      </Bar>
    )
  }
  const unreadList = notifications.filter(n => !n.read)
  const unread = unreadList.length
  const isCreator = user.creatorStatus === 'verified'

  const toggle = () => {
    if (open) markNotificationsRead()
    setOpen(o => !o)
  }

  return (
    <Bar>
      <Inner>
        <Brand to="/" aria-label="My Foot — início">
          <LogoMark size={34} />
          <span>
            My <b>Foot</b>
          </span>
        </Brand>

        {isCreator && (
          <PostButton onClick={() => navigate('/postar')} aria-label="Postar conteúdo">
            <ImagePlus size={16} strokeWidth={2} />
            <span>Postar</span>
          </PostButton>
        )}

        <div ref={wrapRef} style={{ position: 'relative' }}>
          <IconButton onClick={toggle} aria-label={`Notificações${unread ? `, ${unread} não lidas` : ''}`} aria-expanded={open}>
            <Bell size={22} />
            {unread > 0 && <Dot aria-hidden="true">{unread > 9 ? '9+' : unread}</Dot>}
          </IconButton>
          {open && (
            <Popover>
              <h2>Notificações</h2>
              {unreadList.length === 0 ? (
                <Empty>Nenhuma notificação nova.</Empty>
              ) : (
                <ul>
                  {unreadList.slice(0, 5).map(n => (
                    <li key={n.id}>
                      <NotifItem
                        $unread={!n.read}
                        onClick={() => {
                          setOpen(false)
                          markNotificationsRead()
                          navigate('/conta/notificacoes')
                        }}
                      >
                        {n.icon && (
                          <NotifIcon $type={n.type} aria-hidden>
                            <DynamicIcon name={toIconName(n.icon) as IconName} size={18} fallback={() => <Bell size={18} />} />
                          </NotifIcon>
                        )}
                        <div>
                          {n.title ?? truncate(n.message, 50)}
                          <small>{relativeTime(n.date)}</small>
                        </div>
                      </NotifItem>
                    </li>
                  ))}
                </ul>
              )}
            </Popover>
          )}
        </div>

        <ProfileLink to="/conta" aria-label="Minha conta">
          <Avatar name={user.name} src={isCreator ? user.creator?.avatar : undefined} size={36} />
        </ProfileLink>
      </Inner>
    </Bar>
  )
}
