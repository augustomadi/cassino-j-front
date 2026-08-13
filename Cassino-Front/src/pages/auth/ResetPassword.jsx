import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './AuthPage.css';
import './AuthModal.css';
import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../api/http';

/* Destino do link enviado por e-mail (ver AppServiceProvider::configureNotificationUrls
   no backend) — extrai token/email da URL e confirma em POST /auth/password/reset. */
export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [done, setDone] = useState(false);

  const fieldError = (name) => fieldErrors[name]?.[0];

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setFieldErrors({});
    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        setFieldErrors(err.errors || {});
      } else {
        setFormError('Algo deu errado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="auth-page">
        <div className="auth-page-card">
          <h2>Link inválido</h2>
          <p>Este link de redefinição de senha está incompleto ou expirado.</p>
          <Link className="btn btn-gold auth-submit" to="/">
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-page-card">
          <h2>Senha redefinida!</h2>
          <p>Todas as sessões anteriores foram encerradas. Faça login novamente com a nova senha.</p>
          <Link className="btn btn-gold auth-submit" to="/">
            Ir para o início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-page-card">
        <form className="auth-form" onSubmit={submit}>
          <h2>Nova senha</h2>
          {formError && <p className="auth-error">{formError}</p>}
          <label className="auth-field">
            <span>Nova senha</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldError('password') && <small>{fieldError('password')}</small>}
          </label>
          <label className="auth-field">
            <span>Confirmar nova senha</span>
            <input
              type="password"
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </label>
          <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
