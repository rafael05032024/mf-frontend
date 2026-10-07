# My Foot

Marketplace de assinatura de conteúdo (nicho podolatria). React + Vite + TypeScript + Styled Components.
Protótipo front-end: dados mockados e persistidos no `localStorage` (sem backend).

## Rodar

```bash
npm install
npm run dev
```

## Contas de demonstração (senha `123456`)

- `demo@myfoot.com`: usuário comum (1.200 ft, 1 assinatura)
- `criadora@myfoot.com`: criadora verificada (POSTAR, Controle, Resgatar)

Para voltar ao estado inicial, limpe o `localStorage` (chaves `myfoot:*`).

## Simulações

- **PIX**: o QR Code usa um BR Code válido para uma chave fictícia; "Já paguei" credita a carteira.
- **Validação de criador**: após "Encaminhar para validação", o perfil é aprovado automaticamente em ~10s.
- Cotação: R$ 1,00 = 30 ft.
