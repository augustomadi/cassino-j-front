import { apiFetch } from './http';

export const getMe = () => apiFetch('/me');

export const updateProfile = (data) => apiFetch('/me', { method: 'PATCH', body: data });

export const getBalance = () => apiFetch('/me/balance');

export const getTransactions = ({ page, type, from, to, per_page } = {}) => {
  const params = new URLSearchParams();
  if (page) params.set('page', page);
  if (type) params.set('type', type);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (per_page) params.set('per_page', per_page);
  const qs = params.toString();
  return apiFetch(`/me/transactions${qs ? `?${qs}` : ''}`);
};
