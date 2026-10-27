import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.jsx';
import { BellIcon, ChevronRightIcon, IdCardIcon, LogoutIcon, MoonIcon } from '../components/Icons.jsx';
import { APPEARANCES, CHANNELS, NOTIFICATION_TOPICS } from '../components/profile.jsx';

function personalSummary(user) {
  const a = user.address;
  const place = a.city ? `${a.city}, ${a.region}` : 'No shipping address yet';
  return `@${user.username} · ${place}`;
}

function notificationSummary(n) {
  const on = NOTIFICATION_TOPICS.filter((t) => n[t.id]).length;
  const channels = CHANNELS.filter((c) => n.channels[c.id]).map((c) => c.label);
  if (on === 0) return 'All notifications off';
  return `${on} of ${NOTIFICATION_TOPICS.length} on · ${channels.join(', ') || 'no channel chosen'}`;
}

function MenuRow({ to, icon: RowIcon, title, summary, testId }) {
  return (
    <li>
      <Link to={to} className="menu-row" data-testid={testId}>
        <span className="menu-icon">
          <RowIcon size={20} />
        </span>
        <span className="grow stack-xxs min0">
          <span className="menu-title">{title}</span>
          <span className="card-sub truncate" data-testid={`${testId}-summary`}>
            {summary}
          </span>
        </span>
        <ChevronRightIcon size={20} className="menu-chevron" />
      </Link>
    </li>
  );
}

export default function Profile() {
  const { user, logout, appearance } = useApp();
  const navigate = useNavigate();

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  async function onLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="page" data-testid="screen-profile">
      <header className="profile-header">
        <div className="avatar avatar-lg" aria-hidden="true" data-testid="profile-avatar">
          {initials}
        </div>
        <h1 className="h2-lg" data-testid="profile-display-name">
          {user.name}
        </h1>
        <span className="muted" data-testid="profile-email">
          {user.email}
        </span>
      </header>

      <nav aria-label="Profile settings">
        <ul className="menu">
          <MenuRow
            to="/profile/personal"
            icon={IdCardIcon}
            title="Personal info"
            summary={personalSummary(user)}
            testId="profile-menu-personal"
          />
          <MenuRow
            to="/profile/notifications"
            icon={BellIcon}
            title="Notification preferences"
            summary={notificationSummary(user.notifications)}
            testId="profile-menu-notifications"
          />
          <MenuRow
            to="/profile/appearance"
            icon={MoonIcon}
            title="Appearance"
            summary={APPEARANCES.find((a) => a.id === appearance)?.label}
            testId="profile-menu-appearance"
          />
        </ul>
      </nav>

      <button type="button" className="btn btn-danger-outline btn-sm logout-btn" onClick={onLogout} data-testid="logout">
        <LogoutIcon size={18} />
        Log out
      </button>
    </main>
  );
}
