import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({ title, children, onClose, maxWidth = '480px' }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="modal"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export default Modal;
