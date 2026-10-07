/** Lê uma imagem e devolve um dataURL JPEG redimensionado (evita estourar o localStorage). */
export function readImage(file: File, maxSize = 1080, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
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
