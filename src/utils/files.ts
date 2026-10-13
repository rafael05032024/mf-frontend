/**
 * Recorta/redimensiona uma região da imagem em um canvas. Reduz em etapas de no máximo 50%
 * com suavização alta — um único drawImage com redução grande serrilha e borra a imagem.
 */
export function drawScaled(src: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dw: number, dh: number): HTMLCanvasElement {
  let cur: CanvasImageSource = src
  let cx = sx, cy = sy, cw = sw, ch = sh
  while (cw / 2 > dw && ch / 2 > dh) {
    const step = document.createElement('canvas')
    step.width = Math.round(cw / 2)
    step.height = Math.round(ch / 2)
    const ctx = step.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(cur, cx, cy, cw, ch, 0, 0, step.width, step.height)
    cur = step
    cx = 0; cy = 0; cw = step.width; ch = step.height
  }
  const out = document.createElement('canvas')
  out.width = dw
  out.height = dh
  const ctx = out.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(cur, cx, cy, cw, ch, 0, 0, dw, dh)
  return out
}

/** Lê uma imagem e devolve um dataURL JPEG redimensionado (evita estourar o localStorage). */
export function readImage(file: File, maxSize = 1080, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = drawScaled(img, 0, 0, img.width, img.height, Math.round(img.width * scale), Math.round(img.height * scale))
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem'))
    }
    img.src = url
  })
}

/** Gera uma miniatura (primeiro quadro) e a duração de um vídeo. */
export function readVideoThumb(file: File, maxSize = 720): Promise<{ thumb: string; duration: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.src = url
    video.onloadeddata = () => {
      video.currentTime = Math.min(0.5, (video.duration || 1) / 2)
    }
    video.onseeked = () => {
      const scale = Math.min(1, maxSize / Math.max(video.videoWidth, video.videoHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(video.videoWidth * scale) || 720
      canvas.height = Math.round(video.videoHeight * scale) || 720
      canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height)
      const secs = Math.round(video.duration || 0)
      const duration = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
      URL.revokeObjectURL(url)
      resolve({ thumb: canvas.toDataURL('image/jpeg', 0.8), duration })
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler o vídeo'))
    }
  })
}
