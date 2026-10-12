export const PASSWORD_RULES = [
  { id: 'length', label: 'Mínimo de 8 caracteres', test: (v: string) => v.length >= 8 },
  { id: 'letter', label: 'Ao menos uma letra', test: (v: string) => /\p{L}/u.test(v) },
  { id: 'number', label: 'Ao menos um número', test: (v: string) => /\d/.test(v) },
  { id: 'special', label: 'Ao menos um caractere especial', test: (v: string) => /[^\p{L}\d\s]/u.test(v) },
] as const

export const isPasswordValid = (v: string) => PASSWORD_RULES.every(r => r.test(v))

export const PASSWORD_ERROR = 'A senha não atende a todos os critérios.'
