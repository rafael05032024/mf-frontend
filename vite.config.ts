import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // O backend só libera CORS para http://localhost:3000, então o dev server
  // precisa subir nessa porta (strictPort evita cair em 3001 silenciosamente).
  server: {
    port: 3000,
    strictPort: true,
  },
})
