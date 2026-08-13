import { adminApiFetch } from './adminHttp';

export const getDashboardKpis = (period = 30) =>
  adminApiFetch(`/admin/dashboard/kpis?period=${period}`);

export const getDashboardRevenueSeries = (period = 30) =>
  adminApiFetch(`/admin/dashboard/revenue-series?period=${period}`);

export const getDashboardActivityFeed = (limit = 20) =>
  adminApiFetch(`/admin/dashboard/activity-feed?limit=${limit}`);
