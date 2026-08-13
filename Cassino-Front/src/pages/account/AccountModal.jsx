import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import './AccountModal.css';
import { useAuth } from '../../auth/AuthContext';
import * as authApi from '../../api/auth';
import * as meApi from '../../api/me';
import * as kycApi from '../../api/kyc';
import * as withdrawalsApi from '../../api/withdrawals';
import { ApiError } from '../../api/http';
import { IconClose } from '../../components/icons/Icons';
import { fmtCents } from '../../utils/money';
import { TRANSACTION_TYPE_LABELS as TYPE_LABELS } from '../../utils/transactionLabels';

export default function AccountModal({ initialTab = 'profile', onClose }) {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal account-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Fechar">
          <IconClose size={18} />
        </button>
        <h2>Minha conta</h2>

        <div className="security-tabs">
          <button className={tab === 'profile' ? 'is-active' : ''} onClick={() => setTab('profile')}>
            Perfil
          </button>
          <button className={tab === '2fa' ? 'is-active' : ''} onClick={() => setTab('2fa')}>
            Segurança
          </button>
          <button className={tab === 'sessions' ? 'is-active' : ''} onClick={() => setTab('sessions')}>
            Sessões
          </button>
          <button className={tab === 'kyc' ? 'is-active' : ''} onClick={() => setTab('kyc')}>
            Verificação
          </button>
          <button className={tab === 'withdrawals' ? 'is-active' : ''} onClick={() => setTab('withdrawals')}>
            Saques
          </button>
          <button className={tab === 'extract' ? 'is-active' : ''} onClick={() => setTab('extract')}>
            Extrato
          </button>
        </div>

        {tab === 'profile' && <ProfilePanel user={user} onChanged={refreshUser} />}
        {tab === '2fa' && <TwoFactorPanel enabled={user?.two_factor_enabled} onChanged={refreshUser} />}
        {tab === 'sessions' && <SessionsPanel />}
        {tab === 'kyc' && <KycPanel />}
        {tab === 'withdrawals' && <WithdrawalsPanel onChanged={refreshUser} />}
        {tab === 'extract' && <ExtractPanel />}
      </div>
    </div>
  );
}

function ProfilePanel({ user, onChanged }) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      await meApi.updateProfile({ name, phone: phone || null });
      await onChanged();
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      {error && <p className="auth-error">{error}</p>}
      {saved && <p className="account-saved">Perfil atualizado.</p>}

      <div className="account-readonly">
        <div>
          <span>E-mail</span>
          <strong>
            {user?.email} {user?.email_verified ? <em className="account-verified">verificado</em> : <em className="account-unverified">não verificado</em>}
          </strong>
        </div>
        <div>
          <span>CPF</span>
          <strong>{user?.cpf_masked}</strong>
        </div>
        <div>
          <span>Data de nascimento</span>
          <strong>{user?.birth_date}</strong>
        </div>
      </div>

      <label className="auth-field">
        <span>Nome completo</span>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="auth-field">
        <span>Telefone</span>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  );
}

function TwoFactorPanel({ enabled, onChanged }) {
  const [step, setStep] = useState('idle'); // idle | setup | recovery | disable
  const [secret, setSecret] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.enableTwoFactor();
      setSecret(res.data.secret);
      const dataUrl = await QRCode.toDataURL(res.data.provisioning_uri, { margin: 1, width: 220 });
      setQrDataUrl(dataUrl);
      setStep('setup');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível iniciar a ativação.');
    } finally {
      setLoading(false);
    }
  };

  const confirmSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.confirmTwoFactor(code);
      setRecoveryCodes(res.data.recovery_codes);
      setStep('recovery');
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Código inválido.');
    } finally {
      setLoading(false);
    }
  };

  const finishRecovery = () => {
    setStep('idle');
    setSecret(null);
    setQrDataUrl(null);
    setCode('');
    setRecoveryCodes([]);
  };

  const submitDisable = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.disableTwoFactor(password);
      setPassword('');
      setStep('idle');
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível desativar.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'setup') {
    return (
      <form className="auth-form" onSubmit={confirmSetup}>
        {error && <p className="auth-error">{error}</p>}
        <p className="auth-hint">
          Escaneie o QR code no seu aplicativo autenticador (Google Authenticator, Authy, etc.) e informe o código
          gerado.
        </p>
        {qrDataUrl && <img className="security-qr" src={qrDataUrl} alt="QR code de ativação do 2FA" />}
        <p className="security-secret">
          Não consegue escanear? Digite manualmente: <code>{secret}</code>
        </p>
        <label className="auth-field">
          <span>Código do autenticador</span>
          <input
            type="text"
            required
            autoFocus
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
          {loading ? 'Confirmando...' : 'Confirmar e ativar'}
        </button>
        <button type="button" className="auth-link" onClick={() => setStep('idle')}>
          Cancelar
        </button>
      </form>
    );
  }

  if (step === 'recovery') {
    return (
      <div className="auth-form">
        <p className="auth-hint">
          Verificação em duas etapas ativada. Guarde estes códigos de recuperação em lugar seguro — eles não serão
          exibidos novamente e cada um serve para um único login sem o autenticador.
        </p>
        <ul className="security-recovery-codes">
          {recoveryCodes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <button className="btn btn-gold auth-submit" onClick={finishRecovery}>
          Já guardei os códigos
        </button>
      </div>
    );
  }

  if (step === 'disable') {
    return (
      <form className="auth-form" onSubmit={submitDisable}>
        {error && <p className="auth-error">{error}</p>}
        <label className="auth-field">
          <span>Confirme sua senha para desativar</span>
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
          {loading ? 'Desativando...' : 'Desativar verificação em duas etapas'}
        </button>
        <button type="button" className="auth-link" onClick={() => setStep('idle')}>
          Cancelar
        </button>
      </form>
    );
  }

  return (
    <div className="security-panel">
      {error && <p className="auth-error">{error}</p>}
      <p className={`security-status ${enabled ? 'is-on' : 'is-off'}`}>{enabled ? 'Ativada' : 'Desativada'}</p>
      <p className="auth-hint">
        {enabled
          ? 'Sua conta pede um código do autenticador a cada login.'
          : 'Adicione uma camada extra de proteção exigindo um código do seu celular a cada login.'}
      </p>
      {enabled ? (
        <button className="btn btn-ghost" onClick={() => setStep('disable')}>
          Desativar
        </button>
      ) : (
        <button className="btn btn-gold" onClick={startSetup} disabled={loading}>
          {loading ? 'Gerando...' : 'Ativar verificação em duas etapas'}
        </button>
      )}
    </div>
  );
}

function SessionsPanel() {
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState(null);
  const [revokingId, setRevokingId] = useState(null);

  const load = () => {
    authApi
      .listSessions()
      .then((res) => setSessions(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar as sessões.'));
  };

  useEffect(load, []);

  const revoke = async (id) => {
    setRevokingId(id);
    try {
      await authApi.revokeSession(id);
      setSessions((list) => list.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível revogar a sessão.');
    } finally {
      setRevokingId(null);
    }
  };

  if (error) return <p className="auth-error">{error}</p>;
  if (sessions === null) return <p className="auth-hint">Carregando...</p>;

  return (
    <ul className="security-sessions">
      {sessions.map((s) => (
        <li key={s.id}>
          <div>
            <strong>{s.ip_address || 'IP desconhecido'}</strong>
            {s.is_current && <span className="chip chip-hot">Sessão atual</span>}
            <span className="security-session-agent">{s.user_agent || 'Dispositivo desconhecido'}</span>
            <span className="security-session-time">
              Último uso: {s.last_used_at ? new Date(s.last_used_at).toLocaleString('pt-BR') : '—'}
            </span>
          </div>
          {!s.is_current && (
            <button className="btn btn-ghost" onClick={() => revoke(s.id)} disabled={revokingId === s.id}>
              {revokingId === s.id ? 'Revogando...' : 'Revogar'}
            </button>
          )}
        </li>
      ))}
      {sessions.length === 0 && <p className="auth-hint">Nenhuma sessão ativa.</p>}
    </ul>
  );
}

function ExtractPanel() {
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPage = (page) => {
    setLoading(true);
    meApi
      .getTransactions({ page })
      .then((res) => {
        setTransactions((list) => (page === 1 ? res.data : [...list, ...res.data]));
        setMeta(res.meta);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o extrato.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadPage(1), []);

  const hasMore = meta && meta.current_page < meta.last_page;

  return (
    <div className="account-extract">
      {error && <p className="auth-error">{error}</p>}
      {transactions.length === 0 && !loading && <p className="auth-hint">Nenhuma movimentação ainda.</p>}
      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            <div>
              <strong>{TYPE_LABELS[t.type] || t.type}</strong>
              <span className="security-session-time">
                {t.created_at ? new Date(t.created_at).toLocaleString('pt-BR') : ''}
                {t.description ? ` · ${t.description}` : ''}
              </span>
            </div>
            <span className={`account-extract-amount ${t.amount_cents >= 0 ? 'pos' : 'neg'}`}>
              {t.amount_cents >= 0 ? '+' : ''}
              {fmtCents(t.amount_cents)}
            </span>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button className="btn btn-ghost account-extract-more" onClick={() => loadPage(meta.current_page + 1)} disabled={loading}>
          {loading ? 'Carregando...' : 'Carregar mais'}
        </button>
      )}
    </div>
  );
}

const KYC_STATUS_LABEL = {
  not_submitted: 'Não enviado',
  pending: 'Em análise',
  approved: 'Aprovado',
  rejected: 'Recusado',
};
const KYC_STATUS_TONE = {
  not_submitted: 'is-off',
  pending: 'is-pending',
  approved: 'is-on',
  rejected: 'is-rejected',
};

function KycPanel() {
  const [kyc, setKyc] = useState(null);
  const [error, setError] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const load = () => {
    kycApi
      .getKycStatus()
      .then((res) => setKyc(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar sua verificação.'));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await kycApi.submitKyc({ selfie, idFront, idBack });
      setSent(true);
      setSelfie(null);
      setIdFront(null);
      setIdBack(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível enviar os documentos.');
    } finally {
      setLoading(false);
    }
  };

  if (!kyc) return <p className="auth-hint">Carregando...</p>;

  const canSubmit = kyc.status === 'not_submitted' || kyc.status === 'rejected';

  return (
    <div className="security-panel" style={{ width: '100%' }}>
      {error && <p className="auth-error">{error}</p>}
      <p className={`security-status ${KYC_STATUS_TONE[kyc.status]}`}>{KYC_STATUS_LABEL[kyc.status] || kyc.status}</p>

      {kyc.status === 'approved' && (
        <p className="auth-hint">Sua identidade foi verificada. Você já pode sacar.</p>
      )}
      {kyc.status === 'pending' && (
        <p className="auth-hint">Seus documentos estão em análise. Isso costuma levar até 48 horas.</p>
      )}
      {kyc.status === 'rejected' && (
        <p className="auth-error">Motivo da recusa: {kyc.rejection_reason}</p>
      )}
      {kyc.status === 'not_submitted' && (
        <p className="auth-hint">Envie seus documentos para liberar o saque.</p>
      )}

      {sent && <p style={{ color: 'var(--green-400)' }}>Documentos enviados. Aguarde a análise.</p>}

      {canSubmit && (
        <form onSubmit={submit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
          <label className="auth-field">
            <span>Selfie segurando o documento</span>
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" required onChange={(e) => setSelfie(e.target.files[0])} />
          </label>
          <label className="auth-field">
            <span>Frente do documento</span>
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" required onChange={(e) => setIdFront(e.target.files[0])} />
          </label>
          <label className="auth-field">
            <span>Verso do documento</span>
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" required onChange={(e) => setIdBack(e.target.files[0])} />
          </label>
          <small className="auth-hint">JPG, PNG ou PDF, até 8MB cada.</small>
          <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar documentos'}
          </button>
        </form>
      )}
    </div>
  );
}

const WITHDRAWAL_STATUS_LABEL = {
  awaiting_approval: 'Aguardando aprovação',
  paid: 'Pago',
  rejected: 'Recusado',
  cancelled: 'Cancelado',
};

function WithdrawalsPanel({ onChanged }) {
  const [withdrawals, setWithdrawals] = useState(null);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const load = () => {
    withdrawalsApi
      .listWithdrawals({})
      .then((res) => setWithdrawals(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar seus saques.'));
  };

  useEffect(load, []);

  const cancel = async (id) => {
    setCancellingId(id);
    try {
      await withdrawalsApi.cancelWithdrawal(id);
      load();
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível cancelar.');
    } finally {
      setCancellingId(null);
    }
  };

  if (error) return <p className="auth-error">{error}</p>;
  if (withdrawals === null) return <p className="auth-hint">Carregando...</p>;

  return (
    <ul className="security-sessions">
      {withdrawals.length === 0 && <p className="auth-hint">Nenhum saque ainda.</p>}
      {withdrawals.map((w) => (
        <li key={w.id}>
          <div>
            <strong>{fmtCents(w.amount_cents)}</strong>
            <span className="security-session-agent">
              {WITHDRAWAL_STATUS_LABEL[w.status] || w.status} · chave {w.destination.key_masked}
            </span>
            <span className="security-session-time">
              {w.created_at ? new Date(w.created_at).toLocaleString('pt-BR') : ''}
              {w.review_reason ? ` · ${w.review_reason}` : ''}
            </span>
          </div>
          {w.status === 'awaiting_approval' && (
            <button className="btn btn-ghost" onClick={() => cancel(w.id)} disabled={cancellingId === w.id}>
              {cancellingId === w.id ? 'Cancelando...' : 'Cancelar'}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
