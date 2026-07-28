// ==========================================================================
// NexusRad AI - Executive Clinical Dashboard & Radiological KPIs
// ==========================================================================

export function renderDashboard(container, state, callbacks) {
  const totalStudies = state.studies.length;
  const readyStudies = state.studies.filter(s => s.status === 'pronto').length;
  const signedStudies = state.studies.filter(s => s.status === 'concluido').length;
  const urgentStudies = state.studies.filter(s => s.urgency === 'alta').length;

  const modalityCounts = {
    US: state.studies.filter(s => s.modality === 'US').length,
    CT: state.studies.filter(s => s.modality === 'CT').length,
    DX: state.studies.filter(s => s.modality === 'DX').length,
    MR: state.studies.filter(s => s.modality === 'MR').length,
    MG: state.studies.filter(s => s.modality === 'MG').length,
  };

  container.innerHTML = `
    <div style="flex: 1; display: flex; flex-direction: column; padding: 1.5rem; overflow-y: auto; gap: 1.25rem; background: var(--bg-dark);">
      
      <!-- Top Title -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1 style="font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; color: #FFF;">
            <i data-lucide="layout-dashboard" style="color: var(--primary-cyan)"></i>
            Painel Dashboard Executivo & KPIs Radiológicos
          </h1>
          <p style="color: var(--text-muted); font-size: 0.85rem;">
            Indicadores de produção médica, tempo médio de laudo (TAT), volume por modalidade e taxa de ocupação.
          </p>
        </div>

        <button class="btn-secondary" id="btnRefreshDashboard" style="font-size: 0.8rem;">
          <i data-lucide="rotate-cw" style="width: 14px; height: 14px;"></i>
          <span>Atualizar Indicadores</span>
        </button>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; border-left: 4px solid var(--primary-cyan);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Volume Total de Exames</div>
          <div style="font-size: 1.75rem; font-weight: 700; color: #FFF;">${totalStudies} Exames</div>
          <div style="font-size: 0.75rem; color: var(--status-ready);">↑ 14% em relação ao mês anterior</div>
        </div>

        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; border-left: 4px solid var(--status-pending);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Fila Aguardando Laudo</div>
          <div style="font-size: 1.75rem; font-weight: 700; color: var(--status-pending);">${readyStudies} Pendentes</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${urgentStudies} casos urgentes (STAT)</div>
        </div>

        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; border-left: 4px solid var(--status-ready);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Tempo Médio de Laudo (TAT)</div>
          <div style="font-size: 1.75rem; font-weight: 700; color: var(--status-ready);">24 min</div>
          <div style="font-size: 0.75rem; color: var(--status-ready);">Meta da clínica: &lt; 45 min OK</div>
        </div>

        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; border-left: 4px solid var(--accent-purple);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Faturamento Estimado Mês</div>
          <div style="font-size: 1.75rem; font-weight: 700; color: #FFF;">R$ 148.500,00</div>
          <div style="font-size: 0.75rem; color: var(--primary-cyan);">Conveniada TUSS / Particular</div>
        </div>
      </div>

      <!-- Charts & Detailed Analytics Section -->
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.25rem;">
        
        <!-- Left: Modality Distribution Progress Bars -->
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.4rem;">
            <i data-lucide="bar-chart-2" style="width: 18px; height: 18px;"></i>
            Distribuição de Produção por Modalidade
          </h3>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                <span>🟢 Ultrassonografia (US)</span>
                <strong>${modalityCounts.US} exames (${totalStudies ? Math.round((modalityCounts.US/totalStudies)*100) : 0}%)</strong>
              </div>
              <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                <div style="width: ${totalStudies ? (modalityCounts.US/totalStudies)*100 : 0}%; height: 100%; background: #34D399;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                <span>🔵 Tomografia Computadorizada (TC)</span>
                <strong>${modalityCounts.CT} exames (${totalStudies ? Math.round((modalityCounts.CT/totalStudies)*100) : 0}%)</strong>
              </div>
              <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                <div style="width: ${totalStudies ? (modalityCounts.CT/totalStudies)*100 : 0}%; height: 100%; background: #00E5FF;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                <span>🟣 Ressonância Magnética (RM)</span>
                <strong>${modalityCounts.MR} exames (${totalStudies ? Math.round((modalityCounts.MR/totalStudies)*100) : 0}%)</strong>
              </div>
              <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                <div style="width: ${totalStudies ? (modalityCounts.MR/totalStudies)*100 : 0}%; height: 100%; background: #A78BFA;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                <span>🔷 Radiografia Digital (RX)</span>
                <strong>${modalityCounts.DX} exames (${totalStudies ? Math.round((modalityCounts.DX/totalStudies)*100) : 0}%)</strong>
              </div>
              <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                <div style="width: ${totalStudies ? (modalityCounts.DX/totalStudies)*100 : 0}%; height: 100%; background: #38BDF8;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                <span>🌸 Mamografia Digital (MG)</span>
                <strong>${modalityCounts.MG} exames (${totalStudies ? Math.round((modalityCounts.MG/totalStudies)*100) : 0}%)</strong>
              </div>
              <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                <div style="width: ${totalStudies ? (modalityCounts.MG/totalStudies)*100 : 0}%; height: 100%; background: #F472B6;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Room Occupancy & Radiologist Performance -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          
          <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.4rem;">
              <i data-lucide="building" style="width: 16px; height: 16px;"></i>
              Taxa de Ocupação das Salas de Exame
            </h3>

            <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8rem;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
                <span>Sala 1 (Ultrassonografia 4D):</span>
                <span style="color: var(--status-ready); font-weight: 700;">85% (Alta Procura)</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
                <span>Sala 2 (Tomografia Multislice):</span>
                <span style="color: var(--status-ready); font-weight: 700;">92% (Fila Cheia)</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
                <span>Sala 3 (Raio-X Digital):</span>
                <span style="color: var(--primary-cyan); font-weight: 700;">64% (Disponível)</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Sala 4 (Ressonância 1.5T):</span>
                <span style="color: var(--status-ready); font-weight: 700;">88% (Alta Procura)</span>
              </div>
            </div>
          </div>

          <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.4rem;">
              <i data-lucide="user-check" style="width: 16px; height: 16px;"></i>
              Laudadores em Atividade
            </h3>

            <div style="font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.4rem;">
              <div style="display: flex; justify-content: space-between;">
                <span>Dr. Carlos Roberto (CRM/SP 142.890):</span>
                <strong style="color: var(--primary-cyan);">42 laudos hoje</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Dra. Renata Vasconcelos (CRM/SP 198.441):</span>
                <strong style="color: var(--primary-cyan);">35 laudos hoje</strong>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  `;

  container.querySelector('#btnRefreshDashboard')?.addEventListener('click', () => {
    alert("🔄 Indicadores e KPIs da clínica atualizados em tempo real!");
  });
}
