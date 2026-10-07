import { useState } from 'react'
import { Check, Copy, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { AmountPicker, parseBRL, validateBRL } from '../components/AmountPicker'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { Button, Card, Muted, NarrowContainer, Stack } from '../components/ui'
import { useApp, useAuthedUser } from '../store/AppContext'
import { brlToFt, formatBRL, formatFt, uid } from '../utils/format'
import { pixPayload } from '../utils/pix'

const Summary = styled.dl`
  margin: 0;
  display: grid;
  gap: 10px;
  div { display: flex; justify-content: space-between; gap: 12px; }
  dt { color: ${({ theme }) => theme.colors.dark}; font-size: 15px; }
  dd { margin: 0; font-weight: 700; }
  div.total { padding-top: 12px; border-top: 1px solid ${({ theme }) => theme.colors.border}; }
  div.total dd { color: ${({ theme }) => theme.colors.primaryText}; font-size: 20px; font-weight: 800; }
  .plus { color: ${({ theme }) => theme.colors.success}; }
`

const Pix = styled.div`
  padding: 28px 20px 20px;
  text-align: center;
  h2 { font-size: 20px; }
  .value { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; color: ${({ theme }) => theme.colors.black}; margin: 4px 0 2px; }
  .qr { display: inline-block; margin: 16px auto; padding: 14px; border-radius: ${({ theme }) => theme.radius.md}; border: 1px solid ${({ theme }) => theme.colors.border}; background: #fff; }
  .code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    word-break: break-all;
    text-align: left;
    background: ${({ theme }) => theme.colors.light};
    border-radius: ${({ theme }) => theme.radius.sm};
    padding: 10px 12px;
    color: ${({ theme }) => theme.colors.dark};
    max-height: 72px;
    overflow: auto;
  }
`

export default function Recharge() {
  const user = useAuthedUser()
  const { recharge } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [value, setValue] = useState('30')
  const [error, setError] = useState<string>()
  const [pix, setPix] = useState<{ amount: number; payload: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const amount = parseBRL(value)
  const valid = !validateBRL(value)
  const addFt = valid ? brlToFt(amount) : 0

  const next = () => {
    const er = validateBRL(value)
    setError(er)
    if (er) return
    setCopied(false)
    setPix({ amount, payload: pixPayload(amount, `MF${uid().toUpperCase()}`) })
  }

  const copy = async () => {
    if (!pix) return
    try {
      await navigator.clipboard.writeText(pix.payload)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const confirmPaid = () => {
    if (!pix) return
    recharge(pix.amount)
    setPix(null)
    toast({ title: 'Recarga confirmada!', message: `${formatFt(brlToFt(pix.amount))} adicionados à sua carteira.`, tone: 'success' })
    navigate('/conta/carteira')
  }

  return (
    <NarrowContainer>
      <PageHeader title="Recarregar" back="/conta/carteira" />
      <Stack $gap={16}>
        <Card>
          <Stack>
            <AmountPicker label="Quanto deseja adicionar?" value={value} onChange={v => { setValue(v); setError(undefined) }} error={error} />
          </Stack>
        </Card>

        <Card>
          <Summary>
            <div><dt>Saldo atual</dt><dd>{formatFt(user.balanceFt)}</dd></div>
            <div><dt>Recarga</dt><dd className="plus">+ {formatFt(addFt)}</dd></div>
            <div className="total"><dt>Saldo após recarga</dt><dd>{formatFt(user.balanceFt + addFt)}</dd></div>
          </Summary>
        </Card>

        <Button $size="lg" $block onClick={next} disabled={!valid}>Continuar</Button>
      </Stack>

      <Modal open={!!pix} onClose={() => setPix(null)} label="Pagamento via PIX" width={420}>
        {pix && (
          <Pix>
            <h2>Pague com PIX</h2>
            <p className="value">{formatBRL(pix.amount)}</p>
            <Muted>Você receberá {formatFt(brlToFt(pix.amount))}</Muted>
            <div className="qr" role="img" aria-label="QR Code PIX para pagamento">
              <QRCodeSVG value={pix.payload} size={200} level="M" />
            </div>
            <Stack $gap={12}>
              <Muted>Escaneie o QR Code no app do seu banco ou use o PIX copia e cola:</Muted>
              <div className="code">{pix.payload}</div>
              <Button $variant="outline" $block onClick={copy}>
                {copied ? <><Check size={18} /> Código copiado</> : <><Copy size={18} /> Copiar código PIX</>}
              </Button>
              <Button $block onClick={confirmPaid}>
                <QrCode size={18} /> Já paguei
              </Button>
            </Stack>
          </Pix>
        )}
      </Modal>
    </NarrowContainer>
  )
}
