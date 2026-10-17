#!/bin/sh
# Gera /config.js a partir das variáveis de ambiente do container, no boot.
# A imagem nginx executa automaticamente os scripts .sh deste diretório.
set -eu

CONFIG_FILE=/usr/share/nginx/html/config.js
API_URL="${VITE_API_URL:-${API_URL:-}}"

# Escapa barra invertida e aspas para não quebrar o literal JS
ESCAPED=$(printf '%s' "$API_URL" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')

printf 'window.__ENV__ = { API_URL: "%s" };\n' "$ESCAPED" > "$CONFIG_FILE"

if [ -z "$API_URL" ]; then
  echo "[config] AVISO: VITE_API_URL nao definida - a aplicacao nao conseguira chamar a API." >&2
else
  echo "[config] API_URL=$API_URL"
fi
