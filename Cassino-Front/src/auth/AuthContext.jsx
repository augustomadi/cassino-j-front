import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import { getMe, getBalance } from '../api/me';
import { getToken, setToken, clearToken } from '../api/authStorage';
import { setUnauthorizedHandler } from '../api/http';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [balanceCents, setBalanceCents] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authenticated | guest

  const logoutLocal = useCallback(() => {
    clearToken();
    setUser(null);
    setBalanceCents(null);
    setStatus('guest');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logoutLocal);
  }, [logoutLocal]);

  const refreshBalance = useCallback(async () => {
    const res = await getBalance();
    setBalanceCents(res.data.balance_cents);
    return res.data.balance_cents;
  }, []);

  // Boot: se há token guardado, confirma que ainda é válido antes de assumir
  // sessão ativa (token pode ter sido revogado/expirado desde a última visita).
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus('guest');
      return;
    }

    getMe()
      .then((res) => {
        setUser(res.data);
        setStatus('authenticated');
        return refreshBalance();
      })
      .catch(() => logoutLocal());
  }, [logoutLocal, refreshBalance]);

  const login = useCallback(
    async ({ email, password }) => {
      const res = await authApi.login({ email, password });

      if (res.data.two_factor_required) {
        return { twoFactorRequired: true, challengeToken: res.data.challenge_token };
      }

      setToken(res.data.token);
      setUser(res.data.user);
      setStatus('authenticated');
      refreshBalance();
      return { twoFactorRequired: false };
    },
    [refreshBalance]
  );

  const completeTwoFactorChallenge = useCallback(
    async ({ challengeToken, code }) => {
      const res = await authApi.completeTwoFactorChallenge({ challengeToken, code });
      setToken(res.data.token);
      setUser(res.data.user);
      setStatus('authenticated');
      refreshBalance();
    },
    [refreshBalance]
  );

  const register = useCallback((data) => authApi.register(data), []);

  // Recarrega o usuário do servidor — usado depois de mudanças que o token
  // guardado localmente não reflete sozinho (ex: ativar/desativar 2FA, editar perfil).
  const refreshUser = useCallback(async () => {
    const res = await getMe();
    setUser(res.data);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // sessão local é limpa de qualquer forma
    }
    logoutLocal();
  }, [logoutLocal]);

  const value = useMemo(
    () => ({
      user,
      balanceCents,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      completeTwoFactorChallenge,
      register,
      logout,
      refreshUser,
      refreshBalance,
      forgotPassword: authApi.forgotPassword,
      resetPassword: authApi.resetPassword,
      verifyEmail: authApi.verifyEmail,
      resendEmailVerification: authApi.resendEmailVerification,
    }),
    [
      user,
      balanceCents,
      status,
      login,
      completeTwoFactorChallenge,
      register,
      logout,
      refreshUser,
      refreshBalance,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  return ctx;
}
