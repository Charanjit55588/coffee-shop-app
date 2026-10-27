import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatMoney } from '../api.js';
import { useApp } from '../AppContext.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import { Loading, ProductImage, Stepper } from '../components/common.jsx';

export default function Cart() {
  const { setCartCount } = useApp();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [promo, setPromo] = useState('');
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    api.cart().then(setCart).catch((err) => setError(err.message));
  }, []);

  async function run(action) {
    setBusy(true);
    setError('');
    try {
      const next = await action();
      setCart(next);
      setCartCount(next.itemCount);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function applyPromo(e) {
    e.preventDefault();
    setPromoError('');
    setBusy(true);
    try {
      const next = await api.applyPromo(promo);
      setCart(next);
      setPromo('');
    } catch (err) {
      setPromoError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!cart && !error) return <Loading label="Loading cart…" />;

  return (
    <main className="page" data-testid="screen-cart">
      <div className="row-between baseline">
        <h1 className="h1-lg">Cart</h1>
        {cart && (
          <span className="muted" data-testid="cart-count">
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {error && (
        <p className="alert alert-error" role="alert" data-testid="cart-error">
          {error}
        </p>
      )}

      {cart && cart.items.length === 0 && (
        <div className="empty" data-testid="cart-empty">
          <p>Your cart is empty.</p>
          <Link to="/" className="link-strong" data-testid="cart-browse">
            Start shopping
          </Link>
        </div>
      )}

      {cart && cart.items.length > 0 && (
        <>
          <ul className="list" data-testid="cart-list">
            {cart.items.map((item) => (
              <li key={item.id} className="list-row align-start" data-testid={`cart-item-${item.productId}`}>
                <ProductImage product={{ ...item, id: item.productId }} className="thumb" />
                <div className="grow stack-xs min0">
                  <div className="row-between gap-8">
                    <Link to={`/products/${item.productId}`} className="item-title plain">
                      {item.name}
                    </Link>
                    <span className="item-price" data-testid={`cart-line-total-${item.productId}`}>
                      {formatMoney(item.lineTotal)}
                    </span>
                  </div>
                  <span className="card-sub" data-testid={`cart-item-options-${item.productId}`}>
                    {[item.sizeLabel, item.grindLabel].filter(Boolean).join(' · ') || item.subtitle}
                    {item.quantity > 1 && ` · ${formatMoney(item.unitPrice)} each`}
                  </span>
                  <div className="row-between">
                    <Stepper
                      small
                      value={item.quantity}
                      onChange={(q) => run(() => api.updateCartItem(item.id, q))}
                      label={`Quantity for ${item.name}`}
                      testIdPrefix={`cart-qty-${item.productId}`}
                      disabled={busy}
                    />
                    <button
                      type="button"
                      className="link-btn danger"
                      onClick={() => run(() => api.removeCartItem(item.id))}
                      disabled={busy}
                      data-testid={`cart-remove-${item.productId}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {cart.promoCode ? (
            <div className="row-between promo-applied" data-testid="promo-applied">
              <span>
                Promo <b data-testid="promo-applied-code">{cart.promoCode}</b> applied
              </span>
              <button
                type="button"
                className="link-btn"
                onClick={() => run(() => api.removePromo())}
                disabled={busy}
                data-testid="promo-remove"
              >
                Remove
              </button>
            </div>
          ) : (
            <form className="field" onSubmit={applyPromo} noValidate data-testid="promo-form">
              <label htmlFor="promo-code">Promo code</label>
              <div className="row gap-8">
                <input
                  id="promo-code"
                  className={`input grow ${promoError ? 'invalid' : ''}`}
                  placeholder="e.g. BREW10"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  aria-invalid={Boolean(promoError)}
                  aria-describedby={promoError ? 'promo-error' : undefined}
                  data-testid="promo-code"
                />
                <button type="submit" className="btn btn-outline" disabled={busy} data-testid="promo-apply">
                  Apply
                </button>
              </div>
              {promoError && (
                <p id="promo-error" className="field-error" data-testid="promo-error">
                  {promoError}
                </p>
              )}
            </form>
          )}

          <OrderSummary totals={cart} />

          <Link to="/checkout" className="btn btn-primary" data-testid="cart-checkout">
            Proceed to checkout
          </Link>
        </>
      )}
    </main>
  );
}
