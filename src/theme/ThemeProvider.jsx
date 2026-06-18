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

const ThemeContext = createContext(null);

/* ---- Utilidades de cor ---- */

/** "#rrggbb" -> { r, g, b } (0-255). Aceita #rgb e #rrggbb. */
function hexToRgb(hex) {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Luminância relativa (WCAG) 0..1. Usada pra decidir claro/escuro. */
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lin = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** Tinta legível (clara ou escura) sobre uma cor de fundo. */
function inkFor(hex) {
  // ink escura sobre cores claras; ink clara sobre cores escuras
  return luminance(hex) > 0.45 ? '#1a1205' : '#fff';
}

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
