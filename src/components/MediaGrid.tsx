import { Lock, Play } from 'lucide-react'
import styled from 'styled-components'
import { mq } from '../styles/theme'
import type { Media } from '../types'

const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  /* mobile: 2 colunas (tiles de ~160px); telas maiores cabem mais por linha */
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  ${mq.sm} { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  ${mq.md} { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
`

const Tile = styled.button<{ $locked: boolean }>`
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.radius.sm};
  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    ${({ $locked }) => $locked && 'filter: blur(14px) brightness(.85); transform: scale(1.15);'}
  }
  &:hover img, &:hover video { ${({ $locked }) => !$locked && 'transform: scale(1.05);'} }
`

const Overlay = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.white};
  font-size: 12px;
  font-weight: 700;
  text-shadow: 0 1px 4px rgba(0,0,0,.4);
  svg { filter: drop-shadow(0 1px 3px rgba(0,0,0,.4)); }
  small { font-size: 12px; }
`

const Badge = styled.span`
  position: absolute;
  right: 6px;
  bottom: 6px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 7px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: ${({ theme }) => theme.colors.white};
  font-size: 12px;
  font-weight: 600;
`

const PlayButton = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 44px;
  height: 44px;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: ${({ theme }) => theme.colors.white};
  svg { margin-left: 2px; }
`

interface Props {
  media: Media[]
  isLocked: (m: Media) => boolean
  onOpen: (m: Media) => void
}

export function MediaGrid({ media, isLocked, onOpen }: Props) {
  return (
    <Grid>
      {media.map(m => {
        const locked = isLocked(m)
        const kind = m.type === 'video' ? 'Vídeo' : 'Foto'
        return (
          <li key={m.id}>
            <Tile $locked={locked} onClick={() => onOpen(m)} aria-label={locked ? `${kind} exclusivo para assinantes` : `Abrir ${kind.toLowerCase()}${m.caption ? `: ${m.caption}` : ''}`}>
              {m.type === 'video' && m.url.includes('/api/') ? (
                <video src={`${m.url}#t=0.1`} preload="metadata" muted playsInline />
              ) : (
                <img src={m.url} alt="" loading="lazy" />
              )}
              {locked && (
                <Overlay>
                  <Lock size={26} aria-hidden />
                  <small>Assinantes</small>
                </Overlay>
              )}
              {m.type === 'video' && !locked && (
                <PlayButton aria-hidden>
                  <Play size={20} fill="currentColor" strokeWidth={0} />
                </PlayButton>
              )}
              {m.type === 'video' && m.duration && <Badge aria-hidden>{m.duration}</Badge>}
            </Tile>
          </li>
        )
      })}
    </Grid>
  )
}
