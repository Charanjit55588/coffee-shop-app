import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatMoney } from '../api.js';
import { useApp } from '../AppContext.jsx';
import { Loading, ProductImage, Toast } from '../components/common.jsx';
import { HeartIcon, PlusIcon } from '../components/Icons.jsx';
import { tid } from '../testid.js';

export default function Favorites() {
  const { toggleFavorite, setCartCount } = useApp();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const clearToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    api.favorites().then(setItems).catch((err) => setError(err.message));
  }, []);

  async function remove(product) {
    await toggleFavorite(product.id);
    setItems((list) => list.filter((p) => p.id !== product.id));
    setToast({ id: Date.now(), message: `Removed ${product.name} from favorites.` });
  }

  async function addToCart(product) {
    try {
      const cart = await api.addToCart({ productId: product.id, quantity: 1 });
      setCartCount(cart.itemCount);
      setToast({ id: Date.now(), message: `Added ${product.name} to your cart.` });
    } catch (err) {
      setToast({ id: Date.now(), message: err.message });
    }
  }

  return (
    <main className="page" {...tid('screen-favorites')}>
      <div className="row-between baseline">
        <h1 className="h1-lg">Favorites</h1>
        {items && (
          <span className="muted" {...tid('favorites-count')}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}
      {!items && !error && <Loading />}
      {items && items.length === 0 && (
        <div className="empty" {...tid('favorites-empty')}>
          <p>No favorites yet. Tap the heart on any product to save it here.</p>
          <Link to="/" className="link-strong" {...tid('favorites-browse')}>
            Browse products
          </Link>
        </div>
      )}
      {items && items.length > 0 && (
        <ul className="list" {...tid('favorites-list')}>
          {items.map((p) => (
            <li key={p.id} className="list-row" {...tid(`favorite-item-${p.id}`)}>
              <Link to={`/products/${p.id}`} className="list-main">
                <ProductImage product={p} className="thumb" />
                <span className="stack-xxs">
                  <span className="item-title">{p.name}</span>
                  <span className="card-sub">{p.subtitle}</span>
                  <span className="item-price">{formatMoney(p.price)}</span>
                </span>
              </Link>
              <button
                type="button"
                className="icon-btn fav-btn is-on fav-soft"
                aria-label={`Remove ${p.name} from favorites`}
                onClick={() => remove(p)}
                {...tid(`favorite-remove-${p.id}`)}
              >
                <HeartIcon size={20} filled />
              </button>
              <button
                type="button"
                className="icon-btn icon-btn-primary"
                aria-label={`Add ${p.name} to cart`}
                onClick={() => addToCart(p)}
                disabled={!p.inStock}
                {...tid(`favorite-add-to-cart-${p.id}`)}
              >
                <PlusIcon size={20} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Toast toast={toast} onDone={clearToast} />
    </main>
  );
}
