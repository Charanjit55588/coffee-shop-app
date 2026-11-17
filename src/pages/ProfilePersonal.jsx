import { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { SaveBar, SettingsPage, TextField, useProfileSave } from '../components/profile.jsx';
import { tid } from '../testid.js';

function toForm(user) {
  return { username: user.username, phone: user.phone, address: { ...user.address } };
}

export default function ProfilePersonal() {
  const { user } = useApp();
  const [form, setForm] = useState(() => toForm(user));
  const { errors, message, saving, save, clearMessage } = useProfileSave();
  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(user));

  function edit(updater) {
    setForm((f) => updater(structuredClone(f)));
    clearMessage();
  }
  const setAddress = (key) => (value) => edit((f) => ((f.address[key] = value), f));

  function onSubmit(e) {
    e.preventDefault();
    save(form);
  }

  return (
    <SettingsPage title="Personal info" testId="screen-profile-personal">
      <form className="stack-lg" onSubmit={onSubmit} noValidate {...tid('profile-personal-form')}>
        <section aria-labelledby="pi-h" className="stack-sm">
          <h2 id="pi-h" className="h3">
            Account
          </h2>
          <TextField
            label="Username"
            value={form.username}
            onChange={(v) => edit((f) => ((f.username = v), f))}
            error={errors.username}
            testId="profile-username"
            autoComplete="username"
          />
          <TextField
            label="Phone (optional)"
            type="tel"
            placeholder="e.g. 416 555 0123"
            value={form.phone}
            onChange={(v) => edit((f) => ((f.phone = v), f))}
            error={errors.phone}
            testId="profile-phone"
            autoComplete="tel"
          />
        </section>

        <section aria-labelledby="addr-h" className="stack-sm">
          <h2 id="addr-h" className="h3">
            Shipping address
          </h2>
          <TextField
            label="Street"
            value={form.address.street}
            onChange={setAddress('street')}
            error={errors.street}
            testId="address-street"
            autoComplete="street-address"
          />
          <TextField
            label="City"
            value={form.address.city}
            onChange={setAddress('city')}
            error={errors.city}
            testId="address-city"
            autoComplete="address-level2"
          />
          <div className="grid">
            <TextField
              label="Province / State"
              value={form.address.region}
              onChange={setAddress('region')}
              error={errors.region}
              testId="address-region"
              autoComplete="address-level1"
            />
            <TextField
              label="Postal / ZIP"
              value={form.address.postalCode}
              onChange={setAddress('postalCode')}
              error={errors.postalCode}
              testId="address-postal-code"
              autoComplete="postal-code"
            />
          </div>
        </section>

        <SaveBar message={message} saving={saving} dirty={dirty} />
      </form>
    </SettingsPage>
  );
}
