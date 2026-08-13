import { adminApiFetch } from './adminHttp';

export const listWithdrawals = ({ status, payment_mode, user_id, page, per_page } = {}) => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (payment_mode) params.set('payment_mode', payment_mode);
  if (user_id) params.set('user_id', user_id);
  if (page) params.set('page', page);
  if (per_page) params.set('per_page', per_page);
  const qs = params.toString();
  return adminApiFetch(`/admin/withdrawals${qs ? `?${qs}` : ''}`);
};

export const getWithdrawal = (id) => adminApiFetch(`/admin/withdrawals/${id}`);

export const approveWithdrawal = (id) =>
  adminApiFetch(`/admin/withdrawals/${id}/approve`, {
    method: 'POST',
    body: { idempotency_key: crypto.randomUUID() },
  });

export const rejectWithdrawal = (id, reason) =>
  adminApiFetch(`/admin/withdrawals/${id}/reject`, {
    method: 'POST',
    body: { reason, idempotency_key: crypto.randomUUID() },
  });

export const getAutoLimit = () => adminApiFetch('/admin/withdrawals/auto-limit');

export const setAutoLimit = (limitCents) =>
  adminApiFetch('/admin/withdrawals/auto-limit', { method: 'PUT', body: { limit_cents: limitCents } });

export const getAutoLimitHistory = ({ page } = {}) =>
  adminApiFetch(`/admin/withdrawals/auto-limit/history${page ? `?page=${page}` : ''}`);
