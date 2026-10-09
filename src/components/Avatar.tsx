import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { initials } from '../utils/format'

const Wrap = styled.span<{ $size: number; $ring?: boolean }>`
  flex-shrink: 0;
  display: inline-grid;
  place-items: center;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 800;
  font-size: ${({ $size }) => Math.round($size * 0.38)}px;
  letter-spacing: 0.02em;
  box-shadow: ${({ $ring, theme }) => ($ring ? `0 0 0 4px ${theme.colors.white}` : 'none')};
  img { width: 100%; height: 100%; object-fit: cover; }
`

interface Props {
  name: string
  src?: string
  size?: number
  ring?: boolean
  className?: string
}

export function Avatar({ name, src, size = 40, ring, className }: Props) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])
  const showImg = !!src && !failed
  return (
    <Wrap $size={size} $ring={ring} className={className} aria-hidden={!showImg}>
      {showImg ? <img src={src} alt={`Foto de ${name}`} loading="lazy" onError={() => setFailed(true)} /> : initials(name)}
    </Wrap>
  )
}
