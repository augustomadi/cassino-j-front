/* Lê o cookie de atribuição de afiliado gravado por GET /r/:code no backend.
   Cookie não é HttpOnly de propósito (ver ReferralController do backend):
   a SPA precisa ler o código para mandar em POST /auth/register. */

const COOKIE_NAME = 'cj_ref';

export function getReferralCode() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
