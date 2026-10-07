// Gera um payload PIX "copia e cola" (BR Code estático) para demonstração.
const tlv = (id: string, value: string) => `${id}${String(value.length).padStart(2, '0')}${value}`

function crc16(payload: string) {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}

export function pixPayload(amountBRL: number, txid: string) {
  const body =
    tlv('00', '01') +
    tlv('26', tlv('00', 'br.gov.bcb.pix') + tlv('01', 'pagamentos@myfoot.com.br')) +
    tlv('52', '0000') +
    tlv('53', '986') +
    tlv('54', amountBRL.toFixed(2)) +
    tlv('58', 'BR') +
    tlv('59', 'MY FOOT') +
    tlv('60', 'SAO PAULO') +
    tlv('62', tlv('05', txid.slice(0, 25))) +
    '6304'
  return body + crc16(body)
}
