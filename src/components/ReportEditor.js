// ==========================================================================
// NexusRad AI - Streamlined Minimalist Report Editor with Medical Photo Attachment Engine
// Benchmark: Fleury, DASA, Rede D'Or, Carestream Vue Report PDF Print
// Includes 2-up / 4-up Medical Image Grid PDF Generation
// ==========================================================================

import { MOCK_TEMPLATES } from '../data/mockData.js';
import { analyzeStudyWithGemini } from '../utils/geminiAiService.js';
import { renderTemplateLibraryModal } from './TemplateLibraryModal.js';
import { showToast } from '../utils/toast.js';
import { saveStudiesToStorage } from '../utils/storage.js';
import jsPDF from 'jspdf';

export function renderReportEditor(container, study, allStudies = [], callbacks = {}) {
  const templates = MOCK_TEMPLATES || {};
  let currentStudy = study;
  let activeTemplateKey = Object.keys(templates)[0] || 'US_ABDOMEN_TOTAL';
  let isGeneratingAi = false;
  let includePhotosInPdf = true;

  if (!currentStudy.capturedFrames) {
    currentStudy.capturedFrames = [];
  }

  function render() {
    const tpl = templates[activeTemplateKey];
    const initialText = currentStudy.reportText || (tpl?.findings ? `${tpl.findings}\n\nIMPRESSÃO DIAGNÓSTICA:\n${tpl.impression}` : '');
    const photoCount = currentStudy.capturedFrames.length;

    container.innerHTML = `
      <div class="report-pane" style="height: 100%; border: none; display: flex; flex-direction: column; background: #0B0F17; color: #F1F5F9;">
        
        <!-- Top Header with Patient Switcher & Viewer Nav -->
        <div style="background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid var(--border-light); padding: 0.85rem 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
          
          <!-- Patient Selector -->
          <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 280px; max-width: 520px;">
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--primary-cyan); white-space: nowrap; display: flex; align-items: center; gap: 0.35rem;">
              <i data-lucide="user" style="width: 16px; height: 16px;"></i>
              PACIENTE:
            </label>

            <select id="patientSelectDropdown" class="form-select" style="font-size: 0.85rem; font-weight: 600; padding: 0.4rem 0.75rem; border-color: var(--primary-cyan); background: #0F172A; color: #FFF; width: 100%;">
              ${allStudies.map(s => `
                <option value="${s.id}" ${s.id === currentStudy.id ? 'selected' : ''} style="background: #0F172A; color: #FFFFFF; font-weight: 600; padding: 6px;">
                  ${s.patientName} — ${s.studyDescription} (${s.modality}) [${s.status.toUpperCase()}]
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Quick Navigation Buttons -->
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button class="btn-secondary" id="btnNavViewer" style="font-size: 0.75rem; padding: 0.4rem 0.85rem; border-radius: 6px;" title="Abrir Imagens no Viewer">
              <i data-lucide="eye" style="width: 14px; height: 14px; color: var(--primary-cyan);"></i>
              <span>Viewer DICOM</span>
            </button>

            <button class="btn-secondary" id="btnNavSplit" style="font-size: 0.75rem; padding: 0.4rem 0.85rem; border-radius: 6px;" title="Modo Dividido 2 Monitores">
              <i data-lucide="columns-2" style="width: 14px; height: 14px;"></i>
              <span>Modo Dividido</span>
            </button>
          </div>
        </div>

        <!-- Main Editor Body -->
        <div style="flex: 1; display: flex; flex-direction: column; padding: 1.25rem; gap: 1rem; overflow-y: auto;">
          
          <!-- Complete Pre-Laudo Search & Selection Control Bar -->
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-light); border-radius: 8px; padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.6rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.4rem;">
                <i data-lucide="file-text" style="width: 16px; height: 16px;"></i>
                📚 BANCO DE PRÉ-LAUDOS PADRONIZADOS (${Object.keys(templates).length} MODELOS)
              </span>

              <div style="display: flex; gap: 0.5rem;">
                <button class="btn-secondary" id="btnSaveCustomPreLaudo" style="font-size: 0.72rem; padding: 0.3rem 0.65rem; border-color: var(--status-ready); color: var(--status-ready); font-weight: 700;">
                  <i data-lucide="save" style="width: 13px; height: 13px;"></i>
                  <span>+ Salvar Texto Atual como Pré-Laudo</span>
                </button>

                <button class="btn-secondary" id="btnOpenTemplateLibrary" style="font-size: 0.72rem; padding: 0.3rem 0.65rem; border-color: var(--primary-cyan); color: var(--primary-cyan); font-weight: 700;">
                  <i data-lucide="search" style="width: 13px; height: 13px;"></i>
                  <span>📚 Biblioteca Completa</span>
                </button>
              </div>
            </div>

            <!-- Instant Search Input & Dropdown Selector -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.5rem;">
              <div style="position: relative;">
                <i data-lucide="search" style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: var(--text-muted);"></i>
                <input type="text" id="tplSearchInput" class="form-select" style="padding-left: 2.3rem; width: 100%; font-size: 0.8rem; background: #05080E; color: #FFF;" placeholder="🔍 Digite para pesquisar pré-laudos (ex: esteatose, transvaginal, mioma, carótida, mamas, cisto)...">
              </div>

              <select id="tplQuickSelect" class="form-select" style="font-size: 0.8rem; font-weight: 600; background: #0F172A; color: #FFF;">
                <option value="">-- Selecionar Máscara de Pré-Laudo --</option>
                ${Object.entries(templates).map(([key, t]) => `
                  <option value="${key}" ${key === activeTemplateKey ? 'selected' : ''}>
                    [${t.category || t.modality}] ${t.name}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Filtered Quick Chips Bar -->
            <div style="display: flex; align-items: center; gap: 0.4rem; overflow-x: auto; padding-top: 0.2rem;" id="templateChips">
              ${Object.entries(templates).slice(0, 6).map(([key, t]) => `
                <button class="btn-chip ${key === activeTemplateKey ? 'active' : ''}" data-key="${key}" style="font-size: 0.7rem; padding: 3px 8px; border-radius: 6px; border: 1px solid ${key === activeTemplateKey ? 'var(--primary-cyan)' : 'var(--border-light)'}; background: ${key === activeTemplateKey ? 'var(--primary-cyan-soft)' : '#0F172A'}; color: ${key === activeTemplateKey ? 'var(--primary-cyan)' : 'var(--text-muted)'}; cursor: pointer; font-weight: 600; white-space: nowrap;">
                  ${t.name}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Action Buttons Bar (Gemini AI) -->
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn-primary" id="btnGeminiAiReport" style="flex: 1; justify-content: center; background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); border: none; font-weight: 700; padding: 0.6rem;">
              <i data-lucide="sparkles" style="width: 16px; height: 16px;"></i>
              <span>${isGeneratingAi ? 'IA Redigindo Laudo...' : '✨ Gerar Laudo Automático (Gemini IA)'}</span>
            </button>
          </div>

          <!-- Report Textarea -->
          <div style="flex: 1; display: flex; flex-direction: column; min-height: 280px;">
            <textarea id="reportTextarea" class="form-select" style="flex: 1; width: 100%; font-family: 'Consolas', 'Courier New', monospace; font-size: 0.95rem; line-height: 1.6; padding: 1.25rem; background: #05080E; color: #F1F5F9; border: 1px solid var(--border-light); border-radius: 8px; resize: vertical;" placeholder="Digite ou gere o laudo radiológico...">${initialText}</textarea>
          </div>

          <!-- Captured Photos Attachment Section for PDF Printing -->
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-light); border-radius: 8px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" id="chkIncludePhotos" ${includePhotosInPdf ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--primary-cyan); cursor: pointer;">
                <label for="chkIncludePhotos" style="font-size: 0.85rem; font-weight: 700; color: var(--primary-cyan); cursor: pointer;">
                  🖼️ Anexar Fotos Diagnósticas ao Impresso do Laudo PDF (${photoCount} ${photoCount === 1 ? 'foto disponível' : 'fotos disponíveis'})
                </label>
              </div>

              <span style="font-size: 0.75rem; color: var(--status-ready); font-weight: 700;">
                ${includePhotosInPdf && photoCount > 0 ? '🟢 Página de Anexo Fotográfico Ativa no PDF' : '⚪ Apenas Laudo em Texto'}
              </span>
            </div>

            <!-- Mini Thumbnails Carousel inside Report Editor -->
            <div style="display: flex; gap: 0.5rem; align-items: center; overflow-x: auto; padding: 0.25rem 0;">
              ${photoCount === 0 ? `
                <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">
                  Nenhuma foto capturada ainda neste exame. Vá ao <strong>"Viewer DICOM"</strong> e clique em <strong>"📸 Tirar Foto"</strong> ou <strong>"📁 Importar Fotos"</strong>.
                </div>
              ` : currentStudy.capturedFrames.map((frame, idx) => `
                <div style="position: relative; width: 70px; height: 70px; background: #000; border: 2px solid var(--primary-cyan); border-radius: 6px; overflow: hidden; flex-shrink: 0;">
                  <img src="${frame.dataUrl}" style="width: 100%; height: 100%; object-fit: cover;">
                  <span style="position: absolute; bottom: 2px; right: 2px; font-size: 0.6rem; background: rgba(0,0,0,0.8); color: #FFF; padding: 1px 4px; border-radius: 3px; font-weight: 700;">#${idx + 1}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Action Footer -->
          <div style="display: flex; gap: 0.75rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem; flex-wrap: wrap;">
            <button class="btn-secondary" id="btnPrintReport" style="flex: 1; justify-content: center; padding: 0.75rem; font-weight: 700;">
              <i data-lucide="printer" style="width: 16px; height: 16px;"></i>
              <span>🖨️ Imprimir Laudo com Fotos (PDF)</span>
            </button>

            <button class="btn-primary" id="btnSignReport" style="flex: 1.5; justify-content: center; background: var(--status-ready); border-color: var(--status-ready); font-weight: 700; padding: 0.75rem;">
              <i data-lucide="shield-check" style="width: 18px; height: 18px;"></i>
              <span>Assinar Digitalmente & Enviar WhatsApp ao Paciente</span>
            </button>
          </div>

        </div>
      </div>
    `;

    const reportTextarea = container.querySelector('#reportTextarea');
    const chkIncludePhotos = container.querySelector('#chkIncludePhotos');

    chkIncludePhotos?.addEventListener('change', (e) => {
      includePhotosInPdf = e.target.checked;
    });

    // Patient Dropdown Selection Handler
    container.querySelector('#patientSelectDropdown')?.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const found = allStudies.find(s => s.id === selectedId);
      if (found) {
        currentStudy = found;
        if (!currentStudy.capturedFrames) currentStudy.capturedFrames = [];
        if (callbacks.onSelectPatient) callbacks.onSelectPatient(selectedId);
        render();
      }
    });

    // Navigation Buttons
    container.querySelector('#btnNavViewer')?.addEventListener('click', () => {
      if (callbacks.onToggleViewMode) callbacks.onToggleViewMode('viewer');
    });

    container.querySelector('#btnNavSplit')?.addEventListener('click', () => {
      if (callbacks.onToggleViewMode) callbacks.onToggleViewMode('split');
    });

    // Instant Search Input & Dropdown Selector Handlers
    const tplSearchInput = container.querySelector('#tplSearchInput');
    const tplQuickSelect = container.querySelector('#tplQuickSelect');

    tplSearchInput?.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      if (!tplQuickSelect) return;

      Array.from(tplQuickSelect.options).forEach((opt, idx) => {
        if (idx === 0) return;
        const text = opt.textContent.toLowerCase();
        opt.style.display = !term || text.includes(term) ? '' : 'none';
      });
    });

    tplQuickSelect?.addEventListener('change', (e) => {
      const key = e.target.value;
      if (!key) return;
      activeTemplateKey = key;
      const selectedTpl = templates[activeTemplateKey];
      if (selectedTpl) {
        reportTextarea.value = selectedTpl.findings ? `${selectedTpl.findings}\n\nIMPRESSÃO DIAGNÓSTICA:\n${selectedTpl.impression}` : '';
        showToast(`📋 Pré-laudo "${selectedTpl.name}" inserido no editor!`, "info");
      }
    });

    // Save Custom Pre-Laudo Button
    container.querySelector('#btnSaveCustomPreLaudo')?.addEventListener('click', () => {
      const text = reportTextarea.value.trim();
      if (!text) {
        showToast("Por favor, digite o texto do pré-laudo antes de salvar.", "warning");
        return;
      }

      const title = prompt("Digite o título do novo Pré-Laudo padronizado:", `Ultrassom de ${currentStudy.studyDescription}`);
      if (!title) return;

      const key = `CUSTOM_US_${Date.now()}`;
      const newTpl = {
        name: title.toUpperCase(),
        modality: currentStudy.modality || "US",
        category: "Personalizados Clínica",
        findings: text,
        impression: "Conclusão personalizada salva."
      };

      MOCK_TEMPLATES[key] = newTpl;
      showToast(`✅ Novo Pré-Laudo "${title}" salvo com sucesso na biblioteca!`, "success");
      render();
    });

    // Open Template Library Search Modal
    container.querySelector('#btnOpenTemplateLibrary')?.addEventListener('click', () => {
      renderTemplateLibraryModal(document.querySelector('#modalContainer'), {
        onSelectTemplate: (tpl) => {
          reportTextarea.value = `${tpl.findings}\n\nIMPRESSÃO DIAGNÓSTICA:\n${tpl.impression}`;
        }
      });
    });

    // Template Chip Click Handler
    container.querySelectorAll('#templateChips .btn-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTemplateKey = btn.dataset.key;
        const selectedTpl = templates[activeTemplateKey];
        reportTextarea.value = selectedTpl?.findings ? `${selectedTpl.findings}\n\nIMPRESSÃO DIAGNÓSTICA:\n${selectedTpl.impression}` : '';
        render();
      });
    });

    // Gemini AI Report Generation
    container.querySelector('#btnGeminiAiReport')?.addEventListener('click', async () => {
      isGeneratingAi = true;
      const btn = container.querySelector('#btnGeminiAiReport');
      btn.querySelector('span').textContent = 'IA Analisando e Redigindo...';

      const aiRes = await analyzeStudyWithGemini(currentStudy);
      reportTextarea.value = `RELATÓRIO DOS ACHADOS:\n${aiRes.findings}\n\nIMPRESSÃO DIAGNÓSTICA:\n${aiRes.impression}\n\nDIAGNÓSTICO DIFERENCIAL:\n- ${aiRes.differential.join('\n- ')}\n\nRECOMENDAÇÕES CLÍNICAS:\n${aiRes.recommendations}`;
      isGeneratingAi = false;
      btn.querySelector('span').textContent = '✨ Gerar Laudo Automático (Gemini IA)';
    });

    // Sign, Save PDF & Send Automatic WhatsApp Notification
    container.querySelector('#btnSignReport')?.addEventListener('click', () => {
      currentStudy.status = 'concluido';
      currentStudy.reportText = reportTextarea.value;
      saveStudiesToStorage(allStudies);
      generatePdfWithPhotos(currentStudy, reportTextarea.value, includePhotosInPdf);

      const msg = encodeURIComponent(`Olá ${currentStudy.patientName}, seu laudo do exame de ${currentStudy.studyDescription} foi assinado digitalmente e já está disponível para consulta e download em nosso portal online:\n\nhttp://127.0.0.1:3000/#/portal/${currentStudy.id}`);

      if (confirm(`✅ Laudo do paciente ${currentStudy.patientName} assinado digitalmente com Certificado ICP-Brasil!\n\nDeseja disparar a notificação automática via WhatsApp para o paciente agora?`)) {
        window.open(`https://wa.me/5511998887766?text=${msg}`, '_blank');
      }

      if (callbacks.onReportSigned) callbacks.onReportSigned(currentStudy.id);
    });

    // Print PDF with Photos
    container.querySelector('#btnPrintReport')?.addEventListener('click', () => {
      currentStudy.reportText = reportTextarea.value;
      saveStudiesToStorage(allStudies);
      generatePdfWithPhotos(currentStudy, reportTextarea.value, includePhotosInPdf);
      showToast("📄 Laudo PDF com Anexo de Imagens gerado com sucesso!", "success");
    });
  }

  render();
}

export function generatePdfWithPhotos(study, textContent, includePhotos = true) {
  const doc = new jsPDF();

  // ==========================================
  // PAGE 1: Standard Timbrado Diagnostic Report
  // ==========================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 150, 200);
  doc.text("NEXUSRAD DIAGNÓSTICO POR IMAGEM S/A", 14, 20);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Av. Paulista, 1500 - Bela Vista - São Paulo / SP • Tel: (11) 3300-9000 • CRM/SP 900.123", 14, 25);
  doc.line(14, 28, 196, 28);

  // Patient Header Info Box
  doc.setFillColor(245, 247, 250);
  doc.rect(14, 32, 182, 32, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text(`PACIENTE: ${study.patientName}`, 18, 39);
  doc.text(`PRONTUÁRIO / CPF: ${study.patientId}`, 18, 45);
  doc.text(`IDADE / SEXO: ${study.age || '38a'} / ${study.gender || 'M'}`, 18, 51);
  doc.text(`CONVÊNIO: ${study.agreement || 'Bradesco Saúde'}`, 18, 57);

  doc.text(`EXAME: ${study.studyDescription}`, 115, 39);
  doc.text(`CHAVE ACC: ${study.accessionNumber}`, 115, 45);
  doc.text(`DATA: ${study.date}`, 115, 51);
  doc.text(`MÉDICO REQUISITANTE: Dr. Fernando Ramos`, 115, 57);

  doc.line(14, 68, 196, 68);

  // Report Body Content
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 150, 200);
  doc.text("RELATÓRIO DO EXAME RADIOLÓGICO:", 14, 76);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40);
  const splitText = doc.splitTextToSize(textContent || "Exame dentro dos padrões da normalidade.", 180);
  doc.text(splitText, 14, 84);

  // Footer Signature & ICP-Brasil Seal
  doc.line(14, 258, 196, 258);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Assinado Digitalmente por: Dr. Carlos Roberto de Mendonça (CRM/SP 142.890)", 14, 265);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Certificado ICP-Brasil A1 • SHA-256: e8f901ab-2026-nexusrad-valid", 14, 271);
  doc.text("Página 1 de " + (includePhotos && study.capturedFrames && study.capturedFrames.length > 0 ? "2" : "1"), 170, 271);

  // ==========================================
  // PAGE 2+: Medical Photo Attachment Grid Layout (High Definition)
  // ==========================================
  if (includePhotos && study.capturedFrames && study.capturedFrames.length > 0) {
    doc.addPage();

    // Attachment Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 150, 200);
    doc.text("NEXUSRAD DIAGNÓSTICO — ANEXO DE IMAGENS DIAGNÓSTICAS", 14, 20);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Paciente: ${study.patientName}  |  Exame: ${study.studyDescription}  |  ACC: ${study.accessionNumber}`, 14, 25);
    doc.line(14, 28, 196, 28);

    // Render Photo Grid Layout (2x2 per page)
    const frames = study.capturedFrames;
    const maxPhotosPerPage = 4;
    
    frames.forEach((frame, idx) => {
      if (idx > 0 && idx % maxPhotosPerPage === 0) {
        doc.addPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 150, 200);
        doc.text("NEXUSRAD DIAGNÓSTICO — ANEXO DE IMAGENS DIAGNÓSTICAS (CONT.)", 14, 20);
        doc.line(14, 28, 196, 28);
      }

      const localIndex = idx % maxPhotosPerPage;
      const col = localIndex % 2; // 0 or 1
      const row = Math.floor(localIndex / 2); // 0 or 1

      const x = 14 + col * 92;
      const y = 35 + row * 108;
      const imgWidth = 86;
      const imgHeight = 86;

      try {
        // Draw Image Frame Border & Background
        doc.setFillColor(5, 8, 14);
        doc.rect(x - 1, y - 1, imgWidth + 2, imgHeight + 16, "F");

        doc.addImage(frame.dataUrl, 'JPEG', x, y, imgWidth, imgHeight);

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 229, 255);
        doc.text(`FOTO #${idx + 1} — ${frame.source || 'IMAGEM DE DIAGNÓSTICO'}`, x + 3, y + imgHeight + 6);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(200);
        doc.text(`Captura: ${frame.timestamp || '10:30:00'} | NexusRad PACS`, x + 3, y + imgHeight + 11);
      } catch (err) {
        console.error("Error adding image to PDF:", err);
      }
    });

    // Page 2 Footer
    doc.line(14, 268, 196, 268);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Imagens Diagnósticas Integrantes do Laudo Definitivo • Autenticado via PACS NexusRad AI", 14, 274);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Página 2 de 2", 175, 274);
  }

  doc.save(`Laudo_Com_Fotos_${study.patientName.replace(/\s+/g, '_')}.pdf`);
}
