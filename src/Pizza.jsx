import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Pizza.css';
import {
  SHOPS,
  INITIAL_ORDERS,
  ROAM_HQ,
  OFFICE_CREDITS_CENTS,
  shopById,
  menuFor,
  formatPrice,
  STATUS_LABEL,
} from './pizzaData';

const NAV_ITEMS = [
  { key: 'nearby', label: 'Nearby', icon: PinIcon },
  { key: 'favorites', label: 'Favorites', icon: StarIcon },
  { key: 'cart', label: 'Cart', icon: BagIcon },
  { key: 'orders', label: 'Orders', icon: ReceiptIcon },
];

function PinIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 8.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 14s5-3.6 5-7.25A5 5 0 0 0 3 6.75C3 10.4 8 14 8 14Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ filled = false }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2.4l1.6 3.24 3.58.52-2.59 2.52.61 3.56L8 10.76 4.8 12.24l.61-3.56L2.82 6.16l3.58-.52L8 2.4Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4.5 5.5h7l.7 7.2a1 1 0 0 1-1 1.1H4.8a1 1 0 0 1-1-1.1l.7-7.2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M6 5.5V4.4A2 2 0 0 1 8 2.5c1.1 0 2 .9 2 1.9v1.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 2.5h8v11l-1.2-.8-1.3.8-1.5-.8-1.5.8-1.3-.8L4 13.5v-11Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M6 5.5h4M6 8h4M6 10.5h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.5 10.5 13.2 13.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M8 5.5V8l1.6 1.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function StarSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.8 9.4 6l3.4.5-2.46 2.52.61 3.48L8 10.86 4.95 12.5l.61-3.48L3.1 6.5 6.5 6 8 2.8Z" fill="currentColor" />
    </svg>
  );
}

function BikeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="4.25" cy="11" r="2.25" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="11.75" cy="11" r="2.25" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4.25 11 7 6.5h3.2L11.75 11M7 6.5 8.2 4h2.1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LocateIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 2.5v1.75M8 11.75V13.5M2.5 8h1.75M11.75 8H13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function PizzaArt({ variant = 'pepperoni' }) {
  const toppings = {
    pepperoni: ['#c23b22', [[48, 28], [72, 34], [54, 48], [68, 54], [44, 52]]],
    'pepperoni-pie': ['#c23b22', [[46, 30], [70, 32], [58, 46], [44, 50], [72, 52]]],
    margherita: ['#3d8b5a', [[50, 32], [70, 42], [52, 52]]],
    vodka: ['#d97a5a', [[50, 34], [68, 30], [58, 50], [42, 46]]],
    grandma: ['#c23b22', [[44, 32], [62, 30], [76, 40], [50, 52], [68, 54]]],
    square: ['#c23b22', [[44, 30], [60, 30], [76, 30], [44, 46], [60, 46], [76, 46], [52, 54], [68, 54]]],
    classic: ['#f0c56e', [[50, 34], [66, 38], [54, 50]]],
    coal: ['#8a2a1a', [[48, 32], [70, 36], [56, 50], [42, 48]]],
    knots: ['#c4a06a', [[46, 36], [62, 30], [72, 44], [52, 52]]],
    slice: ['#3d8b5a', [[52, 36], [66, 48]]],
  };
  const [color, dots] = toppings[variant] || toppings.pepperoni;
  const isSquare = variant === 'square' || variant === 'grandma';
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true">
      <rect width="120" height="80" fill="#161618" />
      {isSquare ? (
        <>
          <rect x="22" y="12" width="76" height="56" rx="6" fill="#c4a06a" />
          <rect x="26" y="16" width="68" height="48" rx="4" fill="#d9a441" />
          <rect x="30" y="20" width="60" height="40" rx="3" fill="#b8321a" />
          <rect x="32" y="22" width="56" height="36" rx="2" fill="#f0c56e" opacity="0.72" />
        </>
      ) : (
        <>
          <circle cx="60" cy="40" r="32" fill="#c4a06a" />
          <circle cx="60" cy="40" r="28" fill="#d9a441" />
          <circle cx="60" cy="40" r="24" fill="#b8321a" />
          <circle cx="60" cy="40" r="22" fill="#f0c56e" opacity="0.78" />
        </>
      )}
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={variant === 'knots' ? 6 : 5} fill={color} />
      ))}
    </svg>
  );
}

function Badge({ icon: Icon, label, tone }) {
  return (
    <span className={`pz-badge ${tone ? `pz-badge-${tone}` : ''}`}>
      {Icon && <Icon />}
      <span>{label}</span>
    </span>
  );
}

export default function Pizza({
  win,
  onDrag,
  initialNav = 'nearby',
  initialShopId = null,
  initialCart = [],
  initialAddress = null,
} = {}) {
  const [closing, setClosing] = useState(false);
  const [activeNav, setActiveNav] = useState(initialNav);
  const [shopId, setShopId] = useState(initialShopId);
  const [favorites, setFavorites] = useState(() => new Set(SHOPS.filter((s) => s.favorite).map((s) => s.id)));
  const [cart, setCart] = useState(initialCart);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [query, setQuery] = useState('');
  const [address, setAddress] = useState(initialAddress);
  const [addressDraft, setAddressDraft] = useState(initialAddress?.line ?? '');
  const [isCompact, setIsCompact] = useState(false);
  const winRef = useRef(null);

  useEffect(() => {
    if (!winRef.current) return;
    const el = winRef.current;
    const ro = new ResizeObserver((entries) => {
      setIsCompact(entries[0].contentRect.width < 780);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  useEffect(() => {
    if (win.closeRequestId) handleClose();
  }, [win.closeRequestId]);

  const commitAddress = (next) => {
    const line = (typeof next === 'string' ? next : next?.line ?? addressDraft).trim();
    if (!line) return;
    setAddress({
      label: typeof next === 'object' && next?.label ? next.label : line.split(',')[0],
      line,
    });
    setAddressDraft(line);
  };

  const shop = shopById(shopId);
  const cartCount = cart.reduce((n, l) => n + l.qty, 0);
  const cartTotal = cart.reduce((n, l) => n + l.priceCents * l.qty, 0);

  const q = query.trim().toLowerCase();
  const shops = useMemo(() => {
    const list = activeNav === 'favorites' ? SHOPS.filter((s) => favorites.has(s.id)) : SHOPS;
    if (!q) return list;
    return list.filter((s) => `${s.name} ${s.neighborhood} ${s.cuisine}`.toLowerCase().includes(q));
  }, [activeNav, favorites, q]);

  const menu = useMemo(() => {
    const list = shop ? menuFor(shop.id) : [];
    if (!q) return list;
    return list.filter((i) => `${i.name} ${i.description} ${i.category}`.toLowerCase().includes(q));
  }, [shop, q]);

  const filteredOrders = useMemo(() => {
    if (!q) return orders;
    return orders.filter((o) => {
      const s = shopById(o.shopId);
      return `${s?.name || ''} ${o.id} ${STATUS_LABEL[o.status]}`.toLowerCase().includes(q);
    });
  }, [orders, q]);

  const openShop = (id) => {
    setShopId(id);
    setActiveNav('menu');
    setQuery('');
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === item.id);
      if (existing) return prev.map((l) => (l.itemId === item.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { itemId: item.id, shopId: shop.id, name: item.name, priceCents: item.priceCents, image: item.image, qty: 1 }];
    });
  };

  const bumpCart = (itemId, delta) => {
    setCart((prev) => prev
      .map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + delta } : l))
      .filter((l) => l.qty > 0));
  };

  const checkout = () => {
    if (!cart.length) return;
    const firstShop = cart[0].shopId;
    const order = {
      id: `ord_${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      shopId: firstShop,
      status: 'preparing',
      items: cart.map((l) => ({ itemId: l.itemId, name: l.name, qty: l.qty, priceCents: l.priceCents })),
      totalCents: cartTotal,
      placedAt: new Date().toISOString(),
      etaMinutes: shopById(firstShop)?.etaMinutes || 30,
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setActiveNav('orders');
    setQuery('');
  };

  const headerLabel =
    activeNav === 'menu' ? (shop?.name || 'Menu') :
    activeNav === 'favorites' ? 'Favorites' :
    activeNav === 'cart' ? 'Cart' :
    activeNav === 'orders' ? 'Orders' :
    'Nearby';

  const isAddressView = activeNav === 'nearby' || activeNav === 'favorites';
  const needsAddress = !address && isAddressView;

  const searchPlaceholder =
    activeNav === 'menu' ? 'Search the menu' :
    activeNav === 'orders' ? 'Search orders' :
    'Search';

  const goNav = (key) => {
    setActiveNav(key);
    setQuery('');
    if (key !== 'menu') setShopId((id) => (key === 'nearby' ? null : id));
  };

  return (
    <div
      ref={winRef}
      className={`pz-win ${!win.isFocused ? 'pz-win-unfocused' : ''} ${closing ? 'pz-win-closing' : ''} ${isCompact ? 'pz-win-compact' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      <aside className="pz-sidebar" onMouseDown={onDrag}>
        <div className="pz-lights">
          <button
            type="button"
            aria-label="Close"
            className="unbutton pz-light pz-light-close"
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <span aria-hidden="true" className="pz-light pz-light-min" />
          <span aria-hidden="true" className="pz-light pz-light-max" />
        </div>
        <nav className="pz-nav">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`pz-nav-item ${(activeNav === key || (key === 'nearby' && activeNav === 'menu')) ? 'pz-nav-item-active' : ''}`}
              onClick={(e) => { e.stopPropagation(); goNav(key); }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Icon />
              <span>{label}</span>
              {key === 'cart' && cartCount > 0 && <span className="pz-nav-count">{cartCount}</span>}
            </button>
          ))}
        </nav>
        <div className="pz-credits">
          <span className="pz-credits-chip">{formatPrice(OFFICE_CREDITS_CENTS)} credits</span>
        </div>
      </aside>

      <main className="pz-main">
        <header className="pz-header" onMouseDown={onDrag}>
          <h1 className="pz-header-title">{headerLabel}</h1>
          <div className="pz-header-actions" onMouseDown={(e) => e.stopPropagation()}>
            {!needsAddress && activeNav !== 'cart' && (
              <label className={`pz-search ${isAddressView ? 'pz-search-address' : ''}`}>
                {isAddressView ? <PinIcon /> : <SearchIcon />}
                <input
                  type={isAddressView ? 'text' : 'search'}
                  value={isAddressView ? addressDraft : query}
                  onChange={(e) => (isAddressView ? setAddressDraft(e.target.value) : setQuery(e.target.value))}
                  onKeyDown={isAddressView ? (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (addressDraft.trim()) commitAddress(addressDraft);
                      else setAddressDraft(address.line);
                    }
                  } : undefined}
                  onBlur={isAddressView ? () => {
                    if (addressDraft.trim()) commitAddress(addressDraft);
                    else setAddressDraft(address.line);
                  } : undefined}
                  placeholder={isAddressView ? 'Street, city, or ZIP' : searchPlaceholder}
                  autoComplete={isAddressView ? 'street-address' : undefined}
                  aria-label={isAddressView ? 'Delivery address' : undefined}
                />
              </label>
            )}
            {activeNav === 'cart' ? (
              <button type="button" className="pz-cta" disabled={!cart.length} onClick={checkout}>
                <span>Checkout {cart.length ? formatPrice(cartTotal) : ''}</span>
              </button>
            ) : activeNav === 'menu' ? (
              <button type="button" className="pz-cta" onClick={() => goNav('cart')}>
                <BagIcon />
                <span>{cartCount ? `Cart · ${cartCount}` : 'Cart'}</span>
              </button>
            ) : null}
          </div>
        </header>

        {needsAddress ? (
          <div className="pz-welcome">
            <div className="pz-welcome-copy">
              <h2 className="pz-welcome-title">Where should we send it?</h2>
              <p className="pz-welcome-sub">Nearby shops appear once we have a delivery address.</p>
            </div>
            <form
              className="pz-welcome-form"
              onSubmit={(e) => {
                e.preventDefault();
                commitAddress(addressDraft);
              }}
            >
              <label className="pz-welcome-field">
                <button
                  type="button"
                  className="pz-welcome-locate"
                  aria-label="Use current location"
                  onClick={() => commitAddress({ label: 'Current location', line: ROAM_HQ.line })}
                >
                  <LocateIcon size={18} />
                </button>
                <input
                  type="text"
                  value={addressDraft}
                  onChange={(e) => setAddressDraft(e.target.value)}
                  placeholder="Enter delivery address"
                  autoComplete="street-address"
                  aria-label="Delivery address"
                />
                <button
                  type="submit"
                  className="pz-welcome-go"
                  disabled={!addressDraft.trim()}
                  aria-label="Find shops"
                >
                  <ArrowRightIcon />
                </button>
              </label>
            </form>
          </div>
        ) : activeNav === 'nearby' || activeNav === 'favorites' ? (
          shops.length === 0 ? (
            <div className="pz-empty">{activeNav === 'favorites' ? 'No favorites yet.' : 'No shops nearby.'}</div>
          ) : (
            <div className="pz-list">
              {shops.map((s) => (
                <div key={s.id} className="pz-card" onClick={() => openShop(s.id)}>
                  <div className="pz-thumb"><PizzaArt variant={s.image} /></div>
                  <div className="pz-card-info">
                    <div className="pz-card-title-row">
                      <span className="pz-card-name">{s.name}</span>
                      <span className="pz-card-sub">{s.neighborhood}</span>
                    </div>
                    <div className="pz-card-badges">
                      <Badge icon={ClockIcon} label={`${s.etaMinutes}m`} />
                      <Badge icon={StarSmallIcon} label={s.rating.toFixed(1)} />
                      <Badge
                        icon={BikeIcon}
                        label={s.isOpen ? (s.fulfillment === 'pickup' ? 'Pickup' : 'Delivery') : 'Closed'}
                        tone={s.isOpen ? 'live' : 'closed'}
                      />
                    </div>
                  </div>
                  <div className="pz-card-actions">
                    <button
                      type="button"
                      className={`pz-icon-btn ${favorites.has(s.id) ? 'pz-icon-btn-on' : ''}`}
                      aria-label={favorites.has(s.id) ? 'Unfavorite' : 'Favorite'}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(s.id); }}
                    >
                      <StarIcon filled={favorites.has(s.id)} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeNav === 'menu' ? (
          !shop ? (
            <div className="pz-empty">Pick a shop nearby.</div>
          ) : menu.length === 0 ? (
            <div className="pz-empty">Nothing on the menu matches.</div>
          ) : (
            <div className="pz-list">
              {menu.map((item) => (
                <div key={item.id} className="pz-card" onClick={() => addToCart(item)}>
                  <div className="pz-thumb"><PizzaArt variant={item.image} /></div>
                  <div className="pz-card-info">
                    <div className="pz-card-title-row">
                      <span className="pz-card-name">{item.name}</span>
                      <span className="pz-card-sub">{item.description}</span>
                    </div>
                    <div className="pz-card-badges">
                      <Badge label={item.category} />
                    </div>
                  </div>
                  <div className="pz-card-actions">
                    <span className="pz-price">{formatPrice(item.priceCents)}</span>
                    <button
                      type="button"
                      className="pz-add"
                      aria-label={`Add ${item.name}`}
                      onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeNav === 'cart' ? (
          cart.length === 0 ? (
            <div className="pz-empty">Cart is empty. Grab a slice nearby.</div>
          ) : (
            <div className="pz-list">
              {cart.map((line) => (
                <div key={line.itemId} className="pz-card">
                  <div className="pz-thumb"><PizzaArt variant={line.image} /></div>
                  <div className="pz-card-info">
                    <div className="pz-card-title-row">
                      <span className="pz-card-name">{line.name}</span>
                      <span className="pz-card-sub">{shopById(line.shopId)?.name}</span>
                    </div>
                    <div className="pz-card-badges">
                      <Badge label={formatPrice(line.priceCents)} />
                    </div>
                  </div>
                  <div className="pz-card-actions">
                    <div className="pz-qty">
                      <button type="button" className="pz-icon-btn" aria-label="Remove one" onClick={() => bumpCart(line.itemId, -1)}>
                        <MinusIcon />
                      </button>
                      <span className="pz-qty-n">{line.qty}</span>
                      <button type="button" className="pz-icon-btn" aria-label="Add one" onClick={() => bumpCart(line.itemId, 1)}>
                        <PlusIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          filteredOrders.length === 0 ? (
            <div className="pz-empty">No orders yet.</div>
          ) : (
            <div className="pz-list">
              {filteredOrders.map((order) => {
                const s = shopById(order.shopId);
                const count = order.items.reduce((n, i) => n + i.qty, 0);
                return (
                  <div key={order.id} className="pz-card">
                    <div className="pz-thumb"><PizzaArt variant={s?.image || 'pepperoni'} /></div>
                    <div className="pz-card-info">
                      <div className="pz-card-title-row">
                        <span className="pz-card-name">{s?.name}</span>
                        <span className="pz-card-sub">{order.id}</span>
                      </div>
                      <div className="pz-card-badges">
                        <Badge
                          icon={order.status === 'out_for_delivery' ? BikeIcon : ClockIcon}
                          label={STATUS_LABEL[order.status]}
                          tone={order.status === 'delivered' ? undefined : 'live'}
                        />
                        <Badge label={`${count} item${count === 1 ? '' : 's'}`} />
                        <Badge label={formatPrice(order.totalCents)} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>
    </div>
  );
}
