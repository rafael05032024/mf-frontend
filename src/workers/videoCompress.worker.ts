/**
 * Recomprime vídeos grandes no próprio navegador, via WebCodecs.
 *
 * O pipeline (demux → decode → encode → mux) fica com a mediabunny, que usa VideoDecoder/VideoEncoder
 * com aceleração de hardware quando disponível. O áudio não é re-encodado: a mediabunny copia os
 * pacotes originais para o MP4 de saída, o que evita problemas de sincronia e economiza tempo.
 *
 * Roda em worker porque o encode satura a thread e congelaria a interface.
 */
import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  canEncodeVideo,
  Conversion,
  ConversionCanceledError,
  Input,
  Mp4OutputFormat,
  Output,
  Quality,
} from 'mediabunny'

/** Motivos para não conseguir recomprimir: todos impedem o envio do arquivo original. */
export type UnsupportedReason =
  /** Container não reconhecido pela mediabunny. */
  | 'unreadable'
  /** Arquivo sem faixa de vídeo. */
  | 'no-video'
  /** Sem suporte de decode no navegador — caso típico do HEVC (iPhone) no Firefox. */
  | 'undecodable'
  /** Sem suporte de encode H.264 no navegador. */
  | 'unencodable'
  /** As faixas restantes não formam um MP4 válido. */
  | 'invalid-conversion'

/** Em que ponto do pipeline a falha aconteceu — o que mais ajuda a diagnosticar. */
export type Stage = 'open' | 'probe' | 'init' | 'encode' | 'finalize'

export type CompressRequest =
  | { type: 'start'; file: File; maxShortSide: number }
  | { type: 'cancel' }

export type CompressResponse =
  | { type: 'progress'; progress: number }
  | { type: 'done'; blob: Blob; width: number; height: number }
  | { type: 'unsupported'; reason: UnsupportedReason }
  | { type: 'canceled' }
  | { type: 'error'; message: string; stage: Stage; detail?: string }

// o escopo do worker é tipado à mão: o projeto compila com a lib DOM, não com a WebWorker
const ctx = self as unknown as {
  postMessage: (message: CompressResponse) => void
  onmessage: ((event: MessageEvent<CompressRequest>) => void) | null
}

const send = (message: CompressResponse) => ctx.postMessage(message)

/** H.264 exige dimensões pares; é o mesmo arredondamento que a mediabunny aplica internamente. */
const ceil2 = (n: number) => Math.max(2, Math.ceil(n / 2) * 2)

/**
 * Bitrate alvo pelo lado menor do quadro. 1080p a 3,5 Mbps é visualmente equivalente ao original
 * de celular (que costuma passar de 15 Mbps) no tamanho em que o feed exibe.
 */
const bitrateFor = (shortSide: number) =>
  shortSide >= 1080 ? 3_500_000 : shortSide >= 720 ? 2_000_000 : 1_200_000

let current: Conversion | null = null
let stage: Stage = 'open'

async function compress(file: File, maxShortSide: number, useStreamReader: boolean) {
  stage = 'open'
  // useStreamReader: false é o modo de leitura lento mas estável, usado na segunda tentativa
  const input = new Input({ source: new BlobSource(file, { useStreamReader }), formats: ALL_FORMATS })

  if (!(await input.canRead())) return send({ type: 'unsupported', reason: 'unreadable' })

  const track = await input.getPrimaryVideoTrack()
  if (!track) return send({ type: 'unsupported', reason: 'no-video' })
  if (!(await track.canDecode())) return send({ type: 'unsupported', reason: 'undecodable' })

  stage = 'probe'
  // mesma base que a Conversion usa para calcular o tamanho de saída: pixels quadrados já
  // orientados pela rotação do arquivo (vídeo de celular costuma vir girado por metadado)
  const rotation = await track.getRotation()
  const squareWidth = await track.getSquarePixelWidth()
  const squareHeight = await track.getSquarePixelHeight()
  const [srcWidth, srcHeight] = rotation % 180 === 0 ? [squareWidth, squareHeight] : [squareHeight, squareWidth]

  // limita o lado menor: em vídeo de celular (retrato) limitar a altura destruiria a resolução
  const shortSide = Math.max(1, Math.min(srcWidth, srcHeight))
  const portrait = srcWidth < srcHeight
  const aspectRatio = srcWidth / srcHeight

  // passamos só a dimensão do lado menor: a mediabunny deduz a outra preservando o aspecto e
  // arredonda as duas para múltiplos de 2. Passar largura e altura juntas exigiria também um
  // `fit` e abriria espaço para letterbox/corte por arredondamento.
  // acima do limite, o lado menor vira exatamente maxShortSide; abaixo, não há redimensionamento
  const target = shortSide > maxShortSide ? maxShortSide : undefined
  const size: { width?: number; height?: number } =
    target === undefined ? {} : portrait ? { width: target } : { height: target }

  // dimensões finais previstas, replicando o cálculo da Conversion, para a sonda de suporte
  // conferir exatamente a config que o encoder vai receber
  const width = size.width !== undefined ? ceil2(size.width)
    : size.height !== undefined ? ceil2(Math.round(ceil2(size.height) * aspectRatio))
      : ceil2(srcWidth)
  const height = size.height !== undefined ? ceil2(size.height)
    : size.width !== undefined ? ceil2(Math.round(ceil2(size.width) / aspectRatio))
      : ceil2(srcHeight)
  const bitrate = bitrateFor(Math.min(width, height))

  // a sonda usa exatamente a config do encode abaixo; divergir aqui faria a conversão falhar
  // depois de o usuário já ter esperado. Sem hint de hardware: a mediabunny/navegador escolhem
  // aceleração por hardware quando faz sentido, e 'prefer-hardware' pode reprovar configs que
  // funcionariam em software.
  if (!(await canEncodeVideo('avc', { width, height, quality: new Quality({ bitrate }) })))
    return send({ type: 'unsupported', reason: 'unencodable' })

  stage = 'init'
  const output = new Output({
    // fast start: o moov vai para o início do arquivo, então o vídeo começa a tocar sem baixar tudo
    format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
    target: new BufferTarget(),
  })

  const conversion = await Conversion.init({
    input,
    output,
    tracks: 'primary',
    video: {
      codec: 'avc',
      ...size,
      quality: new Quality({ bitrate }),
    },
    // sem opções de áudio a mediabunny copia os pacotes originais em vez de re-encodar
    audio: {},
    showWarnings: false,
  })
  current = conversion

  if (!conversion.isValid) return send({ type: 'unsupported', reason: 'invalid-conversion' })

  conversion.onProgress = progress => send({ type: 'progress', progress })
  stage = 'encode'
  await conversion.execute()

  stage = 'finalize'
  const buffer = output.target.buffer
  if (!buffer) throw new Error('Saída vazia')

  send({ type: 'done', blob: new Blob([buffer], { type: 'video/mp4' }), width, height })
}

const describe = (error: unknown) => {
  if (!(error instanceof Error)) return { message: String(error) }
  const cause = error.cause instanceof Error ? ` ← ${error.cause.name}: ${error.cause.message}` : ''
  return {
    message: `${error.name}: ${error.message}${cause}`,
    detail: error.stack?.split('\n').slice(0, 4).join('\n'),
  }
}

ctx.onmessage = event => {
  const message = event.data
  if (message.type === 'cancel') {
    void current?.cancel()
    return
  }
  const run = async () => {
    try {
      await compress(message.file, message.maxShortSide, true)
    } catch (error) {
      if (error instanceof ConversionCanceledError) throw error
      // a doc da mediabunny registra bugs de navegador no ReadableStream do Blob: a segunda
      // tentativa troca para o modo de leitura estável antes de desistir
      if (stage === 'open' || stage === 'probe') {
        await compress(message.file, message.maxShortSide, false)
        return
      }
      throw error
    }
  }
  run()
    .catch(error => {
      if (error instanceof ConversionCanceledError) return send({ type: 'canceled' })
      send({ type: 'error', stage, ...describe(error) })
    })
    .finally(() => {
      current = null
    })
}
