import { adminApiFetch } from './adminHttp';

/* GET /admin/audit-logs devolve o paginador cru do Laravel (current_page no
   nível raiz), como /admin/affiliates — ver nota em adminAffiliates.js. */
export const listAuditLogs = ({ actor_type, action, entity_type, from, to, page, per_page } = {}) => {
  const params = new URLSearchParams();
  if (actor_type) params.set('actor_type', actor_type);
  if (action) params.set('action', action);
  if (entity_type) params.set('entity_type', entity_type);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (page) params.set('page', page);
  if (per_page) params.set('per_page', per_page);
  const qs = params.toString();
  return adminApiFetch(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
};

export const getAuditLog = (id) => adminApiFetch(`/admin/audit-logs/${id}`);
