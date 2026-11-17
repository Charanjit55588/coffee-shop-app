import { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { APPEARANCES, SaveBar, SettingsPage, useProfileSave } from '../components/profile.jsx';
import { tid } from '../testid.js';

export default function ProfileAppearance() {
  const { appearance, setAppearance } = useApp();
  const [value, setValue] = useState(appearance);
  const { message, saving, run, clearMessage } = useProfileSave();

  function onSubmit(e) {
    e.preventDefault();
    // setAppearance applies the theme and saves it to the account.
    run(async () => {
      await setAppearance(value);
      return null;
    });
  }

  return (
    <SettingsPage title="Appearance" testId="screen-profile-appearance">
      <form className="stack-lg" onSubmit={onSubmit} noValidate {...tid('appearance-form')}>
        <div className="field">
          <label htmlFor="appearance-select">Theme</label>
          <div className="select-wrap">
            <select
              className="input select"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                clearMessage();
              }}
              aria-describedby="appearance-hint"
              {...tid('appearance-select')}
            >
              {APPEARANCES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <p id="appearance-hint" className="muted small">
            System switches between light and dark to match your device.
          </p>
        </div>

        <SaveBar message={message} saving={saving} dirty={value !== appearance} />
      </form>
    </SettingsPage>
  );
}
