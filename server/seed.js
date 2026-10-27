// Seed data for the mock backend. Every reset (and every server start)
// rebuilds state from here, so tests always begin from the same data.

const BEAN_OPTIONS = {
  grinds: [
    { id: 'whole-bean', label: 'Whole bean' },
    { id: 'drip', label: 'Drip' },
    { id: 'espresso', label: 'Espresso' },
  ],
  sizes: [
    { id: '250g', label: '250 g' },
    { id: '500g', label: '500 g' },
    { id: '1kg', label: '1 kg' },
  ],
};

export const CATEGORIES = [
  { id: 'roasted', label: 'Roasted beans' },
  { id: 'unroasted', label: 'Green (unroasted)' },
  { id: 'tumblers', label: 'Tumblers' },
  { id: 'mugs', label: 'Mugs' },
  { id: 'cups', label: 'Cups' },
  { id: 'brewing', label: 'Brewing gear' },
];

// Prices are in cents.
const PRODUCTS = [
  {
    id: 'ethiopia-yirgacheffe',
    name: 'Ethiopia Yirgacheffe',
    category: 'roasted',
    subtitle: 'Light roast · whole bean',
    price: 1800,
    popular: true,
    description: 'Bright and floral with notes of jasmine, lemon and black tea. Roasted weekly in small batches.',
    options: BEAN_OPTIONS,
  },
  {
    id: 'colombia-supremo',
    name: 'Colombia Supremo',
    category: 'roasted',
    subtitle: 'Medium roast · whole bean',
    price: 1600,
    description: 'Balanced and sweet with caramel, red apple and a smooth chocolate finish.',
    options: BEAN_OPTIONS,
  },
  {
    id: 'sumatra-mandheling',
    name: 'Sumatra Mandheling',
    category: 'roasted',
    subtitle: 'Dark roast · whole bean',
    price: 1700,
    popular: true,
    description: 'Full-bodied and earthy with cedar, dark cocoa and low acidity.',
    options: BEAN_OPTIONS,
  },
  {
    id: 'house-espresso-blend',
    name: 'House Espresso Blend',
    category: 'roasted',
    subtitle: 'Medium-dark roast · blend',
    price: 1550,
    description: 'Our everyday espresso: syrupy body, toffee sweetness and a hazelnut finish.',
    options: BEAN_OPTIONS,
  },
  {
    id: 'brazil-santos-green',
    name: 'Brazil Santos Green',
    category: 'unroasted',
    subtitle: 'Unroasted · 1 lb',
    price: 1200,
    popular: true,
    description: 'Green coffee for home roasting. Nutty and mild, forgiving for first-time roasters.',
  },
  {
    id: 'guatemala-huehuetenango-green',
    name: 'Guatemala Huehuetenango Green',
    category: 'unroasted',
    subtitle: 'Unroasted · 1 lb',
    price: 1350,
    description: 'High-altitude green coffee with stone fruit and brown sugar notes once roasted.',
  },
  {
    id: 'insulated-tumbler',
    name: 'Insulated Tumbler',
    category: 'tumblers',
    subtitle: '16 oz · stainless steel',
    price: 2400,
    popular: true,
    description: 'Double-wall vacuum insulation keeps coffee hot for 6 hours. Fits most cup holders.',
  },
  {
    id: 'travel-tumbler',
    name: 'Travel Tumbler',
    category: 'tumblers',
    subtitle: '12 oz · leak-proof lid',
    price: 2000,
    description: 'Slim, leak-proof tumbler with a one-hand flip lid for commutes.',
  },
  {
    id: 'ceramic-mug',
    name: 'Ceramic Mug',
    category: 'mugs',
    subtitle: '12 oz · matte white',
    price: 1400,
    description: 'A heavy stoneware mug with a matte glaze and a comfortable wide handle.',
  },
  {
    id: 'double-wall-glass-mug',
    name: 'Double-Wall Glass Mug',
    category: 'mugs',
    subtitle: '8 oz · borosilicate glass',
    price: 1800,
    description: 'Shows off your latte layers while keeping your hands cool.',
  },
  {
    id: 'paper-coffee-cups',
    name: 'Paper Coffee Cups',
    category: 'cups',
    subtitle: '8 oz · pack of 50',
    price: 900,
    description: 'Compostable paper cups with lids, for office pots and events.',
  },
  {
    id: 'espresso-cup-set',
    name: 'Espresso Cup Set',
    category: 'cups',
    subtitle: '2.5 oz · set of 4',
    price: 2200,
    description: 'Thick-walled porcelain demitasse cups with saucers.',
  },
  {
    id: 'pour-over-dripper',
    name: 'Pour-Over Dripper',
    category: 'brewing',
    subtitle: 'Ceramic · size 02',
    price: 2600,
    description: 'A classic cone dripper for clean, bright single cups.',
  },
  {
    id: 'hand-grinder',
    name: 'Hand Grinder',
    category: 'brewing',
    subtitle: 'Steel burrs · adjustable',
    price: 4800,
    inStock: false,
    description: 'Precise conical burrs with 30 click settings. Back in stock soon.',
  },
];

// Demo accounts. These are fake test credentials for this local demo app only.
const USERS = [
  {
    id: 'u1',
    email: 'demo@beanbrew.test',
    password: 'Password123!',
    name: 'Alex Morgan',
    username: 'alexbrews',
    phone: '',
    address: { street: '123 Roast Lane', city: 'Toronto', region: 'ON', postalCode: 'M5V 2T6' },
    appearance: 'light',
    notifications: {
      orderUpdates: true,
      promotions: false,
      newArrivals: true,
      channels: { email: true, sms: false, push: true },
    },
  },
  {
    id: 'u2',
    email: 'noaddress@beanbrew.test',
    password: 'Password123!',
    name: 'Sam Lee',
    username: 'samlee',
    phone: '',
    address: { street: '', city: '', region: '', postalCode: '' },
    appearance: 'light',
    notifications: {
      orderUpdates: true,
      promotions: false,
      newArrivals: false,
      channels: { email: true, sms: false, push: false },
    },
  },
  {
    id: 'u3',
    email: 'locked@beanbrew.test',
    password: 'Password123!',
    name: 'Jordan Locked',
    username: 'jordanlocked',
    locked: true,
    phone: '',
    address: { street: '', city: '', region: '', postalCode: '' },
    appearance: 'light',
    notifications: {
      orderUpdates: true,
      promotions: false,
      newArrivals: false,
      channels: { email: true, sms: false, push: false },
    },
  },
];

const PROMO_CODES = {
  BREW10: { percentOff: 10 },
  WELCOME20: { percentOff: 20 },
};

export function createSeed() {
  const db = structuredClone({
    products: PRODUCTS,
    users: USERS,
    promoCodes: PROMO_CODES,
    favorites: { u1: ['ethiopia-yirgacheffe', 'ceramic-mug'], u2: [], u3: [] },
    carts: {},
    orders: [],
  });
  db.nextUserId = USERS.length + 1;
  db.nextOrderNumber = 100001;
  db.nextCartItemId = 1;
  return db;
}
