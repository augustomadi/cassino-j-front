import { IcX } from './AdminIcons';

export default function Modal({ title, onClose, children, footer }) {
  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-head">
          <h3>{title}</h3>
          <button className="adm-icon-action" onClick={onClose} aria-label="Fechar">
            <IcX size={16} />
          </button>
        </div>
        <div className="adm-modal-body">{children}</div>
        {footer && <div className="adm-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
