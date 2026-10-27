import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, EMAIL_RE } from '../api.js';
import { BackLink } from '../components/common.jsx';
import { CheckIcon } from '../components/Icons.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSuccess('');
    if (!email.trim()) return setError('Email is required.');
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.');
    setError('');
    setSubmitting(true);
    try {
      const { message } = await api.forgotPassword(email.trim());
      setSuccess(message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page auth-page" data-testid="screen-forgot-password">
      <BackLink to="/login" label="Back to sign in" testId="forgot-back" />
      <div className="stack-sm">
        <h1 className="h1">Reset your password</h1>
        <p className="muted">Enter the email you signed up with and we’ll send you a link to reset your password.</p>
      </div>
      <form className="stack" onSubmit={onSubmit} noValidate data-testid="forgot-form">
        <div className="field">
          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            className={`input ${error ? 'invalid' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'forgot-email-error' : undefined}
            data-testid="forgot-email"
          />
          {error && (
            <p id="forgot-email-error" className="field-error" data-testid="forgot-email-error">
              {error}
            </p>
          )}
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting} data-testid="forgot-submit">
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      {success && (
        <div className="alert alert-success" role="status" data-testid="forgot-success">
          <CheckIcon size={20} />
          <span>{success}</span>
        </div>
      )}
      <p className="muted center push-bottom">
        Remembered it?{' '}
        <Link to="/login" className="link-strong" data-testid="forgot-signin-link">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
