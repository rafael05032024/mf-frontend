import type { InputHTMLAttributes } from 'react'
import styled from 'styled-components'
import { MAX_BRL, MIN_BRL } from '../utils/format'
import { Field } from './Field'
import { Input } from './ui'

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.button<{ $active: boolean }>`
  min-height: 40px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.radius.pill};
  border: 1.5px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primarySoft : theme.colors.white)};
  color: ${({ $active, theme }) => ($active ? theme.colors.primaryText : theme.colors.dark)};
  font-weight: 700;
  font-size: 14px;
  transition: all .18s ease;
`

const Money = styled.div`
  position: relative;
  span { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-weight: 700; color: ${({ theme }) => theme.colors.dark}; }
  input { padding-left: 48px; font-size: 24px; font-weight: 800; min-height: 60px; }
`

const Range = styled.input`
  width: 100%;
  accent-color: ${({ theme }) => theme.colors.primary};
  height: 32px;
`

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  presets?: number[]
  /** aceita apenas valores inteiros (sem centavos) */
  whole?: boolean
}

export function AmountPicker({ label, value, onChange, error, presets = [15, 30, 50, 100, 150], whole }: Props) {
  const num = Number(value.replace(',', '.'))
  return (
    <>
      <Field label={label} error={error} hint={`Entre R$ ${MIN_BRL},00 e R$ ${MAX_BRL},00`}>
        <MoneyInput value={value} onChange={onChange} whole={whole} />
      </Field>
      <Range
        type="range"
        min={MIN_BRL}
        max={MAX_BRL}
        step={1}
        value={Number.isFinite(num) ? Math.min(MAX_BRL, Math.max(MIN_BRL, num)) : MIN_BRL}
        onChange={e => onChange(e.target.value)}
        aria-label={`${label} (controle deslizante)`}
      />
      <Chips role="group" aria-label="Valores sugeridos">
        {presets.map(p => (
          <Chip key={p} type="button" $active={num === p} aria-pressed={num === p} onClick={() => onChange(String(p))}>
            R$ {p}
          </Chip>
        ))}
      </Chips>
    </>
  )
}

type MoneyProps = { value: string; onChange: (v: string) => void; whole?: boolean } & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>

function MoneyInput({ value, onChange, whole, ...rest }: MoneyProps) {
  return (
    <Money>
      <span aria-hidden>R$</span>
      <Input
        {...rest}
        inputMode={whole ? 'numeric' : 'decimal'}
        value={value}
        onChange={e => onChange(e.target.value.replace(whole ? /\D/g : /[^\d,.]/g, ''))}
        placeholder={whole ? '0' : '0,00'}
      />
    </Money>
  )
}

export const parseBRL = (v: string) => {
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN
}

export const validateBRL = (v: string, whole?: boolean) => {
  const n = parseBRL(v)
  if (!v || Number.isNaN(n)) return 'Informe um valor.'
  if (whole && !Number.isInteger(n)) return 'Use apenas valores inteiros, sem centavos.'
  if (n < MIN_BRL || n > MAX_BRL) return `O valor deve estar entre R$ ${MIN_BRL},00 e R$ ${MAX_BRL},00.`
  return undefined
}
