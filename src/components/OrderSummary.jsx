import { formatMoney } from '../api.js';

export default function OrderSummary({ totals }) {
  return (
    <dl className="summary" data-testid="cart-summary">
      <dt>Subtotal</dt>
      <dd data-testid="summary-subtotal">{formatMoney(totals.subtotal)}</dd>
      {totals.discount > 0 && (
        <>
          <dt>Discount ({totals.promoCode})</dt>
          <dd className="ok-text" data-testid="summary-discount">
            −{formatMoney(totals.discount)}
          </dd>
        </>
      )}
      <dt>Shipping ({totals.delivery})</dt>
      <dd data-testid="summary-shipping">{totals.shipping === 0 ? 'Free' : formatMoney(totals.shipping)}</dd>
      <dt>Estimated tax</dt>
      <dd data-testid="summary-tax">{formatMoney(totals.tax)}</dd>
      <dt className="total">Total</dt>
      <dd className="total" data-testid="summary-total">
        {formatMoney(totals.total)}
      </dd>
    </dl>
  );
}
