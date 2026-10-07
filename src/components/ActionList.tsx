import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  li + li { border-top: 1px solid ${({ theme }) => theme.colors.light}; }
`

const itemStyles = `
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 64px;
  padding: 12px 16px;
  border: 0;
  background: transparent;
  text-align: left;
  transition: background-color .18s ease;
`

const ItemLink = styled(Link)`
  ${itemStyles}
  color: ${({ theme }) => theme.colors.black};
  &:hover { background: ${({ theme }) => theme.colors.light}; }
`

const ItemButton = styled.button`
  ${itemStyles}
  &:hover { background: ${({ theme }) => theme.colors.light}; }
`

const IconBox = styled.span<{ $tone?: 'primary' | 'danger' | 'neutral' }>`
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $tone = 'primary', theme }) =>
    $tone === 'danger' ? theme.colors.dangerSoft : $tone === 'neutral' ? theme.colors.light : theme.colors.primarySoft};
  color: ${({ $tone = 'primary', theme }) =>
    $tone === 'danger' ? theme.colors.danger : $tone === 'neutral' ? theme.colors.dark : theme.colors.primaryText};
`

const Text = styled.span`
  flex: 1;
  min-width: 0;
  strong { display: block; font-weight: 600; font-size: 15px; }
  small { display: block; font-size: 13px; color: ${({ theme }) => theme.colors.grayText}; }
`

interface ItemProps {
  icon: ReactNode
  title: string
  subtitle?: ReactNode
  to?: string
  onClick?: () => void
  tone?: 'primary' | 'danger' | 'neutral'
  trailing?: ReactNode
}

export function ActionItem({ icon, title, subtitle, to, onClick, tone, trailing }: ItemProps) {
  const content = (
    <>
      <IconBox $tone={tone} aria-hidden>{icon}</IconBox>
      <Text>
        <strong>{title}</strong>
        {subtitle && <small>{subtitle}</small>}
      </Text>
      {trailing ?? (to && <ChevronRight size={20} color="#8A8A8A" aria-hidden />)}
    </>
  )
  return <li>{to ? <ItemLink to={to}>{content}</ItemLink> : <ItemButton onClick={onClick}>{content}</ItemButton>}</li>
}
