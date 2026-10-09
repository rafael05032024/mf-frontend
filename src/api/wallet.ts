import { api } from './client'

interface BalanceDTO {
  balance: number
}

/** Saldo da carteira em ft */
export async function getBalance(): Promise<number> {
  const data = await api.get<BalanceDTO>('/api/wallet/balance')
  return data.balance
}

interface RechargeDTO {
  id: number
  qrCodeImage: string
  payload: string
}

export interface PixRecharge {
  id: number
  /** Imagem do QR Code em base64 (PNG, sem prefixo data:) */
  qrCodeImage: string
  /** PIX copia e cola */
  payload: string
}

/** Gera a cobrança PIX para recarga. `value` em reais */
export function createRecharge(value: number): Promise<PixRecharge> {
  return api.post<RechargeDTO>('/api/wallet/recharges', { value })
}

interface TransactionDTO {
  id: number
  type: 1 | 2 // 1 = crédito, 2 = débito
  value: number
  description: string | null
}

interface WalletDTO {
  balance: number
  transaction: TransactionDTO[]
}

export interface WalletTransaction {
  id: number
  incoming: boolean
  /** Valor movimentado em ft (sempre positivo) */
  amountFt: number
  description: string
}

export interface Wallet {
  /** Saldo em ft */
  balance: number
  transactions: WalletTransaction[]
}

export async function getWallet(): Promise<Wallet> {
  const data = await api.get<WalletDTO>('/api/wallet/transactions')
  return {
    balance: data.balance,
    transactions: (data.transaction ?? []).map(t => ({
      id: t.id,
      incoming: t.type === 1,
      amountFt: t.value,
      description: t.description ?? (t.type === 1 ? 'Crédito' : 'Débito'),
    })),
  }
}
