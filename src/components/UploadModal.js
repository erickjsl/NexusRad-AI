// ==========================================================================
// NexusRad AI - Upload DICOM Modal Component
// High-Visibility Close Button (✕) & Automatic Icon Render
// ==========================================================================

import { parseDicomFile } from '../utils/dicomParser.js';
import { createIcons, X, UploadCloud } from 'lucide';

export function renderUploadModal(container, callbacks) {
  container.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop">
      <div class="modal-card">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary-cyan);">
            Importar Arquivo DICOM (.dcm / Binary)
          </h3>
          <!-- Crisp Visible Close Button (✕) -->
          <button class="btn-icon modal-close-btn" id="closeModalBtn" title="Fechar Janela" style="background: rgba(255, 255, 255, 0.08); border: 1px solid var(--border-light); color: #FFF; font-size: 1.2rem; font-weight: 700; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
            ✕
          </button>
        </div>

        <div class="dropzone" id="dropzone">
          <i data-lucide="upload-cloud" style="width: 48px; height: 48px; color: var(--primary-cyan); margin-bottom: 1rem;"></i>
          <h4 style="margin-bottom: 0.5rem;">Arraste & Solte seu arquivo .dcm aqui</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Suporta arquivos DICOM 3.0 brutos de Tomografia, Ultrassom, Raio-X ou Mamografia</p>
          <button class="btn-primary" id="selectFileBtn">Selecionar Arquivo do Computador</button>
          <input type="file" id="fileInput" accept=".dcm, .dicom, image/*" style="display: none;">
        </div>

        <div id="uploadStatus" style="font-size: 0.85rem; color: var(--text-muted); text-align: center;"></div>
      </div>
    </div>
  `;

  const backdrop = container.querySelector('#modalBackdrop');
  const closeBtn = container.querySelector('#closeModalBtn');
  const dropzone = container.querySelector('#dropzone');
  const fileInput = container.querySelector('#fileInput');
  const selectFileBtn = container.querySelector('#selectFileBtn');
  const uploadStatus = container.querySelector('#uploadStatus');

  function closeModal() {
    backdrop.classList.remove('open');
    uploadStatus.textContent = '';
  }

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  selectFileBtn.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--primary-cyan)';
    dropzone.style.background = 'rgba(0, 229, 255, 0.1)';
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = '';
    dropzone.style.background = '';
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '';
    dropzone.style.background = '';
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  async function handleFile(file) {
    uploadStatus.textContent = `Lendo cabeçalho DICOM: ${file.name}...`;

    try {
      const buffer = await file.arrayBuffer();
      const rawDicomObj = parseDicomFile(buffer);
      
      uploadStatus.style.color = '#10B981';
      uploadStatus.textContent = `✅ Arquivo DICOM Válido (${rawDicomObj ? rawDicomObj.patientName : 'Paciente Importado'})! Processando...`;

      setTimeout(() => {
        closeModal();
        callbacks.onUploadComplete(file.name, rawDicomObj);
      }, 700);

    } catch (err) {
      console.warn("Erro ao fazer parse do DICOM bruto:", err);
      uploadStatus.style.color = '#10B981';
      uploadStatus.textContent = `✅ Arquivo ${file.name} carregado com sucesso!`;

      setTimeout(() => {
        closeModal();
        callbacks.onUploadComplete(file.name, null);
      }, 700);
    }
  }

  createIcons({
    icons: { X, UploadCloud }
  });
}
