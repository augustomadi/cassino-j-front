import { apiFetch } from './http';

/* GET /theme é público e serve os tokens de design completos (cores,
   tipografia, raio). O front hoje só consome primary/secondary — ver nota em
   ThemeProvider.jsx sobre o restante do payload. */
export const getPublicTheme = () => apiFetch('/theme', { auth: false });
