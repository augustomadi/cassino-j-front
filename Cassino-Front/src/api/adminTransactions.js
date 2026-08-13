import { adminApiFetch } from './adminHttp';
import { getAdminToken } from './adminAuthStorage';
import { ApiError } from './http';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const buildParams = ({ type, direction, user_id, from, to, min_amount_cents, page, per_page } = {}) => {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (direction) params.set('direction', direction);
  if (user_id) params.set('user_id', user_id);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (min_amount_cents) params.set('min_amount_cents', min_amount_cents);
  if (page) params.set('page', page);
  if (per_page) params.set('per_page', per_page);
  return params;
};

export const listTransactions = (filters = {}) => {
  const qs = buildParams(filters).toString();
  return adminApiFetch(`/admin/transactions${qs ? `?${qs}` : ''}`);
};

export const getTransaction = (id) => adminApiFetch(`/admin/transactions/${id}`);

/* Export é CSV via download de stream, não JSON — não passa por adminApiFetch. */
export const downloadTransactionsExport = async (filters = {}) => {
  const qs = buildParams(filters).toString();
  const token = getAdminToken();
  const response = await fetch(`${API_URL}/admin/transactions/export${qs ? `?${qs}` : ''}`, {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });

  if (!response.ok) {
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    throw new ApiError(payload?.message || 'Não foi possível exportar.', { status: response.status, errors: payload?.errors });
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : 'transacoes.csv';

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
