import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as adminAuthApi from '../api/adminAuth';
import { getAdminToken, setAdminToken, clearAdminToken } from '../api/adminAuthStorage';
import { setAdminUnauthorizedHandler } from '../api/adminHttp';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authenticated | guest

  const logoutLocal = useCallback(() => {
    clearAdminToken();
    setAdmin(null);
    setStatus('guest');
  }, []);

  useEffect(() => {
    setAdminUnauthorizedHandler(logoutLocal);
  }, [logoutLocal]);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setStatus('guest');
      return;
    }

    adminAuthApi
      .adminMe()
      .then((res) => {
        setAdmin(res.data);
        setStatus('authenticated');
      })
      .catch(() => logoutLocal());
  }, [logoutLocal]);

  const login = useCallback(async ({ email, password }) => {
    const res = await adminAuthApi.adminLogin({ email, password });

    if (res.data.two_factor_required) {
      return { twoFactorRequired: true, challengeToken: res.data.challenge_token };
    }

    setAdminToken(res.data.token);
    setAdmin(res.data.admin);
    setStatus('authenticated');
    return { twoFactorRequired: false, twoFactorSetupPending: res.data.two_factor_setup_pending };
  }, []);

  const completeTwoFactorChallenge = useCallback(async ({ challengeToken, code }) => {
    const res = await adminAuthApi.adminTwoFactorChallenge({ challengeToken, code });
    setAdminToken(res.data.token);
    setAdmin(res.data.admin);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminAuthApi.adminLogout();
    } catch {
      // sessão local é limpa de qualquer forma
    }
    logoutLocal();
  }, [logoutLocal]);

  const hasPermission = useCallback(
    (permission) => admin?.permissions?.includes('*') || admin?.permissions?.includes(permission) || false,
    [admin]
  );

  const value = useMemo(
    () => ({
      admin,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      completeTwoFactorChallenge,
      logout,
      hasPermission,
    }),
    [admin, status, login, completeTwoFactorChallenge, logout, hasPermission]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth precisa ser usado dentro de <AdminAuthProvider>');
  return ctx;
}
