import type { CompressRequest, CompressResponse, Stage, UnsupportedReason } from '../workers/videoCompress.worker'

/** Acima disso o vídeo é recomprimido antes do upload. */
export const VIDEO_COMPRESS_THRESHOLD = 50 * 1024 * 1024

/** Lado menor do quadro na saída: 1080 mantém "1080p" tanto em retrato quanto em paisagem. */
export const VIDEO_MAX_SHORT_SIDE = 1080

/** Falha de recompressão. Vídeos acima do limite não devem ser enviados sem passar por aqui. */
export class VideoCompressError extends Error {
  reason: UnsupportedReason | 'failed'
  /** Ponto do pipeline em que falhou, quando houve falha técnica. */
  stage?: Stage

  constructor(reason: UnsupportedReason | 'failed', message?: string, stage?: Stage) {
    super(message ?? reason)
    this.name = 'VideoCompressError'
    this.reason = reason
    this.stage = stage
  }
}

const MESSAGES: Record<UnsupportedReason | 'failed', string> = {
  unreadable: 'Não foi possível ler este vídeo. Envie um arquivo MP4 ou MOV.',
  'no-video': 'Este arquivo não contém vídeo.',
  undecodable:
    'Seu navegador não consegue processar o formato deste vídeo (comum com vídeos de iPhone no Firefox). Tente pelo Chrome, Edge ou Safari, ou envie um vídeo menor que 50 MB.',
  unencodable:
    'Seu navegador não suporta a compressão de vídeo necessária. Tente pelo Chrome, Edge ou Safari, ou envie um vídeo menor que 50 MB.',
  'invalid-conversion': 'Não foi possível comprimir este vídeo. Tente outro arquivo.',
  failed: 'Não foi possível comprimir este vídeo. Tente novamente.',
}

const STAGES: Record<Stage, string> = {
  open: 'ao abrir o arquivo',
  probe: 'ao ler as dimensões',
  init: 'ao preparar a conversão',
  encode: 'durante a compressão',
  finalize: 'ao finalizar o arquivo',
}

/** Mensagem pronta para o usuário a partir do erro lançado por `compressVideo`. */
export const videoCompressMessage = (error: unknown) => {
  if (!(error instanceof VideoCompressError)) return MESSAGES.failed
  if (error.reason !== 'failed') return MESSAGES[error.reason]
  const where = error.stage ? ` ${STAGES[error.stage]}` : ''
  return `Não foi possível comprimir este vídeo${where}: ${error.message}`
}

interface Options {
  /** Progresso de 0 a 1. */
  onProgress?: (progress: number) => void
  signal?: AbortSignal
}

/**
 * Recomprime um vídeo em um worker com WebCodecs e devolve o MP4 resultante.
 *
 * Lança `VideoCompressError` quando o navegador não dá conta do arquivo (sem suporte a decode do
 * codec de entrada, sem encode H.264 etc.) — nesse caso o upload deve ser barrado, não tentado com
 * o arquivo original. Em cancelamento via `signal`, lança `AbortError`.
 */
export function compressVideo(file: File, { onProgress, signal }: Options = {}): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Compressão cancelada', 'AbortError'))

    // navegador sem WebCodecs (ou sem worker de módulo) falharia só ao carregar o worker, com
    // erro vazio: melhor dar a mensagem de "sem suporte" aqui
    if (typeof Worker === 'undefined' || typeof VideoEncoder === 'undefined' || typeof VideoDecoder === 'undefined')
      return reject(new VideoCompressError('unencodable'))

    const worker = new Worker(new URL('../workers/videoCompress.worker.ts', import.meta.url), { type: 'module' })

    const finish = (settle: () => void) => {
      signal?.removeEventListener('abort', onAbort)
      worker.terminate()
      settle()
    }
    const onAbort = () => {
      worker.postMessage({ type: 'cancel' } satisfies CompressRequest)
      finish(() => reject(new DOMException('Compressão cancelada', 'AbortError')))
    }

    worker.onmessage = (event: MessageEvent<CompressResponse>) => {
      const message = event.data
      switch (message.type) {
        case 'progress':
          return onProgress?.(message.progress)
        case 'done':
          return finish(() => resolve(toMp4File(message.blob, file)))
        case 'unsupported':
          return finish(() => reject(new VideoCompressError(message.reason)))
        case 'canceled':
          return finish(() => reject(new DOMException('Compressão cancelada', 'AbortError')))
        case 'error':
          // sem isso o erro real da mediabunny/WebCodecs se perde e só resta a mensagem genérica
          console.error('[compressVideo] falhou em', message.stage, '\n', message.message, '\n', message.detail ?? '')
          return finish(() => reject(new VideoCompressError('failed', message.message, message.stage)))
      }
    }
    worker.onerror = event => {
      console.error('[compressVideo] erro no worker:', event.message || event)
      finish(() => reject(new VideoCompressError('failed', event.message || 'Falha ao carregar o worker de compressão')))
    }

    signal?.addEventListener('abort', onAbort)
    worker.postMessage({ type: 'start', file, maxShortSide: VIDEO_MAX_SHORT_SIDE } satisfies CompressRequest)
  })
}

function toMp4File(blob: Blob, original: File): File {
  const name = original.name.replace(/\.[^.]+$/, '') || 'video'
  return new File([blob], `${name}.mp4`, { type: 'video/mp4', lastModified: Date.now() })
}
