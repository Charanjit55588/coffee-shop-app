import { Link } from 'react-router-dom';
import { tid } from '../testid.js';

export default function NotFound() {
  return (
    <main className="page center-col" {...tid('screen-not-found')}>
      <h1 className="h1-lg">Page not found</h1>
      <p className="muted">That page doesn’t exist.</p>
      <Link to="/" className="btn btn-primary stretch" {...tid('not-found-home')}>
        Go to Home
      </Link>
    </main>
  );
}
