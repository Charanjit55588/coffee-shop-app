import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useApp } from '../AppContext.jsx';
import { BackIcon, BagIcon, HeartIcon, HomeIcon, UserIcon } from './Icons.jsx';
import ProductArt from './ProductArt.jsx';

// Uses the product's photo when it has one, otherwise a drawn illustration.
export function ProductImage({ product, className = '', testId }) {
  return (
    <span className={`ph ${className}`} role="img" aria-label={product.name} data-testid={testId}>
      {product.image ? <img src={product.image} alt="" /> : <ProductArt product={product} />}
    </span>
  );
}

export function BackLink({ to, label, testId }) {
  return (
    <Link to={to} className="icon-btn" aria-label={label} data-testid={testId}>
      <BackIcon size={22} />
    </Link>
  );
}

export function FavoriteButton({ product, className = '', testId }) {
  const { favoriteIds, toggleFavorite } = useApp();
  const [busy, setBusy] = useState(false);
  const isFavorite = favoriteIds.has(product.id);

  async function onClick() {
    setBusy(true);
    try {
      await toggleFavorite(product.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`icon-btn fav-btn ${isFavorite ? 'is-on' : ''} ${className}`}
      aria-label={isFavorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
      aria-pressed={isFavorite}
      disabled={busy}
      onClick={onClick}
      data-testid={testId}
    >
      <HeartIcon size={20} filled={isFavorite} />
    </button>
  );
}

export function Stepper({ value, onChange, min = 1, max = 10, label, testIdPrefix, disabled, small }) {
  return (
    <div role="group" aria-label={label} className={`stepper ${small ? 'stepper-sm' : ''}`}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        data-testid={`${testIdPrefix}-decrease`}
      >
        −
      </button>
      <span aria-live="polite" data-testid={`${testIdPrefix}-value`}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        data-testid={`${testIdPrefix}-increase`}
      >
        +
      </button>
    </div>
  );
}

// A short-lived message. Changing `message` (with a new `id`) shows it again.
export function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  if (!toast) return null;
  return (
    <div className="toast" role="status" data-testid="toast">
      <span data-testid="toast-message">{toast.message}</span>
      {toast.action}
    </div>
  );
}

export function Loading({ label = 'Loading…' }) {
  return (
    <p className="muted center pad" role="status" data-testid="loading">
      {label}
    </p>
  );
}

export function TabBar() {
  const { cartCount } = useApp();
  const tabs = [
    { to: '/', label: 'Home', icon: HomeIcon, id: 'home', end: true },
    { to: '/favorites', label: 'Favorites', icon: HeartIcon, id: 'favorites' },
    { to: '/cart', label: 'Cart', icon: BagIcon, id: 'cart' },
    { to: '/profile', label: 'Profile', icon: UserIcon, id: 'profile' },
  ];
  return (
    <nav aria-label="Main" className="tabbar" data-testid="tab-bar">
      {tabs.map(({ to, label, icon: TabIcon, id, end }) => (
        <NavLink key={id} to={to} end={end} className="tab" data-testid={`tab-${id}`}>
          {({ isActive }) => (
            <>
              <TabIcon size={24} filled={isActive && id === 'favorites'} />
              {label}
              {id === 'cart' && cartCount > 0 && (
                <span className="badge" data-testid="cart-badge" aria-label={`${cartCount} items in cart`}>
                  {cartCount}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
