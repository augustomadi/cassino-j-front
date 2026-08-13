import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import { AreaChart } from '../components/Charts';
import * as adminDashboardApi from '../../api/adminDashboard';
import { ApiError } from '../../api/http';
import { fmtCents } from '../../utils/money';
import {
  IcFinance, IcWallet, IcUsers, IcTransactions, IcAlert,
} from '../components/AdminIcons';

const FEED_LABELS = {
  'deposit.confirmed': 'Depósito confirmado',
  'withdrawal.requested': 'Saque solicitado',
  'withdrawal.approved': 'Saque aprovado',
  'withdrawal.rejected': 'Saque recusado',
  'auth.registered': 'Novo cadastro',
  'kyc.submitted': 'Documentos de verificação enviados',
  'user.blocked': 'Usuário bloqueado',
  'user.balance_adjusted': 'Saldo ajustado manualmente',
  'cash_account.adjusted': 'Caixa ajustado manualmente',
};

export default function Dashboard() {
  const [period, setPeriod] = useState(30);
  const [kpis, setKpis] = useState(null);
  const [series, setSeries] = useState(null);
  const [seriesError, setSeriesError] = useState(false);
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState(null);

  const loadSeries = () => {
    adminDashboardApi
      .getDashboardRevenueSeries(period)
      .then((res) => {
        setSeries(res.data);
        setSeriesError(false);
      })
      .catch(() => {
        setSeries([]);
        setSeriesError(true);
      });
  };

  useEffect(() => {
    adminDashboardApi.getDashboardKpis(period).then((res) => setKpis(res.data)).catch((err) => setError(err instanceof ApiError ? err.message : 'Erro ao carregar KPIs.'));
    adminDashboardApi
      .getDashboardRevenueSeries(period)
      .then((res) => {
        setSeries(res.data);
        setSeriesError(false);
      })
      .catch(() => {
        setSeries([]);
        setSeriesError(true);
      });
  }, [period]);

  useEffect(() => {
    adminDashboardApi.getDashboardActivityFeed(15).then((res) => setFeed(res.data)).catch(() => setFeed([]));
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Visão geral do cassino"
      actions={
        <select className="adm-select" value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </select>
      }
    >
      {error && <p style={{ color: 'var(--red-text)', marginBottom: 16 }}>{error}</p>}

      {!kpis ? (
        <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>
      ) : (
        <>
          <div className="adm-grid adm-kpis">
            <StatCard
              label="GGR (Receita Bruta)"
              value={kpis.ggr_cents == null ? '—' : fmtCents(kpis.ggr_cents)}
              icon={IcFinance}
              tone="gold"
              hint={kpis.ggr_cents == null ? 'disponível quando os jogos existirem' : undefined}
            />
            <StatCard
              label="NGR (Receita Líquida)"
              value={kpis.ngr_cents == null ? '—' : fmtCents(kpis.ngr_cents)}
              icon={IcFinance}
              tone="green"
              hint={kpis.ngr_cents == null ? 'disponível quando os jogos existirem' : undefined}
            />
            <StatCard label="Saldo em Caixa" value={fmtCents(kpis.cash_balance_cents)} icon={IcWallet} tone="blue" hint="disponível agora" />
            <StatCard label="Usuários Ativos" value={kpis.active_users_count} icon={IcUsers} tone="purple" hint={`${kpis.new_users_count} novos no período`} />
          </div>

          <div className="adm-grid adm-kpis" style={{ marginTop: 16 }}>
            <StatCard label="Depósitos" value={fmtCents(kpis.deposits_cents)} icon={IcTransactions} tone="green" hint={`${kpis.deposits_count} depósitos`} />
            <StatCard label="Saques" value={fmtCents(kpis.withdrawals_cents)} icon={IcTransactions} tone="gold" hint={`${kpis.withdrawals_count} saques`} />
            <Link to="/admin/saques" style={{ textDecoration: 'none', color: 'inherit' }}>
              <StatCard label="Saques Pendentes" value={kpis.pending_withdrawals_count} icon={IcAlert} tone="red" hint={fmtCents(kpis.pending_withdrawals_cents)} />
            </Link>
            <StatCard
              label="Taxa de Conversão"
              value={kpis.conversion_rate == null ? '—' : `${(kpis.conversion_rate * 100).toFixed(1)}%`}
              icon={IcUsers}
              tone="blue"
              hint="cadastro → 1º depósito"
            />
          </div>

          <div className="adm-grid adm-cols-2" style={{ marginTop: 16 }}>
            <div className="adm-card">
              <div className="adm-card-head">
                <h3>Depósitos x Saques</h3>
                <span className="adm-link">Últimos {period} dias</span>
              </div>
              {seriesError ? (
                <p style={{ color: 'var(--red-text)' }}>
                  Não foi possível carregar os dados do período.{' '}
                  <button className="adm-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={loadSeries}>
                    Tentar novamente
                  </button>
                </p>
              ) : series === null ? (
                <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>
              ) : series.length > 0 ? (
                <AreaChart
                  data={series}
                  series={[
                    { key: 'deposits_cents', label: 'Depósitos', color: 'var(--green-500)' },
                    { key: 'withdrawals_cents', label: 'Saques', color: 'var(--gold-500)' },
                  ]}
                />
              ) : (
                <p style={{ color: 'var(--text-dim)' }}>Sem dados no período.</p>
              )}
            </div>

            <div className="adm-card">
              <div className="adm-card-head">
                <h3>Atividade Recente</h3>
              </div>
              <div className="adm-feed">
                {feed === null && <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>}
                {feed?.length === 0 && <p style={{ color: 'var(--text-dim)' }}>Nenhuma atividade recente.</p>}
                {feed?.map((a) => (
                  <div className="adm-feed-item" key={a.id}>
                    <div className="adm-feed-txt">
                      <strong>{FEED_LABELS[a.action] || a.action}</strong>
                      <span>
                        {a.context?.amount_cents != null ? fmtCents(a.context.amount_cents) : `${a.actor_type} #${a.actor_id ?? '—'}`}
                      </span>
                    </div>
                    <span className="adm-feed-time">{a.created_at ? new Date(a.created_at).toLocaleString('pt-BR') : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: 16 }}>
            Dados agregados até {kpis.aggregated_at ? new Date(kpis.aggregated_at).toLocaleString('pt-BR') : '—'}. Jogos com melhor desempenho aparece aqui quando o módulo de jogos existir.
          </p>
        </>
      )}
    </AdminLayout>
  );
}
