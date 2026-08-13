import Modal from './Modal';

/**
 * Confirmação genérica para ações de risco do painel (aprovar, pagar,
 * excluir, desativar...). Um padrão só, reaproveitado em vez de cada tela
 * reinventar seu próprio "tem certeza?".
 */
export default function ConfirmModal({
  title = 'Confirmar ação',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'gold', // 'gold' | 'danger'
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="adm-btn adm-btn-ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={`adm-btn ${tone === 'danger' ? 'adm-btn-danger' : 'adm-btn-gold'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Enviando...' : confirmLabel}
          </button>
        </>
      }
    >
      {typeof message === 'string' ? <p>{message}</p> : message}
    </Modal>
  );
}
