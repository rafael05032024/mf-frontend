import type { ReactNode } from 'react'
import { ChevronRight, Info } from 'lucide-react'
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

const ItemStatic = styled.div`
  ${itemStyles}
  color: ${({ theme }) => theme.colors.black};
  cursor: default;
`

const Dimmed = styled.span`
  display: contents;
  & > ${ItemStatic} > span:not([data-hint]) { opacity: .55; }
`

const Hint = styled.span`
  position: relative;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.grayText};
  cursor: help;
  &::after {
    content: attr(data-hint);
    position: absolute;
    right: 0;
    bottom: calc(100% + 6px);
    padding: 4px 8px;
    border-radius: 6px;
    background: ${({ theme }) => theme.colors.black};
    color: ${({ theme }) => theme.colors.white};
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity .15s ease;
  }
  &:hover::after, &:focus-visible::after { opacity: 1; }
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
  readOnly?: boolean
  readOnlyHint?: string
}

export function ActionItem({ icon, title, subtitle, to, onClick, tone, trailing, readOnly, readOnlyHint = 'Em Breve' }: ItemProps) {
  if (readOnly) {
    return (
      <li>
        <Dimmed>
          <ItemStatic aria-disabled="true">
            <IconBox $tone={tone} aria-hidden>{icon}</IconBox>
            <Text>
              <strong>{title}</strong>
              {subtitle && <small>{subtitle}</small>}
            </Text>
            <Hint data-hint={readOnlyHint} tabIndex={0} role="img" aria-label={readOnlyHint}>
              <Info size={20} />
            </Hint>
          </ItemStatic>
        </Dimmed>
      </li>
    )
  }
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
