import { Check, X } from 'lucide-react'
import styled from 'styled-components'
import { PASSWORD_RULES } from '../utils/password'

const List = styled.ul`
  list-style: none;
  margin: -4px 0 0;
  padding: 0;
  display: grid;
  gap: 6px;
  font-size: 13px;
`

const Item = styled.li<{ $ok: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme, $ok }) => ($ok ? theme.colors.success : theme.colors.danger)};
  transition: color 0.18s ease;
`

export function PasswordChecklist({ value }: { value: string }) {
  return (
    <List aria-label="Critérios da senha">
      {PASSWORD_RULES.map(r => {
        const ok = r.test(value)
        return (
          <Item key={r.id} $ok={ok}>
            {ok ? <Check size={14} aria-hidden /> : <X size={14} aria-hidden />}
            <span>{r.label}<span className="sr-only">{ok ? ' — atendido' : ' — pendente'}</span></span>
          </Item>
        )
      })}
    </List>
  )
}
