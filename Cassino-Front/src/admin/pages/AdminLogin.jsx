import { useState } from 'react';
import './AdminLogin.css';
import { useAdminAuth } from '../AdminAuthContext';
import { ApiError } from '../../api/http';
import { IconLogo } from '../../components/icons/Icons';

export default function AdminLogin() {
  const { login, completeTwoFactorChallenge } = useAdminAuth();

  const [step, setStep] = useState('login'); // login | twoFactor
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [challengeToken, setChallengeToken] = useState(null);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await login({ email, password });
      if (result.twoFactorRequired) {
        setChallengeToken(result.challengeToken);
        setStep('twoFactor');
      } else if (result.twoFactorSetupPending) {
        setNotice(
          'Sua conta de staff ainda não tem verificação em duas etapas ativa. Isso é obrigatório para acesso ao painel — fale com quem administra o backend.'
        );
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  const submitChallenge = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await completeTwoFactorChallenge({ challengeToken, code });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Código inválido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <div className="adm-login-brand">
          <IconLogo size={34} />
          <div>
            <strong>CASSINO</strong>
            <span>Admin Panel</span>
          </div>
        </div>

        {notice && <p className="adm-login-notice">{notice}</p>}

        {step === 'login' && (
          <form onSubmit={submitLogin}>
            {error && <p className="adm-login-error">{error}</p>}
            <div className="adm-field">
              <label>E-mail</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="adm-field">
              <label>Senha</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="adm-btn adm-btn-gold adm-login-submit" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}

        {step === 'twoFactor' && (
          <form onSubmit={submitChallenge}>
            {error && <p className="adm-login-error">{error}</p>}
            <p className="adm-login-hint">Informe o código do seu aplicativo autenticador.</p>
            <div className="adm-field">
              <label>Código</label>
              <input type="text" required autoFocus value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <button className="adm-btn adm-btn-gold adm-login-submit" type="submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Confirmar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
