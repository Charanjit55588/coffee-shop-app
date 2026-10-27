import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatMoney } from '../api.js';
import { useApp } from '../AppContext.jsx';
import { BackLink, FavoriteButton, Loading, ProductImage, Stepper, Toast } from '../components/common.jsx';

const SIZE_MULTIPLIER = { '250g': 1, '500g': 1.8, '1kg': 3.4 };

function OptionGroup({ label, name, options, value, onChange }) {
  return (
    <div role="group" aria-labelledby={`${name}-label`} className="stack-sm">
      <span id={`${name}-label`} className="label">
        {label}
      </span>
      <div className="seg">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            data-testid={`${name}-${o.id}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  const { setCartCount } = useApp();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [grind, setGrind] = useState(null);
  const [size, setSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const clearToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    setProduct(null);
    setError('');
    api
      .product(id)
      .then((p) => {
        setProduct(p);
        setGrind(p.options?.grinds[0].id ?? null);
        setSize(p.options?.sizes[0].id ?? null);
        setQuantity(1);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <main className="page" data-testid="screen-product">
        <BackLink to="/" label="Back to Home" testId="product-back" />
        <p className="alert alert-error" role="alert" data-testid="product-error">
          {error}
        </p>
      </main>
    );
  }
  if (!product) return <Loading label="Loading product…" />;

  const unit = product.options ? Math.round(product.price * SIZE_MULTIPLIER[size]) : product.price;

  async function addToCart() {
    setAdding(true);
    try {
      const cart = await api.addToCart({ productId: product.id, quantity, grind, size });
      setCartCount(cart.itemCount);
      setToast({
        id: Date.now(),
        message: `Added ${quantity} × ${product.name} to your cart.`,
        action: (
          <Link to="/cart" className="toast-action" data-testid="toast-view-cart">
            View cart
          </Link>
        ),
      });
    } catch (err) {
      setToast({ id: Date.now(), message: err.message });
    } finally {
      setAdding(false);
    }
  }

  return (
    <main className="page" data-testid="screen-product">
      <div className="topbar">
        <BackLink to="/" label="Back to Home" testId="product-back" />
        <span className="topbar-title">Details</span>
        <FavoriteButton product={product} className="fav-soft" testId="product-fav-toggle" />
      </div>

      <ProductImage product={product} className="hero-img" testId="product-image" />

      <div className="stack-xs">
        <span className="eyebrow">{product.subtitle}</span>
        <div className="row-between baseline">
          <h1 className="h1" data-testid="product-name">
            {product.name}
          </h1>
          <span className="price-lg" data-testid="product-price">
            {formatMoney(unit)}
          </span>
        </div>
        <span className={product.inStock ? 'ok-text' : 'error-text'} data-testid="product-stock">
          {product.inStock ? 'In stock' : 'Out of stock'}
        </span>
      </div>

      <p className="body-text" data-testid="product-description">
        {product.description}
      </p>

      {product.options && (
        <>
          <OptionGroup label="Grind" name="grind" options={product.options.grinds} value={grind} onChange={setGrind} />
          <OptionGroup label="Size" name="size" options={product.options.sizes} value={size} onChange={setSize} />
        </>
      )}

      <div className="row gap-12">
        <Stepper
          value={quantity}
          onChange={setQuantity}
          label="Quantity"
          testIdPrefix="qty"
          disabled={!product.inStock}
        />
        <button
          type="button"
          className="btn btn-primary grow"
          onClick={addToCart}
          disabled={!product.inStock || adding}
          data-testid="add-to-cart"
        >
          {product.inStock ? `Add to cart · ${formatMoney(unit * quantity)}` : 'Out of stock'}
        </button>
      </div>

      <Toast toast={toast} onDone={clearToast} />
    </main>
  );
}
