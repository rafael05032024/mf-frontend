// URL base da API: definida em .env.development / .env.production (VITE_API_URL)
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')
