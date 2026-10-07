import type { ReactNode } from 'react'
import { Coins, Lock, ShieldCheck } from 'lucide-react'
import styled from 'styled-components'
import { LogoMark } from '../components/icons'
import { mq } from '../styles/theme'

const Page = styled.div`
  min-height: 100dvh;
  display: grid;
  background: ${({ theme }) => theme.colors.white};
  ${mq.md} { grid-template-columns: 1fr 1fr; }
`

const Hero = styled.aside`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: 28px 24px 36px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  ${mq.md} { padding: 56px; justify-content: center; gap: 24px; }
  h1 { font-size: 30px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; ${mq.md} { font-size: 44px; } }
  p { font-size: 16px; opacity: 0.95; max-width: 440px; }
  ul { display: none; list-style: none; margin: 8px 0 0; padding: 0; ${mq.md} { display: grid; gap: 14px; } }
  li { display: flex; gap: 12px; align-items: center; font-weight: 600; }
  li svg { flex-shrink: 0; }
`

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  svg rect { fill: #fff; }
  svg path, svg circle { fill: #00AFF0; }
`

const Main = styled.main`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 28px 20px 48px;
  ${mq.md} { align-items: center; padding: 48px; }
  > div { width: 100%; max-width: 400px; }
`

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <Page>
      <Hero>
        <Brand>
          <LogoMark size={36} />
          My Foot
        </Brand>
        <h1>Seu conteúdo, seu preço, sua comunidade.</h1>
        <p>O marketplace feito para criadores de conteúdo de pés monetizarem com mais facilidade e segurança.</p>
        <ul>
          <li><Coins size={22} /> Pagamentos em FootCoin: R$ 1,00 = 30 ft</li>
          <li><ShieldCheck size={22} /> Criadores verificados por documento</li>
          <li><Lock size={22} /> Conteúdo exclusivo para assinantes</li>
        </ul>
      </Hero>
      <Main>
        <div>{children}</div>
      </Main>
    </Page>
  )
}
