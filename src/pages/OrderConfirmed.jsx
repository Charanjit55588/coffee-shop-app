import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatMoney } from '../api.js';
import { useApp } from '../AppContext.jsx';
import { Loading } from '../components/common.jsx';
import { CheckIcon } from '../components/Icons.jsx';

export default function OrderConfirmed() {
  const { id } = useParams();
  const { user } = useApp();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.order(id).then(setOrder).catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <main className="page" data-testid="screen-order-confirmed">
        <p className="alert alert-error" role="alert" data-testid="order-error">
          {error}
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </main>
    );
  }
  if (!order) return <Loading label="Loading order…" />;

  return (
    <main className="page center-col" data-testid="screen-order-confirmed">
      <div className="success-mark">
        <CheckIcon size={44} />
      </div>
      <div className="stack-sm center">
        <h1 className="h1-lg" data-testid="order-confirmed-title">
          Order placed!
        </h1>
        <p className="muted">Thanks, {user.name.split(' ')[0]}. A confirmation email is on its way.</p>
      </div>
      <dl className="summary stretch">
        <dt>Order number</dt>
        <dd className="strong" data-testid="order-number">
          #{order.id}
        </dd>
        <dt>Items</dt>
        <dd data-testid="order-items">{order.itemCount}</dd>
        <dt>Delivery</dt>
        <dd data-testid="order-delivery">{order.delivery === 'express' ? 'Express · 1–2 days' : 'Standard · 3–5 days'}</dd>
        <dt>Paid with</dt>
        <dd data-testid="order-card">Card ending {order.cardLast4}</dd>
        <dt className="total">Total paid</dt>
        <dd className="total" data-testid="order-total">
          {formatMoney(order.total)}
        </dd>
      </dl>
      <Link to="/" className="btn btn-primary stretch push-bottom" data-testid="continue-shopping">
        Continue shopping
      </Link>
    </main>
  );
}
