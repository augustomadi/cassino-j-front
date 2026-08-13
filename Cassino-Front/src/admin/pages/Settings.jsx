import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../components/ConfirmModal';
import * as adminSettingsApi from '../../api/adminSettings';
import { ApiError } from '../../api/http';
import { fmtCents } from '../../utils/money';

/* Converte centavos para uma string de reais editável em <input>, e vice-versa.
   Nulo (= "sem política própria da casa", ver backend) vira campo vazio. */
const centsToInput = (cents) => (cents == null ? '' : (cents / 100).toString());

// Campo vazio é intencional (null = sem teto próprio). Texto que não vira
// número é diferente — não pode virar null em silêncio, senão "abc" some e
// vira "sem limite" sem ninguém perceber.
const inputToCents = (value) => {
  if (value.trim() === '') return null;
  const parsed = Math.round(parseFloat(value.replace(',', '.')) * 100);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const MONEY_FIELD_LABELS = {
  min_deposit_cents: 'Depósito mínimo',
  min_withdrawal_cents: 'Saque mínimo',
  daily_withdrawal_limit_cents: 'Limite de saque diário',
  withdrawal_auto_approval_max_cents: 'Teto do ciclo automático',
};

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const load = () => {
    setLoading(true);
    adminSettingsApi
      .getSettings()
      .then((res) => {
        setSettings(res.data);
        setForm({
          platform_name: res.data.platform_name,
          min_deposit_cents: centsToInput(res.data.min_deposit_cents),
          min_withdrawal_cents: centsToInput(res.data.min_withdrawal_cents),
          daily_withdrawal_limit_cents: centsToInput(res.data.daily_withdrawal_limit_cents),
          withdrawal_auto_approval_max_cents: centsToInput(res.data.withdrawal_auto_approval_max_cents),
        });
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar as configurações.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const askConfirm = () => {
    setError(null);
    const parsed = {
      min_deposit_cents: inputToCents(form.min_deposit_cents),
      min_withdrawal_cents: inputToCents(form.min_withdrawal_cents),
      daily_withdrawal_limit_cents: inputToCents(form.daily_withdrawal_limit_cents),
      withdrawal_auto_approval_max_cents: inputToCents(form.withdrawal_auto_approval_max_cents),
    };
    const invalidKey = Object.keys(parsed).find((key) => Number.isNaN(parsed[key]));
    if (invalidKey) {
      setError(`"${MONEY_FIELD_LABELS[invalidKey]}" não é um valor válido. Use só números (ex.: 100 ou 100,50) ou deixe em branco.`);
      return;
    }
    setShowConfirm(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await adminSettingsApi.updateSettings({
        platform_name: form.platform_name,
        min_deposit_cents: inputToCents(form.min_deposit_cents),
        min_withdrawal_cents: inputToCents(form.min_withdrawal_cents),
        daily_withdrawal_limit_cents: inputToCents(form.daily_withdrawal_limit_cents),
        withdrawal_auto_approval_max_cents: inputToCents(form.withdrawal_auto_approval_max_cents),
      });
      setSettings(res.data);
      setSaved(true);
      setShowConfirm(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar.');
      setShowConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <AdminLayout title="Configurações" subtitle="Parâmetros gerais da plataforma">
        <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações" subtitle="Parâmetros gerais da plataforma">
      {error && <p style={{ color: 'var(--red-text)', marginBottom: 16 }}>{error}</p>}

      <div className="adm-grid adm-cols-2">
        <div className="adm-card">
          <div className="adm-card-head"><h3>Geral</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="adm-field">
              <label>Nome da plataforma</label>
              <input value={form.platform_name} onChange={(e) => setField('platform_name', e.target.value)} />
            </div>
            <div className="adm-field">
              <label>Depósito mínimo (R$) — em branco = só o mínimo do método</label>
              <input type="number" min="0" step="0.01" value={form.min_deposit_cents} onChange={(e) => setField('min_deposit_cents', e.target.value)} />
              <small style={{ color: 'var(--text-dim)' }}>
                Efetivo hoje (PIX): {fmtCents(settings.effective_minimums.deposit.pix)}
              </small>
            </div>
            <div className="adm-field">
              <label>Saque mínimo (R$) — em branco = só o mínimo do método</label>
              <input type="number" min="0" step="0.01" value={form.min_withdrawal_cents} onChange={(e) => setField('min_withdrawal_cents', e.target.value)} />
              <small style={{ color: 'var(--text-dim)' }}>
                Efetivo hoje (PIX): {fmtCents(settings.effective_minimums.withdrawal.pix)}
              </small>
            </div>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><h3>Limites de Saque</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="adm-field">
              <label>Limite de saque diário por jogador (R$) — em branco = sem teto</label>
              <input type="number" min="0" step="0.01" value={form.daily_withdrawal_limit_cents} onChange={(e) => setField('daily_withdrawal_limit_cents', e.target.value)} />
              <small style={{ color: 'var(--text-dim)' }}>Conta saque pedido no dia, não pago.</small>
            </div>
            <div className="adm-field">
              <label>Teto por saque para entrar no ciclo automático (R$) — em branco = sem teto próprio</label>
              <input type="number" min="0" step="0.01" value={form.withdrawal_auto_approval_max_cents} onChange={(e) => setField('withdrawal_auto_approval_max_cents', e.target.value)} />
              <small style={{ color: 'var(--text-dim)' }}>
                Compõe com o limite automático da conta do cassino — um saque grande vai para a fila mesmo com orçamento sobrando.
              </small>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="adm-btn adm-btn-gold" onClick={askConfirm} disabled={saving}>
          {saving ? 'Salvando...' : saved ? '✓ Salvo' : 'Salvar configurações'}
        </button>
        {settings.updated_at && (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            Última atualização: {new Date(settings.updated_at).toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Salvar configurações"
          message="Confirma salvar essas configurações? Os novos valores passam a valer para toda a plataforma imediatamente."
          confirmLabel="Salvar"
          tone="gold"
          loading={saving}
          onConfirm={save}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </AdminLayout>
  );
}
