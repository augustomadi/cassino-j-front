import { apiFetch } from './http';

export const getWithdrawalMethods = () => apiFetch('/withdrawals/methods', { auth: false });

export const createWithdrawal = ({ method, amountCents, destination, idempotencyKey }) =>
  apiFetch('/withdrawals', {
    method: 'POST',
    body: { method, amount_cents: amountCents, destination, idempotency_key: idempotencyKey },
  });

export const listWithdrawals = ({ status, page } = {}) => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (page) params.set('page', page);
  const qs = params.toString();
  return apiFetch(`/withdrawals${qs ? `?${qs}` : ''}`);
};

export const getWithdrawal = (id) => apiFetch(`/withdrawals/${id}`);

export const cancelWithdrawal = (id) => apiFetch(`/withdrawals/${id}`, { method: 'DELETE' });
