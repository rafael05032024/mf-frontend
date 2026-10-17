// URL base da API, em ordem de precedencia:
//  1. window.__ENV__.API_URL  -> injetado em runtime pelo container (/config.js)
//  2. import.meta.env.VITE_API_URL -> embutido no build (.env.development / --build-arg)
const raw = window.__ENV__?.API_URL || import.meta.env.VITE_API_URL || ''

export const API_URL = raw.replace(/\/+$/, '')
