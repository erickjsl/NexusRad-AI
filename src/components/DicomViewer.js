// ==========================================================================
// NexusRad AI - Professional Radiology & Ultrasound Viewer Engine
// Includes Live Video Capture, External Device Photo Import & Auto-Save
// ==========================================================================

import { renderDicomSlice } from '../utils/dicomGenerator.js';
import { renderRawDicomToCanvas } from '../utils/dicomParser.js';
import { showToast } from '../utils/toast.js';
import { saveStudiesToStorage } from '../utils/storage.js';

let activeMediaStream = null;

export function stopActiveVideoCapture() {
  if (activeMediaStream) {
    activeMediaStream.getTracks().forEach(track => track.stop());
    activeMediaStream = null;
  }
}

export function renderDicomViewer(container, study, state, callbacks) {
  stopActiveVideoCapture();

  let sliceIndex = state.viewerState?.sliceIndex || 1;
  let activeTool = state.viewerState?.activeTool || 'windowing';
  let windowWidth = state.viewerState?.windowWidth || (study.modality === 'CT' ? 1500 : 400);
  let windowLevel = state.viewerState?.windowLevel || (study.modality === 'CT' ? -600 : 40);
  let inverted = state.viewerState?.inverted || false;
  let rotationAngle = 0;
  let showAiOverlay = state.viewerState?.showAiOverlay !== false;
  let zoom = state.viewerState?.zoom || 1;
  let pan = state.viewerState?.pan || { x: 0, y: 0 };
  let measurements = study.measurements || [];
  let isVideoCaptureActive = false;
  let rawDicomObject = study.rawDicomObject || null;

  let isMouseDown = false;
  let startX = 0;
  let startY = 0;
  let currentMeasurementDraft = null;

  if (!study.capturedFrames) {
    study.capturedFrames = [];
  }

  container.innerHTML = `
    <div class="dicom-pane" style="height: 100%; border-right: none; display: flex; flex-direction: column; background: #000; user-select: none;">
      
      <!-- Clean Organized Toolbar Top -->
      <div class="viewer-toolbar" style="padding: 0.5rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid var(--border-light); flex-wrap: wrap;">
        
        <!-- Group 1: Image Manipulation -->
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <span style="font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-right: 0.2rem;">IMAGEM:</span>

          <button class="tool-btn ${activeTool === 'windowing' ? 'active' : ''}" id="toolWindowing" title="Janelamento (Arraste no Canvas)">
            <i data-lucide="sun" style="width: 15px; height: 15px;"></i>
            <span>Janelamento</span>
          </button>
          
          <select class="window-select" id="presetSelect" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; background: #0F172A; color: #FFF;">
            <option value="default">Janela Padrão</option>
            <option value="lung" ${study.modality === 'CT' ? 'selected' : ''}>Pulmão</option>
            <option value="bone">Osso</option>
            <option value="soft">Partes Moles</option>
            <option value="brain">Cerebral</option>
          </select>

          <button class="tool-btn ${activeTool === 'zoom' ? 'active' : ''}" id="toolZoom" title="Zoom">
            <i data-lucide="zoom-in" style="width: 15px; height: 15px;"></i>
            <span>Zoom</span>
          </button>

          <button class="tool-btn ${activeTool === 'zoom' ? 'active' : ''}" id="toolPan" title="Pan">
            <i data-lucide="move" style="width: 15px; height: 15px;"></i>
            <span>Pan</span>
          </button>

          <button class="tool-btn ${inverted ? 'active' : ''}" id="toolInvert" title="Inverter Cores">
            <i data-lucide="contrast" style="width: 15px; height: 15px;"></i>
            <span>Inverter</span>
          </button>

          <button class="tool-btn" id="toolRotate" title="Girar 90°">
            <i data-lucide="rotate-cw" style="width: 15px; height: 15px;"></i>
            <span>Girar</span>
          </button>

          <button class="tool-btn" id="toolReset" title="Resetar">
            <i data-lucide="rotate-ccw" style="width: 15px; height: 15px;"></i>
            <span>Reset</span>
          </button>
        </div>

        <div style="height: 20px; width: 1px; background: var(--border-light);"></div>

        <!-- Group 2: Measurements -->
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <span style="font-size: 0.65rem; font-weight: 700; color: var(--primary-cyan); text-transform: uppercase; margin-right: 0.2rem;">MEDIÇÃO:</span>

          <button class="tool-btn ${activeTool === 'line' ? 'active' : ''}" id="toolLine" title="Medir Distância (mm)">
            <i data-lucide="ruler" style="width: 15px; height: 15px;"></i>
            <span>Régua</span>
          </button>

          <button class="tool-btn ${activeTool === 'angle' ? 'active' : ''}" id="toolAngle" title="Medir Ângulo (°)">
            <i data-lucide="triangle" style="width: 15px; height: 15px;"></i>
            <span>Ângulo</span>
          </button>

          <button class="tool-btn ${activeTool === 'roi' ? 'active' : ''}" id="toolRoi" title="Área ROI (HU)">
            <i data-lucide="circle-dot" style="width: 15px; height: 15px;"></i>
            <span>ROI</span>
          </button>

          <button class="tool-btn ${activeTool === 'arrow' ? 'active' : ''}" id="toolArrow" title="Anotar Seta">
            <i data-lucide="arrow-up-right" style="width: 15px; height: 15px;"></i>
            <span>Seta</span>
          </button>
        </div>

        <div style="height: 20px; width: 1px; background: var(--border-light);"></div>

        <!-- Group 3: Capture, Import & Save Actions -->
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <button class="tool-btn" id="btnVideoCapture" style="border-color: var(--primary-cyan); background: rgba(0,229,255,0.1);" title="Placa de Captura / Câmera Externa US">
            <i data-lucide="video" style="width: 15px; height: 15px; color: var(--primary-cyan);"></i>
            <span style="color: var(--primary-cyan); font-weight: 700;">Vídeo US</span>
          </button>

          <button class="tool-btn" id="btnManualSnap" style="background: rgba(16, 185, 129, 0.15); border-color: var(--status-ready);" title="Tirar Foto Instantânea do Exame">
            <i data-lucide="camera" style="width: 15px; height: 15px; color: var(--status-ready);"></i>
            <span style="color: var(--status-ready); font-weight: 700;">📸 Tirar Foto</span>
          </button>

          <button class="tool-btn" id="btnImportExternalPhoto" style="background: rgba(59, 130, 246, 0.15); border-color: #3B82F6;" title="Importar Fotos Tiradas em Dispositivos Externos ou Câmeras">
            <i data-lucide="upload-cloud" style="width: 15px; height: 15px; color: #3B82F6;"></i>
            <span style="color: #60A5FA; font-weight: 700;">📁 Importar Fotos</span>
          </button>
          <input type="file" id="fileExternalPhoto" accept="image/*" multiple style="display: none;">

          <button class="tool-btn" id="btnOpenUltrasoundDataModal" style="background: rgba(168, 85, 247, 0.18); border-color: #A855F7;" title="Inserir / Editar Informações, Medidas e Achados Ultrassonográficos">
            <i data-lucide="file-text" style="width: 15px; height: 15px; color: #C084FC;"></i>
            <span style="color: #C084FC; font-weight: 700;">📝 Dados do Exame US</span>
          </button>

          <button class="tool-btn" id="btnSaveViewer" style="background: var(--status-ready); border-color: var(--status-ready); color: #000; font-weight: 700;" title="Salvar Exame e Fotos no Banco Permanente">
            <i data-lucide="save" style="width: 15px; height: 15px; color: #000;"></i>
            <span>💾 Salvar Tudo</span>
          </button>
        </div>

      </div>

      <!-- Live Video Controls Bar -->
      <div id="videoControlBar" style="display: none; background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid var(--border-active); padding: 0.5rem 1rem; align-items: center; justify-content: space-between; z-index: 30;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--status-ready); display: flex; align-items: center; gap: 0.35rem;">
            <span class="status-dot"></span> TRANSMISSÃO AO VIVO DE DISPOSITIVO EXTERNO / PLACA DE CAPTURA
          </span>
          <select id="videoSourceSelect" class="window-select" style="font-size: 0.7rem; max-width: 220px; background: #0F172A; color: #FFF;">
            <option value="">Selecione o Dispositivo Externo...</option>
          </select>
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button class="btn-primary" id="btnSnapFrame" style="font-size: 0.75rem; padding: 0.35rem 0.75rem; background: var(--status-ready); border-color: var(--status-ready); font-weight: 700;">
            <i data-lucide="camera" style="width: 14px; height: 14px;"></i>
            <span>📸 Capturar & Salvar Foto</span>
          </button>
          <button class="btn-secondary" id="btnStopVideo" style="font-size: 0.75rem; padding: 0.35rem 0.75rem;">
            <i data-lucide="power" style="width: 14px; height: 14px; color: #EF4444;"></i>
            <span>Desativar Vídeo</span>
          </button>
        </div>
      </div>

      <!-- Viewport Stage Container -->
      <div class="viewport-stage" id="viewportStage" style="flex: 1; display: flex; gap: 4px; padding: 4px; position: relative;">
        <div id="primaryViewportContainer" style="flex: 1; position: relative; height: 100%; display: flex; align-items: center; justify-content: center; background: #000; overflow: hidden;">
          
          <!-- DICOM Interactive Canvas -->
          <canvas id="dicomCanvas" width="512" height="512" style="cursor: crosshair; touch-action: none;"></canvas>
          
          <video id="usLiveVideo" autoplay playsinline style="display: none; width: 100%; height: 100%; object-fit: contain; background: #000;"></video>

          <!-- HUD Overlays -->
          <div class="hud-overlay hud-top-left">
            <div><strong>PATIENT:</strong> ${study.patientName}</div>
            <div><strong>ID:</strong> ${study.patientId}</div>
            <div><strong>AGE/SEX:</strong> ${study.age} / ${study.gender}</div>
          </div>

          <div class="hud-overlay hud-top-right">
            <div><strong>STUDY:</strong> ${study.studyDescription}</div>
            <div><strong>ACC#:</strong> ${study.accessionNumber}</div>
            <div><strong>MODALITY:</strong> ${study.modality}</div>
          </div>

          <div class="hud-overlay hud-bottom-left">
            <div><strong>WW:</strong> <span id="hudWw">${windowWidth}</span> | <strong>WL:</strong> <span id="hudWl">${windowLevel}</span></div>
            <div><strong>ZOOM:</strong> <span id="hudZoom">${(zoom * 100).toFixed(0)}%</span> | <strong>FERRAMENTA:</strong> <span id="hudActiveToolName" style="color: var(--primary-cyan); text-transform: uppercase;">${activeTool}</span></div>
          </div>

          <div class="hud-overlay hud-bottom-right">
            <div><strong>FOTOS SALVAS:</strong> <span id="hudCapturesCount" style="color: var(--status-ready); font-weight: 700;">${study.capturedFrames.length}</span></div>
            <div><strong>SITUAÇÃO:</strong> ARMAZENAMENTO ATIVO</div>
          </div>
        </div>

        ${study.instanceCount > 1 ? `
          <div class="series-stack-bar">
            <span style="font-size: 0.65rem; color: var(--primary-cyan); font-weight: 700;">SLICE</span>
            <input type="range" id="sliceSlider" min="1" max="${study.instanceCount}" value="${sliceIndex}">
            <span style="font-size: 0.65rem; color: var(--text-muted);" id="sliceCountLabel">${sliceIndex}/${study.instanceCount}</span>
          </div>
        ` : ''}
      </div>

      <!-- ULTRASOUND & EXTERNAL DEVICE CAPTURE FILMSTRIP GALLERY -->
      <div id="filmstripContainer" style="background: #070A11; border-top: 1px solid var(--border-light); padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.75rem; overflow-x: auto; min-height: 105px;">
        <div style="font-size: 0.7rem; font-weight: 700; color: var(--primary-cyan); display: flex; flex-direction: column; gap: 0.2rem; min-width: 130px;">
          <span>🖼️ FOTOS DO EXAME</span>
          <span style="font-size: 0.65rem; color: var(--status-ready); font-weight: 700;" id="filmstripLabel">(${study.capturedFrames.length} salvas)</span>
          <button id="btnQuickImportFooter" style="font-size: 0.65rem; padding: 2px 6px; background: rgba(0,229,255,0.15); border: 1px solid var(--primary-cyan); color: var(--primary-cyan); border-radius: 4px; cursor: pointer; margin-top: 4px; font-weight: 700;">
            + Adicionar Foto
          </button>
        </div>

        <div id="filmstripGallery" style="display: flex; gap: 0.5rem; align-items: center; flex: 1; overflow-x: auto;">
          <!-- Items auto-rendered -->
        </div>
      </div>

    </div>
  `;

  const canvas = container.querySelector('#dicomCanvas');
  const ctx = canvas.getContext('2d');
  const usLiveVideo = container.querySelector('#usLiveVideo');
  const videoControlBar = container.querySelector('#videoControlBar');
  const videoSourceSelect = container.querySelector('#videoSourceSelect');
  const hudWw = container.querySelector('#hudWw');
  const hudWl = container.querySelector('#hudWl');
  const hudZoom = container.querySelector('#hudZoom');
  const hudActiveToolName = container.querySelector('#hudActiveToolName');
  const hudCapturesCount = container.querySelector('#hudCapturesCount');
  const filmstripGallery = container.querySelector('#filmstripGallery');
  const filmstripLabel = container.querySelector('#filmstripLabel');

  function updateRender() {
    if (isVideoCaptureActive) {
      canvas.style.display = 'none';
      usLiveVideo.style.display = 'block';
      return;
    }

    usLiveVideo.style.display = 'none';
    canvas.style.display = 'block';

    // 1. Always render diagnostic medical slice synchronously first as instant base canvas
    let dicomRendered = false;
    if (rawDicomObject && rawDicomObject.pixelData) {
      dicomRendered = renderRawDicomToCanvas(canvas, rawDicomObject, { windowWidth, windowLevel, inverted });
    }

    if (!dicomRendered) {
      renderDicomSlice(canvas, study, { sliceIndex, windowWidth, windowLevel, inverted, showAiOverlay, zoom, pan, measurements });
    }

    // 2. If study has captured/imported image frames, overlay valid image frame onto canvas
    if (study.capturedFrames && study.capturedFrames.length > 0) {
      const frameIdx = Math.min(sliceIndex - 1, study.capturedFrames.length - 1);
      const currentFrame = study.capturedFrames[Math.max(0, frameIdx)];

      if (currentFrame && currentFrame.dataUrl && currentFrame.dataUrl.startsWith('data:image/')) {
        const img = new Image();
        img.onload = () => {
          if (img.width > 20 && img.height > 20) {
            canvas.width = 512;
            canvas.height = 512;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * zoom;
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (canvas.width - w) / 2 + pan.x;
            const y = (canvas.height - h) / 2 + pan.y;

            ctx.save();
            if (inverted) ctx.filter = 'invert(100%)';
            ctx.drawImage(img, x, y, w, h);
            ctx.restore();

            drawDraftOverlay();
          }
        };
        img.src = currentFrame.dataUrl;
      }
    }

    drawDraftOverlay();

    if (hudWw) hudWw.textContent = Math.round(windowWidth);
    if (hudWl) hudWl.textContent = Math.round(windowLevel);
    if (hudZoom) hudZoom.textContent = `${(zoom * 100).toFixed(0)}%`;
    if (hudActiveToolName) hudActiveToolName.textContent = activeTool;
    if (hudCapturesCount) hudCapturesCount.textContent = study.capturedFrames ? study.capturedFrames.length : 0;
    if (filmstripLabel) filmstripLabel.textContent = `(${study.capturedFrames ? study.capturedFrames.length : 0} salvas)`;
  }

  function drawDraftOverlay() {
    if (currentMeasurementDraft) {
      ctx.save();
      ctx.strokeStyle = '#00E5FF';
      ctx.fillStyle = '#00E5FF';
      ctx.lineWidth = 2;

      if (currentMeasurementDraft.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(currentMeasurementDraft.x1, currentMeasurementDraft.y1);
        ctx.lineTo(currentMeasurementDraft.x2, currentMeasurementDraft.y2);
        ctx.stroke();

        const dist = Math.hypot(currentMeasurementDraft.x2 - currentMeasurementDraft.x1, currentMeasurementDraft.y2 - currentMeasurementDraft.y1) * 0.15;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`${dist.toFixed(1)} mm`, (currentMeasurementDraft.x1 + currentMeasurementDraft.x2) / 2 + 5, (currentMeasurementDraft.y1 + currentMeasurementDraft.y2) / 2 - 5);
      } else if (currentMeasurementDraft.type === 'roi') {
        const rx = Math.abs(currentMeasurementDraft.x2 - currentMeasurementDraft.x1) / 2;
        const ry = Math.abs(currentMeasurementDraft.y2 - currentMeasurementDraft.y1) / 2;
        const cx = (currentMeasurementDraft.x1 + currentMeasurementDraft.x2) / 2;
        const cy = (currentMeasurementDraft.y1 + currentMeasurementDraft.y2) / 2;

        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();

        const area = Math.PI * rx * ry * 0.05;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`ROI: ${area.toFixed(1)} mm² | HU: +38.5`, cx - 40, cy);
      } else if (currentMeasurementDraft.type === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(currentMeasurementDraft.x1, currentMeasurementDraft.y1);
        ctx.lineTo(currentMeasurementDraft.x2, currentMeasurementDraft.y2);
        ctx.stroke();
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText("📍 ACHADO LESÃO", currentMeasurementDraft.x2 + 5, currentMeasurementDraft.y2);
      }

      ctx.restore();
    }
  }

  function addCapturedFrame(dataUrl, sourceName = "DISPOSITIVO EXTERNO") {
    const newFrame = {
      id: `FRAME-${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      dataUrl: dataUrl,
      source: sourceName,
      timestamp: new Date().toLocaleTimeString()
    };

    study.capturedFrames.push(newFrame);
    study.instanceCount += 1;

    // SAVE INSTANTLY TO LOCALSTORAGE
    saveStudiesToStorage(state.studies);

    updateFilmstripUI();
    updateRender();

    showToast(`📸 Foto #${study.capturedFrames.length} salva com sucesso no exame do paciente!`, "success");
  }

  function updateFilmstripUI() {
    if (!filmstripGallery) return;

    if (study.capturedFrames.length === 0) {
      filmstripGallery.innerHTML = `
        <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; display: flex; align-items: center; gap: 0.5rem;">
          <span>Nenhuma imagem capturada. Clique em <strong>"📸 Tirar Foto"</strong> ou <strong>"📁 Importar Fotos"</strong> para adicionar imagens.</span>
        </div>
      `;
      return;
    }

    filmstripGallery.innerHTML = study.capturedFrames.map((frame, idx) => `
      <div class="filmstrip-item" data-index="${idx}" style="position: relative; width: 80px; height: 80px; background: #000; border: 2px solid var(--primary-cyan); border-radius: 6px; overflow: hidden; cursor: pointer; flex-shrink: 0;" title="Foto #${idx + 1} - Clique para exibir no monitor">
        <img src="${frame.dataUrl}" style="width: 100%; height: 100%; object-fit: cover;">
        <span style="position: absolute; bottom: 2px; right: 2px; font-size: 0.6rem; background: rgba(0,0,0,0.8); color: #FFF; padding: 1px 4px; border-radius: 3px; font-weight: 700;">#${idx + 1}</span>
        
        <button class="btn-delete-frame" data-index="${idx}" title="Excluir Foto" style="position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; background: rgba(239,68,68,0.9); border: none; border-radius: 3px; color: #FFF; font-size: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          ✕
        </button>
      </div>
    `).join('');

    filmstripGallery.querySelectorAll('.filmstrip-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-frame')) return;
        const index = parseInt(item.dataset.index);
        const frame = study.capturedFrames[index];
        if (frame) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = frame.dataUrl;
          showToast(`🖼️ Exibindo Foto #${index + 1} no monitor principal.`, "info");
        }
      });
    });

    filmstripGallery.querySelectorAll('.btn-delete-frame').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        study.capturedFrames.splice(idx, 1);
        saveStudiesToStorage(state.studies);
        updateFilmstripUI();
        updateRender();
        showToast("🗑️ Foto removida do exame.", "warning");
      });
    });
  }

  // File import for external photos
  const fileInput = container.querySelector('#fileExternalPhoto');
  const btnImportExternal = container.querySelector('#btnImportExternalPhoto');
  const btnQuickImportFooter = container.querySelector('#btnQuickImportFooter');

  const triggerFileImport = () => {
    if (fileInput) fileInput.click();
  };

  btnImportExternal?.addEventListener('click', triggerFileImport);
  btnQuickImportFooter?.addEventListener('click', triggerFileImport);

  fileInput?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        addCapturedFrame(event.target.result, "IMPORTAÇÃO EXTERNA");
      };
      reader.readAsDataURL(file);
    });

    fileInput.value = '';
  });

  // Manual Save All Button
  container.querySelector('#btnSaveViewer')?.addEventListener('click', () => {
    saveStudiesToStorage(state.studies);
    showToast(`💾 Sucesso! O exame e todas as ${study.capturedFrames.length} fotos foram salvos permanentemente!`, "success");
  });

  // Open Ultrasound Exam Information Modal
  container.querySelector('#btnOpenUltrasoundDataModal')?.addEventListener('click', () => {
    openUltrasoundModal();
  });

  function openUltrasoundModal() {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop open';
    modalBackdrop.id = 'usInfoModalBackdrop';

    modalBackdrop.innerHTML = `
      <div class="modal-card" style="max-width: 650px; width: 92%; display: flex; flex-direction: column; gap: 1rem; background: #0A0F1D; border: 1px solid var(--primary-cyan); box-shadow: 0 0 30px rgba(0, 229, 255, 0.25);">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.4rem;">
              📝 Inserir / Editar Informações do Exame Ultrassonográfico
            </h3>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 2px 0 0 0;">
              Paciente: <strong>${study.patientName}</strong> (${study.patientId}) — Modalidade: <strong>${study.modality}</strong>
            </p>
          </div>
          <button class="btn-icon" id="btnCloseUsModal" style="width: 32px; height: 32px; background: rgba(255,255,255,0.1); border-color: var(--border-light); color: #FFF; font-weight: 700;">✕</button>
        </div>

        <!-- Preset Quick Filler -->
        <div style="background: rgba(0, 229, 255, 0.05); border: 1px solid var(--border-light); padding: 0.6rem; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary-cyan); white-space: nowrap;">⚡ Carregar Modelo / Pré-set de Medidas:</span>
          <select id="usPresetSelector" class="form-select" style="font-size: 0.78rem; background: #0F172A; color: #FFF; flex: 1;">
            <option value="">-- Selecionar Pré-set Médico --</option>
            <option value="US_ABDOMEN_NORMAL">Ultrassom de Abdômen Total (Normal)</option>
            <option value="US_ESTEATOSE">Esteatose Hepática Moderada (Grau II)</option>
            <option value="US_COLELITIASE">Colelitíase (Cálculos em Vesícula Biliar)</option>
            <option value="US_CISTO_RENAL">Cisto Renal Simples</option>
            <option value="US_OBSTETRICO">Ultrassom Obstétrico (Gestação Única)</option>
            <option value="US_TIREOIDE">Ultrassom de Tireóide (Nódulo Benigno)</option>
            <option value="US_CAROTIDAS">Ultrassom de Carótidas e Vertebrais</option>
            <option value="US_TRANSVAGINAL">Ultrassom Pelvico Transvaginal</option>
          </select>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <div class="form-group" style="margin: 0;">
              <label style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.2rem; display: block;">Indicação Clínica / Suspeita:</label>
              <input type="text" id="usModalClinical" class="form-select" value="${study.clinicalIndication || 'Dor abdominal difusa a esclarecer.'}" style="background: #0F172A; color: #FFF; padding: 0.45rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--border-light); width: 100%;">
            </div>

            <div class="form-group" style="margin: 0;">
              <label style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.2rem; display: block;">Técnica Ultrassonográfica:</label>
              <input type="text" id="usModalTechnique" class="form-select" value="${study.technique || 'Transdutor Convexo 3.5 MHz e Linear 7.5 MHz em tempo real.'}" style="background: #0F172A; color: #FFF; padding: 0.45rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--border-light); width: 100%;">
            </div>
          </div>

          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.2rem; display: block;">Achados & Medidas dos Órgãos Ultrassonografados:</label>
            <textarea id="usModalFindings" class="form-select" style="background: #0F172A; color: #FFF; padding: 0.6rem; font-size: 0.82rem; border-radius: 6px; border: 1px solid var(--border-light); width: 100%; height: 110px; font-family: 'Consolas', monospace; line-height: 1.4;">${study.findingsText || 'Fígado com dimensões preservadas, contornos regulares e ecotextura homogênea.\nVesícula biliar tópica, anecóica, sem evidência de cálculos.\nRins tópicos com espessura parenquimatosa preservada.\nBexiga repleta e sem alterações vesicais.'}</textarea>
          </div>

          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.2rem; display: block;">Impressão Diagnóstica / Conclusão do Laudo:</label>
            <input type="text" id="usModalImpression" class="form-select" value="${study.impressionText || 'Exame ultrassonográfico dentro dos padrões da normalidade.'}" style="background: #0F172A; color: #FFF; padding: 0.45rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--border-light); width: 100%;">
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
          <button class="btn-secondary" id="btnCancelUsModal">Cancelar</button>
          <button class="btn-primary" id="btnSaveUsModal" style="background: var(--status-ready); border-color: var(--status-ready); font-weight: 700; padding: 0.55rem 1.25rem;">
            ⚡ Salvar Dados & Aplicar ao Laudo
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modalBackdrop);

    const close = () => modalBackdrop.remove();
    modalBackdrop.querySelector('#btnCloseUsModal').addEventListener('click', close);
    modalBackdrop.querySelector('#btnCancelUsModal').addEventListener('click', close);

    // Preset selector handler
    modalBackdrop.querySelector('#usPresetSelector').addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'US_ABDOMEN_NORMAL') {
        modalBackdrop.querySelector('#usModalTechnique').value = "Transdutor Convexo 3.5 MHz em tempo real.";
        modalBackdrop.querySelector('#usModalFindings').value = "Fígado de dimensões preservadas (14.2 cm no LHD), superfície regular e ecotextura homogênea.\nVesícula biliar normotrófica, paredes finas e anecóica.\nVias biliares intra e extra-hepáticas de calibre normal.\nPâncreas e baço de contornos e ecotextura preservadas.\nRins tópicos, dimensões normais (RD: 10.5 cm, RE: 10.8 cm) sem hidronefrose.";
        modalBackdrop.querySelector('#usModalImpression').value = "Exame ultrassonográfico de abdômen total dentro dos padrões da normalidade.";
      } else if (val === 'US_ESTEATOSE') {
        modalBackdrop.querySelector('#usModalTechnique').value = "Transdutor Convexo 3.5 MHz com atenuação acústica posterior.";
        modalBackdrop.querySelector('#usModalFindings').value = "Fígado aumentado de volume (LHD: 16.5 cm), apresentando aumento difuso da ecotextura parenquimatosa com atenuação acústica posterior e atenuação da visualização de vasos hepáticos profundos.\nVesícula biliar normotrófica sem cálculos.\nRins de ecotextura e dimensões preservadas.";
        modalBackdrop.querySelector('#usModalImpression').value = "Esteatose Hepática Moderada (Grau II).";
      } else if (val === 'US_COLELITIASE') {
        modalBackdrop.querySelector('#usModalTechnique').value = "Transdutor Convexo 3.5 MHz em decúbitos dorsal e lateral esquerdo.";
        modalBackdrop.querySelector('#usModalFindings').value = "Fígado de dimensões normais.\nVesícula biliar normotrófica, apresentando cálculo móbile de 1.4 cm em seu interior, gerando sombra acústica posterior bem definida. Paredes vesicais finas (2.0 mm).\nColedoco de calibre normal (3.5 mm).";
        modalBackdrop.querySelector('#usModalImpression').value = "Colelitíase (Cálculo em vesícula biliar sem sinais de colecistite aguda).";
      } else if (val === 'US_OBSTETRICO') {
        modalBackdrop.querySelector('#usModalTechnique').value = "Transdutor Convexo Volumétrico 4.0 MHz com Doppler Colorido.";
        modalBackdrop.querySelector('#usModalFindings').value = "Feto único vivo em apresentação cefálica.\nBPM: 148 bpm (ritmo regular).\nDBP: 72 mm | CC: 265 mm | CA: 240 mm | COMP. FÊMUR: 54 mm.\nPeso fetal estimado: 1.250 g (Percentil 50).\nLíquido amniótico de volume normal (ILA: 13.5 cm).\nPlacenta fúndica posterior Grau I.";
        modalBackdrop.querySelector('#usModalImpression').value = "Gestação única tópica de 28 semanas e 4 dias. Vitalidade fetal preservada.";
      }
    });

    modalBackdrop.querySelector('#btnSaveUsModal').addEventListener('click', () => {
      study.clinicalIndication = modalBackdrop.querySelector('#usModalClinical').value.trim();
      study.technique = modalBackdrop.querySelector('#usModalTechnique').value.trim();
      study.findingsText = modalBackdrop.querySelector('#usModalFindings').value.trim();
      study.impressionText = modalBackdrop.querySelector('#usModalImpression').value.trim();

      study.reportText = `INDICAÇÃO CLÍNICA: ${study.clinicalIndication}\nTÉCNICA: ${study.technique}\n\nACHADOS E MEDIDAS ULTRASSONOGRÁFICAS:\n${study.findingsText}\n\nIMPRESSÃO DIAGNÓSTICA / CONCLUSÃO:\n${study.impressionText}`;

      saveStudiesToStorage(state.studies);
      close();
      showToast("✅ Informações do exame ultrassonográfico salvas no laudo com sucesso!", "success");
    });
  }

  // Active Tool Click Handlers
  const toolButtons = {
    windowing: container.querySelector('#toolWindowing'),
    line: container.querySelector('#toolLine'),
    angle: container.querySelector('#toolAngle'),
    roi: container.querySelector('#toolRoi'),
    arrow: container.querySelector('#toolArrow'),
    zoom: container.querySelector('#toolZoom'),
    pan: container.querySelector('#toolPan')
  };

  function setActiveTool(toolName) {
    activeTool = toolName;
    Object.entries(toolButtons).forEach(([name, btn]) => {
      if (btn) btn.classList.toggle('active', name === toolName);
    });
    updateRender();
  }

  Object.entries(toolButtons).forEach(([name, btn]) => {
    btn?.addEventListener('click', () => setActiveTool(name));
  });

  // Preset Selector
  container.querySelector('#presetSelect')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'lung') { windowWidth = 1500; windowLevel = -600; }
    else if (val === 'bone') { windowWidth = 2000; windowLevel = 350; }
    else if (val === 'soft') { windowWidth = 350; windowLevel = 40; }
    else if (val === 'brain') { windowWidth = 80; windowLevel = 40; }
    else { windowWidth = 400; windowLevel = 40; }
    updateRender();
  });

  container.querySelector('#toolInvert')?.addEventListener('click', () => {
    inverted = !inverted;
    container.querySelector('#toolInvert').classList.toggle('active', inverted);
    updateRender();
  });

  container.querySelector('#toolRotate')?.addEventListener('click', () => {
    rotationAngle = (rotationAngle + 90) % 360;
    updateRender();
  });

  // Interactive Mouse Events
  canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    if (activeTool === 'line' || activeTool === 'roi' || activeTool === 'arrow') {
      currentMeasurementDraft = {
        type: activeTool,
        x1: startX,
        y1: startY,
        x2: startX,
        y2: startY
      };
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const dx = currentX - startX;
    const dy = currentY - startY;

    if (activeTool === 'windowing') {
      windowWidth = Math.max(1, windowWidth + dx * 2);
      windowLevel = windowLevel - dy * 2;
      startX = currentX;
      startY = currentY;
      updateRender();
    } else if (activeTool === 'zoom') {
      zoom = Math.max(0.5, Math.min(5, zoom - dy * 0.01));
      startY = currentY;
      updateRender();
    } else if (activeTool === 'pan') {
      pan.x += dx;
      pan.y += dy;
      startX = currentX;
      startY = currentY;
      updateRender();
    } else if (currentMeasurementDraft) {
      currentMeasurementDraft.x2 = currentX;
      currentMeasurementDraft.y2 = currentY;
      updateRender();
    }
  });

  canvas.addEventListener('mouseup', () => {
    if (!isMouseDown) return;
    isMouseDown = false;

    if (currentMeasurementDraft) {
      measurements.push({ ...currentMeasurementDraft });
      study.measurements = measurements;
      saveStudiesToStorage(state.studies);
      currentMeasurementDraft = null;
      updateRender();
    }
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoom = Math.min(5, zoom * 1.1);
    } else {
      zoom = Math.max(0.5, zoom / 1.1);
    }
    updateRender();
  });

  // Manual Photo Capture Button
  container.querySelector('#btnManualSnap')?.addEventListener('click', () => {
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = canvas.width;
    snapCanvas.height = canvas.height;
    const snapCtx = snapCanvas.getContext('2d');

    if (usLiveVideo.srcObject) {
      snapCtx.drawImage(usLiveVideo, 0, 0, snapCanvas.width, snapCanvas.height);
    } else {
      renderDicomSlice(snapCanvas, study, { sliceIndex, windowWidth, windowLevel, showAiOverlay: true });
    }

    addCapturedFrame(snapCanvas.toDataURL(), "CAPTURA MANUAL VIEWER");
  });

  // Toggle Live Video Capture
  const btnVideoCapture = container.querySelector('#btnVideoCapture');
  btnVideoCapture?.addEventListener('click', async () => {
    isVideoCaptureActive = !isVideoCaptureActive;

    if (isVideoCaptureActive) {
      videoControlBar.style.display = 'flex';
      btnVideoCapture.classList.add('active');

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');

        videoSourceSelect.innerHTML = videoDevices.map((d, i) => `
          <option value="${d.deviceId}">${d.label || `Placa de Captura / Câmera Externa ${i + 1}`}</option>
        `).join('') || '<option value="">Placa de Captura Padrão (USB Video)</option>';

        startVideoStream(videoDevices[0]?.deviceId);
      } catch (err) {
        startVideoStream();
      }
    } else {
      stopVideoStream();
    }
  });

  async function startVideoStream(deviceId = null) {
    stopActiveVideoCapture();

    const constraints = {
      video: deviceId ? { deviceId: { exact: deviceId }, width: 1280, height: 720 } : { width: 1280, height: 720 }
    };

    try {
      activeMediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      usLiveVideo.srcObject = activeMediaStream;
      updateRender();
      showToast("📹 Placa de Captura / Câmera Conectada ao Vivo!", "info");
    } catch (err) {
      showToast("📹 Modo de Simulação de Captura de Vídeo Ativado!", "info");
      updateRender();
    }
  }

  function stopVideoStream() {
    stopActiveVideoCapture();
    if (usLiveVideo) {
      usLiveVideo.srcObject = null;
    }
    isVideoCaptureActive = false;
    videoControlBar.style.display = 'none';
    btnVideoCapture.classList.remove('active');
    updateRender();
  }

  container.querySelector('#btnStopVideo')?.addEventListener('click', stopVideoStream);

  container.querySelector('#btnSnapFrame')?.addEventListener('click', () => {
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = canvas.width;
    snapCanvas.height = canvas.height;
    const snapCtx = snapCanvas.getContext('2d');

    if (usLiveVideo.srcObject) {
      snapCtx.drawImage(usLiveVideo, 0, 0, snapCanvas.width, snapCanvas.height);
    } else {
      renderDicomSlice(snapCanvas, study, { sliceIndex, windowWidth, windowLevel, showAiOverlay: true });
    }

    addCapturedFrame(snapCanvas.toDataURL(), "PLACA DE CAPTURA");
  });

  container.querySelector('#toolReset')?.addEventListener('click', () => {
    zoom = 1;
    pan = { x: 0, y: 0 };
    windowWidth = study.modality === 'CT' ? 1500 : 400;
    windowLevel = study.modality === 'CT' ? -600 : 40;
    inverted = false;
    measurements = [];
    study.measurements = [];
    currentMeasurementDraft = null;
    saveStudiesToStorage(state.studies);
    updateRender();
  });

  // Initial Draw & Gallery Render
  updateFilmstripUI();
  updateRender();
}
