import { BadgeCheck } from 'lucide-react'
import styled from 'styled-components'

type P = { size?: number }

export const InstagramIcon = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const TikTokIcon = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.4-2.47V9.67a5.73 5.73 0 0 0-.8-.06 5.7 5.7 0 0 0-5.7 5.7 5.7 5.7 0 0 0 5.7 5.69 5.7 5.7 0 0 0 5.7-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.26-1.48z" />
  </svg>
)

/** Marca do My Foot: pé estilizado. */
export const LogoMark = ({ size = 32 }: P) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <rect width="64" height="64" rx="16" fill="#00AFF0" />
    <path d="M24 50c-6 0-9-4-8-10 1-5 4-9 6-15 2-6 5-11 11-11 6 0 9 5 8 11-1 5-4 7-4 11 0 3 3 5 3 8 0 4-4 6-8 6z" fill="#fff" />
    <circle cx="44" cy="16" r="3" fill="#fff" />
    <circle cx="50" cy="22" r="2.5" fill="#fff" />
    <circle cx="52" cy="30" r="2.2" fill="#fff" />
    <circle cx="51" cy="37" r="2" fill="#fff" />
  </svg>
)

const Verified = styled(BadgeCheck)`
  color: ${({ theme }) => theme.colors.white};
  fill: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`

export const VerifiedBadge = ({ size = 18 }: P) => (
  <span title="Perfil verificado" style={{ display: 'inline-flex' }}>
    <Verified size={size} aria-hidden="true" />
    <span className="sr-only">Perfil verificado</span>
  </span>
)
