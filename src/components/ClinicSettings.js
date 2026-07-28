// ==========================================================================
// NexusRad AI - Clinic Settings & DICOM Node Configuration Module
// ==========================================================================

export function renderClinicSettings(container, state, callbacks) {
  container.innerHTML = `
    <div style="flex: 1; display: flex; flex-direction: column; padding: 1.5rem; overflow-y: auto; gap: 1.25rem;">
      <div>
        <h1 style="font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="settings" style="color: var(--primary-cyan)"></i>
          Configurações da Clínica & Servidor DICOM PACS
        </h1>
        <p style="color: var(--text-muted); font-size: 0.85rem;">
          Personalização de cabeçalho, médicos laudadores, parâmetros DICOM e Portal do Paciente.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
        <!-- Clinic Profile -->
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
          <h2 style="font-size: 1rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.4rem;">
            <i data-lucide="building" style="width: 18px; height: 18px;"></i>
            Dados Institucionais da Clínica
          </h2>

          <div class="form-group">
            <label>Nome Fantasia / Timbre:</label>
            <input type="text" class="form-select" value="NEXUSRAD DIAGNÓSTICO POR IMAGEM S/A">
          </div>

          <div class="form-group">
            <label>CNPJ da Clínica:</label>
            <input type="text" class="form-select" value="12.345.678/0001-90">
          </div>

          <div class="form-group">
            <label>Endereço Completo & Cidade/UF:</label>
            <input type="text" class="form-select" value="Av. Paulista, 1500 - Bela Vista - São Paulo, SP">
          </div>

          <div class="form-group">
            <label>Telefone & WhatsApp de Atendimento:</label>
            <input type="text" class="form-select" value="(11) 3000-9000 / (11) 99888-7766">
          </div>
        </div>

        <!-- DICOM Gateway Settings -->
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
          <h2 style="font-size: 1rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.4rem;">
            <i data-lucide="radio-receiver" style="width: 18px; height: 18px;"></i>
            Servidor DICOM Gateway (C-STORE / DICOMweb)
          </h2>

          <div class="form-group">
            <label>AETitle do Servidor PACS:</label>
            <input type="text" class="form-select" value="NEXUS_PACS_SERVER">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <div class="form-group">
              <label>Porta DICOM SCP:</label>
              <input type="text" class="form-select" value="104">
            </div>
            <div class="form-group">
              <label>Porta WADO/QIDO (HTTP):</label>
              <input type="text" class="form-select" value="8042">
            </div>
          </div>

          <div class="form-group">
            <label>Certificado Digital ICP-Brasil A1 (Assinatura PDF):</label>
            <input type="text" class="form-select" value="CertificadoA1_DrMendonca_Valido2028.pfx" readonly style="color: var(--status-ready);">
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div style="display: flex; justify-content: flex-end;">
        <button class="btn-primary" id="btnSaveClinicSettings" style="padding: 0.75rem 1.5rem; font-size: 0.9rem;">
          <i data-lucide="save" style="width: 18px; height: 18px;"></i>
          <span>Salvar Configurações da Clínica</span>
        </button>
      </div>
    </div>
  `;

  container.querySelector('#btnSaveClinicSettings').addEventListener('click', () => {
    alert("✅ Configurações da clínica e servidor DICOM salvos com sucesso!");
  });
}
