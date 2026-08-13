/* ============================================================
   Persistência do tema — CAMADA DE FRONTEIRA COM O BACKEND
   ------------------------------------------------------------
   Hoje usa localStorage. Quando existir backend, basta trocar
   o corpo de load()/save() por chamadas à API (fetch). NENHUM
   outro arquivo do app precisa mudar.
   ============================================================ */

const STORAGE_KEY = 'cassino:theme';

/** Lê o tema salvo. Retorna null se não houver nada salvo. */
export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Salva o tema ativo. `theme` = { primary, secondary, presetId } */
export function save(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch {
    /* ignora (modo privado / quota) */
  }
}

/** Remove o tema salvo (volta ao padrão). */
export function clear() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
