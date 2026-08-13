import { adminApiFetch } from './adminHttp';

export const adminLogin = ({ email, password }) =>
  adminApiFetch('/admin/auth/login', { method: 'POST', body: { email, password }, auth: false });

export const adminTwoFactorChallenge = ({ challengeToken, code }) =>
  adminApiFetch('/admin/auth/2fa/challenge', {
    method: 'POST',
    body: { challenge_token: challengeToken, code },
    auth: false,
  });

export const adminLogout = () => adminApiFetch('/admin/auth/logout', { method: 'POST' });

export const adminMe = () => adminApiFetch('/admin/me');
