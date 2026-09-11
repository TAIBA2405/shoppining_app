// Tiny fetch client for the StyleVerse Postgres API.
// Base URL: set VITE_API_URL in .env (production) — falls back to
// same-origin /api via vite proxy, then localhost:3001 for `vite dev`.
const BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:3001' : '')

const TOKEN_KEY = 'sv_token'

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* private mode */ }
}

async function req(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  } catch {
    throw new Error('Cannot reach the API. Is the backend running?')
  }
  let data = null
  try { data = await res.json() } catch { /* empty body (e.g. index.html fallback) */ }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
  if (data === null || data === undefined) {
    // Static host served HTML instead of JSON (wrong VITE_API_URL) —
    // throw so callers keep their [] default instead of setting null.
    throw new Error('Cannot reach the API. Is the backend running?')
  }
  return data
}

export const api = {
  // ── Auth ──
  signup: (payload) => req('/api/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => req('/api/auth/login', { method: 'POST', body: payload }),
  me: () => req('/api/auth/me', { auth: true }),
  updateMe: (updates) => req('/api/auth/me', { method: 'PATCH', body: updates, auth: true }),

  // ── Catalog (public) ──
  getProducts: () => req('/api/products'),
  getProduct: (id) => req(`/api/products/${id}`),
  getCoupons: () => req('/api/coupons'),

  // ── Orders ──
  // Awaited server-side — resolves ONLY after Postgres confirms the
  // insert, so checkout never shows success for a lost order.
  placeOrder: (order, token) => req('/api/orders', {
    method: 'POST',
    body: order,
    ...(token ? { auth: true } : {})
  }),
  getOrderById: (id) => req(`/api/orders/${encodeURIComponent(id)}`),
  getMyOrders: () => req('/api/orders/mine', { auth: true })
}

export { BASE }
