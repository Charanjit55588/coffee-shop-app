import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { api, formatMoney } from '../api.js';
import { useApp } from '../AppContext.jsx';
import { FavoriteButton, Loading, ProductImage } from '../components/common.jsx';
import { SearchIcon } from '../components/Icons.jsx';
import { tid } from '../testid.js';

export default function Home() {
  const { user } = useApp();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || 'all';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  // Debounced so typing in search doesn't fire a request per keystroke.
  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    setError('');
    const t = setTimeout(() => {
      api
        .products({ q, category })
        .then((list) => !cancelled && setProducts(list))
        .catch((err) => !cancelled && setError(err.message));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, category]);

  function update(next) {
    const merged = { q, category, ...next };
    const out = {};
    if (merged.q) out.q = merged.q;
    if (merged.category && merged.category !== 'all') out.category = merged.category;
    setParams(out, { replace: true });
  }

  const filtered = q || category !== 'all';
  const firstName = user?.name?.split(' ')[0];

  return (
    <main className="page" {...tid('screen-home')}>
      <header className="stack-xs">
        <p className="muted" {...tid('home-greeting')}>
          Hi, {firstName}
        </p>
        <h1 className="h1">What are you brewing today?</h1>
      </header>

      {location.state?.welcome && (
        <p className="alert alert-success" role="status" {...tid('home-welcome')}>
          Welcome to Bean &amp; Brew! Your account is ready.
        </p>
      )}

      <div className="search">
        <label htmlFor="home-search" className="sr-only">
          Search products
        </label>
        <SearchIcon size={20} className="search-icon" />
        <input
          type="search"
          className="input"
          placeholder="Search beans, mugs, tumblers…"
          value={q}
          onChange={(e) => update({ q: e.target.value })}
          {...tid('home-search')}
        />
      </div>

      <div role="group" aria-label="Categories" className="chips" {...tid('home-categories')}>
        {[{ id: 'all', label: 'All' }, ...categories].map((c) => (
          <button
            key={c.id}
            type="button"
            className="chip"
            aria-pressed={category === c.id}
            onClick={() => update({ category: c.id })}
            {...tid(`category-${c.id}`)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="row-between">
        <h2 className="h2" {...tid('product-results-heading')}>
          {filtered ? 'Results' : 'All products'}
          {products && (
            <span className="muted count" {...tid('product-results-count')}>
              {' '}
              ({products.length})
            </span>
          )}
        </h2>
        {filtered && (
          <button type="button" className="link-btn" onClick={() => setParams({}, { replace: true })} {...tid('home-clear-filters')}>
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <p className="alert alert-error" role="alert" {...tid('home-error')}>
          {error}
        </p>
      )}
      {!products && !error && <Loading label="Loading products…" />}
      {products && products.length === 0 && (
        <div className="empty" {...tid('home-no-results')}>
          No products match “{q}”. Try another search or category.
        </div>
      )}
      {products && products.length > 0 && (
        <div className="grid" {...tid('product-grid')}>
          {products.map((p) => (
            <div className="card" key={p.id} {...tid(`product-card-${p.id}`)}>
              <Link to={`/products/${p.id}`} className="card-link" {...tid(`product-link-${p.id}`)}>
                <ProductImage product={p} className="card-img" />
                {/* These repeat in every card, so the Maestro id is scoped by product. */}
                <span className="card-title" data-testid="product-name" id={`product-name-${p.id}`}>
                  {p.name}
                </span>
                <span className="card-sub">{p.subtitle}</span>
                <span className="card-price" data-testid="product-price" id={`product-price-${p.id}`}>
                  {formatMoney(p.price)}
                </span>
                {p.popular && p.inStock && (
                  <span className="pill pill-accent" data-testid="product-popular" id={`product-popular-${p.id}`}>
                    Popular
                  </span>
                )}
                {!p.inStock && (
                  <span className="pill pill-muted" data-testid="product-out-of-stock" id={`product-out-of-stock-${p.id}`}>
                    Out of stock
                  </span>
                )}
              </Link>
              <FavoriteButton product={p} className="card-fav" testId={`fav-toggle-${p.id}`} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
