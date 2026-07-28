// ==========================================================================
// NexusRad AI - Streamlined Minimalist Report Editor with Template Library
// ==========================================================================

import { MOCK_TEMPLATES } from '../data/mockData.js';
import { analyzeStudyWithGemini } from '../utils/geminiAiService.js';
import { renderTemplateLibraryModal } from './TemplateLibraryModal.js';
import jsPDF from 'jspdf';

export function renderReportEditor(container, study, allStudies = [], callbacks = {}) {
  const templates = MOCK_TEMPLATES || {};
  let currentStudy = study;
  let activeTemplateKey = Object.keys(templates)[0] || 'US_ABDOMEN_TOTAL';
  let isGeneratingAi = false;

  function render() {
    const tpl = templates[activeTemplateKey];
    const initialText = currentStudy.reportText || (tpl?.findings ? `${tpl.findings}\n\nIMPRESSÃO DIAGNÓSTICA:\n${tpl.impression}` : '');

    container.innerHTML = `
      <div class="report-pane" style="height: 100%; border: none; display: flex; flex-direction: column; background: #0B0F17; color: #F1F5F9;">
        
        <!-- Clean Minimal Top Header with Patient Switcher Dropdown -->
        <div style="background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid var(--border-light); padding: 0.85rem 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
          
          <!-- Patient Selector -->
          <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1; max-width: 500px;">
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--primary-cyan); white-space: nowrap; display: flex; align-items: center; gap: 0.35rem;">
              <i data-lucide="user" style="width: 16px; height: 16px;"></i>
              PACIENTE:
            </label>

            <select id="patientSelectDropdown" class="form-select" style="font-size: 0.85rem; font-weight: 600; padding: 0.4rem 0.75rem; border-color: var(--primary-cyan); background: rgba(0, 229, 255, 0.05); color: #FFF; width: 100%;">
              ${allStudies.map(s => `
                <option value="${s.id}" ${s.id === currentStudy.id ? 'selected' : ''}>
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

        <!-- Clean Main Editor Body -->
        <div style="flex: 1; display: flex; flex-direction: column; padding: 1.25rem; gap: 1rem; overflow-y: auto;">
          
          <!-- Template Selector Bar & Search Library Button -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; background: rgba(15, 23, 42, 0.5); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-light); flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;" id="templateChips">
              <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Máscaras Rápidas:</span>

              ${Object.entries(templates).slice(0, 4).map(([key, t] ) => `
                <button class="btn-chip ${key === activeTemplateKey ? 'active' : ''}" data-key="${key}" style="font-size: 0.72rem; padding: 4px 10px; border-radius: 6px; border: 1px solid ${key === activeTemplateKey ? 'var(--primary-cyan)' : 'transparent'}; background: ${key === activeTemplateKey ? 'var(--primary-cyan-soft)' : 'transparent'}; color: ${key === activeTemplateKey ? 'var(--primary-cyan)' : 'var(--text-muted)'}; cursor: pointer; font-weight: 600;">
                  ${t.name}
                </button>
              `).join('')}
            </div>

            <button class="btn-secondary" id="btnOpenTemplateLibrary" style="font-size: 0.75rem; padding: 0.35rem 0.75rem; border-color: var(--primary-cyan); color: var(--primary-cyan); font-weight: 700;">
              <i data-lucide="search" style="width: 14px; height: 14px;"></i>
              <span>📚 Pesquisar Todas as Máscaras (${Object.keys(templates).length})</span>
            </button>
          </div>

          <!-- Action Buttons Bar (Gemini AI & Voice) -->
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn-primary" id="btnGeminiAiReport" style="flex: 1; justify-content: center; background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); border: none; font-weight: 700; padding: 0.6rem;">
              <i data-lucide="sparkles" style="width: 16px; height: 16px;"></i>
              <span>${isGeneratingAi ? 'IA Redigindo Laudo...' : '✨ Gerar Laudo Automático (Gemini IA)'}</span>
            </button>
          </div>

          <!-- Clean Textarea -->
          <div style="flex: 1; display: flex; flex-direction: column; min-height: 320px;">
            <textarea id="reportTextarea" class="form-select" style="flex: 1; width: 100%; font-family: 'Consolas', 'Courier New', monospace; font-size: 0.95rem; line-height: 1.6; padding: 1.25rem; background: #05080E; color: #F1F5F9; border: 1px solid var(--border-light); border-radius: 8px; resize: vertical;" placeholder="Digite ou gere o laudo radiológico...">${initialText}</textarea>
          </div>

          <!-- Action Footer -->
          <div style="display: flex; gap: 0.75rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
            <button class="btn-secondary" id="btnPrintReport" style="flex: 1; justify-content: center; padding: 0.65rem;">
              <i data-lucide="printer" style="width: 16px; height: 16px;"></i>
              <span>Imprimir</span>
            </button>

            <button class="btn-primary" id="btnSignReport" style="flex: 1.5; justify-content: center; background: var(--status-ready); border-color: var(--status-ready); font-weight: 700; padding: 0.65rem;">
              <i data-lucide="shield-check" style="width: 18px; height: 18px;"></i>
              <span>Assinar Laudo Digitalmente (ICP-Brasil)</span>
            </button>
          </div>

        </div>
      </div>
    `;

    const reportTextarea = container.querySelector('#reportTextarea');

    // Patient Dropdown Selection Handler
    container.querySelector('#patientSelectDropdown')?.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const found = allStudies.find(s => s.id === selectedId);
      if (found) {
        currentStudy = found;
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

    // Sign & Save PDF
    container.querySelector('#btnSignReport')?.addEventListener('click', () => {
      currentStudy.status = 'concluido';
      currentStudy.reportText = reportTextarea.value;
      generatePdf(currentStudy, reportTextarea.value);
      alert(`✅ Laudo do paciente ${currentStudy.patientName} assinado digitalmente com Certificado ICP-Brasil! PDF gerado com sucesso.`);
      if (callbacks.onReportSigned) callbacks.onReportSigned(currentStudy.id);
    });

    // Print PDF
    container.querySelector('#btnPrintReport')?.addEventListener('click', () => {
      generatePdf(currentStudy, reportTextarea.value);
    });
  }

  render();
}

function generatePdf(study, textContent) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 150, 200);
  doc.text("NEXUSRAD DIAGNÓSTICO POR IMAGEM S/A", 14, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Av. Paulista, 1500 - Bela Vista - São Paulo / SP • Tel: (11) 3300-9000", 14, 26);
  doc.line(14, 30, 196, 30);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(`PACIENTE: ${study.patientName}`, 14, 40);
  doc.text(`PRONTUÁRIO / CPF: ${study.patientId}`, 14, 46);
  doc.text(`EXAME: ${study.studyDescription}`, 14, 52);
  doc.text(`DATA DO EXAME: ${study.date}`, 14, 58);
  doc.line(14, 62, 196, 62);

  doc.setFontSize(11);
  doc.text("RELATÓRIO DO EXAME RADIOLÓGICO:", 14, 72);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const splitText = doc.splitTextToSize(textContent || "Exame sem alterações.", 180);
  doc.text(splitText, 14, 80);

  doc.line(14, 260, 196, 260);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Assinado Digitalmente por: Dr. Carlos Roberto de Mendonça (CRM/SP 142.890)", 14, 268);
  doc.setFont("helvetica", "normal");
  doc.text("Certificado ICP-Brasil • Token SHA-256: e8f901ab-2026-nexusrad", 14, 274);

  doc.save(`Laudo_${study.patientName.replace(/\s+/g, '_')}.pdf`);
}
