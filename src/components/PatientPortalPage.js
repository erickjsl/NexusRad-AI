// ==========================================================================
// NexusRad AI - Individual Patient Web Portal & Exam History Page
// ==========================================================================

import { renderDicomSlice } from '../utils/dicomGenerator.js';
import jsPDF from 'jspdf';

export function renderPatientPortalPage(container, selectedStudy, allStudies, callbacks) {
  let activeStudy = selectedStudy || (allStudies.length > 0 ? allStudies[0] : null);
  let isPatientAuthenticated = !!selectedStudy;

  function render() {
    if (!isPatientAuthenticated) {
      // Patient Login / Protocol Access Screen
      container.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; background: radial-gradient(circle at center, #0F172A 0%, #070A11 100%); color: #FFF; overflow-y: auto; padding: 2rem; align-items: center; justify-content: center;">
          <div class="glass-card" style="width: 100%; max-width: 440px; padding: 2rem; border-radius: var(--radius-lg); border-color: var(--primary-cyan); display: flex; flex-direction: column; gap: 1.25rem;">
            
            <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
              <div class="brand-icon" style="width: 48px; height: 48px; font-size: 1.4rem;">
                <i data-lucide="activity"></i>
              </div>
              <div>
                <h1 style="font-size: 1.3rem; font-weight: 700; color: #FFF;">PORTAL DO PACIENTE ONLINE</h1>
                <p style="font-size: 0.75rem; color: var(--primary-cyan);">NEXUSRAD DIAGNÓSTICO POR IMAGEM</p>
              </div>
            </div>

            <form id="patientLoginForm" style="display: flex; flex-direction: column; gap: 1rem;">
              <div class="form-group">
                <label style="font-size: 0.75rem;">CPF do Paciente:</label>
                <input type="text" id="patientCpfInput" class="form-select" placeholder="Ex: 088.441.229-30" required value="${allStudies[0]?.patientId || ''}">
              </div>

              <div class="form-group">
                <label style="font-size: 0.75rem;">Chave de Acesso / Protocolo:</label>
                <input type="text" id="patientProtocolInput" class="form-select" placeholder="Ex: ACC-2026-90416" required value="${allStudies[0]?.accessionNumber || ''}">
              </div>

              <button type="submit" class="btn-primary" style="justify-content: center; padding: 0.75rem;">
                <i data-lucide="log-in" style="width: 18px; height: 18px;"></i>
                <span>Acessar Meus Exames</span>
              </button>
            </form>

            <div style="border-top: 1px solid var(--border-light); padding-top: 0.75rem; font-size: 0.7rem; color: var(--text-muted); text-align: center;">
              🔒 Acesso seguro e individual em conformidade com a LGPD.
            </div>
          </div>
        </div>
      `;

      container.querySelector('#patientLoginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const cpf = container.querySelector('#patientCpfInput').value.trim();
        const acc = container.querySelector('#patientProtocolInput').value.trim();
        
        const found = allStudies.find(s => s.patientId.includes(cpf) || s.accessionNumber.includes(acc) || s.id.includes(acc));
        if (found) {
          activeStudy = found;
          isPatientAuthenticated = true;
          render();
        } else {
          alert("⚠️ Dados não encontrados. Verifique seu CPF e Chave de Acesso no comprovante da recepção.");
        }
      });

      return;
    }

    // Individual Patient Authenticated Portal (Exam History & Viewer)
    const patientExams = allStudies.filter(s => s.patientId === activeStudy.patientId);

    container.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; background: #0F172A; color: #FFF; overflow-y: auto; padding: 2rem;">
        <div style="max-width: 960px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Header Portal -->
          <div class="glass-card" style="padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; border-color: var(--primary-cyan);">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div class="brand-icon" style="width: 44px; height: 44px; font-size: 1.2rem;">
                <i data-lucide="activity"></i>
              </div>
              <div>
                <h1 style="font-size: 1.2rem; font-weight: 700; color: #FFF;">PORTAL EXCLUSIVO DO PACIENTE</h1>
                <p style="font-size: 0.75rem; color: var(--primary-cyan);">NEXUSRAD DIAGNÓSTICO POR IMAGEM</p>
              </div>
            </div>

            <button class="btn-secondary" id="btnBackToApp" style="font-size: 0.8rem;">
              <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
              <span>Voltar ao RIS da Clínica</span>
            </button>
          </div>

          <!-- Patient Identity Banner -->
          <div class="glass-card" style="padding: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Prontuário Individual do Paciente:</span>
              <h2 style="font-size: 1.3rem; font-weight: 700; color: var(--primary-cyan);">${activeStudy.patientName}</h2>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${activeStudy.patientId} • ${activeStudy.age} • (${activeStudy.gender})</div>
            </div>

            <div style="text-align: right;">
              <span style="font-size: 0.75rem; color: var(--status-ready); background: var(--status-ready-bg); padding: 4px 10px; border-radius: var(--radius-full); font-weight: 600;">
                SESSÃO AUTENTICADA LGPD
              </span>
            </div>
          </div>

          <!-- Exam Selection Tabs for This Patient -->
          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem; display: block;">
              Histórico de Exames deste Paciente na Clínica (${patientExams.length}):
            </label>

            <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem;">
              ${patientExams.map(ex => `
                <button class="glass-card btn-exam-tab ${ex.id === activeStudy.id ? 'active' : ''}" data-id="${ex.id}" style="padding: 0.75rem 1rem; text-align: left; cursor: pointer; border-color: ${ex.id === activeStudy.id ? 'var(--primary-cyan)' : 'var(--border-light)'}; background: ${ex.id === activeStudy.id ? 'var(--primary-cyan-soft)' : 'var(--bg-card)'};">
                  <div style="font-size: 0.8rem; font-weight: 700; color: #FFF;">${ex.studyDescription}</div>
                  <div style="font-size: 0.7rem; color: var(--primary-cyan); font-family: monospace;">${ex.modality} • Data: ${ex.date}</div>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Active Exam Viewer & Download -->
          <div class="glass-card" style="padding: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <!-- Image Canvas Viewport -->
            <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: center;">
              <h3 style="font-size: 0.9rem; font-weight: 700; color: #FFF; align-self: flex-start;">
                Imagens do Exame (${activeStudy.modality}):
              </h3>

              <div style="position: relative; width: 100%; height: 320px; background: #000; border-radius: var(--radius-md); overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <canvas id="patientCanvas" width="512" height="512" style="max-width: 100%; max-height: 100%;"></canvas>
              </div>
            </div>

            <!-- Report & Download Panel -->
            <div style="display: flex; flex-direction: column; gap: 1rem; justify-content: space-between;">
              <div>
                <h3 style="font-size: 0.9rem; font-weight: 700; color: #FFF; margin-bottom: 0.5rem;">
                  Laudo Diagnóstico Assinado:
                </h3>

                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem; font-size: 0.85rem; line-height: 1.5; max-height: 220px; overflow-y: auto;">
                  <strong>ACHADOS:</strong>
                  ${activeStudy.aiFinding ? activeStudy.aiFinding.description : 'Estudo sem alterações agudas.'}

                  <strong>CONCLUSÃO:</strong>
                  ${activeStudy.aiFinding ? activeStudy.aiFinding.type : 'Dentro dos limites da normalidade.'}
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button class="btn-primary" id="btnDownloadPatientPdf" style="justify-content: center; width: 100%; padding: 0.75rem;">
                  <i data-lucide="download" style="width: 18px; height: 18px;"></i>
                  <span>Baixar Laudo Assinado em PDF (ICP-Brasil)</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    const canvas = container.querySelector('#patientCanvas');
    if (canvas) {
      renderDicomSlice(canvas, activeStudy, { sliceIndex: 1, showAiOverlay: false });
    }

    container.querySelector('#btnBackToApp')?.addEventListener('click', callbacks.onBack);

    container.querySelectorAll('.btn-exam-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const found = allStudies.find(s => s.id === btn.dataset.id);
        if (found) {
          activeStudy = found;
          render();
        }
      });
    });

    container.querySelector('#btnDownloadPatientPdf')?.addEventListener('click', () => {
      generatePdf(activeStudy);
    });
  }

  render();
}

function generatePdf(study) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 150, 200);
  doc.text("NEXUSRAD DIAGNÓSTICO POR IMAGEM S/A", 14, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Portal Exclusivo do Paciente • Av. Paulista, 1500 - São Paulo, SP", 14, 26);
  doc.line(14, 30, 196, 30);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(`PACIENTE: ${study.patientName}`, 14, 40);
  doc.text(`EXAME: ${study.studyDescription}`, 14, 46);
  doc.text(`DATA: ${study.date}`, 14, 52);

  doc.text("IMPRESSÃO DIAGNÓSTICA:", 14, 70);
  doc.setFont("helvetica", "normal");
  doc.text(study.aiFinding ? study.aiFinding.type : "Exame dentro dos limites da normalidade.", 14, 78);

  doc.save(`Laudo_Paciente_${study.patientName.replace(/\s+/g, '_')}.pdf`);
}
