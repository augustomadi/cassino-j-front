import { useEffect, useState } from 'react';
import '../auth/AuthModal.css';
import './DepositModal.css';
import { useAuth } from '../../auth/AuthContext';
import * as depositsApi from '../../api/deposits';
import { ApiError } from '../../api/http';
import { IconClose, IconCoin } from '../../components/icons/Icons';
import { fmtCents } from '../../utils/money';

const PRESETS_CENTS = [2000, 5000, 10000, 20000, 50000];

export default function DepositModal({ onClose }) {
  const { refreshBalance } = useAuth();

  const [methods, setMethods] = useState(null);
  const [amountInput, setAmountInput] = useState('50,00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deposit, setDeposit] = useState(null); // resultado de POST /deposits
  const [polling, setPolling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    depositsApi
      .getDepositMethods()
      .then((res) => setMethods(res.data))
      .catch(() => setMethods([]));
  }, []);

  const method = methods?.[0]; // hoje só existe PIX (config/payment.php do backend)

  const amountCents = Math.round(
    parseFloat(amountInput.replace(/\./g, '').replace(',', '.')) * 100 || 0
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!method) return;
    setError(null);

    if (amountCents < method.min_cents || amountCents > method.max_cents) {
      setError(
        `Valor deve ser entre ${fmtCents(method.min_cents)} e ${fmtCents(method.max_cents)}.`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await depositsApi.createDeposit({
        method: method.method,
        amountCents,
        idempotencyKey: crypto.randomUUID(),
      });
      setDeposit(res.data);
      if (res.data.status === 'confirmed') {
        refreshBalance();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar o depósito.');
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = async () => {
    const code = deposit?.payment_data?.qr_code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível (ex: sem HTTPS) — o código copia-e-cola
      // continua visível na tela pra copiar manualmente
    }
  };

  const checkStatus = async () => {
    if (!deposit) return;
    setPolling(true);
    try {
      const res = await depositsApi.getDeposit(deposit.id);
      setDeposit(res.data);
      if (res.data.status === 'confirmed') {
        refreshBalance();
      }
    } catch {
      // silencioso — usuário pode tentar de novo
    } finally {
      setPolling(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Fechar">
          <IconClose size={18} />
        </button>

        {!deposit && (
          <form className="auth-form" onSubmit={submit}>
            <h2>Depositar</h2>
            {error && <p className="auth-error">{error}</p>}

            {method && (
              <>
                <div className="deposit-presets">
                  {PRESETS_CENTS.map((cents) => (
                    <button
                      type="button"
                      key={cents}
                      className={amountCents === cents ? 'is-active' : ''}
                      onClick={() => setAmountInput((cents / 100).toFixed(2).replace('.', ','))}
                    >
                      {fmtCents(cents)}
                    </button>
                  ))}
                </div>
                <label className="auth-field">
                  <span>Valor (mín. {fmtCents(method.min_cents)})</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                  />
                </label>
                <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
                  <IconCoin size={18} />
                  {loading ? 'Gerando...' : `Depositar via ${method.label}`}
                </button>
              </>
            )}
            {methods !== null && !method && <p className="auth-hint">Nenhum método de depósito disponível no momento.</p>}
            {methods === null && <p className="auth-hint">Carregando...</p>}
          </form>
        )}

        {deposit && deposit.status === 'confirmed' && (
          <div className="auth-form auth-confirmation">
            <h2>Depósito confirmado!</h2>
            <p>{fmtCents(deposit.amount_cents)} já caíram na sua conta.</p>
            <button className="btn btn-gold auth-submit" onClick={onClose}>
              Fechar
            </button>
          </div>
        )}

        {deposit && deposit.status === 'pending' && (
          <div className="auth-form">
            <h2>Escaneie para pagar</h2>
            <p className="auth-hint">
              Pague {fmtCents(deposit.amount_cents)} via PIX escaneando o QR code ou usando o código copia-e-cola
              abaixo. O saldo cai automaticamente após a confirmação.
            </p>
            {(deposit.payment_data?.qr_code_base64 || deposit.payment_data?.qr_code_image_url) && (
              <img
                className="deposit-pix-qr"
                src={
                  deposit.payment_data.qr_code_base64
                    ? `data:image/png;base64,${deposit.payment_data.qr_code_base64}`
                    : deposit.payment_data.qr_code_image_url
                }
                alt="QR code PIX"
              />
            )}
            {deposit.payment_data?.qr_code && (
              <>
                <code className="deposit-pix-code">{deposit.payment_data.qr_code}</code>
                <button type="button" className="deposit-pix-copy" onClick={copyPixCode}>
                  {copied ? 'Copiado!' : 'Copiar código'}
                </button>
              </>
            )}
            <button className="btn btn-gold auth-submit" onClick={checkStatus} disabled={polling}>
              {polling ? 'Verificando...' : 'Já paguei, verificar'}
            </button>
          </div>
        )}

        {deposit && (deposit.status === 'failed' || deposit.status === 'expired') && (
          <div className="auth-form auth-confirmation">
            <h2>Depósito não confirmado</h2>
            <p>Este depósito {deposit.status === 'expired' ? 'expirou' : 'falhou'}. Tente novamente.</p>
            <button className="btn btn-gold auth-submit" onClick={() => setDeposit(null)}>
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
