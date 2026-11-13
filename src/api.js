
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://inkloom-ai-py3k.onrender.com'
).replace(/\/$/, '')

export function apiUrl(path) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export async function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.headers || {}),
    },
  })
}
