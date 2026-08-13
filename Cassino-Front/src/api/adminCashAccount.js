import { adminApiFetch } from './adminHttp';

export const getCashAccount = () => adminApiFetch('/admin/cash-account');

export const adjustCashAccount = ({ amountCents, reason }) =>
  adminApiFetch('/admin/cash-account', {
    method: 'PATCH',
    body: { amount_cents: amountCents, reason, idempotency_key: crypto.randomUUID() },
  });

export const getCashAccountAdjustments = ({ source, page } = {}) => {
  const params = new URLSearchParams();
  if (source) params.set('source', source);
  if (page) params.set('page', page);
  const qs = params.toString();
  return adminApiFetch(`/admin/cash-account/adjustments${qs ? `?${qs}` : ''}`);
};
