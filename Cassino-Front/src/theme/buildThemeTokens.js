import { luminance, inkFor, lighten, darken } from '../utils/color';

/**
 * Monta o payload completo exigido por PublishThemeRequest (backend) a partir
 * das 2 seeds que o admin realmente edita (primary/secondary).
 *
 * O backend guarda um token set mais rico que o front consome hoje (paleta
 * completa, tipografia, raio — ver config/theme.php) porque ele também
 * precisa servir um painel/app que não tem o color-mix() do theme.css. Este
 * front deriva tudo das 2 seeds em runtime, então os demais campos aqui são
 * aproximações da mesma derivação, só que calculadas em JS pra publicar —
 * nenhuma tela deste front lê `background`/`surface`/`text`/`radius` de volta
 * da API, então o valor exato deles não afeta a própria aparência do site.
 *
 * success/warning/danger ficam fixos, batendo com as cores semânticas fixas
 * de theme.css (verde/dourado/vermelho não derivam das seeds de propósito).
 */
export function buildThemeTokens({ primary, secondary }) {
  const dark = luminance(primary) <= 0.5;

  return {
    colors: {
      primary,
      primary_contrast: inkFor(primary),
      secondary,
      background: primary,
      surface: dark ? lighten(primary, 0.09) : darken(primary, 0.04),
      text: dark ? '#F8F9FA' : '#0B1622',
      text_muted: dark ? '#93A4BB' : '#51647B',
      success: '#22C55E',
      warning: secondary,
      danger: '#E63946',
      border: dark ? lighten(primary, 0.16) : darken(primary, 0.14),
    },
    typography: {
      font_family: 'Inter, system-ui, sans-serif',
      font_family_heading: 'Poppins, Inter, system-ui, sans-serif',
      base_size_px: 16,
    },
    radius: {
      sm_px: 8,
      md_px: 12,
      lg_px: 16,
      full_px: 9999,
    },
  };
}
