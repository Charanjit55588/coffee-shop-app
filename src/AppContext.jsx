import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from './api.js';

const AppContext = createContext(null);
const THEME_KEY = 'bb_theme';

// The saved choice is kept locally too, so the sign-in screen matches it.
function storedAppearance() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light';
  } catch {
    return 'light';
  }
}

function storeAppearance(value) {
  try {
    localStorage.setItem(THEME_KEY, value);
  } catch {
    // Storage unavailable; the theme still applies for this visit.
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [appearance, setAppearanceState] = useState(storedAppearance);
  const [status, setStatus] = useState(tokenStore.get() ? 'loading' : 'signedOut');
  const [cartCount, setCartCount] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());

  const reset = useCallback(() => {
    setUser(null);
    setCartCount(0);
    setFavoriteIds(new Set());
    setStatus('signedOut');
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const [me, cart, favorites] = await Promise.all([api.me(), api.cart(), api.favorites()]);
      setUser(me);
      setAppearanceState(me.appearance);
      storeAppearance(me.appearance);
      setCartCount(cart.itemCount);
      setFavoriteIds(new Set(favorites.map((p) => p.id)));
      setStatus('signedIn');
    } catch {
      tokenStore.clear();
      reset();
    }
  }, [reset]);

  // "system" follows the device setting, and keeps following it if it changes.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved = appearance === 'system' ? (media.matches ? 'dark' : 'light') : appearance;
      document.documentElement.dataset.theme = resolved;
    };
    apply();
    if (appearance !== 'system') return undefined;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [appearance]);

  const setAppearance = useCallback(async (value) => {
    setAppearanceState(value);
    storeAppearance(value);
    const updated = await api.updateMe({ appearance: value });
    setUser(updated);
  }, []);

  useEffect(() => {
    if (tokenStore.get()) loadSession();
    window.addEventListener('bb:unauthorized', reset);
    return () => window.removeEventListener('bb:unauthorized', reset);
  }, [loadSession, reset]);

  const login = useCallback(
    async (email, password, remember) => {
      const { token } = await api.login(email, password);
      tokenStore.set(token, remember);
      await loadSession();
    },
    [loadSession],
  );

  // New accounts are signed in straight away, for this tab only.
  const register = useCallback(
    async (account) => {
      const { token } = await api.register(account);
      tokenStore.set(token, false);
      await loadSession();
    },
    [loadSession],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Already signed out on the server; clear locally either way.
    }
    tokenStore.clear();
    reset();
  }, [reset]);

  const toggleFavorite = useCallback(
    async (productId) => {
      const isFavorite = favoriteIds.has(productId);
      if (isFavorite) await api.removeFavorite(productId);
      else await api.addFavorite(productId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFavorite) next.delete(productId);
        else next.add(productId);
        return next;
      });
    },
    [favoriteIds],
  );

  const value = useMemo(
    () => ({
      user,
      setUser,
      status,
      login,
      register,
      logout,
      cartCount,
      setCartCount,
      favoriteIds,
      toggleFavorite,
      appearance,
      setAppearance,
    }),
    [user, status, login, register, logout, cartCount, favoriteIds, toggleFavorite, appearance, setAppearance],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
