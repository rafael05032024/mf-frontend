import { useEffect, useState, type PointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react'
import styled from 'styled-components'
import type { Media } from '../types'
import { IconButton } from './ui'

// altura limitada ao painel do modal: a mídia encolhe para a legenda caber, sem rolagem
const Figure = styled.figure`
  display: flex;
  flex-direction: column;
  max-height: calc(96dvh / var(--ui-zoom, 1));
  margin: 0;
  figcaption { flex: none; padding: 14px 20px 20px; font-size: 15px; background: ${({ theme }) => theme.colors.white}; }
  p { margin: 6px 0 0; color: ${({ theme }) => theme.colors.grayText}; line-height: 1.5; white-space: pre-line; }
`

const Stage = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 0 1 auto;
  min-height: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.black};
  img:not([aria-hidden]), video {
    position: relative;
    display: block;
    width: 100%;
    flex: 0 1 auto;
    min-height: 0;
    object-fit: contain;
  }
`

// a própria foto desfocada ocupa todo o modal no lugar do preto
const Backdrop = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(12px) brightness(0.7);
  transform: scale(1.15);
  pointer-events: none;
`

const Full = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  padding: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
`

const FullStage = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.black};
  img:not([aria-hidden]), video {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  img {
    cursor: zoom-in;
    touch-action: none;
    transition: transform 0.2s ease;
    &[data-zoomed='true'] { cursor: zoom-out; transition: none; }
  }
`

const Expand = styled(IconButton)`
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 2;
  width: 40px;
  height: 40px;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  &:hover { background: rgba(0, 0, 0, 0.75); }
`

const FullToggle = styled(Expand)`
  top: 10px;
  right: 10px;
  bottom: auto;
`

const ZoomToggle = styled(FullToggle)`
  right: 58px;
`

const ZOOM = 2.5

interface Props {
  media: Media
  footer?: ReactNode
}

export function MediaViewer({ media, footer }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')

  const close = () => {
    setExpanded(false)
    setZoomed(false)
  }

  // a lupa acompanha o ponteiro (mouse ou dedo): o ponto sob o cursor fica sob o cursor
  const follow = (e: PointerEvent<HTMLImageElement>) => {
    // o retângulo do palco (e não o da imagem), que muda de tamanho com o scale
    const r = e.currentTarget.parentElement!.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100))
    setOrigin(`${x}% ${y}%`)
  }


  useEffect(() => {
    if (!expanded) return
    // capture + stop: o Escape só sai da tela cheia, sem fechar o modal por baixo
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      close()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [expanded])

  const isVideo = media.type === 'video' && media.url.includes('/api/')

  const renderMedia = (full = false) =>
    isVideo ? (
      <video src={media.url} controls autoPlay playsInline />
    ) : full ? (
      <img
        src={media.url}
        alt={media.caption}
        data-zoomed={zoomed}
        draggable={false}
        style={{ transformOrigin: origin, transform: zoomed ? `scale(${ZOOM})` : 'none' }}
        onPointerMove={follow}
        onClick={() => setZoomed(z => !z)}
      />
    ) : (
      <img src={media.url} alt={media.caption} />
    )

  return (
    <Figure>
      <Stage>
        {!expanded && !isVideo && <Backdrop src={media.url} alt="" aria-hidden />}
        {!expanded && renderMedia()}
        {!expanded && (
          <Expand onClick={() => setExpanded(true)} aria-label="Expandir para tela cheia">
            <Maximize2 size={20} />
          </Expand>
        )}
      </Stage>
      {expanded &&
        createPortal(
          <Full role="dialog" aria-modal="true" aria-label="Mídia em tela cheia">
            <FullStage>
              {!isVideo && <Backdrop src={media.url} alt="" aria-hidden />}
              {renderMedia(true)}
              {!isVideo && (
                <ZoomToggle onClick={() => setZoomed(z => !z)} aria-label={zoomed ? 'Afastar' : 'Aproximar'} aria-pressed={zoomed}>
                  {zoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                </ZoomToggle>
              )}
              <FullToggle onClick={close} aria-label="Sair da tela cheia" autoFocus>
                <Minimize2 size={20} />
              </FullToggle>
            </FullStage>
          </Full>,
          document.body,
        )}
      <figcaption>
        {media.caption && <p>{media.caption}</p>}
        {footer}
      </figcaption>
    </Figure>
  )
}
