// ==========================================================================
// NexusRad AI - Collapsible Top Header Navigation (Maximizes DICOM Workspace)
// ==========================================================================

import { renderNewExamWizardModal } from './NewExamWizardModal.js';
import { DEMO_USERS } from './LoginModal.js';

export function renderHeader(container, state, callbacks) {
  const user = state.currentUser || DEMO_USERS[0];
  const isCollapsed = state.headerCollapsed || false;

  container.innerHTML = `
    <header class="app-header ${isCollapsed ? 'collapsed' : ''}" style="${isCollapsed ? 'display: none;' : ''}">
      <div class="brand-container" id="brandBtn" title="Ir para a Central de Laudos (Worklist)">
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

        <!-- Logged User Profile Switcher (RBAC) -->
        <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-card-hover); padding: 0.25rem 0.6rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
          <select id="userRoleSelect" class="form-select" style="font-size: 0.75rem; font-weight: 700; background: transparent; border: none; color: #FFF; cursor: pointer;">
            ${DEMO_USERS.map(u => `
              <option value="${u.username}" ${u.username === user.username ? 'selected' : ''}>
                ${u.avatar} ${u.name.split(' ')[0]} (${u.badge})
              </option>
            `).join('')}
          </select>

          <button id="btnLogout" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 2px;" title="Sair / Encerrar Sessão">
            <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
          </button>
        </div>

        <!-- Collapse Header Button -->
        <button id="btnCollapseHeader" class="btn-secondary" style="padding: 0.35rem; border-radius: 6px;" title="Ocultar Cabeçalho Superior (Maximizar Área do Viewer)">
          <i data-lucide="chevron-up" style="width: 16px; height: 16px; color: var(--primary-cyan);"></i>
        </button>
      </div>
    </header>

    <!-- Floating Expand Button when Header is Collapsed -->
    ${isCollapsed ? `
      <button id="btnExpandHeader" style="position: fixed; top: 0.5rem; right: 1rem; z-index: 999; background: var(--bg-card); border: 1px solid var(--primary-cyan); color: var(--primary-cyan); padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(0,229,255,0.2); display: flex; align-items: center; gap: 0.35rem;">
        <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i>
        <span>Exibir Menu Superior</span>
      </button>
    ` : ''}
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
          if (callbacks.onWizardComplete) callbacks.onWizardComplete(newStudy);
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

  const userRoleSelect = container.querySelector('#userRoleSelect');
  if (userRoleSelect) {
    userRoleSelect.addEventListener('change', (e) => {
      const foundUser = DEMO_USERS.find(u => u.username === e.target.value);
      if (foundUser && callbacks.onSelectUserRole) {
        callbacks.onSelectUserRole(foundUser);
      }
    });
  }

  const logoutBtn = container.querySelector('#btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', callbacks.onLogout);
  }

  container.querySelector('#btnCollapseHeader')?.addEventListener('click', () => {
    if (callbacks.onToggleCollapseHeader) callbacks.onToggleCollapseHeader(true);
  });

  container.querySelector('#btnExpandHeader')?.addEventListener('click', () => {
    if (callbacks.onToggleCollapseHeader) callbacks.onToggleCollapseHeader(false);
  });
}
