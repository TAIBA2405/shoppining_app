// Tiny fetch client for the StyleVerse Postgres API (admin).
// Same contract as frontend/src/lib/api.js, plus admin-only endpoints.
// All mutating + listing calls send the JWT from localStorage.
const BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '5174' ? 'http://localhost:3001' : '')

const TOKEN_KEY = 'sv_admin_token'

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* private mode */ }
}

async function req(path, { method = 'GET', body, auth = true } = {}) {
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
  try { data = await res.json() } catch { /* empty body */ }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  login: (payload) => req('/api/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => req('/api/auth/me'),

  // ── Products ──
  getProducts: () => req('/api/products', { auth: false }),
  addProduct: (data) => req('/api/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => req(`/api/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => req(`/api/products/${id}`, { method: 'DELETE' }),
  toggleProductStock: (id) => req(`/api/products/${id}/stock`, { method: 'PATCH' }),

  // ── Orders ──
  getAllOrders: () => req('/api/orders'),
  getOrderById: (id) => req(`/api/orders/${encodeURIComponent(id)}`, { auth: false }),
  updateOrderStatus: (id, status) =>
    req(`/api/orders/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } }),
  deleteOrder: (id) => req(`/api/orders/${id}`, { method: 'DELETE' }),

  // ── Users ──
  getAllUsers: () => req('/api/users'),
  deleteUser: (id) => req(`/api/users/${id}`, { method: 'DELETE' }),

  // ── Coupons ──
  getCoupons: () => req('/api/coupons', { auth: false }),
  addCoupon: (data) => req('/api/coupons', { method: 'POST', body: data }),
  toggleCoupon: (id) => req(`/api/coupons/${id}`, { method: 'PATCH' }),
  deleteCoupon: (id) => req(`/api/coupons/${id}`, { method: 'DELETE' })
}

export { BASE }
