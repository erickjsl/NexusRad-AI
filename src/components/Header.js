// ==========================================================================
// NexusRad AI - Header Navigation Component with Auth User Info
// ==========================================================================

import { renderNewExamWizardModal } from './NewExamWizardModal.js';

export function renderHeader(container, state, callbacks) {
  const user = state.currentUser || {
    name: "Dr. Carlos Roberto",
    role: "Médico Radiologista",
    avatar: "👨‍⚕️",
    badge: "LAUDADOR"
  };

  container.innerHTML = `
    <header class="app-header">
      <div class="brand-container" id="brandBtn">
        <div class="brand-icon">
          <i data-lucide="activity"></i>
        </div>
        <div>
          <span class="brand-title">NexusRad <span style="color: var(--primary-cyan)">AI</span></span>
          <span class="brand-tag">PACS / RIS v3.4</span>
        </div>
      </div>

      <div class="header-center">
        <div class="search-box">
          <i data-lucide="search" class="search-icon"></i>
          <input type="text" id="searchInput" placeholder="Buscar por Nome do Paciente, Prontuário, CPF ou Acc#..." value="${state.searchTerm || ''}">
        </div>

        <div class="modality-pills">
          ${['TODOS', 'CT', 'DX', 'MR', 'US', 'MG'].map(mod => `
            <button class="modality-btn ${state.activeModality === mod ? 'active' : ''}" data-modality="${mod}">${mod}</button>
          `).join('')}
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div class="dicom-status">
          <span class="status-dot"></span>
          <span>DICOM Gateway: <strong>ONLINE</strong></span>
        </div>

        <button class="btn-primary" id="btnNewExamWizard" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); border: none;">
          <i data-lucide="file-plus" style="width: 16px; height: 16px;"></i>
          <span>Gerar Novo Exame</span>
        </button>

        <button class="btn-secondary" id="btnUploadModal" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" title="Importar arquivo binário .dcm">
          <i data-lucide="upload-cloud" style="width: 16px; height: 16px;"></i>
          <span>Importar .dcm</span>
        </button>

        <!-- Logged User Info & Logout Button -->
        <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-card-hover); padding: 0.35rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
          <span style="font-size: 1.1rem;">${user.avatar}</span>
          <div style="display: flex; flex-direction: column; line-height: 1.2;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-main);">${user.name.split(' ')[0]} ${user.name.split(' ')[1] || ''}</span>
            <span style="font-size: 0.65rem; color: var(--primary-cyan); font-family: monospace;">${user.badge}</span>
          </div>
          <button id="btnLogout" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; margin-left: 4px;" title="Sair / Encerrar Sessão">
            <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
      </div>
    </header>
  `;

  // Attach event listeners
  const searchInput = container.querySelector('#searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      callbacks.onSearch(e.target.value);
    });
  }

  container.querySelectorAll('.modality-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      callbacks.onSelectModality(btn.dataset.modality);
    });
  });

  const wizardBtn = container.querySelector('#btnNewExamWizard');
  if (wizardBtn) {
    wizardBtn.addEventListener('click', () => {
      renderNewExamWizardModal(document.querySelector('#modalContainer'), state, {
        onWizardComplete: (newStudy) => {
          if (callbacks.onGoHome) callbacks.onGoHome();
        }
      });
    });
  }

  const uploadBtn = container.querySelector('#btnUploadModal');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', callbacks.onOpenUpload);
  }

  const brandBtn = container.querySelector('#brandBtn');
  if (brandBtn) {
    brandBtn.addEventListener('click', callbacks.onGoHome);
  }

  const logoutBtn = container.querySelector('#btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', callbacks.onLogout);
  }
}
