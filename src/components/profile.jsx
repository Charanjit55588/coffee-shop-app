import { useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../AppContext.jsx';
import { BackLink } from './common.jsx';
import { tid } from '../testid.js';

export const NOTIFICATION_TOPICS = [
  { id: 'orderUpdates', label: 'Order updates', hint: 'Shipping and delivery status', testId: 'notify-order-updates' },
  { id: 'promotions', label: 'Promotions & offers', hint: 'Discounts and seasonal deals', testId: 'notify-promotions' },
  { id: 'newArrivals', label: 'New arrivals', hint: 'Fresh roasts and new gear', testId: 'notify-new-arrivals' },
];

export const CHANNELS = [
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'push', label: 'Push' },
];

export const APPEARANCES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System (match device)' },
];

// A settings screen opened from the Profile hub.
export function SettingsPage({ title, testId, children }) {
  return (
    <main className="page" {...tid(testId)}>
      <div className="row gap-12">
        <BackLink to="/profile" label="Back to profile" testId="settings-back" />
        <h1 className="h1">{title}</h1>
      </div>
      {children}
    </main>
  );
}

// The input's id is its test ID, so the label, the error and Maestro all point at it.
export function TextField({ label, value, onChange, error, testId, ...rest }) {
  return (
    <div className="field">
      <label htmlFor={testId}>{label}</label>
      <input
        className={`input ${error ? 'invalid' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${testId}-error` : undefined}
        {...tid(testId)}
        {...rest}
      />
      {error && (
        <p className="field-error" {...tid(`${testId}-error`)}>
          {error}
        </p>
      )}
    </div>
  );
}

// Saves part of the profile and reports the result.
export function useProfileSave() {
  const { setUser } = useApp();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  async function run(action) {
    setSaving(true);
    setErrors({});
    setMessage(null);
    try {
      const updated = await action();
      if (updated) setUser(updated);
      setMessage({ type: 'success', text: 'Changes saved.' });
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return {
    errors,
    message,
    saving,
    save: (patch) => run(() => api.updateMe(patch)),
    run,
    clearMessage: () => setMessage(null),
  };
}

export function SaveBar({ message, saving, dirty }) {
  return (
    <div className="stack-sm">
      {message && (
        <p
          className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}
          role={message.type === 'success' ? 'status' : 'alert'}
          {...tid(message.type === 'success' ? 'profile-save-success' : 'profile-save-error')}
        >
          {message.text}
        </p>
      )}
      <div className="actions-row">
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving || !dirty} {...tid('profile-save')}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
