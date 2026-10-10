import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ZoomIn, ZoomOut } from 'lucide-react'
import styled from 'styled-components'
import { Button } from './ui'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, .6);
`

const Card = styled.div`
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  h3 { margin: 0; font-size: 18px; }
  .zoom { display: flex; align-items: center; gap: 10px; width: 100%; }
  .zoom input { flex: 1; }
  .actions { display: flex; gap: 8px; width: 100%; justify-content: flex-end; }
`

const Stage = styled.div<{ $w: number; $h: number; $round: boolean }>`
  position: relative;
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
  overflow: hidden;
  background: #000;
  touch-action: none;
  cursor: grab;
  user-select: none;
  &:active { cursor: grabbing; }
  img { position: absolute; left: 0; top: 0; max-width: none; transform-origin: 0 0; pointer-events: none; }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: ${({ $round }) => ($round ? '50%' : '4px')};
    box-shadow: 0 0 0 999px rgba(0, 0, 0, .55);
    border: 2px solid #fff;
    pointer-events: none;
  }
`

interface Props {
  src: string
  outputSize?: number
  /** largura / altura do recorte (1 = círculo) */
  aspect?: number
  onCancel: () => void
  onConfirm: (dataUrl: string) => void
}

export function ImageCropper({ src, outputSize = 400, aspect = 1, onCancel, onConfirm }: Props) {
  const W = Math.min(aspect > 1 ? 480 : 400, window.innerWidth - 72)
  const H = W / aspect
  const imgRef = useRef<HTMLImageElement>(null)
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)

  const base = nat ? Math.max(W / nat.w, H / nat.h) : 1 // escala que cobre o quadro
  const scale = base * zoom

  const clamp = (p: { x: number; y: number }, s = scale) => {
    if (!nat) return p
    return {
      x: Math.min(0, Math.max(W - nat.w * s, p.x)),
      y: Math.min(0, Math.max(H - nat.h * s, p.y)),
    }
  }

  useEffect(() => {
    if (nat) setPos({ x: (W - nat.w * base) / 2, y: (H - nat.h * base) / 2 })
  }, [nat, base, W, H])

  const changeZoom = (z: number) => {
    if (!nat) return
    const next = base * z
    // mantém o centro do quadro fixo ao dar zoom
    const cx = (W / 2 - pos.x) / scale
    const cy = (H / 2 - pos.y) / scale
    setZoom(z)
    setPos(clamp({ x: W / 2 - cx * next, y: H / 2 - cy * next }, next))
  }

  const confirm = () => {
    const img = imgRef.current
    if (!img || !nat) return
    const canvas = document.createElement('canvas')
    canvas.width = outputSize
    canvas.height = Math.round(outputSize / aspect)
    const sx = -pos.x / scale
    const sy = -pos.y / scale
        canvas.getContext('2d')!.drawImage(img, sx, sy, W / scale, H / scale, 0, 0, canvas.width, canvas.height)
    onConfirm(canvas.toDataURL('image/jpeg', 0.85))
  }

  return createPortal(
    <Backdrop role="dialog" aria-modal="true" aria-label="Ajustar foto">
      <Card>
        <h3>Ajustar foto</h3>
        <Stage
          $w={W}
          $h={H}
          $round={aspect === 1}
          onPointerDown={e => {
            e.currentTarget.setPointerCapture(e.pointerId)
            drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }
          }}
          onPointerMove={e => {
            const d = drag.current
            if (d) setPos(clamp({ x: d.px + e.clientX - d.x, y: d.py + e.clientY - d.y }))
          }}
          onPointerUp={() => { drag.current = null }}
          onWheel={e => changeZoom(Math.min(4, Math.max(1, zoom - e.deltaY * 0.002)))}
        >
          <img
            ref={imgRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={e => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
          />
        </Stage>
        <div className="zoom">
          <ZoomOut size={18} aria-hidden />
          <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={e => changeZoom(Number(e.target.value))} aria-label="Zoom" />
          <ZoomIn size={18} aria-hidden />
        </div>
        <div className="actions">
          <Button type="button" $variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="button" onClick={confirm} disabled={!nat}>Aplicar</Button>
        </div>
      </Card>
    </Backdrop>,
    document.body,
  )
}
