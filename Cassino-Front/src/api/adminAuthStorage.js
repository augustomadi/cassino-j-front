/* Sessão do staff, separada da sessão do jogador de propósito — o backend
   trata User e AdminUser como guards completamente distintos (EnsureIsAdmin
   middleware), então o front espelha essa separação: chave de storage
   diferente, nunca compartilhada com authStorage.js do site. */

const TOKEN_KEY = 'cj_admin_token';

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}
