/* Utilidades de cor compartilhadas — extraídas do ThemeProvider pra também
   servir a montagem do payload de tema publicado no admin (ver Appearance.jsx). */

/** "#rrggbb" -> { r, g, b } (0-255). Aceita #rgb e #rrggbb. */
export function hexToRgb(hex) {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const toHex2 = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');

export function rgbToHex({ r, g, b }) {
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`.toUpperCase();
}

/** Luminância relativa (WCAG) 0..1. */
export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lin = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** Tinta legível (clara ou escura) sobre uma cor de fundo, em hex de 6 dígitos. */
export function inkFor(hex) {
  return luminance(hex) > 0.45 ? '#1A1205' : '#FFFFFF';
}

/** Mistura duas cores hex (0 = 100% a, 1 = 100% b) — aproxima color-mix() do CSS. */
export function mix(hexA, hexB, weightB) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * weightB,
    g: a.g + (b.g - a.g) * weightB,
    b: a.b + (b.b - a.b) * weightB,
  });
}

export function lighten(hex, amount) {
  return mix(hex, '#FFFFFF', amount);
}

export function darken(hex, amount) {
  return mix(hex, '#000000', amount);
}
