import { apiFetch } from './http';

/* Contrato conferido em app/Http/Controllers/Api/V1/Auth/* do backend. */

export const register = (data) =>
  apiFetch('/auth/register', { method: 'POST', body: data, auth: false });

export const login = ({ email, password }) =>
  apiFetch('/auth/login', { method: 'POST', body: { email, password }, auth: false });

/* Segunda etapa do login quando a conta tem 2FA ativo. */
export const completeTwoFactorChallenge = ({ challengeToken, code }) =>
  apiFetch('/auth/2fa/challenge', {
    method: 'POST',
    body: { challenge_token: challengeToken, code },
    auth: false,
  });

export const logout = () => apiFetch('/auth/logout', { method: 'POST' });

export const refresh = () => apiFetch('/auth/refresh', { method: 'POST' });

export const me = () => apiFetch('/me');

export const forgotPassword = (email) =>
  apiFetch('/auth/password/forgot', { method: 'POST', body: { email }, auth: false });

export const resetPassword = ({ email, token, password, password_confirmation }) =>
  apiFetch('/auth/password/reset', {
    method: 'POST',
    body: { email, token, password, password_confirmation },
    auth: false,
  });

export const verifyEmail = ({ id, hash }) =>
  apiFetch('/auth/email/verify', { method: 'POST', body: { id, hash }, auth: false });

export const resendEmailVerification = () => apiFetch('/auth/email/resend', { method: 'POST' });

/* ---- 2FA (gestão — challenge do login fica em completeTwoFactorChallenge) ---- */

export const enableTwoFactor = () => apiFetch('/auth/2fa/enable', { method: 'POST' });

export const confirmTwoFactor = (code) =>
  apiFetch('/auth/2fa/confirm', { method: 'POST', body: { code } });

export const disableTwoFactor = (password) =>
  apiFetch('/auth/2fa', { method: 'DELETE', body: { password } });

/* ---- Sessões ativas ---- */

export const listSessions = () => apiFetch('/auth/sessions');

export const revokeSession = (id) => apiFetch(`/auth/sessions/${id}`, { method: 'DELETE' });
