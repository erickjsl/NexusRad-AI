// ==========================================================================
// NexusRad AI - Enterprise CRUD Management System (Pacientes, Laudos, Médicos, Convênios)
// ==========================================================================

import { MOCK_TEMPLATES } from '../data/mockData.js';

export function renderCrudManagement(container, state, callbacks) {
  let activeTab = 'patients'; // 'patients' | 'templates' | 'doctors' | 'agreements'

  // Editable lists in state or local
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

  if (!state.customTemplates) {
    state.customTemplates = Object.entries(MOCK_TEMPLATES).map(([key, tpl]) => ({
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

  function render() {
    container.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; padding: 1.5rem; overflow-y: auto; gap: 1.25rem;">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; color: #FFF;">
              <i data-lucide="folder-open" style="color: var(--primary-cyan)"></i>
              Central de Cadastros & Gestão CRUD do Sistema
            </h1>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Gerenciamento completo de Pacientes, Modelos de Laudos, Corpo Médico Radiologista e Convênios.
            </p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
          <button class="btn-secondary nav-crud-tab ${activeTab === 'patients' ? 'active' : ''}" data-tab="patients" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
            <i data-lucide="user" style="width: 16px; height: 16px;"></i>
            <span>👤 Cadastro de Pacientes (${state.customPatients.length})</span>
          </button>

          <button class="btn-secondary nav-crud-tab ${activeTab === 'templates' ? 'active' : ''}" data-tab="templates" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
            <i data-lucide="file-check-2" style="width: 16px; height: 16px;"></i>
            <span>📝 Cadastro de Modelos de Laudos (${state.customTemplates.length})</span>
          </button>

          <button class="btn-secondary nav-crud-tab ${activeTab === 'doctors' ? 'active' : ''}" data-tab="doctors" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
            <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
            <span>👨‍⚕️ Corpo Médico Laudador (${state.customDoctors.length})</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div id="crudTabContainer">
          ${renderActiveTabContent()}
        </div>

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
  }

  function renderActiveTabContent() {
    if (activeTab === 'patients') {
      return `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-cyan);">Lista de Pacientes Cadastrados</h3>
            <button class="btn-primary" id="btnAddPatient" style="font-size: 0.8rem;">
              <i data-lucide="user-plus" style="width: 14px; height: 14px;"></i>
              <span>+ Novo Paciente</span>
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
                    <td><span style="font-family: monospace; color: var(--primary-cyan);">${p.id}</span></td>
                    <td>${p.age} / ${p.gender}</td>
                    <td>${p.phone}</td>
                    <td><span class="badge-status concluido">${p.agreement}</span></td>
                    <td>
                      <div class="action-btn-group">
                        <button class="btn-secondary btn-edit-patient" data-index="${i}" title="Editar Dados do Paciente">
                          <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
                        </button>
                        <button class="btn-secondary btn-delete-patient" data-index="${i}" title="Excluir Paciente" style="color: #EF4444;">
                          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
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
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-cyan);">Cadastrar & Editar Modelos de Laudo</h3>
            <button class="btn-primary" id="btnAddTemplate" style="font-size: 0.8rem;">
              <i data-lucide="file-text" style="width: 14px; height: 14px;"></i>
              <span>+ Criar Novo Modelo de Laudo</span>
            </button>
          </div>

          <div class="table-wrapper">
            <table class="worklist-table">
              <thead>
                <tr>
                  <th>Nome do Modelo de Laudo</th>
                  <th>Categoria</th>
                  <th>Modalidade</th>
                  <th>Pré-visualização do Texto</th>
                  <th>Ações CRUD</th>
                </tr>
              </thead>
              <tbody>
                ${state.customTemplates.map((t, i) => `
                  <tr>
                    <td><strong>${t.name}</strong></td>
                    <td><span class="badge-status concluido">${t.category}</span></td>
                    <td><span class="badge-modality ${t.modality}">${t.modality}</span></td>
                    <td><div style="font-size: 0.75rem; color: var(--text-muted); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.impression}</div></td>
                    <td>
                      <div class="action-btn-group">
                        <button class="btn-secondary btn-edit-template" data-index="${i}" title="Editar Modelo de Laudo">
                          <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
                        </button>
                        <button class="btn-secondary btn-delete-template" data-index="${i}" title="Excluir Modelo" style="color: #EF4444;">
                          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
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
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-cyan);">Corpo Médico Laudador</h3>
            <button class="btn-primary" id="btnAddDoctor" style="font-size: 0.8rem;">
              <i data-lucide="user-plus" style="width: 14px; height: 14px;"></i>
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
                    <td><span style="font-family: monospace; color: var(--primary-cyan);">${d.id}</span></td>
                    <td><strong>${d.name}</strong></td>
                    <td>${d.crm}</td>
                    <td>${d.specialty}</td>
                    <td>
                      <div class="action-btn-group">
                        <button class="btn-secondary btn-delete-doctor" data-index="${i}" title="Remover Médico" style="color: #EF4444;">
                          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
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

  function attachTabEvents() {
    // Add Patient Form Modal
    container.querySelector('#btnAddPatient')?.addEventListener('click', () => {
      const name = prompt("Nome completo do novo paciente:");
      if (name) {
        const cpf = prompt("CPF do paciente:", "088.000.111-99");
        state.customPatients.unshift({
          id: `CPF: ${cpf || '000.000.000-00'}`,
          name: name.toUpperCase(),
          age: "35a",
          gender: "F",
          phone: "(11) 98888-0000",
          agreement: "Bradesco Saúde"
        });
        render();
        alert(`✅ Paciente ${name} cadastrado com sucesso!`);
      }
    });

    // Delete Patient
    container.querySelectorAll('.btn-delete-patient').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        state.customPatients.splice(index, 1);
        render();
      });
    });

    // Add Template Modal Form
    container.querySelector('#btnAddTemplate')?.addEventListener('click', () => {
      const title = prompt("Título da nova máscara de laudo (ex: Ultrassom de Carótidas Especial):");
      if (title) {
        const findings = prompt("Texto dos Achados da Técnica:", "TÉCNICA:\nExame realizado com transdutor linear.\n\nACHADOS:\nEstruturas dentro da normalidade.");
        const impression = prompt("Conclusão Diagnóstica:", "Exame normal.");

        const newKey = `CUSTOM_${Date.now()}`;
        const newTpl = {
          key: newKey,
          name: title,
          modality: "US",
          category: "Personalizados Clínica",
          findings: findings || "Exame sem alterações.",
          impression: impression || "Exame normal."
        };

        state.customTemplates.unshift(newTpl);
        MOCK_TEMPLATES[newKey] = newTpl;
        render();
        alert(`✅ Modelo de Laudo "${title}" cadastrado com sucesso na biblioteca!`);
      }
    });

    // Delete Template
    container.querySelectorAll('.btn-delete-template').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        const item = state.customTemplates[index];
        if (item) {
          delete MOCK_TEMPLATES[item.key];
          state.customTemplates.splice(index, 1);
          render();
        }
      });
    });

    // Add Doctor
    container.querySelector('#btnAddDoctor')?.addEventListener('click', () => {
      const name = prompt("Nome completo do médico radiologista:");
      if (name) {
        const crm = prompt("CRM / UF:", "CRM/SP 200.123");
        state.customDoctors.push({
          id: `MED-${state.customDoctors.length + 1}`,
          name: name,
          crm: crm || "CRM/SP 000.000",
          specialty: "Radiologia & Diagnóstico por Imagem"
        });
        render();
        alert(`✅ Médico ${name} cadastrado com sucesso!`);
      }
    });

    // Delete Doctor
    container.querySelectorAll('.btn-delete-doctor').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        state.customDoctors.splice(index, 1);
        render();
      });
    });
  }

  render();
}
