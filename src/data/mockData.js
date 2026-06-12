/* Dados fictícios (mock) — substituir por API real depois.
   Cada jogo traz `grad` (gradiente do thumb) e `emoji` para o placeholder. */

let _id = 0;
const uid = () => `g${++_id}`;

const make = (name, provider, grad, emoji, extra = {}) => ({
  id: uid(),
  name,
  provider,
  grad,
  emoji,
  paid: extra.paid ?? rndMoney(),
  hot: extra.hot ?? false,
  live: extra.live ?? false,
  rtp: extra.rtp ?? null,
  ...extra,
});

function rndMoney() {
  const v = Math.floor(Math.random() * 90000000) + 1000000;
  return v / 100;
}

export const fmtBRL = (v) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ---- Categorias do menu (sem Esportes) ---- */
export const menuItems = [
  { id: 'cassino', label: 'Jogos de Cassino', icon: 'cards' },
  { id: 'ao-vivo', label: 'Cassino ao Vivo', icon: 'live' },
  { id: 'slots', label: 'Jogos Slots', icon: 'slots' },
  { id: 'todos', label: 'Todos os Jogos', icon: 'crown' },
  { id: 'provedores', label: 'Provedores', icon: 'provider' },
  { id: 'mines', label: 'Mines', icon: 'bomb' },
  { id: 'tiger', label: 'Fortune Tiger', icon: 'tiger' },
  { id: 'aviator', label: 'Aviator', icon: 'plane' },
  { id: 'roleta', label: 'Roleta Brasileira', icon: 'roulette' },
  { id: 'dice', label: 'Dice', icon: 'dice' },
];

/* ---- Cards promocionais da sidebar ---- */
export const promoCards = [
  { id: 'mini', kicker: 'Jogue e ganhe', title: 'Mini Games Diários', icon: 'gift', grad: 'linear-gradient(135deg,#2a5c9e,#173a66)' },
  { id: 'indique', kicker: 'R$ 50,00', title: 'Indique e Ganhe', icon: 'fire', grad: 'linear-gradient(135deg,#7c3aed,#4d1fa3)' },
  { id: 'torneios', kicker: 'Participe dos', title: 'Torneios', icon: 'trophy', grad: 'linear-gradient(135deg,#e8970f,#a65f00)' },
  { id: 'missoes', kicker: 'Participe das', title: 'Missões', icon: 'target', grad: 'linear-gradient(135deg,#16a34a,#0c6b32)' },
];

/* ---- Banners de destaque (hero) ---- */
export const banners = [
  { id: 'b1', title: 'Torneio Diário da', highlight: 'Fortuna em Dobro', sub: 'Premiação de R$ 100.000 toda semana', grad: 'linear-gradient(120deg,#b3201f 0%,#7a0f0e 100%)', emoji: '🐯', cta: 'Participar' },
  { id: 'b2', title: 'Cashback de até', highlight: '25% Todos os Dias', sub: 'Recupere parte das suas apostas', grad: 'linear-gradient(120deg,#1e6fd6 0%,#0e3a78 100%)', emoji: '💎', cta: 'Resgatar' },
  { id: 'b3', title: 'Novos Jogos', highlight: 'Já Disponíveis', sub: 'Os lançamentos mais quentes da semana', grad: 'linear-gradient(120deg,#f5a623 0%,#b5740a 100%)', emoji: '🎰', cta: 'Explorar' },
];

/* ---- Jogos populares ---- */
export const popularGames = [
  make('Fortune Rabbit', 'PG Soft', 'linear-gradient(160deg,#ff8fb0,#d63b6e)', '🐰', { hot: true, media: 'https://cassino.bet.br/images/db67fda5-1884-432e-7c5d-dfd608c7b800/width=240,height=300,fit=cover,quality=80,format=auto' }),
  make('Fortune Dragon', 'PG Soft', 'linear-gradient(160deg,#5ed18a,#1f8f54)', '🐉', { hot: true, media: 'https://cassino.bet.br/images/67fffbd0-2722-42c6-9e61-bf1ede490000/width=240,height=300,fit=cover,quality=80,format=auto' }),
  make('Fortune Tiger', 'PG Soft', 'linear-gradient(160deg,#ffb24d,#d6571f)', '🐯', { hot: true, media: 'https://cassino.bet.br/assets/thumbs/fortune-tiger.mp4' }),
  make('Fortune Ox', 'PG Soft', 'linear-gradient(160deg,#ff6f5e,#b32424)', '🐂', { media: 'https://cassino.bet.br/images/d497611a-a2d4-4459-b4ac-c7998dafb400/width=240,height=300,fit=cover,quality=80,format=auto' }),
  make('Pinata Wins', 'Gamzix', 'linear-gradient(160deg,#ff7fc4,#a32b8f)', '🪅', { media: 'https://cassino.bet.br/images/c515a1fe-347e-4245-c203-fc0749a7e700/width=240,height=300,fit=cover,quality=80,format=auto' }),
  make('Fortune Snake', 'PG Soft', 'linear-gradient(160deg,#7c5bff,#3b1fa3)', '🐍'),
  make('Fortune Mouse', 'PG Soft', 'linear-gradient(160deg,#ffd24d,#d69a0f)', '🐭'),
  make('Dragon Hatch', 'PG Soft', 'linear-gradient(160deg,#5ec6ff,#1f5f9f)', '🥚'),
  make('Gates of Olympus', 'Pragmatic', 'linear-gradient(160deg,#7c8bff,#3b3fa3)', '⚡'),
  make('Sweet Bonanza', 'Pragmatic', 'linear-gradient(160deg,#ff9ad1,#c23b9e)', '🍭'),
];

/* ---- Cassino ao vivo ---- */
export const liveGames = [
  make('Football Studio', 'Evolution', 'linear-gradient(160deg,#1f9f54,#0c5e30)', '⚽', { live: true, players: 253 }),
  make('Crazy Time', 'Evolution', 'linear-gradient(160deg,#ff6b35,#b33c10)', '🎡', { live: true, players: 1842 }),
  make('Sweet Bonanza Candy', 'Pragmatic', 'linear-gradient(160deg,#ff9ad1,#c23b9e)', '🍬', { live: true, players: 612 }),
  make('Mega Wheel', 'Pragmatic', 'linear-gradient(160deg,#7c5bff,#3b1fa3)', '🎯', { live: true, players: 430 }),
  make('Dice City', 'Pragmatic', 'linear-gradient(160deg,#e63946,#9c1f29)', '🎲', { live: true, players: 198 }),
  make('Blackjack Live', 'Evolution', 'linear-gradient(160deg,#2a5c9e,#143a66)', '🃏', { live: true, players: 521 }),
  make('Auto Roulette', 'Evolution', 'linear-gradient(160deg,#16273d,#0b1622)', '🎡', { live: true, players: 388 }),
  make('Lightning Dice', 'Evolution', 'linear-gradient(160deg,#ffd24d,#d69a0f)', '⚡', { live: true, players: 274 }),
];

/* ---- Jogos crash ---- */
export const crashGames = [
  make('Aviator', 'Spribe', 'linear-gradient(160deg,#e63946,#7a0f16)', '✈️', { hot: true, rtp: 97 }),
  make('Aviator Crash', 'Spribe', 'linear-gradient(160deg,#ffb24d,#d6571f)', '🚀', { rtp: 96 }),
  make('Mines', 'Spribe', 'linear-gradient(160deg,#16273d,#0b1622)', '💣', { hot: true, rtp: 97 }),
  make('Spaceman', 'Pragmatic', 'linear-gradient(160deg,#2a5c9e,#143a66)', '🧑\u200d🚀', { rtp: 96.5 }),
  make('Space Crash', 'Smartsoft', 'linear-gradient(160deg,#7c5bff,#3b1fa3)', '🛸', { rtp: 95 }),
  make('Aviatrix', 'Aviatrix', 'linear-gradient(160deg,#5ec6ff,#1f5f9f)', '🛩️', { rtp: 97 }),
  make('Banana Mines', 'Banana', 'linear-gradient(160deg,#ffd24d,#d69a0f)', '🍌', { rtp: 96 }),
  make('JetX', 'Smartsoft', 'linear-gradient(160deg,#ff6b35,#b33c10)', '🛫', { rtp: 97 }),
];

/* ---- Slots ---- */
export const slotsGames = [
  make('Book of Dead', "Play'n GO", 'linear-gradient(160deg,#d6a30f,#8a6500)', '📖'),
  make('Big Bass Bonanza', 'Pragmatic', 'linear-gradient(160deg,#1f9f9f,#0c5e5e)', '🎣'),
  make('Wolf Gold', 'Pragmatic', 'linear-gradient(160deg,#ffb24d,#9c6100)', '🐺'),
  make('Starburst', 'NetEnt', 'linear-gradient(160deg,#7c5bff,#3b1fa3)', '🌟'),
  make('Money Train 3', 'Relax', 'linear-gradient(160deg,#e63946,#7a0f16)', '🚂'),
  make('Sugar Rush', 'Pragmatic', 'linear-gradient(160deg,#ff9ad1,#c23b9e)', '🧁'),
  make('Gates of Olympus', 'Pragmatic', 'linear-gradient(160deg,#7c8bff,#3b3fa3)', '⚡'),
  make('The Dog House', 'Pragmatic', 'linear-gradient(160deg,#5ec6ff,#1f5f9f)', '🐕'),
];

/* ---- Top ganhos (grid numerado) ---- */
export const topWinners = [
  ...popularGames.slice(0, 5),
  ...crashGames.slice(0, 5),
].map((g, i) => ({ ...g, rank: i + 1, amount: rndMoney() * 5 }));

/* ---- Ticker "Top Ganhos" (faixa rolando) ---- */
export const tickerWins = [
  { game: 'Speed Baccarat', user: 'FR***', amount: 22600 },
  { game: 'Fire in the Hole', user: 'MA***', amount: 17592.5 },
  { game: 'Le Bandit', user: 'LU***', amount: 14711 },
  { game: 'Fortune Tiger', user: 'JO***', amount: 49031.06 },
  { game: 'Aviator', user: 'CA***', amount: 8851.82 },
  { game: 'Gates of Olympus', user: 'PE***', amount: 31250.4 },
  { game: 'Mines', user: 'RA***', amount: 12375.65 },
  { game: 'Sweet Bonanza', user: 'BR***', amount: 9870 },
];

/* ---- Provedores ---- */
export const providers = [
  'PG Soft', 'Pragmatic', 'Evolution', 'Spribe', "Play'n GO",
  'NetEnt', 'Relax', 'Smartsoft', 'Gamzix', 'Aviatrix',
];
