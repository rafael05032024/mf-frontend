import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Move, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'
import styled, { keyframes } from 'styled-components'
import { drawScaled } from '../utils/files'
import { Button, IconButton } from './ui'

const fade = keyframes`from { opacity: 0 } to { opacity: 1 }`
const rise = keyframes`from { transform: translateY(16px) scale(.98); opacity: 0 } to { transform: none; opacity: 1 }`

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  padding: 16px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.overlay};
  animation: ${fade} .2s ease;
`

const Card = styled.div`
  margin: auto;
  width: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadow.lg};
  animation: ${rise} .25s cubic-bezier(.2, .8, .2, 1);
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  .titles { flex: 1; min-width: 0; }
  h3 { margin: 0; font-family: ${({ theme }) => theme.fontDisplay}; font-size: 19px; font-weight: 700; color: ${({ theme }) => theme.colors.dark}; }
  p { margin: 4px 0 0; font-size: 13px; color: ${({ theme }) => theme.colors.grayText}; }
  button { margin: -8px -8px 0 0; }
`

const Stage = styled.div<{ $w: number; $h: number; $round: boolean }>`
  position: relative;
  align-self: center;
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.dark};
  touch-action: none;
  cursor: grab;
  user-select: none;
  &:active { cursor: grabbing; }
  img { position: absolute; left: 0; top: 0; max-width: none; transform-origin: 0 0; pointer-events: none; }
  /* máscara fora da área de recorte + borda */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: ${({ $round, theme }) => ($round ? '50%' : theme.radius.md)};
    box-shadow: 0 0 0 999px rgba(0, 0, 0, .5), inset 0 0 0 2px rgba(255, 255, 255, .9);
    pointer-events: none;
  }
  /* guias de terço, visíveis só ao arrastar */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    opacity: 0;
    transition: opacity .2s ease;
    pointer-events: none;
    background:
      linear-gradient(to right, transparent calc(33.33% - .5px), rgba(255,255,255,.45) calc(33.33% - .5px), rgba(255,255,255,.45) calc(33.33% + .5px), transparent calc(33.33% + .5px),
        transparent calc(66.66% - .5px), rgba(255,255,255,.45) calc(66.66% - .5px), rgba(255,255,255,.45) calc(66.66% + .5px), transparent calc(66.66% + .5px)),
      linear-gradient(to bottom, transparent calc(33.33% - .5px), rgba(255,255,255,.45) calc(33.33% - .5px), rgba(255,255,255,.45) calc(33.33% + .5px), transparent calc(33.33% + .5px),
        transparent calc(66.66% - .5px), rgba(255,255,255,.45) calc(66.66% - .5px), rgba(255,255,255,.45) calc(66.66% + .5px), transparent calc(66.66% + .5px));
  }
  &:active::before { opacity: 1; }
  .drag-hint {
    position: absolute;
    left: 50%;
    bottom: 10px;
    z-index: 2;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: rgba(0, 0, 0, .55);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    pointer-events: none;
    transition: opacity .2s ease;
  }
  &:active .drag-hint { opacity: 0; }
`

const Zoom = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.light};
  button { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
  button:disabled { opacity: .4; cursor: default; }
  input {
    flex: 1;
    min-width: 0;
    appearance: none;
    height: 24px;
    background: transparent;
    cursor: pointer;
  }
  input::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: linear-gradient(to right, ${({ theme }) => theme.colors.primary} var(--pct), ${({ theme }) => theme.colors.border} var(--pct));
  }
  input::-moz-range-track { height: 4px; border-radius: ${({ theme }) => theme.radius.pill}; background: ${({ theme }) => theme.colors.border}; }
  input::-moz-range-progress { height: 4px; border-radius: ${({ theme }) => theme.radius.pill}; background: ${({ theme }) => theme.colors.primary}; }
  input::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    margin-top: -7px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.white};
    border: 3px solid ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadow.sm};
  }
  input::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.white};
    border: 3px solid ${({ theme }) => theme.colors.primary};
  }
  .pct { width: 42px; text-align: right; font-size: 12px; font-weight: 700; color: ${({ theme }) => theme.colors.grayText}; font-variant-numeric: tabular-nums; }
  @media (max-width: 400px) { .pct { display: none; } }
`

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`

interface Props {
  src: string
  outputSize?: number
  /** largura / altura do recorte (1 = círculo) */
  aspect?: number
  onCancel: () => void
  onConfirm: (dataUrl: string) => void
}

/** Altura ocupada por tudo que não é a área de recorte (cabeçalho, zoom, botões, paddings). */
const CHROME_H = 290

/** Largura da área de recorte que cabe na viewport, descontando o zoom global da página (--ui-zoom). */
function stageWidth(aspect: number) {
  const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-zoom')) || 1
  const vw = window.innerWidth / zoom
  const vh = window.innerHeight / zoom
  return Math.max(160, Math.floor(Math.min(aspect > 1 ? 960 : 560, vw - 72, (vh - CHROME_H) * aspect)))
}

export function ImageCropper({ src, outputSize = 400, aspect = 1, onCancel, onConfirm }: Props) {
  const W = stageWidth(aspect)
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
    const sx = -pos.x / scale
    const sy = -pos.y / scale
    const sw = W / scale
    const sh = H / scale
    // nunca amplia além da resolução real do recorte (ampliar só borra e pesa)
    const outW = Math.round(Math.min(outputSize, sw))
    const canvas = drawScaled(img, sx, sy, sw, sh, outW, Math.round(outW / aspect))
    onConfirm(canvas.toDataURL('image/jpeg', 0.92))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const reset = () => {
    if (!nat) return
    setZoom(1)
    setPos({ x: (W - nat.w * base) / 2, y: (H - nat.h * base) / 2 })
  }

  const round = aspect === 1

  return createPortal(
    <Backdrop role="dialog" aria-modal="true" aria-labelledby="cropper-title" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <Card style={{ width: W + 40 }}>
        <Header>
          <div className="titles">
            <h3 id="cropper-title">Ajustar foto</h3>
            {!round && <p>Escolha a área que aparecerá no seu perfil.</p>}
          </div>
          <IconButton type="button" onClick={onCancel} aria-label="Fechar"><X size={20} /></IconButton>
        </Header>
        <Stage
          $w={W}
          $h={H}
          $round={round}
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
          {nat && <span className="drag-hint" aria-hidden><Move size={14} /> Arraste para posicionar</span>}
        </Stage>
        <Zoom>
          <IconButton type="button" onClick={() => changeZoom(Math.max(1, zoom - 0.25))} disabled={zoom <= 1} aria-label="Diminuir zoom"><ZoomOut size={18} /></IconButton>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={e => changeZoom(Number(e.target.value))}
            aria-label="Zoom"
            style={{ '--pct': `${((zoom - 1) / 3) * 100}%` } as CSSProperties}
          />
          <IconButton type="button" onClick={() => changeZoom(Math.min(4, zoom + 0.25))} disabled={zoom >= 4} aria-label="Aumentar zoom"><ZoomIn size={18} /></IconButton>
          <span className="pct" aria-hidden>{Math.round(zoom * 100)}%</span>
          <IconButton type="button" onClick={reset} disabled={!nat} aria-label="Restaurar enquadramento" title="Restaurar"><RotateCcw size={16} /></IconButton>
        </Zoom>
        <Actions>
          <Button type="button" $variant="ghost" $block onClick={onCancel}>Cancelar</Button>
          <Button type="button" $block onClick={confirm} disabled={!nat}>Aplicar</Button>
        </Actions>
      </Card>
    </Backdrop>,
    document.body,
  )
}
