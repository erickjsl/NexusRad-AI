// ==========================================================================
// NexusRad AI - Enterprise HIS 360° (Hospital Information System)
// Complete Modules: Triagem Manchester, Mapa de Leitos, Faturamento TISS XML,
// Financeiro (DRE/Contas) & Farmácia Hospitalar
// ==========================================================================

import { createIcons, Activity, Bed, FileSpreadsheet, DollarSign, Package, UserPlus, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Download, Plus, Trash2, Edit, Search, Printer } from 'lucide';
import { showToast } from '../utils/toast.js';
import { saveStudiesToStorage } from '../utils/storage.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export function renderHospitalManager(container, state, callbacks) {
  let activeSubTab = 'manchester'; // 'manchester' | 'beds' | 'tiss' | 'financial' | 'pharmacy'

  // Mock State for HIS
  if (!state.hisData) {
    state.hisData = {
      // Manchester Triage Queue
      triageQueue: [
        { id: "TRI-901", patientName: "MAURÍCIO FERREIRA DE SOUZA", age: "54a", gender: "M", time: "10:14", color: "red", label: "EMERGÊNCIA (Vermelho)", symptoms: "Dor torácica intensa com irradiação para braço esquerdo, sudorese fria", bp: "160/100", hr: "112 bpm", spo2: "92%", status: "Atendimento Imediato" },
        { id: "TRI-902", patientName: "ANA LÚCIA TEIXEIRA", age: "42a", gender: "F", time: "10:22", color: "orange", label: "MUITO URGENTE (Laranja)", symptoms: "Cólica renal intensa refratária a analgésicos, disúria e hematúria", bp: "140/90", hr: "98 bpm", spo2: "98%", status: "Aguardando Médico" },
        { id: "TRI-903", patientName: "ERICK LIMA", age: "38a", gender: "M", time: "10:30", color: "yellow", label: "URGENTE (Amarelo)", symptoms: "Dor em hipocôndrio direito pós-prandial, náuseas", bp: "125/80", hr: "78 bpm", spo2: "99%", status: "Aguardando Exames (US)" },
        { id: "TRI-904", patientName: "CAROLINA MENDES SANCHES", age: "29a", gender: "F", time: "10:45", color: "green", label: "POUCO URGENTE (Verde)", symptoms: "Sintomas gripais leves há 3 dias, febrícula", bp: "120/75", hr: "72 bpm", spo2: "99%", status: "Aguardando Consulta" }
      ],

      // Hospital Bed Map (Census)
      beds: [
        { id: "UTI-01", sector: "UTI ADULTO", bedNumber: "Leito 01", patientName: "MAURÍCIO FERREIRA DE SOUZA", status: "ocupado", doctor: "Dr. Carlos Mendonça", admissionDate: "28/07/2026 10:30" },
        { id: "UTI-02", sector: "UTI ADULTO", bedNumber: "Leito 02", patientName: "ROBERTO ALVES DE OLIVEIRA", status: "ocupado", doctor: "Dr. Marcelo Ramos", admissionDate: "27/07/2026 14:15" },
        { id: "UTI-03", sector: "UTI ADULTO", bedNumber: "Leito 03", patientName: "-", status: "higienizacao", doctor: "-", admissionDate: "-" },
        { id: "UTI-04", sector: "UTI ADULTO", bedNumber: "Leito 04", patientName: "-", status: "vago", doctor: "-", admissionDate: "-" },
        
        { id: "ENF-101", sector: "ENFERMARIA MASCULINA", bedNumber: "Quarto 101-A", patientName: "ANTÔNIO RODRIGUES GOMES", status: "ocupado", doctor: "Dr. Carlos Mendonça", admissionDate: "26/07/2026 09:00" },
        { id: "ENF-102", sector: "ENFERMARIA MASCULINA", bedNumber: "Quarto 101-B", patientName: "GUILHERME CASTRO SANTIAGO", status: "ocupado", doctor: "Dra. Renata Vasconcelos", admissionDate: "27/07/2026 16:45" },
        { id: "ENF-103", sector: "ENFERMARIA MASCULINA", bedNumber: "Quarto 102-A", patientName: "-", status: "vago", doctor: "-", admissionDate: "-" },
        
        { id: "APT-201", sector: "APARTAMENTO VIP", bedNumber: "Apto 201", patientName: "CAMILA FREITAS MENDONÇA", status: "ocupado", doctor: "Dra. Renata Vasconcelos", admissionDate: "28/07/2026 08:30" },
        { id: "APT-202", sector: "APARTAMENTO VIP", bedNumber: "Apto 202", patientName: "-", status: "reservado", doctor: "Dr. Marcelo Ramos", admissionDate: "28/07/2026 14:00" }
      ],

      // Financial Cashflow & TISS Batches
      tissBatches: [
        { id: "LOTE-2026-088", agreement: "Bradesco Saúde S/A", count: 42, totalValue: "R$ 38.450,00", date: "28/07/2026", status: "PRONTO PARA ENVIO (XML TISS 4.01)" },
        { id: "LOTE-2026-089", agreement: "Unimed Nacional", count: 35, totalValue: "R$ 29.800,00", date: "28/07/2026", status: "TRANSMITIDO (AGUARDANDO REPASSE)" },
        { id: "LOTE-2026-090", agreement: "SulAmérica Saúde", count: 28, totalValue: "R$ 32.100,00", date: "27/07/2026", status: "PAGO / CONCILIADO" }
      ],

      financialSummary: {
        incomeMonth: "R$ 485.200,00",
        expensesMonth: "R$ 210.400,00",
        netBalance: "R$ 274.800,00",
        pendingInsurance: "R$ 98.450,00"
      },

      // Pharmacy Inventory
      pharmacy: [
        { id: "MED-001", name: "Contraste Radiológico Iopamida 300mg/ml 100ml", category: "Contraste TC/RX", stock: 145, minStock: 30, unit: "Frasco", expDate: "11/2027", status: "OK" },
        { id: "MED-002", name: "Contraste Gadolínio para Ressonância 15ml", category: "Contraste RM", stock: 82, minStock: 20, unit: "Ampola", expDate: "08/2028", status: "OK" },
        { id: "MED-003", name: "Dipirona Sódica 500mg/ml Injetável", category: "Analgésico", stock: 450, minStock: 100, unit: "Ampola", expDate: "04/2027", status: "OK" },
        { id: "MED-004", name: "Gel Ultrassonográfico Condutor 5Kg", category: "Insumo US", stock: 24, minStock: 10, unit: "Galão", expDate: "12/2026", status: "OK" }
      ]
    };
  }

  function refreshIcons() {
    createIcons({
      icons: { Activity, Bed, FileSpreadsheet, DollarSign, Package, UserPlus, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Download, Plus, Trash2, Edit, Search, Printer }
    });
  }

  function render() {
    container.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; padding: 1.5rem; overflow-y: auto; gap: 1.25rem; background: var(--bg-dark); color: #FFF;">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; color: #FFF;">
              <i data-lucide="activity" style="color: var(--primary-cyan)"></i>
              Módulo de Gestão Hospitalar 360° — HIS (Hospital Information System)
            </h1>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Pronto Atendimento (Triagem Manchester), Mapa de Leitos UTI/Enfermaria, Faturamento TISS XML ANS e Gestão Financeira.
            </p>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-primary" id="btnQuickTriageModal" style="background: linear-gradient(135deg, #EF4444 0%, #F59E0B 100%); border: none; font-weight: 700; padding: 0.55rem 1rem;">
              🚨 + Nova Triagem PS
            </button>
            <button class="btn-primary" id="btnExportTissBatch" style="background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); border: none; font-weight: 700; padding: 0.55rem 1rem;">
              📥 Exportar Lote TISS XML (ANS)
            </button>
          </div>
        </div>

        <!-- HIS Navigation Tabs -->
        <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; flex-wrap: wrap;">
          <button class="btn-secondary nav-his-tab ${activeSubTab === 'manchester' ? 'active' : ''}" data-tab="manchester">
            <i data-lucide="activity" style="width: 15px; height: 15px; color: #EF4444;"></i>
            <span>🚨 1. Triagem de Manchester (${state.hisData.triageQueue.length})</span>
          </button>

          <button class="btn-secondary nav-his-tab ${activeSubTab === 'beds' ? 'active' : ''}" data-tab="beds">
            <i data-lucide="bed" style="width: 15px; height: 15px; color: var(--primary-cyan);"></i>
            <span>🏥 2. Mapa de Leitos & Censo (${state.hisData.beds.filter(b => b.status === 'ocupado').length} Ocupados)</span>
          </button>

          <button class="btn-secondary nav-his-tab ${activeSubTab === 'tiss' ? 'active' : ''}" data-tab="tiss">
            <i data-lucide="file-spreadsheet" style="width: 15px; height: 15px; color: #10B981;"></i>
            <span>💳 3. Faturamento TISS XML ANS</span>
          </button>

          <button class="btn-secondary nav-his-tab ${activeSubTab === 'financial' ? 'active' : ''}" data-tab="financial">
            <i data-lucide="dollar-sign" style="width: 15px; height: 15px; color: #F59E0B;"></i>
            <span>💰 4. Financeiro & Fluxo de Caixa</span>
          </button>

          <button class="btn-secondary nav-his-tab ${activeSubTab === 'pharmacy' ? 'active' : ''}" data-tab="pharmacy">
            <i data-lucide="package" style="width: 15px; height: 15px; color: #A855F7;"></i>
            <span>💊 5. Farmácia & Suprimentos</span>
          </button>
        </div>

        <!-- Sub Tab Content -->
        <div id="hisSubTabContainer">
          ${renderSubTabContent()}
        </div>

      </div>
    `;

    // Attach Sub Tab Handlers
    container.querySelectorAll('.nav-his-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSubTab = btn.dataset.tab;
        render();
      });
    });

    attachHisEvents();
    refreshIcons();
  }

  function renderSubTabContent() {
    if (activeSubTab === 'manchester') {
      return `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1rem; font-weight: 700; color: #EF4444; display: flex; align-items: center; gap: 0.4rem;">
              🚨 Fila de Triagem de Manchester — Pronto Atendimento (Pronto Socorro)
            </h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Protocolo Internacional de Classificação de Risco em Saúde</span>
          </div>

          <div class="table-wrapper">
            <table class="worklist-table">
              <thead>
                <tr>
                  <th>Classificação de Risco</th>
                  <th>Senha / Paciente</th>
                  <th>Idade/Sexo</th>
                  <th>Sinais Vitais (PA / FC / SpO2)</th>
                  <th>Queixa Principal & Sintomas</th>
                  <th>Situação Atual</th>
                  <th>Ação Directa</th>
                </tr>
              </thead>
              <tbody>
                ${state.hisData.triageQueue.map((item, idx) => `
                  <tr>
                    <td>
                      <span style="display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 800; font-size: 0.75rem; padding: 4px 10px; border-radius: 6px; background: ${getColorBg(item.color)}; color: ${getColorText(item.color)}; border: 1px solid ${getColorText(item.color)};">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: ${getColorText(item.color)};"></span>
                        ${item.label}
                      </span>
                    </td>
                    <td>
                      <strong>${item.patientName}</strong><br>
                      <span style="font-size: 0.7rem; color: var(--primary-cyan); font-family: monospace;">${item.id} (${item.time})</span>
                    </td>
                    <td>${item.age} / ${item.gender}</td>
                    <td><span style="font-family: monospace; font-size: 0.75rem;">PA: ${item.bp} | FC: ${item.hr} | SpO2: ${item.spo2}</span></td>
                    <td><div style="max-width: 250px; font-size: 0.75rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.symptoms}</div></td>
                    <td><span class="badge-status concluido">${item.status}</span></td>
                    <td>
                      <button class="btn-primary btn-call-consult" data-index="${idx}" style="font-size: 0.72rem; padding: 4px 8px; background: var(--primary-cyan); color: #000; font-weight: 700; border: none;">
                        👨‍⚕️ Chamar Médico
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeSubTab === 'beds') {
      return `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.4rem;">
              🏥 Censo Hospitalar & Mapa Geral de Leitos em Tempo Real
            </h3>
            <button class="btn-primary" id="btnAdmitPatientBed" style="font-size: 0.8rem; background: var(--status-ready); border-color: var(--status-ready); font-weight: 700;">
              + Nova Internação Hospitalar
            </button>
          </div>

          <!-- Bed Cards Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem;">
            ${state.hisData.beds.map((b, idx) => `
              <div style="background: #0B0F17; border: 1px solid ${b.status === 'ocupado' ? '#EF4444' : b.status === 'vago' ? '#10B981' : '#F59E0B'}; border-radius: 8px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.35rem;">
                  <span style="font-size: 0.7rem; font-weight: 700; color: var(--primary-cyan);">${b.sector}</span>
                  <span style="font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${b.status === 'ocupado' ? 'rgba(239,68,68,0.2)' : b.status === 'vago' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}; color: ${b.status === 'ocupado' ? '#EF4444' : b.status === 'vago' ? '#10B981' : '#F59E0B'}; text-transform: uppercase;">
                    ${b.status}
                  </span>
                </div>

                <div style="font-size: 0.95rem; font-weight: 800; color: #FFF;">${b.bedNumber}</div>

                <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 2px;">
                  <div><strong>Paciente:</strong> ${b.patientName}</div>
                  <div><strong>Médico:</strong> ${b.doctor}</div>
                  <div style="font-size: 0.68rem; font-family: monospace;">Entrada: ${b.admissionDate}</div>
                </div>

                ${b.status === 'ocupado' ? `
                  <button class="btn-secondary btn-discharge-bed" data-index="${idx}" style="font-size: 0.7rem; padding: 3px; border-color: #10B981; color: #10B981; font-weight: 700; margin-top: 4px;">
                    🟢 Dar Alta Hospitalar
                  </button>
                ` : b.status === 'vago' ? `
                  <button class="btn-secondary btn-occupy-bed" data-index="${idx}" style="font-size: 0.7rem; padding: 3px; border-color: var(--primary-cyan); color: var(--primary-cyan); font-weight: 700; margin-top: 4px;">
                    📥 Internar neste Leito
                  </button>
                ` : `
                  <button class="btn-secondary btn-clean-bed" data-index="${idx}" style="font-size: 0.7rem; padding: 3px; border-color: #F59E0B; color: #F59E0B; font-weight: 700; margin-top: 4px;">
                    🧹 Liberar Higienização
                  </button>
                `}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (activeSubTab === 'tiss') {
      return `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1rem; font-weight: 700; color: #10B981; display: flex; align-items: center; gap: 0.4rem;">
              💳 Central de Faturamento TISS XML — Padrão Regulatório ANS
            </h3>
            <button class="btn-primary" id="btnGenerateTissBatch" style="font-size: 0.8rem; background: #10B981; border: none; font-weight: 700;">
              ⚡ Gerar Novo Lote XML TISS 4.01
            </button>
          </div>

          <div class="table-wrapper">
            <table class="worklist-table">
              <thead>
                <tr>
                  <th>Código do Lote TISS</th>
                  <th>Convênio Destino</th>
                  <th>Qtd. Guias / Exames</th>
                  <th>Valor Total do Lote</th>
                  <th>Data de Fechamento</th>
                  <th>Status do Lote TISS</th>
                  <th>Ação de Exportação</th>
                </tr>
              </thead>
              <tbody>
                ${state.hisData.tissBatches.map((batch, idx) => `
                  <tr>
                    <td><strong style="font-family: monospace; color: var(--primary-cyan);">${batch.id}</strong></td>
                    <td><strong>${batch.agreement}</strong></td>
                    <td>${batch.count} guias SADT</td>
                    <td><strong style="color: #10B981;">${batch.totalValue}</strong></td>
                    <td>${batch.date}</td>
                    <td><span class="badge-status concluido">${batch.status}</span></td>
                    <td>
                      <button class="btn-secondary btn-download-tiss-xml" data-index="${idx}" style="font-size: 0.72rem; padding: 4px 8px; border-color: var(--primary-cyan); color: var(--primary-cyan); font-weight: 700;">
                        📥 Baixar XML TISS (ANS)
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeSubTab === 'financial') {
      const fin = state.hisData.financialSummary;
      return `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <h3 style="font-size: 1rem; font-weight: 700; color: #F59E0B; display: flex; align-items: center; gap: 0.4rem;">
            💰 Gestão Financeira Hospitalar, DRE & Fluxo de Caixa
          </h3>

          <!-- Financial Indicator Cards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div style="background: rgba(16,185,129,0.1); border: 1px solid #10B981; padding: 1rem; border-radius: 8px; display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 0.75rem; color: #10B981; font-weight: 700;">Faturamento Bruto (Mês):</span>
              <span style="font-size: 1.4rem; font-weight: 800; color: #FFF;">${fin.incomeMonth}</span>
            </div>

            <div style="background: rgba(239,68,68,0.1); border: 1px solid #EF4444; padding: 1rem; border-radius: 8px; display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 0.75rem; color: #EF4444; font-weight: 700;">Custos Operacionais:</span>
              <span style="font-size: 1.4rem; font-weight: 800; color: #FFF;">${fin.expensesMonth}</span>
            </div>

            <div style="background: rgba(0,229,255,0.1); border: 1px solid var(--primary-cyan); padding: 1rem; border-radius: 8px; display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 0.75rem; color: var(--primary-cyan); font-weight: 700;">Resultado Líquido (EBITDA):</span>
              <span style="font-size: 1.4rem; font-weight: 800; color: #FFF;">${fin.netBalance}</span>
            </div>

            <div style="background: rgba(245,158,11,0.1); border: 1px solid #F59E0B; padding: 1rem; border-radius: 8px; display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 0.75rem; color: #F59E0B; font-weight: 700;">A Receber de Convênios:</span>
              <span style="font-size: 1.4rem; font-weight: 800; color: #FFF;">${fin.pendingInsurance}</span>
            </div>
          </div>
        </div>
      `;
    } else if (activeSubTab === 'pharmacy') {
      return `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1rem; font-weight: 700; color: #A855F7; display: flex; align-items: center; gap: 0.4rem;">
              💊 Farmácia Hospitalar, Controle de Medicamentos & Contrastes
            </h3>
            <button class="btn-primary" id="btnAddPharmacyItem" style="font-size: 0.8rem; background: #A855F7; border: none; font-weight: 700;">
              + Dar Entrada de Insumo / Medicamento
            </button>
          </div>

          <div class="table-wrapper">
            <table class="worklist-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Medicamento / Insumo Hospitalar</th>
                  <th>Categoria</th>
                  <th>Estoque Atual</th>
                  <th>Estoque Mínimo</th>
                  <th>Validade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${state.hisData.pharmacy.map(item => `
                  <tr>
                    <td><span style="font-family: monospace; color: var(--primary-cyan); font-weight: 700;">${item.id}</span></td>
                    <td><strong>${item.name}</strong></td>
                    <td><span class="badge-status concluido">${item.category}</span></td>
                    <td><strong style="color: #FFF; font-size: 0.9rem;">${item.stock} ${item.unit}s</strong></td>
                    <td>${item.minStock} ${item.unit}s</td>
                    <td><span style="font-family: monospace; color: #F59E0B;">${item.expDate}</span></td>
                    <td><span class="badge-status concluido">🟢 EM ESTOQUE</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  function attachHisEvents() {
    // Triage Action
    container.querySelectorAll('.btn-call-consult').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const item = state.hisData.triageQueue[idx];
        showToast(`📢 Paciente ${item.patientName} chamado no Painel da Recepção!`, 'success');
        logAuditEvent('PATIENT_CALLED_TRIAGE', `Paciente ${item.patientName} chamado na Triagem Manchester.`);
      });
    });

    // Discharge Bed Action
    container.querySelectorAll('.btn-discharge-bed').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const bed = state.hisData.beds[idx];
        bed.status = 'higienizacao';
        bed.patientName = '-';
        bed.doctor = '-';
        render();
        showToast(`🟢 Alta concedida no leito ${bed.bedNumber}. Leito enviado para higienização!`, 'success');
      });
    });

    // Occupy Bed Action
    container.querySelectorAll('.btn-occupy-bed').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const bed = state.hisData.beds[idx];
        const pName = prompt("Informe o nome do paciente a ser internado:", "ERICK LIMA");
        if (pName) {
          bed.status = 'ocupado';
          bed.patientName = pName.toUpperCase();
          bed.doctor = "Dr. Carlos Mendonça";
          bed.admissionDate = new Date().toLocaleString();
          render();
          showToast(`📥 Paciente ${pName.toUpperCase()} internado com sucesso no leito ${bed.bedNumber}!`, 'success');
        }
      });
    });

    // Clean Bed Action
    container.querySelectorAll('.btn-clean-bed').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const bed = state.hisData.beds[idx];
        bed.status = 'vago';
        render();
        showToast(`🧹 Leito ${bed.bedNumber} higienizado e liberado para novo paciente!`, 'success');
      });
    });

    // Download TISS XML
    container.querySelectorAll('.btn-download-tiss-xml').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const batch = state.hisData.tissBatches[idx];
        const xmlContent = `<?xml version="1.0" encoding="ISO-8859-1"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas">
  <ans:cabecalho>
    <ans:identificacaoTransacao>
      <ans:tipoTransacao>ENVIO_LOTE_GUIAS</ans:tipoTransacao>
      <ans:sequencialTransacao>${batch.id.replace('LOTE-', '')}</ans:sequencialTransacao>
      <ans:dataRegistroTransacao>${new Date().toISOString().slice(0, 10)}</ans:dataRegistroTransacao>
    </ans:identificacaoTransacao>
    <ans:origem><ans:codigoPrestadorNaOperadora>NEXUS_RAD_01</ans:codigoPrestadorNaOperadora></ans:origem>
    <ans:destino><ans:registroANS>409011</ans:registroANS></ans:destino>
    <ans:Padrao>4.01.00</ans:Padrao>
  </ans:cabecalho>
  <ans:prestadorParaOperadora>
    <ans:loteGuias>
      <ans:numeroLote>${batch.id}</ans:numeroLote>
      <ans:convenio>${batch.agreement}</ans:convenio>
      <ans:valorTotalLote>${batch.totalValue}</ans:valorTotalLote>
    </ans:loteGuias>
  </ans:prestadorParaOperadora>
</ans:mensagemTISS>`;

        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TISS_ANS_${batch.id}_${batch.agreement.replace(/\s+/g, '_')}.xml`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`📥 Lote XML TISS 4.01 (${batch.id}) gerado e baixado com sucesso!`, 'success');
        logAuditEvent('TISS_XML_EXPORTED', `Exportação de lote TISS XML ANS ${batch.id} para o convênio ${batch.agreement}`);
      });
    });

    container.querySelector('#btnQuickTriageModal')?.addEventListener('click', () => {
      const name = prompt("Informe o nome do paciente para Triagem de Manchester:", "NOVO PACIENTE PS");
      if (name) {
        state.hisData.triageQueue.unshift({
          id: `TRI-${Math.floor(100 + Math.random() * 900)}`,
          patientName: name.toUpperCase(),
          age: "40a",
          gender: "M",
          time: new Date().toLocaleTimeString().slice(0, 5),
          color: "yellow",
          label: "URGENTE (Amarelo)",
          symptoms: "Dor forte em observação médica",
          bp: "130/85",
          hr: "84 bpm",
          spo2: "98%",
          status: "Aguardando Consulta"
        });
        render();
        showToast(`🚨 Triagem de Manchester criada com sucesso para ${name.toUpperCase()}!`, 'success');
      }
    });

    container.querySelector('#btnExportTissBatch')?.addEventListener('click', () => {
      showToast("⚡ Lote TISS XML 4.01 de todos os convênios gerado com sucesso para a ANS!", 'success');
    });
  }

  function getColorBg(color) {
    if (color === 'red') return 'rgba(239,68,68,0.2)';
    if (color === 'orange') return 'rgba(245,158,11,0.2)';
    if (color === 'yellow') return 'rgba(234,179,8,0.2)';
    if (color === 'green') return 'rgba(16,185,129,0.2)';
    return 'rgba(59,130,246,0.2)';
  }

  function getColorText(color) {
    if (color === 'red') return '#EF4444';
    if (color === 'orange') return '#F59E0B';
    if (color === 'yellow') return '#EAB308';
    if (color === 'green') return '#10B981';
    return '#3B82F6';
  }

  render();
}
