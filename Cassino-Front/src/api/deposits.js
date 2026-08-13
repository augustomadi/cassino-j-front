import { apiFetch } from './http';

export const getDepositMethods = () => apiFetch('/deposits/methods', { auth: false });

export const createDeposit = ({ method, amountCents, idempotencyKey }) =>
  apiFetch('/deposits', {
    method: 'POST',
    body: { method, amount_cents: amountCents, idempotency_key: idempotencyKey },
  });

export const getDeposit = (id) => apiFetch(`/deposits/${id}`);
