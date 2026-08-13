/* Base do backend sem o sufixo /api/v1 — usada pra montar o link público de
   afiliado (GET /r/:code vive em routes/web.php, na raiz do backend, não sob
   /api/v1). O endpoint de listagem de afiliados não devolve esse link pronto
   (só POST/GET de um afiliado específico devolvem), então montamos aqui. */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const API_ROOT = API_URL.replace(/\/api\/v1\/?$/, '');

export const referralLink = (code) => `${API_ROOT}/r/${code}`;
