import { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { CHANNELS, NOTIFICATION_TOPICS, SaveBar, SettingsPage, useProfileSave } from '../components/profile.jsx';
import { tid } from '../testid.js';

function toForm(user) {
  return { ...user.notifications, channels: { ...user.notifications.channels } };
}

export default function ProfileNotifications() {
  const { user } = useApp();
  const [form, setForm] = useState(() => toForm(user));
  const { message, saving, save, clearMessage } = useProfileSave();
  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(user));

  function edit(updater) {
    setForm((f) => updater(structuredClone(f)));
    clearMessage();
  }

  function onSubmit(e) {
    e.preventDefault();
    save({ notifications: form });
  }

  return (
    <SettingsPage title="Notification preferences" testId="screen-profile-notifications">
      <form className="stack-lg" onSubmit={onSubmit} noValidate {...tid('notification-preferences')}>
        <fieldset className="stack-none">
          <legend className="h3 legend">Tell me about</legend>
          {NOTIFICATION_TOPICS.map((t) => (
            <label key={t.id} className="switch-row">
              <span>
                <b>{t.label}</b>
                <br />
                <span className="muted small">{t.hint}</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={form[t.id]}
                onChange={(e) => edit((f) => ((f[t.id] = e.target.checked), f))}
                {...tid(t.testId)}
              />
            </label>
          ))}
        </fieldset>

        <fieldset className="stack-none">
          <legend className="h3 legend">Notify me by</legend>
          {CHANNELS.map((c) => (
            <label key={c.id} className="check check-row">
              <input
                type="checkbox"
                checked={form.channels[c.id]}
                onChange={(e) => edit((f) => ((f.channels[c.id] = e.target.checked), f))}
                {...tid(`channel-${c.id}`)}
              />
              {c.label}
            </label>
          ))}
        </fieldset>

        <SaveBar message={message} saving={saving} dirty={dirty} />
      </form>
    </SettingsPage>
  );
}
