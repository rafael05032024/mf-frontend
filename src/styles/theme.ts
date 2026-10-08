// Paleta oficial (paletas.md) + tons derivados para acessibilidade/estados
export const theme = {
  colors: {
    primary: '#00AFF0',
    primaryHover: '#0098D1',
    primarySoft: '#E6F7FE',
    primaryText: '#0079A8', // azul com contraste 4.5:1 para textos/links sobre branco
    white: '#FFFFFF',
    black: '#000000',
    dark: '#2C2C2C',
    gray: '#8A8A8A',
    grayText: '#6E6E6E', // cinza auxiliar legível em texto pequeno
    light: '#F5F5F5',
    border: '#E4E4E4',
    success: '#12805C',
    successSoft: '#E7F6F0',
    danger: '#C62828',
    dangerSoft: '#FDECEC',
    warning: '#8A5A00',
    warningSoft: '#FFF6E0',
    overlay: 'rgba(0, 0, 0, 0.55)',
  },
  radius: { sm: '8px', md: '12px', lg: '20px', pill: '999px' },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.08)',
    md: '0 4px 16px rgba(0,0,0,.08)',
    lg: '0 16px 48px rgba(0,0,0,.18)',
  },
  fontDisplay: `'Outfit', 'Figtree', system-ui, sans-serif`,
  font: `'Figtree', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`,
  bp: { sm: '480px', md: '768px', lg: '1024px' },
  headerHeight: '64px',
  maxWidth: '1040px',
} as const

export type AppTheme = typeof theme
export const mq = {
  sm: `@media (min-width: ${theme.bp.sm})`,
  md: `@media (min-width: ${theme.bp.md})`,
  lg: `@media (min-width: ${theme.bp.lg})`,
}
