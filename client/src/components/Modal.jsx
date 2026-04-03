import { X } from 'lucide-react';

const Modal = ({ title, onClose, children, maxWidth = 'max-w-lg' }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className={`modal ${maxWidth}`} onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Modal;
