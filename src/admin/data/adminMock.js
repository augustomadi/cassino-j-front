/* Dados fictícios do painel admin — substituir por API real depois. */

export const fmtBRL = (v) =>
  (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const fmtNum = (v) => (v ?? 0).toLocaleString('pt-BR');

export const fmtPct = (v) => `${(v ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));

/* ---- KPIs principais do dashboard ---- */
export const kpis = {
  ggr: 1284530.45, // Gross Gaming Revenue (apostado - pago)
  ngr: 982110.2, // Net Gaming Revenue (GGR - bônus - taxas)
  deposits: 4820300.0,
  withdrawals: 3110870.5,
  caixa: 1709429.5, // saldo em caixa
  activeUsers: 8423,
  newUsers: 612,
  onlineNow: 734,
  pendingWithdrawals: 23,
  pendingWithdrawalsValue: 184320.0,
  conversionRate: 31.4, // % de cadastros que depositaram
  avgDeposit: 187.5,
  houseEdge: 4.2,
  bonusGranted: 142300.0,
};

/* ---- Variação % vs período anterior (para os cards) ---- */
export const kpiTrends = {
  ggr: 12.4,
  ngr: 9.8,
  deposits: 15.2,
  withdrawals: 7.1,
  caixa: 5.6,
  activeUsers: 8.9,
  newUsers: -3.2,
  conversionRate: 2.1,
};

/* ---- Série de receita (últimos 30 dias) ---- */
export const revenueSeries = Array.from({ length: 30 }, (_, i) => {
  const base = 35000 + i * 900;
  return {
    day: i + 1,
    deposits: Math.round(base + rand(-8000, 14000)),
    withdrawals: Math.round(base * 0.62 + rand(-6000, 9000)),
    ggr: Math.round(base * 0.34 + rand(-3000, 6000)),
  };
});

/* ---- Receita por mês (P&L) ---- */
export const monthlyPnL = [
  { month: 'Jan', revenue: 720000, expenses: 480000 },
  { month: 'Fev', revenue: 810000, expenses: 510000 },
  { month: 'Mar', revenue: 905000, expenses: 560000 },
  { month: 'Abr', revenue: 870000, expenses: 540000 },
  { month: 'Mai', revenue: 1020000, expenses: 610000 },
  { month: 'Jun', revenue: 1180000, expenses: 690000 },
  { month: 'Jul', revenue: 1284530, expenses: 740000 },
];

/* ---- Métodos de pagamento (donut) ---- */
export const paymentMethods = [
  { name: 'PIX', value: 78, color: '#22c55e' },
  { name: 'Cartão', value: 14, color: '#f5a623' },
  { name: 'Boleto', value: 5, color: '#7c3aed' },
  { name: 'Cripto', value: 3, color: '#ff6b35' },
];

/* ---- Despesas operacionais ---- */
export const expenses = [
  { id: 'e1', label: 'Comissões de afiliados', value: 218400, cat: 'Marketing' },
  { id: 'e2', label: 'Provedores de jogos (GGR share)', value: 256900, cat: 'Operação' },
  { id: 'e3', label: 'Taxas de pagamento (PIX/gateway)', value: 96300, cat: 'Operação' },
  { id: 'e4', label: 'Bônus e promoções', value: 142300, cat: 'Marketing' },
  { id: 'e5', label: 'Infraestrutura / servidores', value: 38700, cat: 'Tecnologia' },
  { id: 'e6', label: 'Equipe e suporte', value: 74000, cat: 'Pessoal' },
];

/* ---- Afiliados ---- */
const affNames = [
  'João Aposta', 'Maria Bets', 'Canal do Tigre', 'Influencer Slots', 'Grupo VIP Cassino',
  'Pedro Predador', 'Aposta Certa BR', 'Rei do Aviator', 'Ana Lucky', 'Cassino Mestre',
];
export const affiliates = affNames.map((name, i) => {
  const code = name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 10) + (i + 1);
  const signups = randInt(40, 1200);
  const deposited = Math.round(rand(20000, 480000));
  const commissionPct = [20, 25, 30, 35, 40, 15][i % 6];
  const revShare = Math.round(deposited * (commissionPct / 100) * 0.4);
  return {
    id: `aff${i + 1}`,
    name,
    code,
    link: `https://cassino-j.com/r/${code}`,
    commissionPct,
    model: i % 3 === 0 ? 'RevShare' : i % 3 === 1 ? 'CPA' : 'Híbrido',
    clicks: randInt(800, 42000),
    signups,
    ftd: Math.round(signups * rand(0.18, 0.46)), // first time deposits
    deposited,
    commissionDue: revShare,
    commissionPaid: Math.round(revShare * rand(0.4, 0.95)),
    status: i % 7 === 0 ? 'pausado' : 'ativo',
    createdAt: `2026-0${(i % 6) + 1}-1${i % 9}`,
  };
});

/* ---- Usuários ---- */
const firstNames = ['Lucas', 'Ana', 'Carlos', 'Júlia', 'Rafael', 'Beatriz', 'Gustavo', 'Larissa', 'Felipe', 'Camila', 'Bruno', 'Mariana', 'Diego', 'Patrícia', 'Thiago', 'Fernanda'];
const lastNames = ['Silva', 'Souza', 'Oliveira', 'Santos', 'Pereira', 'Costa', 'Almeida', 'Lima', 'Gomes', 'Ribeiro'];
const statuses = ['ativo', 'ativo', 'ativo', 'inativo', 'bloqueado'];
const kycStates = ['verificado', 'verificado', 'pendente', 'recusado'];

export const users = Array.from({ length: 48 }, (_, i) => {
  const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
  const deposited = Math.round(rand(0, 60000));
  const withdrawn = Math.round(deposited * rand(0.1, 0.8));
  const wagered = Math.round(deposited * rand(1.5, 12));
  const houseProfit = Math.round((deposited - withdrawn) * rand(0.4, 0.95));
  const aff = affiliates[i % affiliates.length];
  return {
    id: `u${1000 + i}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@email.com`,
    balance: Math.round(rand(0, 8000) * 100) / 100,
    deposited,
    withdrawn,
    wagered,
    houseProfit, // quanto o cassino lucrou com este usuário
    withdrawalsCount: randInt(0, 24),
    status: statuses[i % statuses.length],
    kyc: kycStates[i % kycStates.length],
    affiliate: aff.name,
    lastLogin: `2026-06-0${(i % 9) + 1} ${randInt(10, 23)}:${randInt(10, 59)}`,
    createdAt: `2026-0${(i % 6) + 1}-${randInt(10, 28)}`,
    vip: i % 9 === 0,
  };
});

/* ---- Saques pendentes de aprovação ---- */
export const pendingWithdrawals = Array.from({ length: 8 }, (_, i) => {
  const u = users[i * 3];
  return {
    id: `w${5000 + i}`,
    user: u.name,
    userId: u.id,
    amount: Math.round(rand(150, 12000) * 100) / 100,
    method: ['PIX', 'PIX', 'PIX', 'Cartão'][i % 4],
    pixKey: `***${randInt(100, 999)}.***.***-${randInt(10, 99)}`,
    requestedAt: `2026-06-09 ${randInt(10, 23)}:${randInt(10, 59)}`,
    risk: i % 5 === 0 ? 'alto' : i % 2 === 0 ? 'médio' : 'baixo',
  };
});

/* ---- Transações recentes ---- */
const txTypes = ['depósito', 'saque', 'aposta', 'ganho', 'bônus'];
export const transactions = Array.from({ length: 60 }, (_, i) => {
  const type = txTypes[i % txTypes.length];
  const u = users[i % users.length];
  const sign = type === 'saque' || type === 'aposta' ? -1 : 1;
  return {
    id: `t${90000 + i}`,
    type,
    user: u.name,
    userId: u.id,
    amount: sign * Math.round(rand(20, 5000) * 100) / 100,
    method: type === 'depósito' || type === 'saque' ? ['PIX', 'Cartão', 'Boleto'][i % 3] : '—',
    game: type === 'aposta' || type === 'ganho' ? ['Fortune Tiger', 'Aviator', 'Mines', 'Gates of Olympus'][i % 4] : '—',
    status: i % 11 === 0 ? 'pendente' : i % 13 === 0 ? 'falhou' : 'concluído',
    date: `2026-06-0${(i % 9) + 1} ${randInt(10, 23)}:${randInt(10, 59)}`,
  };
});

/* ---- Desempenho por jogo ---- */
export const gamePerformance = [
  { game: 'Fortune Tiger', provider: 'PG Soft', bets: 1820400, ggr: 312500, players: 3421, emoji: '🐯' },
  { game: 'Aviator', provider: 'Spribe', bets: 1640200, ggr: 268900, players: 2890, emoji: '✈️' },
  { game: 'Mines', provider: 'Spribe', bets: 980300, ggr: 142300, players: 1980, emoji: '💣' },
  { game: 'Gates of Olympus', provider: 'Pragmatic', bets: 870100, ggr: 138700, players: 1654, emoji: '⚡' },
  { game: 'Fortune Rabbit', provider: 'PG Soft', bets: 720500, ggr: 110200, players: 1432, emoji: '🐰' },
  { game: 'Sweet Bonanza', provider: 'Pragmatic', bets: 690300, ggr: 98400, players: 1320, emoji: '🍭' },
];

/* ---- Atividade recente (feed) ---- */
export const activityFeed = [
  { id: 'a1', icon: '💰', text: 'Novo depósito de R$ 2.500,00', user: 'Lucas Silva', time: 'há 2 min', tone: 'green' },
  { id: 'a2', icon: '🏧', text: 'Saque solicitado de R$ 1.200,00', user: 'Ana Souza', time: 'há 5 min', tone: 'gold' },
  { id: 'a3', icon: '🎉', text: 'Grande vitória no Aviator: R$ 8.400,00', user: 'Carlos Lima', time: 'há 8 min', tone: 'purple' },
  { id: 'a4', icon: '👤', text: 'Novo cadastro via afiliado "Canal do Tigre"', user: 'Júlia Costa', time: 'há 12 min', tone: 'blue' },
  { id: 'a5', icon: '⚠️', text: 'Saque de alto risco aguardando revisão', user: 'Diego Gomes', time: 'há 18 min', tone: 'red' },
  { id: 'a6', icon: '💰', text: 'Novo depósito de R$ 450,00', user: 'Camila Reis', time: 'há 21 min', tone: 'green' },
];
