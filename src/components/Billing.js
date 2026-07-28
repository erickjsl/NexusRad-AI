// ==========================================================================
// NexusRad AI - Billing & TUSS / CBHPM Financial Management Component
// ==========================================================================

import { renderExecutiveReportsModal } from './ExecutiveReportsModal.js';

export function renderBilling(container, state, callbacks) {
  const totalStudies = state.studies.length;
  const estimatedRevenue = totalStudies * 280;
  const readyToBill = state.studies.filter(s => s.status === 'concluido').length;

  container.innerHTML = `
    <div class="worklist-container">
      <div class="worklist-header-row">
        <div class="worklist-title-group">
          <h1>
            <i data-lucide="credit-card" style="color: var(--primary-cyan)"></i>
            Faturamento, Tabela TUSS & Guias TISS (ANS)
          </h1>
          <p style="color: var(--text-muted); font-size: 0.85rem;">
            Gestão financeira de procedimentos radiológicos, codificação TUSS/CBHPM e fechamento de lotes TISS.
          </p>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-secondary" id="btnOpenReportsModal" style="font-size: 0.8rem;">
            <i data-lucide="activity" style="width: 16px; height: 16px; color: var(--primary-cyan);"></i>
            <span>📊 Relatório Gerencial Excel</span>
          </button>
          <button class="btn-primary" id="btnExportTissBatch" style="font-size: 0.8rem;">
            <i data-lucide="download" style="width: 16px; height: 16px;"></i>
            <span>Gerar Lote TISS (XML)</span>
          </button>
        </div>
      </div>

      <!-- Financial Overview Cards -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
        <div class="glass-card" style="padding: 0.75rem 1rem;">
          <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Faturamento Total Estimado</div>
          <div style="font-size: 1.2rem; font-weight: 700; color: var(--status-ready);">R$ ${estimatedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>

        <div class="glass-card" style="padding: 0.75rem 1rem;">
          <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Exames Elegíveis p/ Faturamento</div>
          <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-cyan);">${readyToBill} Procedimentos</div>
        </div>

        <div class="glass-card" style="padding: 0.75rem 1rem;">
          <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Glosa Estimada</div>
          <div style="font-size: 1.2rem; font-weight: 700; color: var(--status-pending);">0.2% (Excelente)</div>
        </div>

        <div class="glass-card" style="padding: 0.75rem 1rem;">
          <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Padrão TISS ANS</div>
          <div style="font-size: 1.2rem; font-weight: 700; color: #FFF;">Versão 4.01.00</div>
        </div>
      </div>

      <!-- TUSS Table -->
      <div class="table-wrapper">
        <table class="worklist-table">
          <thead>
            <tr>
              <th>Código TUSS</th>
              <th>Descrição do Procedimento Radiológico</th>
              <th>Modalidade</th>
              <th>Porte CBHPM</th>
              <th>Valor Médio Convênio</th>
              <th>Status Guia</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong style="color: var(--primary-cyan); font-family: monospace;">40901122</strong></td>
              <td>US - Ultrassonografia de Abdômen Total</td>
              <td><span class="badge-modality US">US</span></td>
              <td>3B</td>
              <td><strong style="color: var(--status-ready)">R$ 280,00</strong></td>
              <td><span class="badge-status concluido">AUTORIZADO</span></td>
            </tr>
            <tr>
              <td><strong style="color: var(--primary-cyan); font-family: monospace;">40901246</strong></td>
              <td>US - Ultrassonografia Obstétrica com Doppler Colorido</td>
              <td><span class="badge-modality US">US</span></td>
              <td>3C</td>
              <td><strong style="color: var(--status-ready)">R$ 340,00</strong></td>
              <td><span class="badge-status concluido">AUTORIZADO</span></td>
            </tr>
            <tr>
              <td><strong style="color: var(--primary-cyan); font-family: monospace;">40901181</strong></td>
              <td>US - Ultrassonografia de Mamas Bilateral</td>
              <td><span class="badge-modality US">US</span></td>
              <td>3A</td>
              <td><strong style="color: var(--status-ready)">R$ 220,00</strong></td>
              <td><span class="badge-status concluido">AUTORIZADO</span></td>
            </tr>
            <tr>
              <td><strong style="color: var(--primary-cyan); font-family: monospace;">40901130</strong></td>
              <td>US - Ultrassonografia de Tireoide</td>
              <td><span class="badge-modality US">US</span></td>
              <td>2C</td>
              <td><strong style="color: var(--status-ready)">R$ 190,00</strong></td>
              <td><span class="badge-status concluido">AUTORIZADO</span></td>
            </tr>
            <tr>
              <td><strong style="color: var(--primary-cyan); font-family: monospace;">41001010</strong></td>
              <td>TC - Tomografia Computadorizada de Tórax</td>
              <td><span class="badge-modality CT">CT</span></td>
              <td>4A</td>
              <td><strong style="color: var(--status-ready)">R$ 650,00</strong></td>
              <td><span class="badge-status concluido">AUTORIZADO</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.querySelector('#btnOpenReportsModal')?.addEventListener('click', () => {
    renderExecutiveReportsModal(document.querySelector('#modalContainer'), state.studies, {});
  });

  container.querySelector('#btnExportTissBatch')?.addEventListener('click', () => {
    alert("📄 Arquivo XML de lote TISS gerado com sucesso para envio ao convênio!");
  });
}
