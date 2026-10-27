import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { EMAIL_RE } from '../api.js';
import { useApp } from '../AppContext.jsx';
import { CupIcon } from '../components/Icons.jsx';

export default function Login() {
  const { login, status } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'signedIn') return <Navigate to={from} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!email.trim()) next.email = 'Email is required.';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password, remember);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <main className="page auth-page" data-testid="screen-login">
      <div className="brand">
        <div className="brand-mark">
          <CupIcon size={32} />
        </div>
        <h1>Bean &amp; Brew</h1>
        <p className="muted">Sign in to your account</p>
      </div>

      <form className="stack" onSubmit={onSubmit} noValidate data-testid="login-form">
        {formError && (
          <p className="alert alert-error" role="alert" data-testid="login-error">
            {formError}
          </p>
        )}
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            className={`input ${errors.email ? 'invalid' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            data-testid="login-email"
          />
          {errors.email && (
            <p id="login-email-error" className="field-error" data-testid="login-email-error">
              {errors.email}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <div className="input-with-action">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Password"
              className={`input ${errors.password ? 'invalid' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              data-testid="login-password"
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              data-testid="login-toggle-password"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <p id="login-password-error" className="field-error" data-testid="login-password-error">
              {errors.password}
            </p>
          )}
        </div>
        <div className="row-between">
          <label className="check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              data-testid="login-remember"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="link-strong tap" data-testid="login-forgot-link">
            Forgot password?
          </Link>
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting} data-testid="login-submit">
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="muted center push-bottom">
        New here?{' '}
        <Link to="/signup" className="link-strong" data-testid="login-signup-link">
          Create an account
        </Link>
      </p>
    </main>
  );
}
