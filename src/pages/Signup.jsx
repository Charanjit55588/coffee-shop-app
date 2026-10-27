import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { EMAIL_RE, PASSWORD_RE } from '../api.js';
import { useApp } from '../AppContext.jsx';
import { BackLink } from '../components/common.jsx';

const PASSWORD_HINT = 'At least 8 characters, with a letter and a number.';

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (!form.password) errors.password = 'Password is required.';
  else if (!PASSWORD_RE.test(form.password)) errors.password = 'Use at least 8 characters, with a letter and a number.';
  if (!form.confirmPassword) errors.confirmPassword = 'Confirm your password.';
  else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords don’t match.';
  if (!form.acceptTerms) errors.acceptTerms = 'You need to accept the terms to continue.';
  return errors;
}

export default function Signup() {
  const { register, status } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', acceptTerms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'signedIn' && !submitting) return <Navigate to="/" replace />;

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        acceptTerms: form.acceptTerms,
      });
      navigate('/', { replace: true, state: { welcome: true } });
    } catch (err) {
      setErrors(err.fieldErrors);
      setFormError(err.message);
      setSubmitting(false);
    }
  }

  const field = (key, label, props = {}) => (
    <div className="field">
      <label htmlFor={`signup-${key}`}>{label}</label>
      <input
        id={`signup-${key}`}
        className={`input ${errors[key] ? 'invalid' : ''}`}
        value={form[key]}
        onChange={set(key)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `signup-${key}-error` : undefined}
        data-testid={`signup-${key === 'confirmPassword' ? 'confirm-password' : key}`}
        {...props}
      />
      {errors[key] && (
        <p id={`signup-${key}-error`} className="field-error" data-testid={`signup-${key === 'confirmPassword' ? 'confirm-password' : key}-error`}>
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <main className="page auth-page signup-page" data-testid="screen-signup">
      <BackLink to="/login" label="Back to sign in" testId="signup-back" />
      <div className="stack-sm">
        <h1 className="h1">Create your account</h1>
        <p className="muted">Save favorites, track orders and check out faster.</p>
      </div>

      <form className="stack" onSubmit={onSubmit} noValidate data-testid="signup-form">
        {formError && (
          <p className="alert alert-error" role="alert" data-testid="signup-error">
            {formError}
          </p>
        )}
        {field('name', 'Full name', { autoComplete: 'name', placeholder: 'Alex Morgan' })}
        {field('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: 'you@example.com' })}

        <div className="field">
          <label htmlFor="signup-password">Password</label>
          <div className="input-with-action">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input ${errors.password ? 'invalid' : ''}`}
              value={form.password}
              onChange={set('password')}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'signup-password-error' : 'signup-password-hint'}
              data-testid="signup-password"
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              data-testid="signup-toggle-password"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password ? (
            <p id="signup-password-error" className="field-error" data-testid="signup-password-error">
              {errors.password}
            </p>
          ) : (
            <p id="signup-password-hint" className="muted small">
              {PASSWORD_HINT}
            </p>
          )}
        </div>

        {field('confirmPassword', 'Confirm password', {
          type: showPassword ? 'text' : 'password',
          autoComplete: 'new-password',
        })}

        <div className="field">
          <label className="check align-start">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={set('acceptTerms')}
              aria-invalid={Boolean(errors.acceptTerms)}
              aria-describedby={errors.acceptTerms ? 'signup-terms-error' : undefined}
              data-testid="signup-terms"
            />
            <span>I agree to the Terms of Service and Privacy Policy.</span>
          </label>
          {errors.acceptTerms && (
            <p id="signup-terms-error" className="field-error" data-testid="signup-terms-error">
              {errors.acceptTerms}
            </p>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting} data-testid="signup-submit">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="muted center push-bottom">
        Already have an account?{' '}
        <Link to="/login" className="link-strong" data-testid="signup-signin-link">
          Sign in
        </Link>
      </p>
    </main>
  );
}
