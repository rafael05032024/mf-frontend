# Rebranding UI — Modernização Visual dos Formulários

## Objetivo

Tornar a plataforma mais moderna e flat, saindo do visual de "site antigo" com labels estáticos acima dos inputs, inputs de data sem estilo, e ícones genéricos. A paleta de cores existente (primary `#00AFF0`) foi preservada integralmente.

## Referências utilizadas

- **Skill `ui-ux-pro-max`** — Flat Design: sem sombras decorativas, transições 150–200ms, ícones SVG (Lucide), cores sólidas, `cursor: pointer` em interativos
- **Skill `frontend-design`** — tipografia intencional, visual restrito e limpo, um ponto de destaque por vez
- **UX Guidelines** — labels sempre visíveis, tipos de input corretos, feedback de loading, focus states visíveis (WCAG)

---

## Mudanças realizadas

### 1. Novo componente: `InputGroup`

**Arquivo criado:** `src/components/InputGroup.tsx`

Wrapper reutilizável que posiciona ícones SVG (Lucide) dentro dos inputs, à esquerda e/ou à direita. O ícone transiciona para a cor `primary` ao receber foco.

```tsx
<InputGroup leftIcon={<Mail size={18} />}>
  <Input value={email} onChange={...} />
</InputGroup>
```

### 2. `Field` com Floating Label

**Arquivo alterado:** `src/components/Field.tsx`

Antes: label estático acima do input (visual de formulário antigo).

Agora: a label fica dentro do input como placeholder e sobe para a borda superior com transição suave ao focar ou quando preenchido. Detalhes:

- **`FloatWrap`** isola input + label do `FieldError`/`Hint`, garantindo que `top: 50%` se refira à altura do input, não do container inteiro
- **`extractValue()`** busca o `value` dentro de wrappers (`InputGroup`, `PasswordInput`) para detectar corretamente campos pré-preenchidos
- **`getDisplayName()`** identifica automaticamente o tipo do componente filho via `displayName`
- **Textarea e componentes especiais** (EmojiTextarea, CodeInput, AmountPicker, Select) usam label tradicional via `float={false}`
- **Estados da label:** cinza quando repouso, `primary` (#00AFF0) quando ativo, `danger` quando inválido

### 3. Inputs modernizados

**Arquivo alterado:** `src/components/ui.tsx`

| Propriedade | Antes | Depois |
|---|---|---|
| Altura mínima | 48px | 52px |
| Padding | 12px 14px | 14px 16px |
| Hover | nenhum | borda cinza |
| Focus | apenas `border-color` | `border-color` + `box-shadow: 0 0 0 3px primarySoft` |
| Focus inválido | apenas `border-color` | `border-color` + `box-shadow: 0 0 0 3px dangerSoft` |
| Cursor | padrão | `cursor: text` (inputs), `cursor: pointer` (select) |
| Transição | 0.18s | 0.18s |
| FieldError/Hint | 13px, margin-top 6px | 12px, margin-top 4px |

**Input de data (`type="date"`):**
- `color-scheme: light` para estilização nativa
- Picker indicator com opacidade 0.5, hover 0.8, `cursor: pointer`

**Select:**
- `appearance: none` com chevron SVG customizado (Lucide ChevronDown inline)
- `cursor: pointer`

**IconButton:**
- Cantos arredondados 8px (antes: circular 50%)
- Cor base `grayText` (antes: `dark`), hover transiciona para `dark`

### 4. `PasswordInput` com ícone Lock

**Arquivo alterado:** `src/components/PasswordInput.tsx`

- Ícone `Lock` (18px) posicionado à esquerda dentro do input
- Transiciona para cor `primary` no foco
- Botão Eye/EyeOff à direita mantido

### 5. Tela de Postagem modernizada

**Arquivo alterado:** `src/pages/Post.tsx`

- Drop zone: ícone `CloudUpload` único (antes: `ImagePlus` + `Film` lado a lado)
- Proporção 4:3 (antes: 1:1), max-height 360px
- `cursor: pointer` no drop zone
- Ícone com transição de cor no hover
- Removida label "Mídia" redundante acima do drop zone

### 6. `EmojiTextarea` e `AmountPicker`

- **`EmojiTextarea`** — adicionado `displayName` para detecção automática pelo Field (usa label tradicional, não floating)
- **`AmountPicker`** — forçado `float={false}` para não conflitar com o prefixo `R$`

---

## Páginas atualizadas com ícones nos inputs

| Página | Ícones adicionados |
|---|---|
| Login | `Mail` no e-mail |
| LoginModal | `Mail` no e-mail |
| Register | `User` nome, `Mail` e-mail, `AtSign` perfil |
| EditProfileName | `User` nome, `AtSign` identificador |
| EditProfileSocials | `InstagramIcon` Instagram, `TikTokIcon` TikTok |
| EditProfilePassword | `Lock` (via PasswordInput) |
| BecomeCreator | `Globe` país, `CreditCard` CPF, `User` nome, `Calendar` data, `AtSign` handle, `InstagramIcon`, `TikTokIcon` |
| Withdraw | `Coins` valor, `Key` chave PIX |
| Post | `CloudUpload` no drop zone |

---

## Arquivos modificados

| Arquivo | Tipo |
|---|---|
| `src/components/InputGroup.tsx` | **Novo** |
| `src/components/Field.tsx` | Reescrito (floating label) |
| `src/components/ui.tsx` | Input/Select/Textarea/IconButton modernizados |
| `src/components/PasswordInput.tsx` | Ícone Lock adicionado |
| `src/components/EmojiTextarea.tsx` | displayName adicionado |
| `src/components/AmountPicker.tsx` | float={false} |
| `src/components/LoginModal.tsx` | InputGroup + Mail |
| `src/pages/Login.tsx` | InputGroup + Mail |
| `src/pages/Register.tsx` | InputGroup + User/Mail/AtSign |
| `src/pages/EditProfileName.tsx` | InputGroup + User/AtSign |
| `src/pages/EditProfileSocials.tsx` | InputGroup + InstagramIcon/TikTokIcon |
| `src/pages/BecomeCreator.tsx` | InputGroup + ícones, removido Prefix local |
| `src/pages/Withdraw.tsx` | InputGroup + Coins/Key, Select float={false} |
| `src/pages/Post.tsx` | CloudUpload, drop zone modernizado |

---

## Decisões de design

1. **Floating label em vez de label acima** — visual mais limpo e moderno, economiza espaço vertical, padrão usado por Material Design e apps contemporâneos
2. **Ícones dentro dos inputs** — dão contexto visual imediato, reduzem carga cognitiva, padrão comum em plataformas modernas
3. **Focus ring suave** — `box-shadow` azul claro em vez de outline sólido, mais elegante sem perder acessibilidade
4. **Textarea mantém label tradicional** — floating label não funciona bem em campos multi-linha (posição vertical fica errada)
5. **Select mantém label tradicional** — o valor selecionado já ocupa o espaço da label, floating causaria sobreposição
6. **Ícones Lucide mantidos** — biblioteca leve, traço fino uniforme, visual profissional e consistente
