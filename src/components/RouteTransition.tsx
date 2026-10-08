import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'

const enter = keyframes`from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none }`
const bar = keyframes`
  0% { transform: scaleX(0); opacity: 1 }
  70% { transform: scaleX(0.85); opacity: 1 }
  100% { transform: scaleX(1); opacity: 0 }
`

const Page = styled.div`
  animation: ${enter} 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`

const Progress = styled.div`
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: ${({ theme }) => theme.colors.primary};
  transform-origin: left;
  pointer-events: none;
  animation: ${bar} 0.7s ease-out forwards;
  @media (prefers-reduced-motion: reduce) { display: none; }
`

// reinicia fade-in e barra de progresso a cada mudança de rota
export function RouteTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <>
      <Progress key={`bar-${pathname}`} aria-hidden />
      <Page key={pathname}>{children}</Page>
    </>
  )
}
