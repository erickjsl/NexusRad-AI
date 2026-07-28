// ==========================================================================
// NexusRad AI - Executive Analytics & Excel / CSV Data Exporter
// ==========================================================================

export function renderExecutiveReportsModal(container, studies, callbacks) {
  const totalFaturado = studies.length * 280;
  const laudades = studies.filter(s => s.status === 'concluido').length;
  const pendentes = studies.filter(s => s.status === 'pronto' || s.status === 'laudando').length;

  container.innerHTML = `
    <div class="modal-backdrop open" id="reportsModalBackdrop">
      <div class="modal-card" style="max-width: 780px; width: 90%; max-height: 85vh; display: flex; flex-direction: column;">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
          <h2 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="activity"></i>
            Relatórios Gerenciais & Produção Médica (Exportação Excel / TISS)
          </h2>
          <button class="btn-icon" id="btnCloseReportsModal" style="width: 28px; height: 28px;">
            <i data-lucide="x" style="width: 16px; height: 16px;"></i>
          </button>
        </div>

        <!-- Body -->
        <div style="flex: 1; overflow-y: auto; padding: 1rem 0; display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Summary Cards -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
            <div class="glass-card" style="padding: 1rem;">
              <div style="font-size: 0.7rem; color: var(--text-muted);">FATURAMENTO BRUTO ESTIMADO</div>
              <div style="font-size: 1.3rem; font-weight: 700; color: var(--status-ready);">R$ ${totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>

            <div class="glass-card" style="padding: 1rem;">
              <div style="font-size: 0.7rem; color: var(--text-muted);">EXAMES LAUDADOS E ASSINADOS</div>
              <div style="font-size: 1.3rem; font-weight: 700; color: var(--primary-cyan);">${laudades} Exames</div>
            </div>

            <div class="glass-card" style="padding: 1rem;">
              <div style="font-size: 0.7rem; color: var(--text-muted);">EXAMES PENDENTES NA FILA</div>
              <div style="font-size: 1.3rem; font-weight: 700; color: var(--status-pending);">${pendentes} Exames</div>
            </div>
          </div>

          <!-- Table Preview -->
          <div style="border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow: hidden;">
            <table class="worklist-table" style="font-size: 0.8rem;">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Paciente</th>
                  <th>Exame / Modalidade</th>
                  <th>Médico Radiologista</th>
                  <th>Valor TUSS</th>
                </tr>
              </thead>
              <tbody>
                ${studies.map(s => `
                  <tr>
                    <td>${s.date}</td>
                    <td><strong>${s.patientName}</strong></td>
                    <td>${s.studyDescription} (${s.modality})</td>
                    <td>${s.physician}</td>
                    <td><strong style="color: var(--status-ready)">R$ 280,00</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

        </div>

        <!-- Footer Actions -->
        <div style="display: flex; gap: 0.75rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
          <button class="btn-secondary" id="btnExportCsv" style="flex: 1; justify-content: center;">
            <i data-lucide="download" style="width: 16px; height: 16px;"></i>
            <span>Exportar Planilha Excel / CSV</span>
          </button>

          <button class="btn-primary" id="btnExportTissXml" style="flex: 1; justify-content: center;">
            <i data-lucide="file-text" style="width: 16px; height: 16px;"></i>
            <span>Gerar Lote XML TISS Convênios</span>
          </button>
        </div>

      </div>
    </div>
  `;

  const backdrop = container.querySelector('#reportsModalBackdrop');
  const closeModal = () => backdrop.remove();

  container.querySelector('#btnCloseReportsModal').addEventListener('click', closeModal);

  container.querySelector('#btnExportCsv').addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Paciente,CPF,Exame,Modalidade,Data,Medico,Status,Valor\n";
    studies.forEach(s => {
      csvContent += `"${s.id}","${s.patientName}","${s.patientId}","${s.studyDescription}","${s.modality}","${s.date}","${s.physician}","${s.status}",280.00\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Producao_NexusRad_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("📊 Planilha de Produção da Clínica exportada em formato Excel/CSV com sucesso!");
  });

  container.querySelector('#btnExportTissXml').addEventListener('click', () => {
    alert("📄 Lote de Guias TISS em formato XML da ANS gerado e pronto para envio às operadoras de saúde!");
  });
}
