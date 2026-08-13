import { adminApiFetch } from './adminHttp';

export const getAdminTheme = () => adminApiFetch('/admin/theme');

export const publishTheme = (tokens) =>
  adminApiFetch('/admin/theme', { method: 'POST', body: { tokens } });

export const getThemeVersions = () => adminApiFetch('/admin/theme/versions');

export const restoreThemeVersion = (version) =>
  adminApiFetch(`/admin/theme/versions/${version}/restore`, { method: 'POST' });
