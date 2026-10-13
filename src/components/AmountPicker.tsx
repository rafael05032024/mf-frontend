import type { InputHTMLAttributes } from 'react'
import styled from 'styled-components'
import { MAX_BRL, MIN_BRL } from '../utils/format'
import { Field } from './Field'
import { Input } from './ui'

const Chips = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(76px, 1fr));
  gap: 8px;
`

const Chip = styled.button<{ $active: boolean }>`
  min-height: 42px;
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1.5px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.white)};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.dark)};
  font-weight: 700;
  font-size: 14px;
  box-shadow: ${({ $active, theme }) => ($active ? `0 4px 12px ${theme.colors.primary}40` : 'none')};
  transition: all .18s ease;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
  small { font-size: 11px; font-weight: 600; opacity: .75; margin-right: 2px; }
`

const Money = styled.div`
  position: relative;
  span {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.grayText};
    pointer-events: none;
    transition: color .18s ease;
  }
  input {
    padding-left: 54px;
    min-height: 64px;
    font-family: ${({ theme }) => theme.fontDisplay};
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: ${({ theme }) => theme.colors.dark};
  }
  &:focus-within span { color: ${({ theme }) => theme.colors.primary}; }
`

const Slider = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const Range = styled.input<{ $pct: number }>`
  appearance: none;
  width: 100%;
  height: 28px;
  background: transparent;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: linear-gradient(to right,
      ${({ theme }) => theme.colors.primary} ${({ $pct }) => $pct}%,
      ${({ theme }) => theme.colors.border} ${({ $pct }) => $pct}%);
  }
  &::-moz-range-track {
    height: 6px;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: ${({ theme }) => theme.colors.border};
  }
  &::-moz-range-progress {
    height: 6px;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: ${({ theme }) => theme.colors.primary};
  }
  &::-webkit-slider-thumb {
    appearance: none;
    width: 22px;
    height: 22px;
    margin-top: -8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.white};
    border: 3px solid ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadow.sm};
    transition: transform .15s ease;
  }
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.white};
    border: 3px solid ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadow.sm};
  }
  &:active::-webkit-slider-thumb { transform: scale(1.15); }
  &:focus-visible { outline: none; }
  &:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primarySoft}; }
`

const RangeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.grayText};
`

interface Props {
  label: string
  hideLabel?: boolean
  value: string
  onChange: (v: string) => void
  error?: string
  presets?: number[]
  /** aceita apenas valores inteiros (sem centavos) */
  whole?: boolean
}

export function AmountPicker({ label, hideLabel, value, onChange, error, presets = [15, 30, 50, 100, 150], whole }: Props) {
  const num = Number(value.replace(',', '.'))
  const clamped = Number.isFinite(num) ? Math.min(MAX_BRL, Math.max(MIN_BRL, num)) : MIN_BRL
  return (
    <>
      <Field label={label} hideLabel={hideLabel} error={error} hint={`Entre R$ ${MIN_BRL},00 e R$ ${MAX_BRL},00`} float={false}>
        <MoneyInput value={value} onChange={onChange} whole={whole} />
      </Field>
      <Slider>
        <Range
          type="range"
          min={MIN_BRL}
          max={MAX_BRL}
          step={1}
          value={clamped}
          $pct={((clamped - MIN_BRL) / (MAX_BRL - MIN_BRL)) * 100}
          onChange={e => onChange(e.target.value)}
          aria-label={`${label} (controle deslizante)`}
        />
        <RangeLabels aria-hidden>
          <span>R$ {MIN_BRL}</span>
          <span>R$ {MAX_BRL}</span>
        </RangeLabels>
      </Slider>
      <Chips role="group" aria-label="Valores sugeridos">
        {presets.map(p => (
          <Chip key={p} type="button" $active={num === p} aria-pressed={num === p} onClick={() => onChange(String(p))}>
            <small>R$</small>{p}
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
