import { useId } from 'react'
import styled from 'styled-components'

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  label { cursor: pointer; }
  strong { display: block; font-weight: 600; }
  small { display: block; font-size: 13px; color: ${({ theme }) => theme.colors.grayText}; }
`

const Track = styled.button<{ $on: boolean }>`
  flex-shrink: 0;
  position: relative;
  width: 52px;
  height: 32px;
  border: 0;
  border-radius: 16px;
  background: ${({ $on, theme }) => ($on ? theme.colors.primary : theme.colors.gray)};
  transition: background-color .2s ease;
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.white};
    box-shadow: 0 1px 3px rgba(0,0,0,.25);
    transform: translateX(${({ $on }) => ($on ? '20px' : '0')});
    transition: transform .2s ease;
  }
`

export function Switch({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  const id = useId()
  return (
    <Wrap>
      <label htmlFor={id}>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </label>
      <Track id={id} type="button" role="switch" aria-checked={checked} $on={checked} onClick={() => onChange(!checked)} />
    </Wrap>
  )
}
