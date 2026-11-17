import { formatMoney } from '../api.js';
import { tid } from '../testid.js';

export default function OrderSummary({ totals }) {
  return (
    <dl className="summary" {...tid('cart-summary')}>
      <dt>Subtotal</dt>
      <dd {...tid('summary-subtotal')}>{formatMoney(totals.subtotal)}</dd>
      {totals.discount > 0 && (
        <>
          <dt>Discount ({totals.promoCode})</dt>
          <dd className="ok-text" {...tid('summary-discount')}>
            −{formatMoney(totals.discount)}
          </dd>
        </>
      )}
      <dt>Shipping ({totals.delivery})</dt>
      <dd {...tid('summary-shipping')}>{totals.shipping === 0 ? 'Free' : formatMoney(totals.shipping)}</dd>
      <dt>Estimated tax</dt>
      <dd {...tid('summary-tax')}>{formatMoney(totals.tax)}</dd>
      <dt className="total">Total</dt>
      <dd className="total" {...tid('summary-total')}>
        {formatMoney(totals.total)}
      </dd>
    </dl>
  );
}
