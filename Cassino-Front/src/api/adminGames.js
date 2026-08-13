import { adminApiFetch } from './adminHttp';

export const getProviders = () => adminApiFetch('/admin/games/providers');

export const getGames = (providerCode) =>
  adminApiFetch(`/admin/games/list?provider_code=${encodeURIComponent(providerCode)}`);

export const getAgentBalance = () => adminApiFetch('/admin/games/agent-balance');

export const getUserAccount = (userId) => adminApiFetch(`/admin/games/users/${userId}`);

export const transferBalance = (userId, { amountCents, direction }) =>
  adminApiFetch(`/admin/games/users/${userId}/transfer`, {
    method: 'POST',
    body: { amount_cents: amountCents, direction },
  });

export const drainUser = (userId) =>
  adminApiFetch(`/admin/games/users/${userId}/drain`, { method: 'POST' });

export const launchForUser = (userId, { providerCode, gameCode, lang }) =>
  adminApiFetch(`/admin/games/users/${userId}/launch`, {
    method: 'POST',
    body: { provider_code: providerCode, game_code: gameCode, lang },
  });
