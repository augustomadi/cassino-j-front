import { getToken, clearToken } from './authStorage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/* Envelope de erro do backend é sempre { message, errors }
   (ver bootstrap/app.php do backend). */
export class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors || {};
  }
}

let onUnauthorized = null;

/* Chamado pelo AuthContext para reagir a 401 num lugar só, em vez de cada
   tela precisar checar status de resposta na mão. */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export async function apiFetch(path, { method = 'GET', body, auth = true, headers = {}, keepalive = false } = {}) {
  const finalHeaders = { Accept: 'application/json', ...headers };

  // FormData (upload de arquivo) define o próprio Content-Type com boundary —
  // setar manualmente aqui quebraria o multipart.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isFormData) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      keepalive,
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
      clearToken();
      onUnauthorized?.();
    }

    throw new ApiError(payload?.message || 'Erro ao processar a requisição.', {
      status: response.status,
      errors: payload?.errors,
    });
  }

  return payload;
}
