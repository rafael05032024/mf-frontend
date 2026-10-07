import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    font-family: ${({ theme }) => theme.font};
    font-size: 16px;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.black};
    background: ${({ theme }) => theme.colors.light};
    -webkit-font-smoothing: antialiased;
  }
  img, video { display: block; max-width: 100%; }
  button, input, textarea, select { font: inherit; color: inherit; }
  button { cursor: pointer; }
  a { color: ${({ theme }) => theme.colors.primaryText}; text-decoration: none; }
  h1, h2, h3, h4, p { margin: 0; }
  :focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
      scroll-behavior: auto !important;
    }
  }
`
