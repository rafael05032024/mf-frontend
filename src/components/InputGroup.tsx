import { cloneElement, type ReactElement } from 'react'
import styled, { css } from 'styled-components'

const Wrap = styled.div<{ $hasLeft?: boolean; $hasRight?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;

  ${({ $hasLeft }) =>
    $hasLeft &&
    css`
      > .ig-icon-left {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: ${({ theme }) => theme.colors.gray};
        display: flex;
        pointer-events: none;
        transition: color 0.18s ease;
      }
      input, select, textarea { padding-left: 44px; }
    `}

  ${({ $hasRight }) =>
    $hasRight &&
    css`
      > .ig-icon-right {
        position: absolute;
        right: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: ${({ theme }) => theme.colors.gray};
        display: flex;
        pointer-events: none;
        transition: color 0.18s ease;
      }
      input, select, textarea { padding-right: 44px; }
    `}

  &:focus-within > .ig-icon-left,
  &:focus-within > .ig-icon-right {
    color: ${({ theme }) => theme.colors.primary};
  }
`

interface Props {
  leftIcon?: ReactElement
  rightIcon?: ReactElement
  children: ReactElement<Record<string, unknown>>
}

function InputGroupInner({ leftIcon, rightIcon, children, ...rest }: Props & Record<string, unknown>) {
  if (!leftIcon && !rightIcon) return cloneElement(children, rest)
  return (
    <Wrap $hasLeft={!!leftIcon} $hasRight={!!rightIcon}>
      {leftIcon && <span className="ig-icon-left" aria-hidden>{leftIcon}</span>}
      {cloneElement(children, rest)}
      {rightIcon && <span className="ig-icon-right" aria-hidden>{rightIcon}</span>}
    </Wrap>
  )
}

InputGroupInner.displayName = 'InputGroup'

export const InputGroup = InputGroupInner
