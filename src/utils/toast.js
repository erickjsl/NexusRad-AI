// ==========================================================================
// NexusRad AI - Custom Glassmorphism Toast Notifications & Dialog Manager
// Zero Browser alert() or confirm()
// ==========================================================================

export function showToast(message, type = 'success', duration = 3500) {
  let toastContainer = document.querySelector('#toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 99999;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'custom-toast';
  
  const bgColors = {
    success: 'rgba(16, 185, 129, 0.95)',
    error: 'rgba(239, 68, 68, 0.95)',
    warning: 'rgba(245, 158, 11, 0.95)',
    info: 'rgba(0, 229, 255, 0.95)'
  };

  const borderColors = {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#00E5FF'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.style.cssText = `
    background: ${bgColors[type] || bgColors.info};
    color: #FFF;
    padding: 0.85rem 1.25rem;
    border-radius: 8px;
    border: 1px solid ${borderColors[type] || borderColors.info};
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    pointer-events: auto;
    backdrop-filter: blur(12px);
    animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  toast.innerHTML = `
    <span>${icons[type] || 'ℹ️'}</span>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function showConfirmDialog(title, message, onConfirm, onCancel = null) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-backdrop open';
  overlay.style.zIndex = '9999';

  overlay.innerHTML = `
    <div class="modal-card" style="max-width: 450px; width: 90%; display: flex; flex-direction: column; gap: 1rem; background: #0F172A; border: 1px solid var(--primary-cyan); box-shadow: 0 0 30px rgba(0, 229, 255, 0.2);">
      <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.5rem;">
        <span>⚠️</span> ${title}
      </div>
      <div style="font-size: 0.9rem; color: #F1F5F9; line-height: 1.5;">
        ${message}
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem; margin-top: 0.5rem;">
        <button class="btn-secondary" id="btnCancelConfirmDlg" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">Cancelar</button>
        <button class="btn-primary" id="btnOkConfirmDlg" style="padding: 0.4rem 1rem; font-size: 0.8rem; background: #EF4444; border-color: #EF4444; font-weight: 700;">Confirmar Exclusão</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#btnCancelConfirmDlg').addEventListener('click', () => {
    overlay.remove();
    if (onCancel) onCancel();
  });

  overlay.querySelector('#btnOkConfirmDlg').addEventListener('click', () => {
    overlay.remove();
    if (onConfirm) onConfirm();
  });
}
