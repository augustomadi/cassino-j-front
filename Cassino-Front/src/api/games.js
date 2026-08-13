import { apiFetch } from './http';

export const getGameProviders = () => apiFetch('/games/providers', { auth: false });

export const getGames = ({ providerCode, category, search, featured, page, perPage } = {}) => {
  const params = new URLSearchParams();
  if (providerCode) params.set('provider_code', providerCode);
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  if (featured) params.set('featured', '1');
  if (perPage) params.set('per_page', perPage);
  if (page) params.set('page', page);
  const qs = params.toString();
  return apiFetch(`/games${qs ? `?${qs}` : ''}`, { auth: false });
};

export const getGame = (id) => apiFetch(`/games/${id}`, { auth: false });

export const launchGame = (id, { lang } = {}) =>
  apiFetch(`/games/${id}/launch`, { method: 'POST', body: { lang } });

export const returnGameBalance = ({ keepalive } = {}) =>
  apiFetch('/games/return-balance', { method: 'POST', keepalive });
