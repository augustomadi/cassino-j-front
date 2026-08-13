/* ============================================================
   ThemeProvider — aplica as 2 seeds no <html> e expõe a API
   de tema (tema atual + setTheme/applyPreset/reset) via Context.
   ------------------------------------------------------------
   - Escreve --brand-primary / --brand-secondary em :root.
   - Calcula a luminância da primária -> data-mode="light|dark"
     (decide o contraste do texto, definido no theme.css).
   - Calcula o contraste do acento -> --on-secondary.
   - Persiste via themeStorage (localStorage hoje; API depois).
   ============================================================ */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DEFAULT_THEME, presets } from './presets';
import { load, save, clear } from './themeStorage';
import { getPublicTheme } from '../api/theme';
import { luminance, inkFor } from '../utils/color';

const ThemeContext = createContext(null);

/**
 * Aplica o tema no documento. Exportada pra poder ser usada
 * antes do React montar (evita "flash" do tema padrão).
 */
export function applyTheme({ primary, secondary }) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', primary);
  root.style.setProperty('--brand-secondary', secondary);
  root.style.setProperty('--on-secondary', inkFor(secondary));
  root.setAttribute('data-mode', luminance(primary) > 0.5 ? 'light' : 'dark');
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => load() || DEFAULT_THEME);

  // aplica sempre que o tema muda
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Busca o tema publicado no backend (GET /theme, público) e sobrepõe o que
  // veio do localStorage/padrão. Backend guarda um token set bem mais rico
  // (tipografia, raio, paleta semântica completa — ver config/theme.php), mas
  // o front hoje deriva tudo de 2 seeds via color-mix(); por isso só
  // primary/secondary são lidos daqui por enquanto. Se a API estiver fora do
  // ar, mantém o que já tinha carregado — o site não pode ficar sem tema.
  useEffect(() => {
    let cancelled = false;

    getPublicTheme()
      .then((res) => {
        if (cancelled) return;
        const colors = res?.data?.tokens?.colors;
        if (!colors?.primary || !colors?.secondary) return;

        const next = { primary: colors.primary, secondary: colors.secondary, presetId: null };
        save(next);
        setThemeState(next);
      })
      .catch(() => {
        /* sem tema publicado ainda ou API indisponível — mantém o local */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState((prev) => {
      const merged = { ...prev, ...next };
      save(merged);
      return merged;
    });
  }, []);

  const applyPreset = useCallback((presetId) => {
    const p = presets.find((x) => x.id === presetId);
    if (!p) return;
    const next = { primary: p.primary, secondary: p.secondary, presetId };
    save(next);
    setThemeState(next);
  }, []);

  const reset = useCallback(() => {
    clear();
    setThemeState(DEFAULT_THEME);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyPreset, reset, presets }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  return ctx;
}
