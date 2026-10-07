import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { IconButton, Title } from './ui'

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px -8px;
  > div { flex: 1; min-width: 0; }
`

export function PageHeader({ title, back, action }: { title: string; back?: string; action?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <Wrap>
      <IconButton onClick={() => (back ? navigate(back) : navigate(-1))} aria-label="Voltar">
        <ArrowLeft size={22} />
      </IconButton>
      <div>
        <Title>{title}</Title>
      </div>
      {action}
    </Wrap>
  )
}
