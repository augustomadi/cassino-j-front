/* ============================================================
   Perfis de cores pré-definidos.
   Cada perfil define só as 2 SEEDS (primary + secondary);
   o resto da paleta é derivado automaticamente via color-mix
   no theme.css. Adicionar um perfil novo = adicionar um objeto.
   ============================================================ */

export const DEFAULT_THEME = {
  primary: '#0c0c0f', // preto premium (padrão)
  secondary: '#e3b04b', // dourado
  presetId: 'black-gold',
};

export const presets = [
  {
    id: 'black-gold',
    name: 'Preto & Dourado',
    description: 'Elegante e premium (padrão)',
    primary: '#0c0c0f',
    secondary: '#e3b04b',
  },
  {
    id: 'navy-gold',
    name: 'Navy & Dourado',
    description: 'Clássico imersivo',
    primary: '#0b1622',
    secondary: '#f5a623',
  },
  {
    id: 'white-gold',
    name: 'Branco & Dourado',
    description: 'Tema claro e limpo',
    primary: '#f4f5f7',
    secondary: '#d99a16',
  },
  {
    id: 'purple-gold',
    name: 'Roxo & Dourado',
    description: 'Luxo e mistério',
    primary: '#1a1030',
    secondary: '#f5c842',
  },
  {
    id: 'emerald-gold',
    name: 'Esmeralda & Dourado',
    description: 'Mesa de jogo',
    primary: '#0a1f16',
    secondary: '#f0b429',
  },
  {
    id: 'crimson-silver',
    name: 'Vinho & Prata',
    description: 'Sofisticado',
    primary: '#1c0d12',
    secondary: '#c9ccd1',
  },
];
