import { adminApiFetch } from './adminHttp';

/* Atenção: index/referrals/statements/payouts devolvem o paginador cru do
   Laravel (current_page/last_page/total no nível raiz do JSON), diferente do
   envelope {data, links, meta} dos endpoints baseados em API Resource
   (ex: /admin/users). Ver AdminAffiliateController do backend. */

export const listAffiliates = ({ page, per_page } = {}) => {
  const params = new URLSearchParams();
  if (page) params.set('page', page);
  if (per_page) params.set('per_page', per_page);
  const qs = params.toString();
  return adminApiFetch(`/admin/affiliates${qs ? `?${qs}` : ''}`);
};

export const createAffiliate = ({ name, email, commissionRateBp }) =>
  adminApiFetch('/admin/affiliates', {
    method: 'POST',
    body: { name, email: email || undefined, commission_rate_bp: commissionRateBp },
  });

export const getAffiliate = (id) => adminApiFetch(`/admin/affiliates/${id}`);

export const updateAffiliate = (id, data) =>
  adminApiFetch(`/admin/affiliates/${id}`, { method: 'PATCH', body: data });

export const getAffiliateReferrals = (id, { page } = {}) =>
  adminApiFetch(`/admin/affiliates/${id}/referrals${page ? `?page=${page}` : ''}`);

export const getAffiliateStatements = (id, { page } = {}) =>
  adminApiFetch(`/admin/affiliates/${id}/statements${page ? `?page=${page}` : ''}`);

export const getAffiliateStatement = (id, period) =>
  adminApiFetch(`/admin/affiliates/${id}/statements/${period}`);

export const closeAffiliateStatement = (id, period) =>
  adminApiFetch(`/admin/affiliates/${id}/statements/${period}/close`, { method: 'POST' });

export const payAffiliateStatement = (id, period, note) =>
  adminApiFetch(`/admin/affiliates/${id}/statements/${period}/pay`, {
    method: 'POST',
    body: { note: note || undefined },
  });

export const getAffiliatePayouts = (id, { page } = {}) =>
  adminApiFetch(`/admin/affiliates/${id}/payouts${page ? `?page=${page}` : ''}`);

export const runMonthlyStatements = (period) =>
  adminApiFetch('/admin/affiliates/statements/run', { method: 'POST', body: { period } });
