import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './AuthPage.css';
import { useAuth } from '../../auth/AuthContext';

/* Destino do link enviado por e-mail (ver AppServiceProvider::configureNotificationUrls
   no backend) — extrai id/hash da URL e confirma em POST /auth/email/verify. */
export default function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    const hash = searchParams.get('hash');

    if (!id || !hash) {
      setState('error');
      setMessage('Link de verificação inválido.');
      return;
    }

    verifyEmail({ id, hash })
      .then(() => setState('success'))
      .catch((err) => {
        setState('error');
        setMessage(err.message || 'Link de verificação inválido ou expirado.');
      });
  }, [searchParams, verifyEmail]);

  return (
    <div className="auth-page">
      <div className="auth-page-card">
        {state === 'loading' && (
          <>
            <h2>Verificando...</h2>
            <p>Aguarde um instante.</p>
          </>
        )}
        {state === 'success' && (
          <>
            <h2>E-mail verificado!</h2>
            <p>Sua conta foi confirmada com sucesso.</p>
          </>
        )}
        {state === 'error' && (
          <>
            <h2>Não foi possível verificar</h2>
            <p>{message}</p>
          </>
        )}
        <Link className="btn btn-gold auth-submit" to="/">
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
