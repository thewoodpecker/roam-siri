// Slice-shaped mock. Later: GET /shops, GET /shops/:id/menu, POST /orders.
// Field names follow the partner API's shops + orders surface so a real
// client can drop in without renaming the UI.

export const SHOPS = [
  {
    id: 'shp_prince',
    name: 'Prince Street Pizza',
    slug: 'prince-street-pizza',
    neighborhood: 'Nolita',
    address: '27 Prince St',
    city: 'New York',
    rating: 4.8,
    reviewCount: 2140,
    etaMinutes: 28,
    fulfillment: 'delivery',
    isOpen: true,
    cuisine: 'Square slice',
    image: 'square',
    favorite: true,
  },
  {
    id: 'shp_joes',
    name: "Joe's Pizza",
    slug: 'joes-pizza-carmine',
    neighborhood: 'West Village',
    address: '7 Carmine St',
    city: 'New York',
    rating: 4.6,
    reviewCount: 3891,
    etaMinutes: 22,
    fulfillment: 'pickup',
    isOpen: true,
    cuisine: 'Classic NY',
    image: 'classic',
    favorite: true,
  },
  {
    id: 'shp_johns',
    name: "John's of Bleecker",
    slug: 'johns-of-bleecker',
    neighborhood: 'West Village',
    address: '278 Bleecker St',
    city: 'New York',
    rating: 4.7,
    reviewCount: 1566,
    etaMinutes: 35,
    fulfillment: 'delivery',
    isOpen: true,
    cuisine: 'Coal oven',
    image: 'coal',
    favorite: false,
  },
  {
    id: 'shp_scarrs',
    name: "Scarr's Pizza",
    slug: 'scarrs-pizza',
    neighborhood: 'Lower East Side',
    address: '35 Orchard St',
    city: 'New York',
    rating: 4.5,
    reviewCount: 980,
    etaMinutes: 40,
    fulfillment: 'delivery',
    isOpen: true,
    cuisine: 'Milled in-house',
    image: 'pepperoni',
    favorite: false,
  },
  {
    id: 'shp_lindustrie',
    name: "L'Industrie",
    slug: 'lindustrie-pizzeria',
    neighborhood: 'Williamsburg',
    address: '254 S 2nd St',
    city: 'Brooklyn',
    rating: 4.9,
    reviewCount: 1722,
    etaMinutes: 45,
    fulfillment: 'delivery',
    isOpen: false,
    cuisine: 'Italian',
    image: 'vodka',
    favorite: false,
  },
];

export const MENU = {
  shp_prince: [
    { id: 'itm_pepperoni_sq', name: 'Pepperoni Square', description: 'Cupped pepperoni, mozzarella, vodka sauce', category: 'Pizzas', priceCents: 600, image: 'square' },
    { id: 'itm_vodka_sq', name: 'Vodka Square', description: 'Vodka sauce, fresh mozzarella, pecorino', category: 'Pizzas', priceCents: 575, image: 'vodka' },
    { id: 'itm_sicilian', name: 'Sicilian', description: 'Thick crust, crushed tomato, oregano', category: 'Pizzas', priceCents: 550, image: 'grandma' },
    { id: 'itm_knots', name: 'Garlic Knots', description: 'Six knots, garlic oil, parsley', category: 'Sides', priceCents: 650, image: 'knots' },
    { id: 'itm_caesar', name: 'Caesar Salad', description: 'Romaine, pecorino, lemon, croutons', category: 'Sides', priceCents: 900, image: 'slice' },
  ],
  shp_joes: [
    { id: 'itm_joe_pep', name: 'Pepperoni', description: 'Classic fold, cupped pep, low-moisture mozz', category: 'Pizzas', priceCents: 450, image: 'pepperoni' },
    { id: 'itm_joe_cheese', name: 'Cheese', description: 'The move. Thin, charred, no fuss', category: 'Pizzas', priceCents: 375, image: 'classic' },
    { id: 'itm_joe_white', name: 'Fresh Mozz', description: 'Fresh mozzarella, basil, olive oil', category: 'Pizzas', priceCents: 500, image: 'margherita' },
    { id: 'itm_joe_garlic', name: 'Garlic Knots', description: 'Four knots, a lot of garlic', category: 'Sides', priceCents: 400, image: 'knots' },
  ],
  shp_johns: [
    { id: 'itm_johns_marg', name: 'Margherita', description: 'Coal blister, San Marzano, basil', category: 'Pizzas', priceCents: 2200, image: 'margherita' },
    { id: 'itm_johns_sausage', name: 'Sausage & Onion', description: 'Fennel sausage, sweet onion, coal char', category: 'Pizzas', priceCents: 2600, image: 'coal' },
    { id: 'itm_johns_pep', name: 'Pepperoni', description: 'Whole pie, coal oven, 18 inch', category: 'Pizzas', priceCents: 2400, image: 'pepperoni-pie' },
  ],
  shp_scarrs: [
    { id: 'itm_scarrs_pep', name: 'Pepperoni', description: 'In-house milled dough, cupped pep', category: 'Pizzas', priceCents: 500, image: 'pepperoni' },
    { id: 'itm_scarrs_white', name: 'White Slice', description: 'Ricotta, mozzarella, black pepper', category: 'Pizzas', priceCents: 475, image: 'classic' },
    { id: 'itm_scarrs_grandma', name: 'Grandma', description: 'Square, olive oil, garlic, tomato', category: 'Pizzas', priceCents: 525, image: 'grandma' },
  ],
  shp_lindustrie: [
    { id: 'itm_ind_burrata', name: 'Burrata & Honey', description: 'The one. Hot oil, basil, hot honey', category: 'Pizzas', priceCents: 700, image: 'vodka' },
    { id: 'itm_ind_pepperoni', name: 'Pepperoni', description: 'Cupped pep, mozzarella, chili oil', category: 'Pizzas', priceCents: 600, image: 'pepperoni' },
    { id: 'itm_ind_marg', name: 'Margherita', description: 'Tomato, mozzarella, basil', category: 'Pizzas', priceCents: 550, image: 'margherita' },
  ],
};

export const INITIAL_ORDERS = [
  {
    id: 'ord_01J8Q2K',
    shopId: 'shp_prince',
    status: 'out_for_delivery',
    items: [
      { itemId: 'itm_pepperoni_sq', name: 'Pepperoni Square', qty: 4, priceCents: 600 },
      { itemId: 'itm_knots', name: 'Garlic Knots', qty: 2, priceCents: 650 },
    ],
    totalCents: 3700,
    placedAt: '2026-09-02T11:04:00',
    etaMinutes: 14,
  },
  {
    id: 'ord_01J7N9C',
    shopId: 'shp_joes',
    status: 'delivered',
    items: [
      { itemId: 'itm_joe_pep', name: 'Pepperoni', qty: 6, priceCents: 450 },
      { itemId: 'itm_joe_cheese', name: 'Cheese', qty: 4, priceCents: 375 },
    ],
    totalCents: 4200,
    placedAt: '2026-08-28T13:22:00',
    etaMinutes: 0,
  },
];

export function shopById(id) {
  return SHOPS.find((s) => s.id === id) || null;
}

export function menuFor(shopId) {
  return MENU[shopId] || [];
}

export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export const STATUS_LABEL = {
  pending: 'Placed',
  preparing: 'Preparing',
  out_for_delivery: 'On the way',
  delivered: 'Delivered',
  canceled: 'Canceled',
};

export const ROAM_HQ = { label: 'Roam HQ', line: '434 Broadway, New York, NY' };
export const OFFICE_CREDITS_CENTS = 5000;
