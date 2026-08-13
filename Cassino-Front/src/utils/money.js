/* Dinheiro do backend sempre vem em centavos, inteiro (ADR 0004 do backend).
   Nunca fazer conta de dinheiro em float — só formatar para exibição aqui. */
export const fmtCents = (cents) =>
  ((cents ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
