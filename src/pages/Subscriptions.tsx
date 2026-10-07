import { ChevronRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { List } from '../components/ActionList'
import { Avatar } from '../components/Avatar'
import { PageHeader } from '../components/PageHeader'
import { Button, Muted, NarrowContainer } from '../components/ui'
import { useAuthedUser } from '../store/AppContext'
import { formatDate } from '../utils/format'

const Item = styled(Link)`
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 72px;
  padding: 12px 16px;
  color: ${({ theme }) => theme.colors.black};
  transition: background-color .18s ease;
  &:hover { background: ${({ theme }) => theme.colors.light}; }
  > div { flex: 1; min-width: 0; }
  strong { display: block; font-weight: 700; overflow: hidden; text-overflow: ellipsis; }
`

const Status = styled.small<{ $active: boolean }>`
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $active, theme }) => ($active ? theme.colors.success : theme.colors.danger)};
`

const Empty = styled.div`
  text-align: center;
  padding: 48px 16px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  strong { display: block; margin-bottom: 4px; }
  button { margin-top: 16px; }
`

export default function Subscriptions() {
  const user = useAuthedUser()
  const subs = [...user.subscriptions].sort((a, b) => b.expiresAt.localeCompare(a.expiresAt))

  return (
    <NarrowContainer>
      <PageHeader title="Minhas assinaturas" back="/conta" />
      {subs.length === 0 ? (
        <Empty>
          <strong>Você ainda não assina nenhum perfil</strong>
          <Muted>Encontre criadores e tenha acesso a conteúdos exclusivos.</Muted>
          <Button as={Link} to="/"><Search size={18} /> Explorar perfis</Button>
        </Empty>
      ) : (
        <List>
          {subs.map(s => {
            const active = new Date(s.expiresAt) > new Date()
            return (
              <li key={s.profileId}>
                <Item to={`/perfil/${s.handle}`}>
                  <Avatar name={s.handle} src={s.avatar} size={52} />
                  <div>
                    <strong>@{s.handle}</strong>
                    <Status $active={active}>
                      {active ? 'Expira em' : 'Expirou em'} {formatDate(s.expiresAt)}
                    </Status>
                  </div>
                  <ChevronRight size={20} color="#8A8A8A" aria-hidden />
                </Item>
              </li>
            )
          })}
        </List>
      )}
    </NarrowContainer>
  )
}
