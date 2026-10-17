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

/** 1 = crédito, 2 = débito, 3 = informativo, 4 = resgate não efetivado */
export type TransactionType = 1 | 2 | 3 | 4

interface TransactionDTO {
  id: number
  type: TransactionType
  value: number
  description: string | null
}

interface WalletDTO {
  balance: number
  transaction: TransactionDTO[]
}

export interface WalletTransaction {
  id: number
  type: TransactionType
  /** true apenas para créditos (type 1) */
  incoming: boolean
  /** Valor movimentado em ft (sempre positivo) */
  amountFt: number
  description: string
}

const FALLBACK_DESCRIPTION: Record<TransactionType, string> = {
  1: 'Crédito',
  2: 'Débito',
  3: 'Informativo',
  4: 'Resgate não efetivado',
}

export interface Wallet {
  /** Saldo em ft */
  balance: number
  transactions: WalletTransaction[]
}

/** Solicita um resgate via PIX. `value` em ft */
export function createWithdrawal(value: number, addressKey: string): Promise<void> {
  return api.post('/api/wallet/withdrawals', { value, address_key: addressKey })
}

export async function getWallet(): Promise<Wallet> {
  const data = await api.get<WalletDTO>('/api/wallet/transactions')
  return {
    balance: data.balance,
    transactions: (data.transaction ?? []).map(t => ({
      id: t.id,
      type: t.type,
      incoming: t.type === 1,
      amountFt: t.value,
      description: t.description ?? FALLBACK_DESCRIPTION[t.type] ?? 'Transação',
    })),
  }
}
