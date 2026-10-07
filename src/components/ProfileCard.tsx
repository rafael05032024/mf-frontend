import { Link } from 'react-router-dom'
import styled from 'styled-components'
import type { Profile } from '../types'
import { brlToFt, formatFt } from '../utils/format'
import { Avatar } from './Avatar'
import { VerifiedBadge } from './icons'

const CardLink = styled(Link)`
  display: block;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  color: inherit;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  &:hover { box-shadow: ${({ theme }) => theme.shadow.md}; border-color: transparent; transform: translateY(-2px); }
`

const Cover = styled.div`
  position: relative;
  aspect-ratio: 3 / 1;
  background: ${({ theme }) => theme.colors.primarySoft};
  img { width: 100%; height: 100%; object-fit: cover; }
`

const Body = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 0 16px 14px;
  > span:first-child { position: relative; margin-top: -28px; }
  > div { min-width: 0; flex: 1; padding-top: 8px; }
`

export const NameLine = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  font-size: 16px;
  min-width: 0;
  > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`

export const HandleText = styled.span`
  display: block;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.grayText};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Price = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primaryText};
  background: rgba(255, 255, 255, 0.94);
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radius.pill};
`

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <CardLink to={`/perfil/${profile.handle}`}>
      <Cover>
        <img src={profile.cover} alt="" loading="lazy" />
        <Price>{formatFt(brlToFt(profile.priceBRL))}/mês</Price>
      </Cover>
      <Body>
        <Avatar name={profile.name} src={profile.avatar} size={64} ring />
        <div>
          <NameLine>
            <span>{profile.name}</span>
            {profile.verified && <VerifiedBadge size={16} />}
          </NameLine>
          <HandleText>@{profile.handle}</HandleText>
        </div>
      </Body>
    </CardLink>
  )
}
