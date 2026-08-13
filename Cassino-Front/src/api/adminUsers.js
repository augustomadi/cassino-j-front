import { adminApiFetch } from './adminHttp';

export const listUsers = ({ search, status, affiliate_id, per_page, page } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (affiliate_id) params.set('affiliate_id', affiliate_id);
  if (per_page) params.set('per_page', per_page);
  if (page) params.set('page', page);
  const qs = params.toString();
  return adminApiFetch(`/admin/users${qs ? `?${qs}` : ''}`);
};

export const getUser = (id) => adminApiFetch(`/admin/users/${id}`);

export const getUserTransactions = (id, { page } = {}) =>
  adminApiFetch(`/admin/users/${id}/transactions${page ? `?page=${page}` : ''}`);

export const setUserStatus = (id, { status, reason }) =>
  adminApiFetch(`/admin/users/${id}/status`, { method: 'PATCH', body: { status, reason } });

export const adjustUserBalance = (id, { amountCents, reason, idempotencyKey }) =>
  adminApiFetch(`/admin/users/${id}/balance-adjustment`, {
    method: 'POST',
    body: { amount_cents: amountCents, reason, idempotency_key: idempotencyKey },
  });
