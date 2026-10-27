const TOKEN_KEY = 'bb_token';

// "Remember me" keeps the token in localStorage; otherwise it lives only for the tab.
export const tokenStore = {
  get() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },
  set(token, remember) {
    this.clear();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
};

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error || `Request failed (${status})`);
    this.status = status;
    this.fieldErrors = body?.fieldErrors || {};
  }
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && token) {
    tokenStore.clear();
    window.dispatchEvent(new Event('bb:unauthorized'));
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

export const api = {
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  register: (account) => request('POST', '/auth/register', account),
  logout: () => request('POST', '/auth/logout'),
  forgotPassword: (email) => request('POST', '/auth/forgot-password', { email }),

  me: () => request('GET', '/me'),
  updateMe: (profile) => request('PUT', '/me', profile),

  categories: () => request('GET', '/categories'),
  products: ({ q = '', category = 'all' } = {}) =>
    request('GET', `/products?${new URLSearchParams({ q, category })}`),
  product: (id) => request('GET', `/products/${encodeURIComponent(id)}`),

  favorites: () => request('GET', '/favorites'),
  addFavorite: (id) => request('PUT', `/favorites/${encodeURIComponent(id)}`),
  removeFavorite: (id) => request('DELETE', `/favorites/${encodeURIComponent(id)}`),

  cart: () => request('GET', '/cart'),
  addToCart: (item) => request('POST', '/cart/items', item),
  updateCartItem: (id, quantity) => request('PATCH', `/cart/items/${id}`, { quantity }),
  removeCartItem: (id) => request('DELETE', `/cart/items/${id}`),
  applyPromo: (code) => request('POST', '/cart/promo', { code }),
  removePromo: () => request('DELETE', '/cart/promo'),
  setDelivery: (delivery) => request('PATCH', '/cart', { delivery }),

  placeOrder: (payment) => request('POST', '/orders', { payment }),
  order: (id) => request('GET', `/orders/${encodeURIComponent(id)}`),
};

export function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
