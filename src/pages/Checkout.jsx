import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api, formatMoney } from '../api.js';
import { useApp } from '../AppContext.jsx';
import { BackLink, Loading } from '../components/common.jsx';
import { tid } from '../testid.js';

const DELIVERY = [
  { id: 'standard', label: 'Standard', eta: '3–5 days', price: 'Free over $75, else $5.00' },
  { id: 'express', label: 'Express', eta: '1–2 days', price: '$12.00' },
];

function formatCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export default function Checkout() {
  const { user, setCartCount } = useApp();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvc: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.cart().then(setCart).catch((err) => setError(err.message));
  }, []);

  if (!cart) {
    if (!error) return <Loading label="Loading checkout…" />;
    return (
      <main className="page page-no-tabs" {...tid('screen-checkout')}>
        <BackLink to="/cart" label="Back to cart" testId="checkout-back" />
        <p className="alert alert-error" role="alert" {...tid('checkout-error')}>
          {error}
        </p>
      </main>
    );
  }
  if (cart.items.length === 0) return <Navigate to="/cart" replace />;

  const a = user.address;
  const hasAddress = Boolean(a.street && a.city && a.region && a.postalCode);

  async function chooseDelivery(id) {
    try {
      setCart(await api.setDelivery(id));
    } catch (err) {
      setError(err.message);
    }
  }

  function setField(name, value) {
    setPayment((p) => ({ ...p, [name]: value }));
    setFieldErrors((errs) => ({ ...errs, [name]: undefined }));
  }

  async function placeOrder(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      const order = await api.placeOrder(payment);
      setCartCount(0);
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors);
      setSubmitting(false);
    }
  }

  // Each card input uses its test ID as its id (see testid.js).
  const inputProps = (name, testId) => ({
    ...tid(testId),
    className: `input ${fieldErrors[name] ? 'invalid' : ''}`,
    value: payment[name],
    'aria-invalid': Boolean(fieldErrors[name]),
    'aria-describedby': fieldErrors[name] ? `${testId}-error` : undefined,
  });
  const fieldError = (name, testId) =>
    fieldErrors[name] && (
      <p className="field-error" {...tid(testId)}>
        {fieldErrors[name]}
      </p>
    );

  return (
    <main className="page page-no-tabs" {...tid('screen-checkout')}>
      <div className="row gap-12">
        <BackLink to="/cart" label="Back to cart" testId="checkout-back" />
        <h1 className="h1">Checkout</h1>
      </div>

      <section aria-labelledby="ship-h" className="stack-sm">
        <div className="row-between baseline">
          <h2 id="ship-h" className="h3">
            Shipping address
          </h2>
          <Link to="/profile/personal" className="link-strong tap" {...tid('checkout-edit-address')}>
            {hasAddress ? 'Edit' : 'Add address'}
          </Link>
        </div>
        {hasAddress ? (
          <div className="boxed" {...tid('checkout-address')}>
            <b>{user.name}</b>
            <br />
            {a.street}
            <br />
            {a.city}, {a.region} {a.postalCode}
          </div>
        ) : (
          <p className="alert alert-warning" {...tid('checkout-address-missing')}>
            No shipping address yet. Add one in your profile to place an order.
          </p>
        )}
      </section>

      <fieldset className="stack-sm" {...tid('checkout-delivery')}>
        <legend className="h3 legend">Delivery</legend>
        {DELIVERY.map((d) => (
          <label key={d.id} className={`radio-card ${cart.delivery === d.id ? 'is-on' : ''}`}>
            <input
              type="radio"
              name="delivery"
              value={d.id}
              checked={cart.delivery === d.id}
              onChange={() => chooseDelivery(d.id)}
              {...tid(`delivery-${d.id}`)}
            />
            <span className="grow">
              <b>{d.label}</b> · {d.eta}
            </span>
            <span className="muted small">{d.price}</span>
          </label>
        ))}
      </fieldset>

      <form className="stack" onSubmit={placeOrder} noValidate {...tid('payment-form')}>
        <h2 className="h3">Payment</h2>
        <div className="field">
          <label htmlFor="card-number">Card number</label>
          <input
            {...inputProps('cardNumber', 'card-number')}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            onChange={(e) => setField('cardNumber', formatCardNumber(e.target.value))}
          />
          {fieldError('cardNumber', 'card-number-error')}
        </div>
        <div className="grid">
          <div className="field">
            <label htmlFor="card-expiry">Expiry</label>
            <input
              {...inputProps('expiry', 'card-expiry')}
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              onChange={(e) => setField('expiry', formatExpiry(e.target.value))}
            />
            {fieldError('expiry', 'card-expiry-error')}
          </div>
          <div className="field">
            <label htmlFor="card-cvc">CVC</label>
            <input
              {...inputProps('cvc', 'card-cvc')}
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              maxLength={4}
              onChange={(e) => setField('cvc', e.target.value.replace(/\D/g, ''))}
            />
            {fieldError('cvc', 'card-cvc-error')}
          </div>
        </div>
        <p className="muted small">Demo app: payments are simulated and no real card is charged.</p>

        {error && (
          <p className="alert alert-error" role="alert" {...tid('checkout-error')}>
            {error}
          </p>
        )}

        <div className="row-between total-row">
          <span>Total</span>
          <span {...tid('checkout-total')}>{formatMoney(cart.total)}</span>
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting} {...tid('place-order')}>
          {submitting ? 'Placing order…' : 'Place order'}
        </button>
      </form>
    </main>
  );
}
