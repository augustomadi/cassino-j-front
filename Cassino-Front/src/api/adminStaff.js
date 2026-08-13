import { adminApiFetch } from './adminHttp';

export const listStaff = ({ role, status, page, per_page } = {}) => {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (status) params.set('status', status);
  if (page) params.set('page', page);
  if (per_page) params.set('per_page', per_page);
  const qs = params.toString();
  return adminApiFetch(`/admin/staff${qs ? `?${qs}` : ''}`);
};

export const createStaff = (data) =>
  adminApiFetch('/admin/staff', { method: 'POST', body: data });

export const updateStaff = (id, data) =>
  adminApiFetch(`/admin/staff/${id}`, { method: 'PATCH', body: data });

export const disableStaff = (id) =>
  adminApiFetch(`/admin/staff/${id}`, { method: 'DELETE' });

export const listRoles = () => adminApiFetch('/admin/roles');
