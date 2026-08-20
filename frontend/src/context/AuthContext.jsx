import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import { setSessionExpiredHandler } from '../lib/api';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  saveSession,
  setStoredUser,
} from '../lib/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [initializing, setInitializing] = useState(true);

  const clear = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // Une session définitivement expirée (refresh refusé) ramène à l'écran de connexion.
  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
    return () => setSessionExpiredHandler(null);
  }, []);

  // Revalidation de la session au démarrage.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!getAccessToken()) {
        clear();
        setInitializing(false);
        return;
      }
      try {
        const current = await authApi.me();
        if (!cancelled) {
          setStoredUser(current);
          setUser(current);
        }
      } catch {
        if (!cancelled) clear();
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [clear]);

  const login = useCallback(async (email, motDePasse) => {
    const data = await authApi.login(email, motDePasse);
    saveSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // La session locale est purgée même si le backend est injoignable.
      }
    }
    clear();
  }, [clear]);

  const applyUser = useCallback((updated) => {
    setStoredUser(updated);
    setUser(updated);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      initializing,
      login,
      logout,
      applyUser,
    }),
    [user, initializing, login, logout, applyUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\u2019intérieur d\u2019un AuthProvider');
  }
  return context;
}

export default AuthContext;
