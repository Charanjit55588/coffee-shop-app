import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="page center-col" data-testid="screen-not-found">
      <h1 className="h1-lg">Page not found</h1>
      <p className="muted">That page doesn’t exist.</p>
      <Link to="/" className="btn btn-primary stretch" data-testid="not-found-home">
        Go to Home
      </Link>
    </main>
  );
}
