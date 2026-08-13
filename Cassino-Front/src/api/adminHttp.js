import { getAdminToken, clearAdminToken } from './adminAuthStorage';
import { ApiError } from './http';

/* Espelha http.js, mas para o guard de staff (token e storage separados —
   ver adminAuthStorage.js). Duplicado de propósito em vez de compartilhar
   client com o site: o backend trata admin/jogador como guards
   completamente isolados, e misturar os dois clients aqui recriaria no front
   o mesmo risco que EnsureIsAdmin existe pra evitar no backend. */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

let onUnauthorized = null;

export function setAdminUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export async function adminApiFetch(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const finalHeaders = { Accept: 'application/json', ...headers };

  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAdminToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua internet.', { status: 0 });
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearAdminToken();
      onUnauthorized?.();
    }

    throw new ApiError(payload?.message || 'Erro ao processar a requisição.', {
      status: response.status,
      errors: payload?.errors,
    });
  }

  return payload;
}

/* Stream binário autenticado (ex: documento de KYC) — a resposta não é JSON,
   então não passa por adminApiFetch. Devolve um blob URL pronto pra <img>/
   window.open; quem chama é responsável por revogar com URL.revokeObjectURL
   quando não precisar mais. */
export async function adminFetchBlobUrl(path) {
  const token = getAdminToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAdminToken();
      onUnauthorized?.();
    }
    throw new ApiError('Não foi possível carregar o arquivo.', { status: response.status });
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
