import styled, { keyframes } from 'styled-components'

const spin = keyframes`to { transform: rotate(360deg) }`
const fade = keyframes`from { opacity: 0 } to { opacity: 1 }`

const Wrap = styled.div`
  display: grid;
  place-items: center;
  min-height: 60vh;
  animation: ${fade} 0.2s ease 0.15s both;
`

const Spinner = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: ${spin} 0.8s linear infinite;
`

export function PageLoader() {
  return (
    <Wrap role="status" aria-label="Carregando">
      <Spinner />
    </Wrap>
  )
}
