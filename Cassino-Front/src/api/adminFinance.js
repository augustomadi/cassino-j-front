import { adminApiFetch } from './adminHttp';

export const getFinanceKpis = () => adminApiFetch('/admin/finance/kpis');

export const getFinancePnl = (months = 12) => adminApiFetch(`/admin/finance/pnl?months=${months}`);

export const getFinancePaymentMethods = (period = 30) =>
  adminApiFetch(`/admin/finance/payment-methods?period=${period}`);

export const getExpenses = ({ category, from, to, page } = {}) => {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (page) params.set('page', page);
  const qs = params.toString();
  return adminApiFetch(`/admin/finance/expenses${qs ? `?${qs}` : ''}`);
};

export const createExpense = ({ category, description, amountCents, incurredOn }) =>
  adminApiFetch('/admin/finance/expenses', {
    method: 'POST',
    body: { category, description, amount_cents: amountCents, incurred_on: incurredOn },
  });

export const updateExpense = (id, data) =>
  adminApiFetch(`/admin/finance/expenses/${id}`, { method: 'PATCH', body: data });

export const deleteExpense = (id) =>
  adminApiFetch(`/admin/finance/expenses/${id}`, { method: 'DELETE' });
