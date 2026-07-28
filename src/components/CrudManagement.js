// ==========================================================================
// NexusRad AI - Enterprise CRUD Management System (Zero Browser Prompts/Alerts)
// Fully Customized Glassmorphism Toast Notifications & Confirm Dialogs
// ==========================================================================

import { MOCK_TEMPLATES } from '../data/mockData.js';
import { createIcons, Edit, Trash2, X, UserPlus, FileText, CreditCard, User, FolderOpen, Search, CheckCircle2 } from 'lucide';
import { showToast, showConfirmDialog } from '../utils/toast.js';
import { savePatientsToStorage, saveTemplatesToStorage, saveDoctorsToStorage, saveAgreementsToStorage } from '../utils/storage.js';

export function renderCrudManagement(container, state, callbacks) {
  let activeTab = 'patients'; // 'patients' | 'templates' | 'doctors' | 'agreements'
  let modalState = null;

  if (!state.customPatients) {
    state.customPatients = [...state.studies.map(s => ({
      id: s.patientId,
      name: s.patientName,
      age: s.age,
      gender: s.gender,
      phone: "(11) 99888-7766",
      agreement: "Bradesco Saúde"
    }))];
  }

  if (!state.customTemplatesList) {
    state.customTemplatesList = Object.entries(MOCK_TEMPLATES).map(([key, tpl]) => ({
      key,
      name: tpl.name,
      modality: tpl.modality,
      category: tpl.category,
      findings: tpl.findings,
      impression: tpl.impression
    }));
  }

  if (!state.customDoctors) {
    state.customDoctors = [
      { id: "MED-01", name: "Dr. Carlos Roberto de Mendonça", crm: "CRM/SP 142.890", specialty: "Radiologia Geral & TC" },
      { id: "MED-02", name: "Dra. Renata Vasconcelos", crm: "CRM/SP 198.441", specialty: "Ultrassonografia & Doppler" },
      { id: "MED-03", name: "Dr. Marcelo Ramos", crm: "CRM/SP 165.220", specialty: "Neurorradiologia & RM" }
    ];
  }

  if (!state.customAgreements) {
    state.customAgreements = [
      { id: "CONV-01", name: "Bradesco Saúde S/A", codeTuss: "40901122", price: "R$ 280,00", status: "ATIVO" },
      { id: "CONV-02", name: "Unimed Nacional", codeTuss: "40901130", price: "R$ 250,00", status: "ATIVO" },
      { id: "CONV-03", name: "SulAmérica Saúde", codeTuss: "40901149", price: "R$ 310,00", status: "ATIVO" },
      { id: "CONV-04", name: "SUS - Sistema Único de Saúde", codeTuss: "02050200", price: "R$ 86,00", status: "ATIVO" }
    ];
  }

  function refreshIcons() {
    createIcons({
      icons: { Edit, Trash2, X, UserPlus, FileText, CreditCard, User, FolderOpen, Search, CheckCircle2 }
    });
  }

  function render() {
    container.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; padding: 1.5rem; overflow-y: auto; gap: 1.25rem; background: var(--bg-dark);">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; color: #FFF;">
              <i data-lucide="folder-open" style="color: var(--primary-cyan)"></i>
              Central de Cadastros & Gestão CRUD do Sistema
            </h1>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Gerenciamento profissional com notificações Toast personalizadas para Pacientes, Laudos, Médicos e Convênios.
            </p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; flex-wrap: wrap;">
          <button class="btn-secondary nav-crud-tab ${activeTab === 'patients' ? 'active' : ''}" data-tab="patients" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
            <i data-lucide="user" style="width: 16px; height: 16px; color: var(--primary-cyan);"></i>
            <span>👤 Cadastro de Pacientes (${state.customPatients.length})</span>
          </button>

          <button class="btn-secondary nav-crud-tab ${activeTab === 'templates' ? 'active' : ''}" data-tab="templates" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
            <i data-lucide="file-text" style="width: 16px; height: 16px; color: var(--primary-cyan);"></i>
            <span>📝 Máscaras de Laudos (${state.customTemplatesList.length})</span>
          </button>

          <button class="btn-secondary nav-crud-tab ${activeTab === 'doctors' ? 'active' : ''}" data-tab="doctors" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
            <i data-lucide="user-plus" style="width: 16px; height: 16px; color: var(--primary-cyan);"></i>
            <span>👨‍⚕️ Corpo Médico (${state.customDoctors.length})</span>
          </button>

          <button class="btn-secondary nav-crud-tab ${activeTab === 'agreements' ? 'active' : ''}" data-tab="agreements" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
            <i data-lucide="credit-card" style="width: 16px; height: 16px; color: var(--primary-cyan);"></i>
            <span>💳 Convênios & TUSS (${state.customAgreements.length})</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div id="crudTabContainer">
          ${renderActiveTabContent()}
        </div>

        <!-- Custom Form Modal Overlay -->
        ${modalState ? renderFormModal() : ''}

      </div>
    `;

    // Attach Tab Switchers
    container.querySelectorAll('.nav-crud-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        render();
      });
    });

    attachTabEvents();
    if (modalState) attachModalEvents();
    refreshIcons();
  }

  function renderActiveTabContent() {
    if (activeTab === 'patients') {
      return `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-cyan);">Lista de Pacientes Cadastrados</h3>
            <button class="btn-primary" id="btnOpenAddPatientModal" style="font-size: 0.8rem; background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); border: none;">
              <i data-lucide="user-plus" style="width: 15px; height: 15px;"></i>
              <span>+ Cadastrar Novo Paciente</span>
            </button>
          </div>

          <div class="table-wrapper">
            <table class="worklist-table">
              <thead>
                <tr>
                  <th>Nome Completo do Paciente</th>
                  <th>Prontuário / CPF</th>
                  <th>Idade / Sexo</th>
                  <th>Telefone / WhatsApp</th>
                  <th>Convênio</th>
                  <th>Ações CRUD</th>
                </tr>
              </thead>
              <tbody>
                ${state.customPatients.map((p, i) => `
                  <tr>
                    <td><strong>${p.name}</strong></td>
                    <td><span style="font-family: monospace; color: var(--primary-cyan); font-weight: 700;">${p.id}</span></td>
                    <td>${p.age} / ${p.gender}</td>
                    <td>${p.phone}</td>
                    <td><span class="badge-status concluido">${p.agreement}</span></td>
                    <td>
                      <div class="action-btn-group" style="display: flex; gap: 0.5rem; align-items: center;">
                        <button class="btn-secondary btn-edit-patient" data-index="${i}" title="Editar Paciente" style="background: rgba(0,229,255,0.15); border-color: var(--primary-cyan); padding: 6px 10px; display: flex; align-items: center; gap: 4px;">
                          <i data-lucide="edit" style="width: 15px; height: 15px; color: var(--primary-cyan);"></i>
                          <span style="font-size: 0.75rem; color: var(--primary-cyan); font-weight: 700;">Editar</span>
                        </button>
                        <button class="btn-secondary btn-delete-patient" data-index="${i}" data-name="${p.name}" title="Excluir Paciente" style="background: rgba(239,68,68,0.15); border-color: #EF4444; padding: 6px 10px; display: flex; align-items: center; gap: 4px;">
                          <i data-lucide="trash-2" style="width: 15px; height: 15px; color: #EF4444;"></i>
                          <span style="font-size: 0.75rem; color: #EF4444; font-weight: 700;">Excluir</span>
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
    } else if (activeTab === 'templates') {
      return `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-cyan);">Biblioteca de Máscaras e Modelos de Laudo</h3>
            <button class="btn-primary" id="btnOpenAddTemplateModal" style="font-size: 0.8rem;">
              <i data-lucide="file-text" style="width: 15px; height: 15px;"></i>
              <span>+ Criar Novo Modelo de Laudo</span>
            </button>
          </div>

          <div class="table-wrapper">
            <table class="worklist-table">
              <thead>
                <tr>
                  <th>Nome da Máscara de Laudo</th>
                  <th>Categoria</th>
                  <th>Modalidade</th>
                  <th>Pré-visualização do Texto</th>
                  <th>Ações CRUD</th>
                </tr>
              </thead>
              <tbody>
                ${state.customTemplatesList.map((t, i) => `
                  <tr>
                    <td><strong>${t.name}</strong></td>
                    <td><span class="badge-status concluido">${t.category}</span></td>
                    <td><span class="badge-modality ${t.modality}">${t.modality}</span></td>
                    <td><div style="font-size: 0.75rem; color: var(--text-muted); max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.impression}</div></td>
                    <td>
                      <div class="action-btn-group" style="display: flex; gap: 0.5rem; align-items: center;">
                        <button class="btn-secondary btn-edit-template" data-index="${i}" title="Editar Modelo" style="background: rgba(0,229,255,0.15); border-color: var(--primary-cyan); padding: 6px 10px; display: flex; align-items: center; gap: 4px;">
                          <i data-lucide="edit" style="width: 15px; height: 15px; color: var(--primary-cyan);"></i>
                          <span style="font-size: 0.75rem; color: var(--primary-cyan); font-weight: 700;">Editar</span>
                        </button>
                        <button class="btn-secondary btn-delete-template" data-index="${i}" data-name="${t.name}" title="Excluir Modelo" style="background: rgba(239,68,68,0.15); border-color: #EF4444; padding: 6px 10px; display: flex; align-items: center; gap: 4px;">
                          <i data-lucide="trash-2" style="width: 15px; height: 15px; color: #EF4444;"></i>
                          <span style="font-size: 0.75rem; color: #EF4444; font-weight: 700;">Excluir</span>
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
    } else if (activeTab === 'doctors') {
      return `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-cyan);">Corpo Médico Radiologista & Laudadores</h3>
            <button class="btn-primary" id="btnOpenAddDoctorModal" style="font-size: 0.8rem;">
              <i data-lucide="user-plus" style="width: 15px; height: 15px;"></i>
              <span>+ Cadastrar Médico</span>
            </button>
          </div>

          <div class="table-wrapper">
            <table class="worklist-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome do Médico Radiologista</th>
                  <th>Registro Profissional CRM</th>
                  <th>Especialidade Médica</th>
                  <th>Ações CRUD</th>
                </tr>
              </thead>
              <tbody>
                ${state.customDoctors.map((d, i) => `
                  <tr>
                    <td><span style="font-family: monospace; color: var(--primary-cyan); font-weight: 700;">${d.id}</span></td>
                    <td><strong>${d.name}</strong></td>
                    <td>${d.crm}</td>
                    <td>${d.specialty}</td>
                    <td>
                      <div class="action-btn-group">
                        <button class="btn-secondary btn-delete-doctor" data-index="${i}" data-name="${d.name}" title="Remover Médico" style="background: rgba(239,68,68,0.15); border-color: #EF4444; padding: 6px 10px; display: flex; align-items: center; gap: 4px;">
                          <i data-lucide="trash-2" style="width: 15px; height: 15px; color: #EF4444;"></i>
                          <span style="font-size: 0.75rem; color: #EF4444; font-weight: 700;">Excluir</span>
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
    } else if (activeTab === 'agreements') {
      return `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-cyan);">Tabela de Convênios & TUSS</h3>
            <button class="btn-primary" id="btnOpenAddAgreementModal" style="font-size: 0.8rem;">
              <i data-lucide="credit-card" style="width: 15px; height: 15px;"></i>
              <span>+ Cadastrar Convênio / TUSS</span>
            </button>
          </div>

          <div class="table-wrapper">
            <table class="worklist-table">
              <thead>
                <tr>
                  <th>Código ID</th>
                  <th>Nome do Convênio</th>
                  <th>Código TUSS Padrão</th>
                  <th>Valor Base do Exame</th>
                  <th>Status</th>
                  <th>Ações CRUD</th>
                </tr>
              </thead>
              <tbody>
                ${state.customAgreements.map((c, i) => `
                  <tr>
                    <td><span style="font-family: monospace; color: var(--primary-cyan); font-weight: 700;">${c.id}</span></td>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.codeTuss}</td>
                    <td><strong style="color: var(--status-ready);">${c.price}</strong></td>
                    <td><span class="badge-status concluido">${c.status}</span></td>
                    <td>
                      <div class="action-btn-group">
                        <button class="btn-secondary btn-delete-agreement" data-index="${i}" data-name="${c.name}" title="Remover Convênio" style="background: rgba(239,68,68,0.15); border-color: #EF4444; padding: 6px 10px; display: flex; align-items: center; gap: 4px;">
                          <i data-lucide="trash-2" style="width: 15px; height: 15px; color: #EF4444;"></i>
                          <span style="font-size: 0.75rem; color: #EF4444; font-weight: 700;">Excluir</span>
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
    }
  }

  function renderFormModal() {
    if (modalState.type === 'add_patient' || modalState.type === 'edit_patient') {
      const isEdit = modalState.type === 'edit_patient';
      const item = modalState.item || {};

      return `
        <div class="modal-backdrop open" id="crudModalBackdrop">
          <div class="modal-card" style="max-width: 550px; width: 90%; display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan);">
                ${isEdit ? 'Editar Dados do Paciente' : 'Cadastrar Novo Paciente'}
              </h3>
              <button class="btn-icon" id="btnCloseCrudModal" style="width: 32px; height: 32px; background: rgba(255,255,255,0.1); border-color: var(--border-light);"><i data-lucide="x" style="width: 18px; height: 18px; color: #FFF;"></i></button>
            </div>

            <div class="form-group">
              <label>Nome Completo do Paciente:</label>
              <input type="text" id="mPatientName" class="form-select" value="${item.name || ''}" placeholder="Ex: ERICK LIMA">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <div class="form-group">
                <label>CPF do Paciente:</label>
                <input type="text" id="mPatientCpf" class="form-select" value="${item.id ? item.id.replace('CPF: ', '') : '123.456.789-00'}" placeholder="000.000.000-00">
              </div>

              <div class="form-group">
                <label>Telefone / WhatsApp:</label>
                <input type="text" id="mPatientPhone" class="form-select" value="${item.phone || '(11) 98888-0000'}">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <div class="form-group">
                <label>Idade / Nascimento:</label>
                <input type="text" id="mPatientAge" class="form-select" value="${item.age || '38 anos'}">
              </div>

              <div class="form-group">
                <label>Sexo Biológico:</label>
                <select id="mPatientGender" class="form-select">
                  <option value="M" ${item.gender === 'M' ? 'selected' : ''}>Masculino</option>
                  <option value="F" ${item.gender === 'F' ? 'selected' : ''}>Feminino</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Convênio Médico:</label>
              <select id="mPatientAgreement" class="form-select">
                <option value="Bradesco Saúde">Bradesco Saúde</option>
                <option value="Unimed Nacional">Unimed Nacional</option>
                <option value="SulAmérica Saúde">SulAmérica Saúde</option>
                <option value="SUS">SUS</option>
                <option value="Particular">Particular</option>
              </select>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
              <button class="btn-secondary" id="btnCancelCrudModal">Cancelar</button>
              <button class="btn-primary" id="btnSavePatientModal" style="background: var(--status-ready); border-color: var(--status-ready); font-weight: 700;">Salvar Paciente</button>
            </div>
          </div>
        </div>
      `;
    } else if (modalState.type === 'add_template' || modalState.type === 'edit_template') {
      const item = modalState.item || {};

      return `
        <div class="modal-backdrop open" id="crudModalBackdrop">
          <div class="modal-card" style="max-width: 600px; width: 90%; display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan);">Cadastrar / Editar Máscara de Laudo</h3>
              <button class="btn-icon" id="btnCloseCrudModal" style="width: 32px; height: 32px; background: rgba(255,255,255,0.1); border-color: var(--border-light);"><i data-lucide="x" style="width: 18px; height: 18px; color: #FFF;"></i></button>
            </div>

            <div class="form-group">
              <label>Título da Máscara de Laudo:</label>
              <input type="text" id="mTplName" class="form-select" value="${item.name || ''}" placeholder="Ex: Ultrassom de Carótidas Especial">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <div class="form-group">
                <label>Modalidade:</label>
                <select id="mTplModality" class="form-select">
                  <option value="US">Ultrassonografia (US)</option>
                  <option value="CT">Tomografia (TC)</option>
                  <option value="MR">Ressonância (RM)</option>
                  <option value="DX">Raio-X (RX)</option>
                  <option value="MG">Mamografia (MG)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Categoria:</label>
                <input type="text" id="mTplCategory" class="form-select" value="${item.category || 'Personalizados Clínica'}">
              </div>
            </div>

            <div class="form-group">
              <label>Texto da Técnica e Achados:</label>
              <textarea id="mTplFindings" class="form-select" style="height: 100px; font-family: monospace;">${item.findings || 'TÉCNICA:\nExame realizado com transdutor linear de alta frequência.\n\nACHADOS:\nEstruturas anatômicas preservadas.'}</textarea>
            </div>

            <div class="form-group">
              <label>Impressão Diagnóstica / Conclusão:</label>
              <input type="text" id="mTplImpression" class="form-select" value="${item.impression || 'Exame dentro dos padrões da normalidade.'}">
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
              <button class="btn-secondary" id="btnCancelCrudModal">Cancelar</button>
              <button class="btn-primary" id="btnSaveTemplateModal" style="background: var(--status-ready); border-color: var(--status-ready); font-weight: 700;">Salvar Máscara de Laudo</button>
            </div>
          </div>
        </div>
      `;
    } else if (modalState.type === 'add_doctor') {
      return `
        <div class="modal-backdrop open" id="crudModalBackdrop">
          <div class="modal-card" style="max-width: 500px; width: 90%; display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan);">Cadastrar Médico Radiologista</h3>
              <button class="btn-icon" id="btnCloseCrudModal" style="width: 32px; height: 32px; background: rgba(255,255,255,0.1); border-color: var(--border-light);"><i data-lucide="x" style="width: 18px; height: 18px; color: #FFF;"></i></button>
            </div>

            <div class="form-group">
              <label>Nome Completo do Médico:</label>
              <input type="text" id="mDoctorName" class="form-select" placeholder="Ex: Dr. Fernando Ramos">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <div class="form-group">
                <label>CRM e Estado:</label>
                <input type="text" id="mDoctorCrm" class="form-select" placeholder="CRM/SP 200.123">
              </div>

              <div class="form-group">
                <label>Especialidade:</label>
                <input type="text" id="mDoctorSpecialty" class="form-select" value="Radiologia & Diagnóstico por Imagem">
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
              <button class="btn-secondary" id="btnCancelCrudModal">Cancelar</button>
              <button class="btn-primary" id="btnSaveDoctorModal" style="background: var(--status-ready); border-color: var(--status-ready); font-weight: 700;">Salvar Médico</button>
            </div>
          </div>
        </div>
      `;
    } else if (modalState.type === 'add_agreement') {
      return `
        <div class="modal-backdrop open" id="crudModalBackdrop">
          <div class="modal-card" style="max-width: 500px; width: 90%; display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan);">Cadastrar Convênio / Tabela TUSS</h3>
              <button class="btn-icon" id="btnCloseCrudModal" style="width: 32px; height: 32px; background: rgba(255,255,255,0.1); border-color: var(--border-light);"><i data-lucide="x" style="width: 18px; height: 18px; color: #FFF;"></i></button>
            </div>

            <div class="form-group">
              <label>Nome do Convênio / Plano:</label>
              <input type="text" id="mAgreeName" class="form-select" placeholder="Ex: Porto Seguro Saúde">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <div class="form-group">
                <label>Código TUSS Padrão:</label>
                <input type="text" id="mAgreeTuss" class="form-select" placeholder="40901150">
              </div>

              <div class="form-group">
                <label>Valor Base do Exame (R$):</label>
                <input type="text" id="mAgreePrice" class="form-select" placeholder="R$ 300,00">
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
              <button class="btn-secondary" id="btnCancelCrudModal">Cancelar</button>
              <button class="btn-primary" id="btnSaveAgreementModal" style="background: var(--status-ready); border-color: var(--status-ready); font-weight: 700;">Salvar Convênio</button>
            </div>
          </div>
        </div>
      `;
    }
  }

  function attachTabEvents() {
    // Patients
    container.querySelector('#btnOpenAddPatientModal')?.addEventListener('click', () => {
      modalState = { type: 'add_patient' };
      render();
    });

    container.querySelectorAll('.btn-edit-patient').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        modalState = { type: 'edit_patient', index: idx, item: state.customPatients[idx] };
        render();
      });
    });

    container.querySelectorAll('.btn-delete-patient').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const name = btn.dataset.name;
        showConfirmDialog(
          "Confirmar Exclusão de Paciente",
          `Tem certeza que deseja excluir permanentemente o cadastro do paciente <strong>${name}</strong>?`,
          () => {
            state.customPatients.splice(idx, 1);
            savePatientsToStorage(state.customPatients);
            render();
            showToast(`O cadastro do paciente "${name}" foi excluído com sucesso.`, 'success');
          }
        );
      });
    });

    // Templates
    container.querySelector('#btnOpenAddTemplateModal')?.addEventListener('click', () => {
      modalState = { type: 'add_template' };
      render();
    });

    container.querySelectorAll('.btn-edit-template').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        modalState = { type: 'edit_template', index: idx, item: state.customTemplatesList[idx] };
        render();
      });
    });

    container.querySelectorAll('.btn-delete-template').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const name = btn.dataset.name;
        showConfirmDialog(
          "Confirmar Exclusão de Máscara de Laudo",
          `Tem certeza que deseja excluir a máscara de laudo <strong>"${name}"</strong>?`,
          () => {
            state.customTemplatesList.splice(idx, 1);
            saveTemplatesToStorage(state.customTemplatesList);
            render();
            showToast(`Máscara de laudo "${name}" excluída.`, 'success');
          }
        );
      });
    });

    // Doctors
    container.querySelector('#btnOpenAddDoctorModal')?.addEventListener('click', () => {
      modalState = { type: 'add_doctor' };
      render();
    });

    container.querySelectorAll('.btn-delete-doctor').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const name = btn.dataset.name;
        showConfirmDialog(
          "Confirmar Remoção de Médico",
          `Tem certeza que deseja remover o médico <strong>"${name}"</strong> do corpo clínico?`,
          () => {
            state.customDoctors.splice(idx, 1);
            saveDoctorsToStorage(state.customDoctors);
            render();
            showToast(`Médico "${name}" removido com sucesso.`, 'success');
          }
        );
      });
    });

    // Agreements
    container.querySelector('#btnOpenAddAgreementModal')?.addEventListener('click', () => {
      modalState = { type: 'add_agreement' };
      render();
    });

    container.querySelectorAll('.btn-delete-agreement').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const name = btn.dataset.name;
        showConfirmDialog(
          "Confirmar Exclusão de Convênio",
          `Tem certeza que deseja excluir o convênio <strong>"${name}"</strong> da tabela TUSS?`,
          () => {
            state.customAgreements.splice(idx, 1);
            saveAgreementsToStorage(state.customAgreements);
            render();
            showToast(`Convênio "${name}" excluído.`, 'success');
          }
        );
      });
    });
  }

  function attachModalEvents() {
    const closeModal = () => {
      modalState = null;
      render();
    };

    container.querySelector('#btnCloseCrudModal')?.addEventListener('click', closeModal);
    container.querySelector('#btnCancelCrudModal')?.addEventListener('click', closeModal);

    // Save Patient Modal
    container.querySelector('#btnSavePatientModal')?.addEventListener('click', () => {
      const name = container.querySelector('#mPatientName').value.trim();
      if (!name) {
        showToast("Por favor, informe o nome do paciente.", "warning");
        return;
      }

      const cpf = container.querySelector('#mPatientCpf').value.trim();
      const phone = container.querySelector('#mPatientPhone').value.trim();
      const age = container.querySelector('#mPatientAge').value.trim();
      const gender = container.querySelector('#mPatientGender').value;
      const agreement = container.querySelector('#mPatientAgreement').value;

      if (modalState.type === 'edit_patient' && modalState.index !== undefined) {
        state.customPatients[modalState.index] = {
          id: `CPF: ${cpf}`,
          name: name.toUpperCase(),
          age, gender, phone, agreement
        };
        showToast(`Dados do paciente ${name.toUpperCase()} atualizados!`, "success");
      } else {
        state.customPatients.unshift({
          id: `CPF: ${cpf}`,
          name: name.toUpperCase(),
          age, gender, phone, agreement
        });
        showToast(`Paciente ${name.toUpperCase()} cadastrado com sucesso!`, "success");
      }

      savePatientsToStorage(state.customPatients);
      closeModal();
    });

    // Save Template Modal
    container.querySelector('#btnSaveTemplateModal')?.addEventListener('click', () => {
      const name = container.querySelector('#mTplName').value.trim();
      if (!name) {
        showToast("Por favor, informe o título da máscara de laudo.", "warning");
        return;
      }

      const modality = container.querySelector('#mTplModality').value;
      const category = container.querySelector('#mTplCategory').value.trim();
      const findings = container.querySelector('#mTplFindings').value;
      const impression = container.querySelector('#mTplImpression').value;

      const newTpl = {
        key: `CUSTOM_${Date.now()}`,
        name, modality, category, findings, impression
      };

      if (modalState.type === 'edit_template' && modalState.index !== undefined) {
        state.customTemplatesList[modalState.index] = newTpl;
        showToast(`Máscara "${name}" atualizada!`, "success");
      } else {
        state.customTemplatesList.unshift(newTpl);
        MOCK_TEMPLATES[newTpl.key] = newTpl;
        showToast(`Máscara "${name}" criada com sucesso!`, "success");
      }

      saveTemplatesToStorage(state.customTemplatesList);
      closeModal();
    });

    // Save Doctor Modal
    container.querySelector('#btnSaveDoctorModal')?.addEventListener('click', () => {
      const name = container.querySelector('#mDoctorName').value.trim();
      if (!name) {
        showToast("Por favor, informe o nome do médico.", "warning");
        return;
      }

      const doc = {
        id: `MED-${state.customDoctors.length + 1}`,
        name,
        crm: container.querySelector('#mDoctorCrm').value || 'CRM/SP 000.000',
        specialty: container.querySelector('#mDoctorSpecialty').value
      };

      state.customDoctors.push(doc);
      saveDoctorsToStorage(state.customDoctors);
      showToast(`Médico ${name} cadastrado no corpo clínico!`, "success");
      closeModal();
    });

    // Save Agreement Modal
    container.querySelector('#btnSaveAgreementModal')?.addEventListener('click', () => {
      const name = container.querySelector('#mAgreeName').value.trim();
      if (!name) {
        showToast("Por favor, informe o nome do convênio.", "warning");
        return;
      }

      state.customAgreements.push({
        id: `CONV-${state.customAgreements.length + 1}`,
        name,
        codeTuss: container.querySelector('#mAgreeTuss').value || '40901100',
        price: container.querySelector('#mAgreePrice').value || 'R$ 200,00',
        status: 'ATIVO'
      });

      saveAgreementsToStorage(state.customAgreements);
      showToast(`Convênio ${name} cadastrado na tabela TUSS!`, "success");
      closeModal();
    });
  }

  render();
}
