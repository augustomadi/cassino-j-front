import { useEffect, useState } from 'react';
import '../auth/AuthModal.css';
import { useAuth } from '../../auth/AuthContext';
import * as withdrawalsApi from '../../api/withdrawals';
import * as kycApi from '../../api/kyc';
import { ApiError } from '../../api/http';
import { IconClose, IconCoin } from '../../components/icons/Icons';
import { fmtCents } from '../../utils/money';

const KEY_TYPE_LABELS = { cpf: 'CPF', email: 'E-mail', phone: 'Telefone', random: 'Chave aleatória' };

export default function WithdrawalModal({ onClose }) {
  const { refreshBalance } = useAuth();

  const [kyc, setKyc] = useState(null);
  const [methods, setMethods] = useState(null);
  const [amountInput, setAmountInput] = useState('');
  const [keyType, setKeyType] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    kycApi.getKycStatus().then((res) => setKyc(res.data)).catch(() => setKyc(null));
    withdrawalsApi
      .getWithdrawalMethods()
      .then((res) => {
        setMethods(res.data);
        if (res.data[0]) setKeyType(res.data[0].key_types[0]);
      })
      .catch(() => setMethods([]));
  }, []);

  const method = methods?.[0];
  const amountCents = Math.round(parseFloat(amountInput.replace(/\./g, '').replace(',', '.')) * 100 || 0);

  const submit = async (e) => {
    e.preventDefault();
    if (!method) return;
    setError(null);

    if (amountCents < method.min_cents || amountCents > method.max_cents) {
      setError(`Valor deve ser entre ${fmtCents(method.min_cents)} e ${fmtCents(method.max_cents)}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await withdrawalsApi.createWithdrawal({
        method: method.method,
        amountCents,
        destination: { key_type: keyType, key: keyValue },
        idempotencyKey: crypto.randomUUID(),
      });
      setResult(res.data);
      refreshBalance();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível solicitar o saque.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Fechar">
          <IconClose size={18} />
        </button>

        {kyc === null && <p className="auth-hint">Carregando...</p>}

        {kyc && !kyc.can_withdraw && (
          <div className="auth-form auth-confirmation">
            <h2>Verificação necessária</h2>
            <p>
              {kyc.status === 'pending' && 'Seus documentos estão em análise. O saque libera assim que a verificação for concluída.'}
              {kyc.status === 'rejected' && `Sua verificação foi recusada: ${kyc.rejection_reason}. Reenvie os documentos em "Minha conta".`}
              {kyc.status === 'not_submitted' && 'Envie seus documentos de identidade em "Minha conta" para liberar o saque.'}
            </p>
            <button className="btn btn-gold auth-submit" onClick={onClose}>Entendi</button>
          </div>
        )}

        {kyc?.can_withdraw && !result && (
          <form className="auth-form" onSubmit={submit}>
            <h2>Sacar</h2>
            {error && <p className="auth-error">{error}</p>}

            {method && (
              <>
                <label className="auth-field">
                  <span>Valor (mín. {fmtCents(method.min_cents)})</span>
                  <input type="text" inputMode="decimal" required value={amountInput} onChange={(e) => setAmountInput(e.target.value)} />
                </label>
                <label className="auth-field">
                  <span>Tipo de chave PIX</span>
                  <select value={keyType} onChange={(e) => setKeyType(e.target.value)}>
                    {method.key_types.map((t) => (
                      <option key={t} value={t}>{KEY_TYPE_LABELS[t] || t}</option>
                    ))}
                  </select>
                </label>
                <label className="auth-field">
                  <span>Chave PIX</span>
                  <input type="text" required value={keyValue} onChange={(e) => setKeyValue(e.target.value)} />
                </label>
                <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
                  <IconCoin size={18} />
                  {loading ? 'Enviando...' : 'Solicitar saque'}
                </button>
              </>
            )}
            {methods !== null && !method && <p className="auth-hint">Nenhum método de saque disponível no momento.</p>}
          </form>
        )}

        {result && (
          <div className="auth-form auth-confirmation">
            <h2>{result.status === 'paid' ? 'Saque pago!' : 'Saque solicitado'}</h2>
            <p>
              {result.status === 'paid'
                ? `${fmtCents(result.amount_cents)} já foram enviados para sua chave ${result.destination.key_masked}.`
                : `${fmtCents(result.amount_cents)} entraram na fila de aprovação. Você será avisado quando for processado.`}
            </p>
            <button className="btn btn-gold auth-submit" onClick={onClose}>Fechar</button>
          </div>
        )}
      </div>
    </div>
  );
}
