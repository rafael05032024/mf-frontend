import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import styled from 'styled-components'
import { IconButton, Input } from './ui'

const Wrap = styled.div`
  position: relative;
  .ig-icon-left {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.gray};
    display: flex;
    pointer-events: none;
    transition: color 0.18s ease;
  }
  &:focus-within > .ig-icon-left { color: ${({ theme }) => theme.colors.primary}; }
  input { padding-left: 44px; padding-right: 52px; }
  > button { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); }
`

function PasswordInputInner(props: InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false)
  return (
    <Wrap>
      <span className="ig-icon-left" aria-hidden><Lock size={18} /></span>
      <Input {...props} type={show ? 'text' : 'password'} />
      <IconButton type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </IconButton>
    </Wrap>
  )
}

PasswordInputInner.displayName = 'PasswordInput'

export const PasswordInput = PasswordInputInner
