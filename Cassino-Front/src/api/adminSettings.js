import { adminApiFetch } from './adminHttp';

export const getSettings = () => adminApiFetch('/admin/settings');

export const updateSettings = (data) =>
  adminApiFetch('/admin/settings', { method: 'PUT', body: data });
