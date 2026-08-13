/* Único módulo que lê/escreve o token de sessão.
   Hoje é localStorage (Bearer token, como o backend devolve — ver ADR 0002
   do backend). Isolado aqui de propósito: quando o back passar a emitir
   cookie HttpOnly, só este arquivo muda (ver TODO de segurança). */

const TOKEN_KEY = 'cj_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
