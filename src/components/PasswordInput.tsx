import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import styled from 'styled-components'
import { IconButton, Input } from './ui'

const Wrap = styled.div`
  position: relative;
  input { padding-right: 52px; }
  button { position: absolute; right: 2px; top: 2px; }
`

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false)
  return (
    <Wrap>
      <Input {...props} type={show ? 'text' : 'password'} />
      <IconButton type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </IconButton>
    </Wrap>
  )
}
