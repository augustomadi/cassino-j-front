import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import * as adminKycApi from '../../api/adminKyc';
import { ApiError } from '../../api/http';

const STATUS_TABS = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Recusados' },
  { value: 'not_submitted', label: 'Não enviaram' },
];

const DOC_LABELS = { selfie: 'Selfie', id_front: 'Frente do documento', id_back: 'Verso do documento' };

export default function Kyc() {
  const [status, setStatus] = useState('pending');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = (page = 1) => {
    setLoading(true);
    adminKycApi
      .getKycQueue({ status, page })
      .then((res) => {
        setRows(res.data);
        setMeta(res.meta);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar a fila.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [status]);

  return (
    <AdminLayout title="Verificação de Identidade" subtitle={meta ? `${meta.total} na fila selecionada` : 'Carregando...'}>
      <div className="adm-tabs" style={{ marginBottom: 16 }}>
        {STATUS_TABS.map((t) => (
          <button key={t.value} className={`adm-tab ${status === t.value ? 'is-active' : ''}`} onClick={() => setStatus(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <p style={{ color: 'var(--red-text)', marginBottom: 16 }}>{error}</p>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Jogador</th>
              <th>Documentos</th>
              <th>Enviado em</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 28 }}>Nada por aqui.</td></tr>
            )}
            {rows.map((k) => (
              <tr key={k.id} onClick={() => setSelected(k)} style={{ cursor: 'pointer' }}>
                <td>
                  <span className="t-name">
                    <span className="adm-mini-avatar">{k.name.charAt(0)}</span>
                    <span>
                      {k.name}
                      <span className="t-sub" style={{ display: 'block' }}>{k.email}</span>
                    </span>
                  </span>
                </td>
                <td className="t-sub">{k.submitted_documents?.length || 0} de {k.required_documents.length}</td>
                <td className="t-sub">{k.submitted_at ? new Date(k.submitted_at).toLocaleString('pt-BR') : '—'}</td>
                <td>{status === 'pending' && <button className="adm-btn adm-btn-gold adm-btn-sm">Analisar</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={meta.current_page <= 1} onClick={() => load(meta.current_page - 1)}>Anterior</button>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', alignSelf: 'center' }}>{meta.current_page} / {meta.last_page}</span>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={meta.current_page >= meta.last_page} onClick={() => load(meta.current_page + 1)}>Próxima</button>
        </div>
      )}

      {selected && (
        <ReviewModal
          entry={selected}
          onClose={() => setSelected(null)}
          onDecided={() => { setSelected(null); load(1); }}
        />
      )}
    </AdminLayout>
  );
}

function ReviewModal({ entry, onClose, onDecided }) {
  const [reason, setReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openingDocId, setOpeningDocId] = useState(null);
  const [viewedDocIds, setViewedDocIds] = useState(() => new Set());
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const viewDocument = async (doc) => {
    setOpeningDocId(doc.id);
    setError(null);
    try {
      const url = await adminKycApi.getKycDocumentBlobUrl(entry.id, doc.id);
      window.open(url, '_blank', 'noopener');
      setViewedDocIds((prev) => new Set(prev).add(doc.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível abrir o documento.');
    } finally {
      setOpeningDocId(null);
    }
  };

  const approve = async () => {
    setLoading(true);
    setError(null);
    try {
      await adminKycApi.approveKyc(entry.id);
      onDecided();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível aprovar.');
      setShowApproveConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const hasViewedDocument = viewedDocIds.size > 0;

  const reject = async () => {
    setLoading(true);
    setError(null);
    try {
      await adminKycApi.rejectKyc(entry.id, reason);
      onDecided();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível recusar.');
    } finally {
      setLoading(false);
    }
  };

  const canDecide = entry.status === 'pending';

  return (
    <Modal
      title={`Verificação — ${entry.name}`}
      onClose={onClose}
      footer={
        canDecide && !showReject ? (
          <>
            <button className="adm-btn adm-btn-danger" onClick={() => setShowReject(true)} disabled={loading}>Recusar</button>
            <button
              className="adm-btn adm-btn-gold"
              onClick={() => setShowApproveConfirm(true)}
              disabled={loading || !hasViewedDocument}
              title={hasViewedDocument ? undefined : 'Abra ao menos um documento antes de aprovar'}
            >
              Aprovar
            </button>
          </>
        ) : canDecide && showReject ? (
          <>
            <button className="adm-btn adm-btn-ghost" onClick={() => setShowReject(false)}>Voltar</button>
            <button className="adm-btn adm-btn-danger" onClick={reject} disabled={loading || reason.trim().length < 5}>
              {loading ? 'Recusando...' : 'Confirmar recusa'}
            </button>
          </>
        ) : (
          <button className="adm-btn adm-btn-ghost" onClick={onClose}>Fechar</button>
        )
      }
    >
      {error && <p style={{ color: 'var(--red-text)', marginBottom: 12 }}>{error}</p>}
      <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: 14 }}>{entry.email}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {(entry.submitted_documents || []).map((doc) => (
          <button
            key={doc.id}
            className="adm-btn adm-btn-ghost"
            onClick={() => viewDocument(doc)}
            disabled={openingDocId === doc.id}
            style={{ justifyContent: 'space-between' }}
          >
            <span>{DOC_LABELS[doc.type] || doc.type}</span>
            <span>{openingDocId === doc.id ? 'Abrindo...' : 'Ver documento →'}</span>
          </button>
        ))}
      </div>

      {canDecide && !hasViewedDocument && (
        <p style={{ color: 'var(--gold-400)', fontSize: '0.8rem', marginTop: -8, marginBottom: 16 }}>
          Abra pelo menos um documento acima antes de aprovar.
        </p>
      )}

      {showReject && (
        <div className="adm-field">
          <label>Motivo da recusa (o jogador vai ver isso)</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: Foto do documento ilegível" />
        </div>
      )}

      {!canDecide && (
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Esta verificação já foi decidida ({entry.status}).
        </p>
      )}

      {showApproveConfirm && (
        <ConfirmModal
          title="Aprovar verificação"
          message={`Confirma aprovar a identidade de ${entry.name}? Isso libera saques para essa conta.`}
          confirmLabel="Aprovar"
          tone="gold"
          loading={loading}
          onConfirm={approve}
          onCancel={() => setShowApproveConfirm(false)}
        />
      )}
    </Modal>
  );
}
