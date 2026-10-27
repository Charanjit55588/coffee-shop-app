// Mock backend for the Bean & Brew demo app.
// All state is in memory: restart the server or POST /api/test/reset to start fresh.

import crypto from 'node:crypto';
import express from 'express';
import { CATEGORIES, createSeed } from './seed.js';

const PORT = Number(process.env.API_PORT) || 4000;
const LATENCY_MS = Number(process.env.API_LATENCY_MS) || 0;

const SIZE_MULTIPLIER = { '250g': 1, '500g': 1.8, '1kg': 3.4 };
const SHIPPING = { standard: 500, express: 1200 };
const FREE_SHIPPING_THRESHOLD = 7500;
const TAX_RATE = 0.08;
const MAX_QUANTITY = 10;
const DECLINED_CARD = '4000000000000002';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const APPEARANCES = ['light', 'dark', 'system'];

let db = createSeed();
const sessions = new Map(); // token -> userId

const app = express();
app.use(express.json());

// Optional artificial latency, handy for practising explicit waits.
if (LATENCY_MS > 0) {
  app.use((req, res, next) => setTimeout(next, LATENCY_MS));
}

// ---------- helpers ----------

function publicUser(user) {
  const { password, locked, ...rest } = user;
  return rest;
}

function findProduct(id) {
  return db.products.find((p) => p.id === id);
}

function getCart(userId) {
  if (!db.carts[userId]) {
    db.carts[userId] = { items: [], promoCode: null, delivery: 'standard' };
  }
  return db.carts[userId];
}

function unitPrice(product, size) {
  if (!product.options) return product.price;
  return Math.round(product.price * SIZE_MULTIPLIER[size]);
}

function optionLabel(product, kind, id) {
  return product.options?.[kind].find((o) => o.id === id)?.label ?? null;
}

function cartView(userId) {
  const cart = getCart(userId);
  const items = cart.items.map((item) => {
    const product = findProduct(item.productId);
    const price = unitPrice(product, item.size);
    return {
      ...item,
      name: product.name,
      subtitle: product.subtitle,
      category: product.category,
      grindLabel: optionLabel(product, 'grinds', item.grind),
      sizeLabel: optionLabel(product, 'sizes', item.size),
      unitPrice: price,
      lineTotal: price * item.quantity,
    };
  });
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const promo = cart.promoCode ? db.promoCodes[cart.promoCode] : null;
  const discount = promo ? Math.round((subtotal * promo.percentOff) / 100) : 0;
  const afterDiscount = subtotal - discount;
  let shipping = 0;
  if (items.length > 0) {
    shipping =
      cart.delivery === 'standard' && afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING[cart.delivery];
  }
  const tax = Math.round(afterDiscount * TAX_RATE);
  return {
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    promoCode: cart.promoCode,
    delivery: cart.delivery,
    subtotal,
    discount,
    shipping,
    tax,
    total: afterDiscount + shipping + tax,
  };
}

function isValidQuantity(q) {
  return Number.isInteger(q) && q >= 1 && q <= MAX_QUANTITY;
}

function luhn(digits) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

function validatePayment(payment = {}) {
  const errors = {};
  const number = String(payment.cardNumber ?? '').replace(/\s+/g, '');
  if (!number) errors.cardNumber = 'Card number is required.';
  else if (!/^\d{16}$/.test(number) || !luhn(number)) errors.cardNumber = 'Enter a valid 16-digit card number.';

  const expiry = String(payment.expiry ?? '').replace(/\s+/g, '');
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!expiry) errors.expiry = 'Expiry is required.';
  else if (!match || Number(match[1]) < 1 || Number(match[1]) > 12) errors.expiry = 'Use MM/YY.';
  else {
    const now = new Date();
    const year = 2000 + Number(match[2]);
    const month = Number(match[1]);
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      errors.expiry = 'This card has expired.';
    }
  }

  const cvc = String(payment.cvc ?? '').trim();
  if (!cvc) errors.cvc = 'CVC is required.';
  else if (!/^\d{3,4}$/.test(cvc)) errors.cvc = 'Enter 3 or 4 digits.';

  return { errors, number };
}

function validateProfile(body) {
  const errors = {};
  if (body.username !== undefined && !/^[A-Za-z0-9_]{3,20}$/.test(body.username)) {
    errors.username = 'Use 3–20 letters, numbers or underscores.';
  }
  if (body.phone && !/^[+\d][\d\s()-]{6,19}$/.test(body.phone)) {
    errors.phone = 'Enter a valid phone number.';
  }
  if (body.appearance !== undefined && !APPEARANCES.includes(body.appearance)) {
    errors.appearance = 'Appearance must be light, dark or system.';
  }
  const a = body.address;
  if (a) {
    const filled = [a.street, a.city, a.region, a.postalCode].filter((v) => v && v.trim()).length;
    if (filled > 0 && filled < 4) {
      if (!a.street?.trim()) errors.street = 'Street is required.';
      if (!a.city?.trim()) errors.city = 'City is required.';
      if (!a.region?.trim()) errors.region = 'Required.';
      if (!a.postalCode?.trim()) errors.postalCode = 'Required.';
    }
    if (a.postalCode?.trim() && !/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(a.postalCode.trim())) {
      errors.postalCode = 'Invalid code.';
    }
  }
  return errors;
}

function hasAddress(user) {
  const a = user.address;
  return Boolean(a.street && a.city && a.region && a.postalCode);
}

function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const userId = token ? sessions.get(token) : null;
  if (!userId) return res.status(401).json({ error: 'You need to sign in.' });
  req.user = db.users.find((u) => u.id === userId);
  req.token = token;
  next();
}

// ---------- routes ----------

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Incorrect email or password. Try again.' });
  }
  if (user.locked) {
    return res.status(423).json({ error: 'This account is locked. Contact support to unlock it.' });
  }
  const token = crypto.randomUUID();
  sessions.set(token, user.id);
  res.json({ token, user: publicUser(user) });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, acceptTerms } = req.body ?? {};
  const cleanName = String(name ?? '').trim();
  const cleanEmail = String(email ?? '').trim().toLowerCase();
  const errors = {};
  if (!cleanName) errors.name = 'Name is required.';
  else if (cleanName.length > 60) errors.name = 'Use 60 characters or fewer.';
  if (!cleanEmail) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(cleanEmail)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  else if (!PASSWORD_RE.test(password)) errors.password = 'Use at least 8 characters, with a letter and a number.';
  if (acceptTerms !== true) errors.acceptTerms = 'You need to accept the terms to continue.';
  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fieldErrors: errors });
  }
  if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return res.status(409).json({
      error: 'An account with this email already exists.',
      fieldErrors: { email: 'This email is already registered. Try signing in.' },
    });
  }

  // Username from the email's local part, made unique with a number if needed.
  const base = (cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') || 'brewer').padEnd(3, '0').slice(0, 16);
  let username = base;
  for (let n = 2; db.users.some((u) => u.username === username); n++) username = `${base}${n}`;

  const user = {
    id: `u${db.nextUserId++}`,
    email: cleanEmail,
    password,
    name: cleanName,
    username,
    phone: '',
    address: { street: '', city: '', region: '', postalCode: '' },
    appearance: 'light',
    notifications: {
      orderUpdates: true,
      promotions: false,
      newArrivals: false,
      channels: { email: true, sms: false, push: false },
    },
  };
  db.users.push(user);
  db.favorites[user.id] = [];

  const token = crypto.randomUUID();
  sessions.set(token, user.id);
  res.status(201).json({ token, user: publicUser(user) });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  sessions.delete(req.token);
  res.status(204).end();
});

app.post('/api/auth/forgot-password', (req, res) => {
  const email = String(req.body?.email ?? '').trim();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  // Same response whether or not the account exists, so emails can't be probed.
  res.json({ message: 'If an account exists for that email, a reset link is on its way. Check your inbox.' });
});

// Profile
app.get('/api/me', requireAuth, (req, res) => res.json(publicUser(req.user)));

app.put('/api/me', requireAuth, (req, res) => {
  const body = req.body ?? {};
  const errors = validateProfile(body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fieldErrors: errors });
  }
  const user = req.user;
  if (body.username !== undefined) user.username = body.username;
  if (body.phone !== undefined) user.phone = body.phone.trim();
  if (body.appearance !== undefined) user.appearance = body.appearance;
  if (body.address) {
    user.address = {
      street: body.address.street?.trim() ?? '',
      city: body.address.city?.trim() ?? '',
      region: body.address.region?.trim() ?? '',
      postalCode: body.address.postalCode?.trim() ?? '',
    };
  }
  if (body.notifications) {
    const n = body.notifications;
    user.notifications = {
      orderUpdates: Boolean(n.orderUpdates),
      promotions: Boolean(n.promotions),
      newArrivals: Boolean(n.newArrivals),
      channels: {
        email: Boolean(n.channels?.email),
        sms: Boolean(n.channels?.sms),
        push: Boolean(n.channels?.push),
      },
    };
  }
  res.json(publicUser(user));
});

// Catalog
app.get('/api/categories', (req, res) => res.json(CATEGORIES));

app.get('/api/products', (req, res) => {
  const q = String(req.query.q ?? '').trim().toLowerCase();
  const category = String(req.query.category ?? 'all');
  let list = db.products;
  if (category !== 'all') list = list.filter((p) => p.category === category);
  if (q) {
    list = list.filter((p) => `${p.name} ${p.subtitle} ${p.description}`.toLowerCase().includes(q));
  }
  if (req.query.popular === 'true') list = list.filter((p) => p.popular);
  res.json(list.map((p) => ({ ...p, inStock: p.inStock !== false })));
});

app.get('/api/products/:id', (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json({ ...product, inStock: product.inStock !== false });
});

// Favorites
app.get('/api/favorites', requireAuth, (req, res) => {
  const ids = db.favorites[req.user.id] ?? [];
  res.json(ids.map(findProduct).filter(Boolean).map((p) => ({ ...p, inStock: p.inStock !== false })));
});

app.put('/api/favorites/:productId', requireAuth, (req, res) => {
  if (!findProduct(req.params.productId)) return res.status(404).json({ error: 'Product not found.' });
  const ids = (db.favorites[req.user.id] ??= []);
  if (!ids.includes(req.params.productId)) ids.push(req.params.productId);
  res.status(204).end();
});

app.delete('/api/favorites/:productId', requireAuth, (req, res) => {
  db.favorites[req.user.id] = (db.favorites[req.user.id] ?? []).filter((id) => id !== req.params.productId);
  res.status(204).end();
});

// Cart
app.get('/api/cart', requireAuth, (req, res) => res.json(cartView(req.user.id)));

app.post('/api/cart/items', requireAuth, (req, res) => {
  const { productId, quantity = 1 } = req.body ?? {};
  const product = findProduct(productId);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  if (product.inStock === false) return res.status(409).json({ error: 'This item is out of stock.' });
  if (!isValidQuantity(quantity)) return res.status(400).json({ error: `Quantity must be 1–${MAX_QUANTITY}.` });

  let grind = null;
  let size = null;
  if (product.options) {
    grind = req.body.grind ?? product.options.grinds[0].id;
    size = req.body.size ?? product.options.sizes[0].id;
    if (!optionLabel(product, 'grinds', grind) || !optionLabel(product, 'sizes', size)) {
      return res.status(400).json({ error: 'Invalid grind or size.' });
    }
  }

  const cart = getCart(req.user.id);
  const existing = cart.items.find((i) => i.productId === productId && i.grind === grind && i.size === size);
  if (existing) {
    if (existing.quantity + quantity > MAX_QUANTITY) {
      return res.status(400).json({ error: `You can add up to ${MAX_QUANTITY} of an item.` });
    }
    existing.quantity += quantity;
  } else {
    cart.items.push({ id: `ci${db.nextCartItemId++}`, productId, grind, size, quantity });
  }
  res.status(201).json(cartView(req.user.id));
});

app.patch('/api/cart/items/:itemId', requireAuth, (req, res) => {
  const item = getCart(req.user.id).items.find((i) => i.id === req.params.itemId);
  if (!item) return res.status(404).json({ error: 'Cart item not found.' });
  const { quantity } = req.body ?? {};
  if (!isValidQuantity(quantity)) return res.status(400).json({ error: `Quantity must be 1–${MAX_QUANTITY}.` });
  item.quantity = quantity;
  res.json(cartView(req.user.id));
});

app.delete('/api/cart/items/:itemId', requireAuth, (req, res) => {
  const cart = getCart(req.user.id);
  cart.items = cart.items.filter((i) => i.id !== req.params.itemId);
  res.json(cartView(req.user.id));
});

app.post('/api/cart/promo', requireAuth, (req, res) => {
  const code = String(req.body?.code ?? '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'Enter a promo code.' });
  if (!db.promoCodes[code]) return res.status(400).json({ error: 'That promo code isn’t valid.' });
  getCart(req.user.id).promoCode = code;
  res.json(cartView(req.user.id));
});

app.delete('/api/cart/promo', requireAuth, (req, res) => {
  getCart(req.user.id).promoCode = null;
  res.json(cartView(req.user.id));
});

app.patch('/api/cart', requireAuth, (req, res) => {
  const { delivery } = req.body ?? {};
  if (!SHIPPING[delivery]) return res.status(400).json({ error: 'Delivery must be standard or express.' });
  getCart(req.user.id).delivery = delivery;
  res.json(cartView(req.user.id));
});

// Orders
app.post('/api/orders', requireAuth, (req, res) => {
  const cart = cartView(req.user.id);
  if (cart.items.length === 0) return res.status(400).json({ error: 'Your cart is empty.' });
  if (!hasAddress(req.user)) {
    return res.status(400).json({ error: 'Add a shipping address in your profile before placing an order.' });
  }
  const { errors, number } = validatePayment(req.body?.payment);
  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Please fix the payment details.', fieldErrors: errors });
  }
  if (number === DECLINED_CARD) {
    return res.status(402).json({ error: 'Your card was declined. Try a different card.' });
  }
  const order = {
    id: `BB-${db.nextOrderNumber++}`,
    userId: req.user.id,
    createdAt: new Date().toISOString(),
    shippingAddress: { name: req.user.name, ...req.user.address },
    cardLast4: number.slice(-4),
    ...cart,
  };
  db.orders.push(order);
  db.carts[req.user.id] = { items: [], promoCode: null, delivery: 'standard' };
  res.status(201).json(order);
});

app.get('/api/orders/:id', requireAuth, (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json(order);
});

// Test support: restore seed data and sign everyone out.
app.post('/api/test/reset', (req, res) => {
  db = createSeed();
  sessions.clear();
  res.status(204).end();
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

app.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}`);
});
