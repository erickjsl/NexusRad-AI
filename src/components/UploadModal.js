// ==========================================================================
// NexusRad AI - Real DICOM (.dcm) Binary File Ingestion Modal
// ==========================================================================

import { parseDicomFile } from '../utils/dicomParser.js';

export function renderUploadModal(container, callbacks) {
  container.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop">
      <div class="modal-card">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h2 style="font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="radio-receiver" style="color: var(--primary-cyan)"></i>
            Recepção DICOM (Gateway C-STORE / Upload .dcm)
          </h2>
          <button class="btn-icon" id="btnCloseModal" style="width: 28px; height: 28px;">
            <i data-lucide="x" style="width: 16px; height: 16px;"></i>
          </button>
        </div>

        <div class="dropzone" id="dicomDropzone">
          <i data-lucide="upload-cloud" style="width: 48px; height: 48px; color: var(--primary-cyan); margin-bottom: 0.75rem;"></i>
          <h3 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.25rem;">Arraste arquivos DICOM (.dcm) nativos aqui</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">
            Suporte para leitura de metadados binários (Tags DICOM 3.0) e matrizes de pixels reais de tomografia, raio-x ou ressonância.
          </p>
          <input type="file" id="dicomFileInput" multiple accept=".dcm,image/*" style="display: none;">
          <button class="btn-primary" id="btnSelectFiles" style="margin: 0 auto;">
            <i data-lucide="folder-open" style="width: 16px; height: 16px;"></i>
            <span>Selecionar Arquivos .dcm</span>
          </button>
        </div>

        <div style="background: rgba(15, 23, 42, 0.6); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); font-size: 0.75rem; color: var(--text-muted);">
          <div style="font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">📡 Status do Gateway PACS:</div>
          <div>AE Title: <strong>NEXUS_PACS_SERVER</strong> • Porta DICOM: <strong>104 / 11112</strong></div>
          <div>Parser Binário Nativo: <strong>dicom-parser + WebGL Enabled</strong></div>
        </div>
      </div>
    </div>
  `;

  const backdrop = container.querySelector('#modalBackdrop');
  const fileInput = container.querySelector('#dicomFileInput');
  const dropzone = container.querySelector('#dicomDropzone');

  const closeModal = () => {
    backdrop.classList.remove('open');
  };

  container.querySelector('#btnCloseModal').addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  container.querySelector('#btnSelectFiles').addEventListener('click', () => {
    fileInput.click();
  });

  const handleFiles = async (files) => {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = function(e) {
        const buffer = e.target.result;
        const dicomObj = parseDicomFile(buffer);

        if (dicomObj) {
          alert(`⚡ Arquivo DICOM "${file.name}" lido com sucesso!\nPaciente: ${dicomObj.patientName}\nModalidade: ${dicomObj.modality}\nResolução: ${dicomObj.cols}x${dicomObj.rows}`);
          callbacks.onUploadComplete(file.name, dicomObj);
        } else {
          alert(`⚡ Arquivo "${file.name}" importado com sucesso para a Fila PACS!`);
          callbacks.onUploadComplete(file.name, null);
        }
        closeModal();
      };

      reader.readAsArrayBuffer(file);
    }
  };

  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--primary-cyan)';
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'var(--border-active)';
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  });
}
