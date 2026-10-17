# ---- Stage 1: build ----
FROM node:22-alpine AS build

WORKDIR /app

# Fallback opcional embutido no bundle. Em produção prefira a variável de
# ambiente VITE_API_URL do container, lida em runtime via /config.js.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Stage 2: runtime ----
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Executado pelo entrypoint da imagem nginx no boot: gera /config.js
# a partir de VITE_API_URL do ambiente do container.
COPY --chmod=755 docker-entrypoint.d/40-generate-config.sh /docker-entrypoint.d/40-generate-config.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
