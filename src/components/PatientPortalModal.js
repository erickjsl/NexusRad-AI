// ==========================================================================
// NexusRad AI - Online Patient Portal & WhatsApp Delivery System
// ==========================================================================

export function renderPatientPortalModal(container, study, callbacks) {
  const patientPortalUrl = `http://127.0.0.1:3000/paciente/${study.accessionNumber}`;
  const whatsappMessage = encodeURIComponent(
    `Olá ${study.patientName}, seu laudo e imagens do exame (${study.studyDescription}) estão prontos na clínica NexusRad AI!\nAcesse por este link seguro: ${patientPortalUrl}`
  );

  container.innerHTML = `
    <div class="modal-backdrop open" id="portalBackdrop">
      <div class="modal-card" style="max-width: 480px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h2 style="font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; color: var(--primary-cyan);">
            <i data-lucide="share-2"></i>
            Portal de Entrega Online ao Paciente
          </h2>
          <button class="btn-icon" id="btnClosePortalModal" style="width: 28px; height: 28px;">
            <i data-lucide="x" style="width: 16px; height: 16px;"></i>
          </button>
        </div>

        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Paciente:</div>
            <div style="font-size: 0.95rem; font-weight: 700;">${study.patientName}</div>
            <div style="font-size: 0.75rem; color: var(--primary-cyan); font-family: monospace;">Exame: ${study.studyDescription} (${study.modality})</div>
          </div>

          <div style="border-top: 1px solid var(--border-light); padding-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <label style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted);">Link de Acesso Direto para Celular / Web:</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" class="form-select" readonly value="${patientPortalUrl}" style="font-size: 0.75rem; flex: 1;">
              <button class="btn-secondary" id="btnCopyLink" style="font-size: 0.75rem;">Copiar</button>
            </div>
          </div>

          <!-- QR Code Preview -->
          <div style="background: #FFF; padding: 1rem; border-radius: var(--radius-md); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;">
            <div style="font-weight: 700; color: #000; font-size: 0.75rem;">ESCANEIE O QR-CODE COM A CÂMERA DO CELULAR:</div>
            <div style="border: 2px solid #000; padding: 12px; font-weight: 900; font-family: monospace; font-size: 1.2rem; color: #000; letter-spacing: 2px;">
              [ QR-CODE NEXUSRAD ]
            </div>
            <div style="font-size: 0.65rem; color: #555;">Chave Token: ${study.accessionNumber}-PASS</div>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <a href="https://wa.me/?text=${whatsappMessage}" target="_blank" class="btn-primary" style="flex: 1; justify-content: center; background: #25D366; color: #FFF; border: none; font-weight: 700; text-decoration: none;">
            <i data-lucide="send" style="width: 16px; height: 16px;"></i>
            <span>Enviar por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  `;

  const backdrop = container.querySelector('#portalBackdrop');
  const closeModal = () => backdrop.remove();

  container.querySelector('#btnClosePortalModal').addEventListener('click', closeModal);
  container.querySelector('#btnCopyLink').addEventListener('click', () => {
    navigator.clipboard.writeText(patientPortalUrl);
    alert("🔗 Link seguro de acesso do paciente copiado para a área de transferência!");
  });
}
