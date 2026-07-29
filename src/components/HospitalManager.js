// ==========================================================================
// NexusRad AI - Enterprise HIS 360° (Hospital Information System)
// Complete 8 Modules: Manchester Triage, Bed Map (Census), Surgical Suite,
// LIS Laboratory, TISS XML Billing, Financial DRE, Pharmacy & PEP Inpatient
// ==========================================================================

import { createIcons, Activity, Bed, FileSpreadsheet, DollarSign, Package, UserPlus, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Download, Plus, Trash2, Edit, Search, Printer, Volume2, Syringe, TestTube, Stethoscope, ClipboardList, Clock, Layers } from 'lucide';
import { showToast } from '../utils/toast.js';
import { saveStudiesToStorage } from '../utils/storage.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { speakPatientCallWithChime, speakText, playHospitalChime } from '../utils/speechVoice.js';

export function renderHospitalManager(container, state, callbacks) {
  let activeSubTab = 'manchester'; // 'manchester' | 'beds' | 'surgery' | 'lab' | 'tiss' | 'financial' | 'pharmacy' | 'pep'

  // Initialize HIS State
  if (!state.hisData) {
    state.hisData = {
      // 1. Manchester Triage Queue
      triageQueue: [
        { id: "TRI-901", patientName: "MAURÍCIO FERREIRA DE SOUZA", age: "54a", gender: "M", time: "10:14", color: "red", label: "EMERGÊNCIA (Vermelho)", symptoms: "Dor torácica intensa com irradiação para braço esquerdo, sudorese fria", bp: "160/100", hr: "112 bpm", spo2: "92%", status: "Atendimento Imediato" },
        { id: "TRI-902", patientName: "ANA LÚCIA TEIXEIRA", age: "42a", gender: "F", time: "10:22", color: "orange", label: "MUITO URGENTE (Laranja)", symptoms: "Cólica renal intensa refratária a analgésicos, disúria e hematúria", bp: "140/90", hr: "98 bpm", spo2: "98%", status: "Aguardando Médico" },
        { id: "TRI-903", patientName: "ERICK LIMA", age: "38a", gender: "M", time: "10:30", color: "yellow", label: "URGENTE (Amarelo)", symptoms: "Dor em hipocôndrio direito pós-prandial, náuseas", bp: "125/80", hr: "78 bpm", spo2: "99%", status: "Aguardando Exames (US)" },
        { id: "TRI-904", patientName: "CAROLINA MENDES SANCHES", age: "29a", gender: "F", time: "10:45", color: "green", label: "POUCO URGENTE (Verde)", symptoms: "Sintomas gripais leves há 3 dias, febrícula", bp: "120/75", hr: "72 bpm", spo2: "99%", status: "Aguardando Consulta" }
      ],

      // 2. Hospital Bed Map (Census)
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

      // 3. Surgical Suite (Bloco Operatório)
      surgeries: [
        { id: "CIR-301", room: "Sala Cirúrgica 01", patientName: "MAURÍCIO FERREIRA DE SOUZA", procedure: "Angioplastia Coronária com Stent", surgeon: "Dr. Roberto Mendonça", anesthetist: "Dr. Fernando Paes", time: "11:30", status: "EM ANDAMENTO" },
        { id: "CIR-302", room: "Sala Cirúrgica 02", patientName: "ANA LÚCIA TEIXEIRA", procedure: "Ureterolitolapaxia a Laser", surgeon: "Dr. Carlos Mendonça", anesthetist: "Dra. Juliana Rocha", time: "14:00", status: "AGENDADA" },
        { id: "CIR-303", room: "Sala Cirúrgica 03", patientName: "ERICK LIMA", procedure: "Colecistectomia Videolaparoscópica", surgeon: "Dra. Renata Vasconcelos", anesthetist: "Dr. Fernando Paes", time: "16:15", status: "AGENDADA" }
      ],

      // 4. LIS Laboratory Samples
      labExams: [
        { id: "LAB-8801", sampleId: "AMO-9012", patientName: "MAURÍCIO FERREIRA DE SOUZA", examName: "Troponina I + CK-MB + Gasometria Arterial", urgency: "ALTISSIMA", status: "LIBERADO", result: "Troponina I: 4.8 ng/mL (ELEVADA - IAM)" },
        { id: "LAB-8802", sampleId: "AMO-9013", patientName: "ERICK LIMA", examName: "Hemograma Completo + PCR + TGO/TGP + Bilirrubinas", urgency: "ALTA", status: "EM ANÁLISE", result: "Leucócitos: 12.400 / mm³ (Leucocitose discreta)" },
        { id: "LAB-8803", sampleId: "AMO-9014", patientName: "ANA LÚCIA TEIXEIRA", examName: "EAS (Urina I) + Urocultura com Antibiograma", urgency: "MÉDIA", status: "COLETADO", result: "Aguardando leitura de lâmina" }
      ],

      // 5. Financial Cashflow & TISS Batches
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

      // 6. Pharmacy Inventory
      pharmacy: [
        { id: "MED-001", name: "Contraste Radiológico Iopamida 300mg/ml 100ml", category: "Contraste TC/RX", stock: 145, minStock: 30, unit: "Frasco", expDate: "11/2027", status: "OK" },
        { id: "MED-002", name: "Contraste Gadolínio para Ressonância 15ml", category: "Contraste RM", stock: 82, minStock: 20, unit: "Ampola", expDate: "08/2028", status: "OK" },
        { id: "MED-003", name: "Dipirona Sódica 500mg/ml Injetável", category: "Analgésico", stock: 450, minStock: 100, unit: "Ampola", expDate: "04/2027", status: "OK" },
        { id: "MED-004", name: "Gel Ultrassonográfico Condutor 5Kg", category: "Insumo US", stock: 24, minStock: 10, unit: "Galão", expDate: "12/2026", status: "OK" }
      ],

      // 7. PEP Inpatient Evolutions
      pepEvolutions: [
        { id: "EVO-101", date: "28/07/2026 10:45", patientName: "MAURÍCIO FERREIRA DE SOUZA", author: "Dr. Carlos Mendonça (Cardiologia)", text: "Paciente admitido na UTI em pós-operatório imediato de Angioplastia Coronária com Stent em ADA. Estável hemodinamicamente, em uso de Dupla Antiagregação Plaquetária (AAS + Clopidogrel). PA 130/80 mmHg, FC 74 bpm. Mantido sob vigilância intensiva." },
        { id: "EVO-102", date: "28/07/2026 09:15", patientName: "ERICK LIMA", author: "Dra. Renata Vasconcelos (Cirurgia Geral)", text: "Paciente em acompanhamento no Pronto Atendimento com quadro de Cólica Biliar. Ultrassonografia mostrou Colelitíase com cálculo impactado de 1.4 cm em infundíbulo biliar sem sinais de colecistite aguda grave. Indicado tratamento cirúrgico eletivo." }
      ]
    };
  }

  function refreshIcons() {
    createIcons({
      icons: { Activity, Bed, FileSpreadsheet, DollarSign, Package, UserPlus, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Download, Plus, Trash2, Edit, Search, Printer, Volume2, Syringe, TestTube, Stethoscope, ClipboardList, Clock, Layers }
    });
  }

  function render() {
    container.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; padding: 1.5rem; overflow-y: auto; gap: 1.25rem; background: var(--bg-dark); color: #FFF;">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; color: #FFF;">
              <i data-lucide="activity" style="color: var(--primary-cyan)"></i>
              Módulo de Gestão Hospitalar 360° — HIS (Hospital Information System)
            </h1>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Pronto Atendimento (Manchester), Censo de Leitos/UTI, Centro Cirúrgico, Laboratório LIS, Faturamento TISS, Financeiro e PEP.
            </p>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn-secondary" id="btnTestAudioPanel" style="border-color: var(--primary-cyan); color: var(--primary-cyan); font-weight: 700; padding: 0.5rem 0.85rem;" title="Testar áudio do sinal sonoro + voz no painel da recepção">
              🔊 Testar Áudio TV
            </button>
            <button class="btn-primary" id="btnQuickTriageModal" style="background: linear-gradient(135deg, #EF4444 0%, #F59E0B 100%); border: none; font-weight: 700; padding: 0.5rem 0.9rem;">
              🚨 + Nova Triagem PS
            </button>
            <button class="btn-primary" id="btnQuickSurgeryModal" style="background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%); border: none; font-weight: 700; padding: 0.5rem 0.9rem;">
              🔪 + Agendar Cirurgia
            </button>
            <button class="btn-primary" id="btnExportTissBatch" style="background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); border: none; font-weight: 700; padding: 0.5rem 0.9rem;">
              📥 Exportar Lote TISS XML
            </button>
          </div>
        </div>

        <!-- HIS Navigation Tabs (8 Modules) -->
        <div style="display: flex; gap: 0.4rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; flex-wrap: wrap;">
          <button class="btn-secondary nav-his-tab ${activeSubTab === 'manchester' ? 'active' : ''}" data-tab="manchester">
            <i data-lucide="activity" style="width: 14px; height: 14px; color: #EF4444;"></i>
            <span>🚨 1. Triagem Manchester (${state.hisData.triageQueue.length})</span>
          </button>

          <button class="btn-secondary nav-his-tab ${activeSubTab === 'beds' ? 'active' : ''}" data-tab="beds">
            <i data-lucide="bed" style="width: 14px; height: 14px; color: var(--primary-cyan);"></i>
            <span>🏥 2. Mapa de Leitos (${state.hisData.beds.filter(b => b.status === 'ocupado').length} Ocupados)</span>
          </button>

          <button class="btn-secondary nav-his-tab ${activeSubTab === 'surgery' ? 'active' : ''}" data-tab="surgery">
            <i data-lucide="stethoscope" style="width: 14px; height: 14px; color: #3B82F6;"></i>
            <span>🔪 3. Centro Cirúrgico (${state.hisData.surgeries.length})</span>
          </button>

          <button class="btn-secondary nav-his-tab ${activeSubTab === 'lab' ? 'active' : ''}" data-tab="lab">
            <i data-lucide="test-tube" style="width: 14px; height: 14px; color: #F59E0B;"></i>
            <span>🧪 4. Laboratório LIS (${state.hisData.labExams.length})</span>
          </button>

          <button class="btn-secondary nav-his-tab ${activeSubTab === 'tiss' ? 'active' : ''}" data-tab="tiss">
            <i data-lucide="file-spreadsheet" style="width: 14px; height: 14px; color: #10B981;"></i>
            <span>💳 5. Faturamento TISS XML</span>
          </button>

          <button class="btn-secondary nav-his-tab ${activeSubTab === 'financial' ? 'active' : ''}" data-tab="financial">
            <i data-lucide="dollar-sign" style="width: 14px; height: 14px; color: #EAB308;"></i>
            <span>💰 6. Financeiro & DRE</span>
          </button>

          <button class="btn-secondary nav-his-tab ${activeSubTab === 'pharmacy' ? 'active' : ''}" data-tab="pharmacy">
            <i data-lucide="package" style="width: 14px; height: 14px; color: #A855F7;"></i>
            <span>💊 7. Farmácia Hospitalar</span>
          </button>

          <button class="btn-secondary nav-his-tab ${activeSubTab === 'pep' ? 'active' : ''}" data-tab="pep">
            <i data-lucide="clipboard-list" style="width: 14px; height: 14px; color: #EC4899;"></i>
            <span>📜 8. Prontuário Eletrônico PEP</span>
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
                  <th>Ações de Chamada por Voz</th>
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
                      <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                        <button class="btn-secondary btn-call-triage" data-index="${idx}" style="font-size: 0.7rem; padding: 3px 6px; border-color: #EF4444; color: #EF4444; font-weight: 700;">
                          🔊 Chamar Triagem
                        </button>
                        <button class="btn-primary btn-call-consult" data-index="${idx}" style="font-size: 0.7rem; padding: 3px 6px; background: var(--primary-cyan); color: #000; font-weight: 700; border: none;">
                          👨‍⚕️ Chamar Médico
                        </button>
                      </div>
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
    } else if (activeSubTab === 'surgery') {
      return `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1rem; font-weight: 700; color: #3B82F6; display: flex; align-items: center; gap: 0.4rem;">
              🔪 Centro Cirúrgico & Escala do Bloco Operatório
            </h3>
            <button class="btn-primary" id="btnAddSurgery" style="font-size: 0.8rem; background: #3B82F6; border: none; font-weight: 700;">
              + Agendar Nova Cirurgia
            </button>
          </div>

          <div class="table-wrapper">
            <table class="worklist-table">
              <thead>
                <tr>
                  <th>Sala Cirúrgica</th>
                  <th>Paciente</th>
                  <th>Procedimento Cirúrgico</th>
                  <th>Cirurgião Principal</th>
                  <th>Anestesista</th>
                  <th>Horário</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${state.hisData.surgeries.map(s => `
                  <tr>
                    <td><strong style="color: var(--primary-cyan); font-family: monospace;">${s.room}</strong></td>
                    <td><strong>${s.patientName}</strong></td>
                    <td>${s.procedure}</td>
                    <td>${s.surgeon}</td>
                    <td>${s.anesthetist}</td>
                    <td><span style="font-family: monospace;">${s.time}</span></td>
                    <td><span class="badge-status laudando">${s.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeSubTab === 'lab') {
      return `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1rem; font-weight: 700; color: #F59E0B; display: flex; align-items: center; gap: 0.4rem;">
              🧪 Laboratório de Análises Clínicas (LIS Integrado)
            </h3>
            <button class="btn-primary" id="btnAddLabExam" style="font-size: 0.8rem; background: #F59E0B; border: none; font-weight: 700;">
              + Cadastrar Exame Laboratorial
            </button>
          </div>

          <div class="table-wrapper">
            <table class="worklist-table">
              <thead>
                <tr>
                  <th>Código / Amostra</th>
                  <th>Paciente</th>
                  <th>Exames Solicitados</th>
                  <th>Urgência</th>
                  <th>Resultado / Parecer Técnico</th>
                  <th>Status LIS</th>
                </tr>
              </thead>
              <tbody>
                ${state.hisData.labExams.map(lab => `
                  <tr>
                    <td><strong style="color: var(--primary-cyan); font-family: monospace;">${lab.id}</strong><br><span style="font-size: 0.68rem; color: var(--text-muted);">${lab.sampleId}</span></td>
                    <td><strong>${lab.patientName}</strong></td>
                    <td>${lab.examName}</td>
                    <td><span style="font-weight: 800; font-size: 0.72rem; color: #EF4444;">${lab.urgency}</span></td>
                    <td><div style="font-size: 0.75rem; color: #10B981; max-width: 280px; font-weight: 600;">${lab.result}</div></td>
                    <td><span class="badge-status concluido">${lab.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
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
          <h3 style="font-size: 1rem; font-weight: 700; color: #EAB308; display: flex; align-items: center; gap: 0.4rem;">
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
    } else if (activeSubTab === 'pep') {
      return `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1rem; font-weight: 700; color: #EC4899; display: flex; align-items: center; gap: 0.4rem;">
              📜 Prontuário Eletrônico do Paciente (PEP — Evoluções Médicas)
            </h3>
            <button class="btn-primary" id="btnAddPepEvolution" style="font-size: 0.8rem; background: #EC4899; border: none; font-weight: 700;">
              + Adicionar Nova Evolução Médica
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${state.hisData.pepEvolutions.map(evo => `
              <div style="background: #0B0F17; border: 1px solid var(--border-light); border-left: 4px solid #EC4899; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.4rem;">
                  <strong style="color: var(--primary-cyan); font-size: 0.9rem;">${evo.patientName}</strong>
                  <span style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${evo.date}</span>
                </div>
                <div style="font-size: 0.75rem; color: #F59E0B; font-weight: 700;">${evo.author}</div>
                <div style="font-size: 0.82rem; color: #E2E8F0; line-height: 1.4;">${evo.text}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  function attachHisEvents() {
    // Audio Test Panel Action
    container.querySelector('#btnTestAudioPanel')?.addEventListener('click', () => {
      const phrase = "Atenção: Teste do Sinal Sonoro e Painel de Convocação por Voz do Sistema Hospitalar NexusRad AI.";
      speakPatientCallWithChime(phrase);
      showToast("🔊 Teste do Painel TV acionado! (Sinal Sonoro + Voz)", "info");
    });

    // Call for Triage Action
    container.querySelectorAll('.btn-call-triage').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const item = state.hisData.triageQueue[idx];
        const phrase = `Atenção paciente ${item.patientName}, favor dirigir-se à Sala de Triagem Manchester.`;
        speakPatientCallWithChime(phrase);
        showToast(`🔊 PAINEL TV: "${phrase}"`, 'info');
        logAuditEvent('PATIENT_CALLED_TRIAGE', phrase);
      });
    });

    // Call for Doctor Action
    container.querySelectorAll('.btn-call-consult').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const item = state.hisData.triageQueue[idx];
        const phrase = `Atenção paciente ${item.patientName}, favor dirigir-se ao Consultório Médico 01 com o Doutor Carlos Mendonça.`;
        speakPatientCallWithChime(phrase);
        showToast(`📢 PAINEL TV: "${phrase}"`, 'success');
        logAuditEvent('PATIENT_CALLED_DOCTOR', phrase);
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
        openAdmitModal(idx);
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
        downloadTissXmlFile(batch);
      });
    });

    // Quick Triage Modal Button
    container.querySelector('#btnQuickTriageModal')?.addEventListener('click', () => {
      openTriageModal();
    });

    // Quick Surgery Modal Button
    container.querySelector('#btnQuickSurgeryModal')?.addEventListener('click', () => {
      openSurgeryModal();
    });
    container.querySelector('#btnAddSurgery')?.addEventListener('click', () => {
      openSurgeryModal();
    });

    // Add Lab Exam Button
    container.querySelector('#btnAddLabExam')?.addEventListener('click', () => {
      openLabModal();
    });

    // Add PEP Evolution Button
    container.querySelector('#btnAddPepEvolution')?.addEventListener('click', () => {
      openPepModal();
    });

    // Admit Patient Modal Button
    container.querySelector('#btnAdmitPatientBed')?.addEventListener('click', () => {
      openAdmitModal();
    });

    // Generate TISS Batch Modal Button
    container.querySelector('#btnGenerateTissBatch')?.addEventListener('click', () => {
      openGenerateTissModal();
    });

    container.querySelector('#btnExportTissBatch')?.addEventListener('click', () => {
      openGenerateTissModal();
    });

    // Add Pharmacy Item Modal Button
    container.querySelector('#btnAddPharmacyItem')?.addEventListener('click', () => {
      openPharmacyModal();
    });
  }

  // ==========================================================================
  // Interactive Modals for Complete HIS Workflow
  // ==========================================================================

  function openTriageModal() {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop open';
    modalBackdrop.innerHTML = `
      <div class="modal-card" style="max-width: 620px; width: 92%; display: flex; flex-direction: column; gap: 1rem; background: #0A0F1D; border: 1px solid #EF4444; box-shadow: 0 0 30px rgba(239, 68, 68, 0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #EF4444;">🚨 Nova Triagem de Manchester & Classificação de Risco</h3>
          <button class="btn-icon" id="closeHisModal" style="color: #FFF; font-weight: 700;">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Nome Completo do Paciente:</label>
            <input type="text" id="tName" class="form-select" value="ERICK LIMA" placeholder="Ex: MAURÍCIO FERREIRA DE SOUZA">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 0.5rem;">
            <div class="form-group" style="margin: 0;">
              <label style="font-size: 0.7rem; color: var(--text-muted);">PA (mmHg):</label>
              <input type="text" id="tBp" class="form-select" value="130/85">
            </div>
            <div class="form-group" style="margin: 0;">
              <label style="font-size: 0.7rem; color: var(--text-muted);">FC (bpm):</label>
              <input type="text" id="tHr" class="form-select" value="84">
            </div>
            <div class="form-group" style="margin: 0;">
              <label style="font-size: 0.7rem; color: var(--text-muted);">SpO2 (%):</label>
              <input type="text" id="tSpo2" class="form-select" value="98%">
            </div>
            <div class="form-group" style="margin: 0;">
              <label style="font-size: 0.7rem; color: var(--text-muted);">Dor (0-10):</label>
              <input type="text" id="tPain" class="form-select" value="6">
            </div>
          </div>

          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Queixa Principal & Sintomas Observados:</label>
            <textarea id="tSymptoms" class="form-select" style="height: 60px;">Dor abdominal difusa de início súbito acompanhada de náuseas leves.</textarea>
          </div>

          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Classificação de Risco (Protocolo Manchester):</label>
            <select id="tColor" class="form-select" style="font-weight: 700;">
              <option value="red" style="color: #EF4444;">🔴 EMERGENCY — Vermelho (Atendimento Imediato)</option>
              <option value="orange" style="color: #F59E0B;">🟠 MUITO URGENTE — Laranja (Atendimento em 10 min)</option>
              <option value="yellow" selected style="color: #EAB308;">🟡 URGENTE — Amarelo (Atendimento em 60 min)</option>
              <option value="green" style="color: #10B981;">🟢 POUCO URGENTE — Verde (Atendimento em 120 min)</option>
              <option value="blue" style="color: #3B82F6;">🔵 NÃO URGENTE — Azul (Atendimento em 240 min)</option>
            </select>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
          <button class="btn-secondary" id="cancelHisModal">Cancelar</button>
          <button class="btn-primary" id="saveTriageBtn" style="background: #EF4444; border-color: #EF4444; font-weight: 700;">
            🚨 Salvar Triagem & Gerar Senha
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    const close = () => modalBackdrop.remove();
    modalBackdrop.querySelector('#closeHisModal').addEventListener('click', close);
    modalBackdrop.querySelector('#cancelHisModal').addEventListener('click', close);

    modalBackdrop.querySelector('#saveTriageBtn').addEventListener('click', () => {
      const name = modalBackdrop.querySelector('#tName').value.trim().toUpperCase() || "NOVO PACIENTE PS";
      const bp = modalBackdrop.querySelector('#tBp').value;
      const hr = modalBackdrop.querySelector('#tHr').value;
      const spo2 = modalBackdrop.querySelector('#tSpo2').value;
      const symptoms = modalBackdrop.querySelector('#tSymptoms').value;
      const color = modalBackdrop.querySelector('#tColor').value;

      const labels = {
        red: "EMERGÊNCIA (Vermelho)",
        orange: "MUITO URGENTE (Laranja)",
        yellow: "URGENTE (Amarelo)",
        green: "POUCO URGENTE (Verde)",
        blue: "NÃO URGENTE (Azul)"
      };

      state.hisData.triageQueue.unshift({
        id: `TRI-${Math.floor(100 + Math.random() * 900)}`,
        patientName: name,
        age: "38a",
        gender: "M",
        time: new Date().toLocaleTimeString().slice(0, 5),
        color: color,
        label: labels[color],
        symptoms: symptoms,
        bp: bp,
        hr: `${hr} bpm`,
        spo2: spo2,
        status: "Aguardando Médico"
      });

      close();
      render();
      showToast(`🚨 Triagem de ${name} salva! Classificação: ${labels[color]}.`, 'success');
      logAuditEvent('TRIAGE_CREATED', `Triagem Manchester criada para ${name} [${labels[color]}]`);
    });
  }

  function openSurgeryModal() {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop open';

    modalBackdrop.innerHTML = `
      <div class="modal-card" style="max-width: 580px; width: 92%; display: flex; flex-direction: column; gap: 1rem; background: #0A0F1D; border: 1px solid #3B82F6; box-shadow: 0 0 30px rgba(59, 130, 246, 0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #3B82F6;">🔪 Agendar Cirurgia no Bloco Operatório</h3>
          <button class="btn-icon" id="closeHisModal" style="color: #FFF; font-weight: 700;">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Nome do Paciente:</label>
            <input type="text" id="surgPatient" class="form-select" value="ERICK LIMA">
          </div>

          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Procedimento Cirúrgico:</label>
            <input type="text" id="surgProc" class="form-select" value="Colecistectomia Videolaparoscópica">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <div class="form-group" style="margin: 0;">
              <label style="font-size: 0.75rem; color: var(--text-muted);">Sala Cirúrgica:</label>
              <select id="surgRoom" class="form-select">
                <option value="Sala Cirúrgica 01">Sala Cirúrgica 01 (Cardiovasc)</option>
                <option value="Sala Cirúrgica 02">Sala Cirúrgica 02 (Ortopedia)</option>
                <option value="Sala Cirúrgica 03" selected>Sala Cirúrgica 03 (Vidéolaparo)</option>
              </select>
            </div>

            <div class="form-group" style="margin: 0;">
              <label style="font-size: 0.75rem; color: var(--text-muted);">Cirurgião Principal:</label>
              <input type="text" id="surgDoctor" class="form-select" value="Dra. Renata Vasconcelos">
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
          <button class="btn-secondary" id="cancelHisModal">Cancelar</button>
          <button class="btn-primary" id="saveSurgeryBtn" style="background: #3B82F6; border-color: #3B82F6; font-weight: 700;">
            🔪 Confirmar Agendamento Cirúrgico
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    const close = () => modalBackdrop.remove();
    modalBackdrop.querySelector('#closeHisModal').addEventListener('click', close);
    modalBackdrop.querySelector('#cancelHisModal').addEventListener('click', close);

    modalBackdrop.querySelector('#saveSurgeryBtn').addEventListener('click', () => {
      const pName = modalBackdrop.querySelector('#surgPatient').value.trim().toUpperCase();
      const proc = modalBackdrop.querySelector('#surgProc').value;
      const room = modalBackdrop.querySelector('#surgRoom').value;
      const doc = modalBackdrop.querySelector('#surgDoctor').value;

      state.hisData.surgeries.unshift({
        id: `CIR-${Math.floor(300 + Math.random() * 900)}`,
        room: room,
        patientName: pName,
        procedure: proc,
        surgeon: doc,
        anesthetist: "Dr. Fernando Paes",
        time: new Date().toLocaleTimeString().slice(0, 5),
        status: "AGENDADA"
      });

      close();
      render();
      showToast(`🔪 Cirurgia de ${pName} agendada na ${room}!`, 'success');
      logAuditEvent('SURGERY_SCHEDULED', `Cirurgia agendada: ${proc} em ${pName}`);
    });
  }

  function openLabModal() {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop open';

    modalBackdrop.innerHTML = `
      <div class="modal-card" style="max-width: 550px; width: 92%; display: flex; flex-direction: column; gap: 1rem; background: #0A0F1D; border: 1px solid #F59E0B; box-shadow: 0 0 30px rgba(245, 158, 11, 0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #F59E0B;">🧪 Cadastrar Exame no Laboratório LIS</h3>
          <button class="btn-icon" id="closeHisModal" style="color: #FFF; font-weight: 700;">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Nome do Paciente:</label>
            <input type="text" id="labPatient" class="form-select" value="ERICK LIMA">
          </div>

          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Exames Laboratoriais Solicitados:</label>
            <input type="text" id="labName" class="form-select" value="Hemograma Completo + PCR + Coagulograma">
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
          <button class="btn-secondary" id="cancelHisModal">Cancelar</button>
          <button class="btn-primary" id="saveLabBtn" style="background: #F59E0B; border-color: #F59E0B; font-weight: 700;">
            🧪 Enviar Pedido LIS & Gerar Amostra
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    const close = () => modalBackdrop.remove();
    modalBackdrop.querySelector('#closeHisModal').addEventListener('click', close);
    modalBackdrop.querySelector('#cancelHisModal').addEventListener('click', close);

    modalBackdrop.querySelector('#saveLabBtn').addEventListener('click', () => {
      const pName = modalBackdrop.querySelector('#labPatient').value.trim().toUpperCase();
      const examName = modalBackdrop.querySelector('#labName').value;

      state.hisData.labExams.unshift({
        id: `LAB-${Math.floor(8800 + Math.random() * 900)}`,
        sampleId: `AMO-${Math.floor(9000 + Math.random() * 900)}`,
        patientName: pName,
        examName: examName,
        urgency: "ALTA",
        status: "COLETADO",
        result: "Amostra em processamento na centrífuga LIS"
      });

      close();
      render();
      showToast(`🧪 Amostra laboratorial gerada para ${pName}!`, 'success');
    });
  }

  function openPepModal() {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop open';

    modalBackdrop.innerHTML = `
      <div class="modal-card" style="max-width: 600px; width: 92%; display: flex; flex-direction: column; gap: 1rem; background: #0A0F1D; border: 1px solid #EC4899; box-shadow: 0 0 30px rgba(236, 72, 153, 0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #EC4899;">📜 Nova Evolução Médica / Enfermagem no PEP</h3>
          <button class="btn-icon" id="closeHisModal" style="color: #FFF; font-weight: 700;">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Paciente Internado:</label>
            <input type="text" id="pepPatient" class="form-select" value="ERICK LIMA">
          </div>

          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Texto da Evolução Clínica / Prescrição:</label>
            <textarea id="pepText" class="form-select" style="height: 100px;">Paciente calmo, eupnéico em ar ambiente, afebril. Refere melhora da epigastralgia. Mantido em jejum relativo para exames adicionais.</textarea>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
          <button class="btn-secondary" id="cancelHisModal">Cancelar</button>
          <button class="btn-primary" id="savePepBtn" style="background: #EC4899; border-color: #EC4899; font-weight: 700;">
            📜 Assinar & Gravar no PEP
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    const close = () => modalBackdrop.remove();
    modalBackdrop.querySelector('#closeHisModal').addEventListener('click', close);
    modalBackdrop.querySelector('#cancelHisModal').addEventListener('click', close);

    modalBackdrop.querySelector('#savePepBtn').addEventListener('click', () => {
      const pName = modalBackdrop.querySelector('#pepPatient').value.trim().toUpperCase();
      const text = modalBackdrop.querySelector('#pepText').value;

      state.hisData.pepEvolutions.unshift({
        id: `EVO-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toLocaleString(),
        patientName: pName,
        author: "Dr. Carlos Mendonça (Plantão)",
        text: text
      });

      close();
      render();
      showToast(`📜 Evolução médica gravada com sucesso no PEP!`, 'success');
      logAuditEvent('PEP_EVOLUTION_SAVED', `Evolução PEP de ${pName}`);
    });
  }

  function openAdmitModal(targetBedIdx = null) {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop open';

    modalBackdrop.innerHTML = `
      <div class="modal-card" style="max-width: 550px; width: 92%; display: flex; flex-direction: column; gap: 1rem; background: #0A0F1D; border: 1px solid var(--primary-cyan); box-shadow: 0 0 30px rgba(0, 229, 255, 0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan);">📥 Efetivar Internação Hospitalar em Leito</h3>
          <button class="btn-icon" id="closeHisModal" style="color: #FFF; font-weight: 700;">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Selecionar Paciente para Internação:</label>
            <input type="text" id="admitPatientName" class="form-select" value="ERICK LIMA" placeholder="Ex: ERICK LIMA">
          </div>

          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Selecionar Leito Disponível:</label>
            <select id="admitBedSelect" class="form-select">
              ${state.hisData.beds.map((b, i) => `
                <option value="${i}" ${targetBedIdx === i ? 'selected' : b.status !== 'vago' ? 'disabled' : ''}>
                  ${b.sector} — ${b.bedNumber} [${b.status.toUpperCase()}]
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Médico Responsável da Internação:</label>
            <select id="admitDoctorSelect" class="form-select">
              <option value="Dr. Carlos Mendonça">Dr. Carlos Mendonça (Radiologia / Internação)</option>
              <option value="Dra. Renata Vasconcelos">Dra. Renata Vasconcelos (Ultrassonografia / UTI)</option>
              <option value="Dr. Marcelo Ramos">Dr. Marcelo Ramos (Neurorradiologia)</option>
            </select>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
          <button class="btn-secondary" id="cancelHisModal">Cancelar</button>
          <button class="btn-primary" id="saveAdmitBtn" style="background: var(--status-ready); border-color: var(--status-ready); font-weight: 700;">
            📥 Efetivar Internação no Leito
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    const close = () => modalBackdrop.remove();
    modalBackdrop.querySelector('#closeHisModal').addEventListener('click', close);
    modalBackdrop.querySelector('#cancelHisModal').addEventListener('click', close);

    modalBackdrop.querySelector('#saveAdmitBtn').addEventListener('click', () => {
      const idx = parseInt(modalBackdrop.querySelector('#admitBedSelect').value);
      const name = modalBackdrop.querySelector('#admitPatientName').value.trim().toUpperCase() || "PACIENTE INTERNADO";
      const doctor = modalBackdrop.querySelector('#admitDoctorSelect').value;

      const bed = state.hisData.beds[idx];
      if (bed) {
        bed.status = 'ocupado';
        bed.patientName = name;
        bed.doctor = doctor;
        bed.admissionDate = new Date().toLocaleString();

        close();
        render();
        showToast(`📥 Paciente ${name} internado no leito ${bed.bedNumber}!`, 'success');
        logAuditEvent('BED_ADMISSION', `Internação do paciente ${name} no leito ${bed.bedNumber} (${bed.sector})`);
      }
    });
  }

  function openGenerateTissModal() {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop open';

    modalBackdrop.innerHTML = `
      <div class="modal-card" style="max-width: 550px; width: 92%; display: flex; flex-direction: column; gap: 1rem; background: #0A0F1D; border: 1px solid #10B981; box-shadow: 0 0 30px rgba(16, 185, 129, 0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #10B981;">⚡ Gerar Lote XML TISS 4.01 (Padrão ANS)</h3>
          <button class="btn-icon" id="closeHisModal" style="color: #FFF; font-weight: 700;">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Operadora / Convênio Médico:</label>
            <select id="tissAgreementSelect" class="form-select">
              <option value="Bradesco Saúde S/A">Bradesco Saúde S/A</option>
              <option value="Unimed Nacional">Unimed Nacional</option>
              <option value="SulAmérica Saúde">SulAmérica Saúde</option>
              <option value="Amil Assistência Médica">Amil Assistência Médica</option>
              <option value="SUS - Governo Federal">SUS - Sistema Único de Saúde</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <div class="form-group" style="margin: 0;">
              <label style="font-size: 0.75rem; color: var(--text-muted);">Competência / Mês:</label>
              <input type="text" class="form-select" value="Julho / 2026" readonly style="opacity: 0.8;">
            </div>

            <div class="form-group" style="margin: 0;">
              <label style="font-size: 0.75rem; color: var(--text-muted);">Padrão TISS ANS:</label>
              <input type="text" class="form-select" value="TISS v4.01.00" readonly style="opacity: 0.8;">
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
          <button class="btn-secondary" id="cancelHisModal">Cancelar</button>
          <button class="btn-primary" id="saveTissBtn" style="background: #10B981; border-color: #10B981; font-weight: 700;">
            ⚡ Gerar & Baixar XML TISS
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    const close = () => modalBackdrop.remove();
    modalBackdrop.querySelector('#closeHisModal').addEventListener('click', close);
    modalBackdrop.querySelector('#cancelHisModal').addEventListener('click', close);

    modalBackdrop.querySelector('#saveTissBtn').addEventListener('click', () => {
      const agreement = modalBackdrop.querySelector('#tissAgreementSelect').value;
      const newBatch = {
        id: `LOTE-2026-${Math.floor(100 + Math.random() * 900)}`,
        agreement: agreement,
        count: Math.floor(15 + Math.random() * 30),
        totalValue: `R$ ${(Math.random() * 30000 + 10000).toFixed(2).replace('.', ',')}`,
        date: new Date().toLocaleDateString(),
        status: "PRONTO PARA ENVIO (XML TISS 4.01)"
      };

      state.hisData.tissBatches.unshift(newBatch);
      close();
      render();
      downloadTissXmlFile(newBatch);
    });
  }

  function openPharmacyModal() {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop open';

    modalBackdrop.innerHTML = `
      <div class="modal-card" style="max-width: 550px; width: 92%; display: flex; flex-direction: column; gap: 1rem; background: #0A0F1D; border: 1px solid #A855F7; box-shadow: 0 0 30px rgba(168, 85, 247, 0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #A855F7;">💊 Dar Entrada de Insumo na Farmácia Hospitalar</h3>
          <button class="btn-icon" id="closeHisModal" style="color: #FFF; font-weight: 700;">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="form-group" style="margin: 0;">
            <label style="font-size: 0.75rem; color: var(--text-muted);">Nome do Medicamento / Insumo:</label>
            <input type="text" id="phName" class="form-select" placeholder="Ex: Contraste Iopamida 300mg/ml" value="Contraste Iopamida 300mg/ml 100ml">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <div class="form-group" style="margin: 0;">
              <label style="font-size: 0.75rem; color: var(--text-muted);">Categoria:</label>
              <select id="phCat" class="form-select">
                <option value="Contraste TC/RX">Contraste TC/RX</option>
                <option value="Contraste RM">Contraste RM</option>
                <option value="Analgésico">Analgésico / Injetável</option>
                <option value="Insumo US">Insumo US (Gel / Capas)</option>
              </select>
            </div>

            <div class="form-group" style="margin: 0;">
              <label style="font-size: 0.75rem; color: var(--text-muted);">Quantidade de Entrada:</label>
              <input type="number" id="phQty" class="form-select" value="50">
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
          <button class="btn-secondary" id="cancelHisModal">Cancelar</button>
          <button class="btn-primary" id="savePharmacyBtn" style="background: #A855F7; border-color: #A855F7; font-weight: 700;">
            💊 Gravar Entrada no Estoque
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    const close = () => modalBackdrop.remove();
    modalBackdrop.querySelector('#closeHisModal').addEventListener('click', close);
    modalBackdrop.querySelector('#cancelHisModal').addEventListener('click', close);

    modalBackdrop.querySelector('#savePharmacyBtn').addEventListener('click', () => {
      const name = modalBackdrop.querySelector('#phName').value.trim();
      const cat = modalBackdrop.querySelector('#phCat').value;
      const qty = parseInt(modalBackdrop.querySelector('#phQty').value) || 10;

      state.hisData.pharmacy.unshift({
        id: `MED-${Math.floor(100 + Math.random() * 900)}`,
        name: name,
        category: cat,
        stock: qty,
        minStock: 20,
        unit: "Frasco",
        expDate: "12/2028",
        status: "OK"
      });

      close();
      render();
      showToast(`💊 Entrada de ${qty} unidade(s) de "${name}" realizada!`, 'success');
      logAuditEvent('PHARMACY_STOCK_ADDED', `Entrada de estoque farmácia: ${name} (${qty} un)`);
    });
  }

  function downloadTissXmlFile(batch) {
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
    showToast(`📥 Lote XML TISS 4.01 (${batch.id}) baixado com sucesso!`, 'success');
    logAuditEvent('TISS_XML_EXPORTED', `Exportação de lote TISS XML ANS ${batch.id} para o convênio ${batch.agreement}`);
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
