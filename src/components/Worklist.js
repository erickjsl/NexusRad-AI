// ==========================================================================
// NexusRad AI - RIS Worklist Component with Executive KPIs & Patient Portal
// ==========================================================================

import { renderPatientPortalModal } from './PatientPortalModal.js';

export function renderWorklist(container, studies, callbacks) {
  const readyCount = studies.filter(s => s.status === 'pronto').length;
  const pendingCount = studies.filter(s => s.status === 'laudando').length;
  const urgentCount = studies.filter(s => s.urgency === 'alta').length;
  const completedCount = studies.filter(s => s.status === 'concluido').length;

  container.innerHTML = `
    <div class="worklist-container">
      <div class="worklist-header-row">
        <div class="worklist-title-group">
          <h1>
            <i data-lucide="list-filter" style="color: var(--primary-cyan)"></i>
            Fila de Exames & Modalities Worklist (MWL)
          </h1>
          <p style="color: var(--text-muted); font-size: 0.85rem;">
            Listagem em tempo real de exames capturados via DICOM C-STORE, Placa de Captura e DICOMweb.
          </p>
        </div>

        <div class="worklist-stats">
          <div class="stat-chip">
            <div>
              <div class="stat-value">${studies.length}</div>
              <div class="stat-label">Total Fila</div>
            </div>
          </div>
          <div class="stat-chip">
            <div>
              <div class="stat-value" style="color: var(--status-ready)">${readyCount}</div>
              <div class="stat-label">Pendente Laudo</div>
            </div>
          </div>
          <div class="stat-chip">
            <div>
              <div class="stat-value" style="color: var(--status-urgent)">${urgentCount}</div>
              <div class="stat-label">Urgentes / STAT</div>
            </div>
          </div>
          <div class="stat-chip">
            <div>
              <div class="stat-value" style="color: var(--status-info)">${completedCount}</div>
              <div class="stat-label">Concluídos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick KPI Metric Cards -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 0.5rem;">
        <div class="glass-card" style="padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Tempo Médio de Laudo</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan);">14 minutos</div>
          </div>
          <i data-lucide="clock" style="color: var(--primary-cyan); opacity: 0.6;"></i>
        </div>

        <div class="glass-card" style="padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Acurácia Copilot IA</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--status-ready);">98.6% Precisão</div>
          </div>
          <i data-lucide="sparkles" style="color: var(--status-ready); opacity: 0.6;"></i>
        </div>

        <div class="glass-card" style="padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Ocupação Equipamentos</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--status-pending);">82% Ocupado</div>
          </div>
          <i data-lucide="activity" style="color: var(--status-pending); opacity: 0.6;"></i>
        </div>

        <div class="glass-card" style="padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Entregas Online / WhatsApp</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--status-info);">100% Digital</div>
          </div>
          <i data-lucide="share-2" style="color: var(--status-info); opacity: 0.6;"></i>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="worklist-table">
          <thead>
            <tr>
              <th>Status / Mod.</th>
              <th>Paciente & Prontuário</th>
              <th>Estudo / Descrição DICOM</th>
              <th>Data & Hora</th>
              <th>Médico Solicitante</th>
              <th>Séries / Imagens</th>
              <th>Achado IA</th>
              <th>Ações PACS</th>
            </tr>
          </thead>
          <tbody>
            ${studies.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                  <i data-lucide="inbox" style="width: 48px; height: 48px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                  <p>Nenhum exame encontrado com os filtros selecionados.</p>
                </td>
              </tr>
            ` : studies.map(study => `
              <tr data-study-id="${study.id}">
                <td>
                  <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <span class="badge-modality ${study.modality}">${study.modality}</span>
                    <span class="badge-status ${study.status}">${study.status.toUpperCase()}</span>
                  </div>
                </td>
                <td>
                  <div class="patient-info">
                    <span class="patient-name">${study.patientName}</span>
                    <span class="patient-sub">${study.patientId} • ${study.age} • (${study.gender})</span>
                  </div>
                </td>
                <td>
                  <div style="font-weight: 500;">${study.studyDescription}</div>
                  <div class="patient-sub" style="font-family: monospace;">Acc#: ${study.accessionNumber}</div>
                </td>
                <td>
                  <div style="font-size: 0.85rem;">${study.date}</div>
                </td>
                <td>
                  <div style="font-size: 0.85rem; color: var(--text-muted);">${study.physician}</div>
                </td>
                <td>
                  <div style="font-size: 0.85rem; font-family: monospace; color: var(--primary-cyan);">
                    ${study.seriesCount} ser. / ${study.instanceCount} img.
                  </div>
                </td>
                <td>
                  ${study.aiFinding ? `
                    <div style="font-size: 0.75rem; color: var(--primary-cyan); background: var(--primary-cyan-soft); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-active);">
                      ⚡ <strong>${study.aiFinding.type}</strong> (${study.aiFinding.confidence})
                    </div>
                  ` : '<span style="color: var(--text-dim); font-size: 0.75rem;">Sem alertas</span>'}
                </td>
                <td>
                  <div class="action-btn-group">
                    <button class="btn-primary btn-open-viewer" data-id="${study.id}" title="Abrir no DICOM Viewer 2D">
                      <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
                      <span>Viewer</span>
                    </button>
                    <button class="btn-secondary btn-open-report" data-id="${study.id}" title="Gerar / Editar Laudo">
                      <i data-lucide="file-text" style="width: 16px; height: 16px;"></i>
                      <span>Laudo</span>
                    </button>
                    <button class="btn-secondary btn-share-patient" data-id="${study.id}" title="Enviar ao Paciente (WhatsApp / QR Code)">
                      <i data-lucide="share-2" style="width: 16px; height: 16px; color: var(--primary-cyan);"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach button click events
  container.querySelectorAll('.btn-open-viewer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      callbacks.onOpenViewer(btn.dataset.id);
    });
  });

  container.querySelectorAll('.btn-open-report').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      callbacks.onOpenReport(btn.dataset.id);
    });
  });

  container.querySelectorAll('.btn-share-patient').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const study = studies.find(s => s.id === btn.dataset.id);
      if (study) {
        renderPatientPortalModal(document.querySelector('#modalContainer'), study, {});
      }
    });
  });
}
