import React from 'react';
import { useUI } from '../context/UiContext';

const variantLabels = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

const ToastViewport = () => {
  const { toasts, removeToast } = useUI();

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.variant}`} role="status">
          <div>
            <div className="toast__label">{variantLabels[toast.variant] || 'Info'}</div>
            <div className="toast__message">{toast.message}</div>
          </div>
          <button type="button" className="icon-button icon-button--ghost" onClick={() => removeToast(toast.id)} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastViewport;