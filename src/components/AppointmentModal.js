// ==========================================================================
// NexusRad AI - Interactive Appointment Scheduling Modal Component
// ==========================================================================

import { formatCPF, validateCPF, calculateAge } from '../utils/cpfValidator.js';

export function renderAppointmentModal(container, state, callbacks) {
  let form = {
    patientName: '',
    cpf: '',
    phone: '',
    birthDate: '',
    calculatedAge: '',
    agreement: 'Bradesco Saúde',
    modality: 'US',
    examType: 'ULTRASSOM DE ABDÔMEN TOTAL',
    date: new Date().toISOString().slice(0, 10),
    time: '14:30',
    room: 'Sala 1 - Ultrassonografia 4D'
  };

  if (!state.appointmentsList) {
    state.appointmentsList = [];
  }

  function render() {
    container.innerHTML = `
      <div class="modal-backdrop open" id="appointmentModalBackdrop">
        <div class="modal-card" style="max-width: 650px; width: 92%; display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
            <div>
              <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="calendar"></i>
                Agendar Novo Exame / Consulta — Recepção
              </h2>
              <span style="font-size: 0.75rem; color: var(--text-muted);">
                Ao agendar, o paciente entra na Fila da Recepção e na Worklist do Médico Radiologista.
              </span>
            </div>
            <button class="btn-icon" id="btnCloseAppModal" style="width: 28px; height: 28px;">
              <i data-lucide="x" style="width: 16px; height: 16px;"></i>
            </button>
          </div>

          <!-- Form Body -->
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            
            <!-- Database Search Dropdown -->
            <div style="background: rgba(0,229,255,0.05); border: 1px solid var(--primary-cyan); padding: 0.75rem 1rem; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 0.5rem;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.35rem;">
                <i data-lucide="search" style="width: 14px; height: 14px;"></i>
                Buscar Paciente Cadastrado no Banco:
              </label>
              <select id="appDbPatientSelect" class="form-select">
                <option value="">-- Selecionar do Banco de Dados ou Cadastrar Abaixo --</option>
                ${(state.customPatients || []).map(p => `
                  <option value="${p.id}">${p.name} (${p.id})</option>
                `).join('')}
              </select>
            </div>

            <!-- Patient Info -->
            <div class="form-group">
              <label style="font-size: 0.8rem; font-weight: 700;">Nome Completo do Paciente:</label>
              <input type="text" id="appPatientName" class="form-select" placeholder="Ex: JOÃO DA SILVA ALMEIDA" value="${form.patientName}" required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label style="font-size: 0.8rem; font-weight: 700;">CPF do Paciente:</label>
                <input type="text" id="appCpf" class="form-select" placeholder="000.000.000-00" value="${form.cpf}" maxlength="14">
              </div>

              <div class="form-group">
                <label style="font-size: 0.8rem; font-weight: 700;">Celular / WhatsApp:</label>
                <input type="text" id="appPhone" class="form-select" placeholder="(11) 98888-7766" value="${form.phone}">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label style="font-size: 0.8rem;">Data de Agendamento:</label>
                <input type="date" id="appDate" class="form-select" value="${form.date}">
              </div>

              <div class="form-group">
                <label style="font-size: 0.8rem;">Horário:</label>
                <input type="time" id="appTime" class="form-select" value="${form.time}">
              </div>

              <div class="form-group">
                <label style="font-size: 0.8rem;">Convênio Médico:</label>
                <select id="appAgreement" class="form-select">
                  <option value="Bradesco Saúde">Bradesco Saúde</option>
                  <option value="Unimed Nacional">Unimed Nacional</option>
                  <option value="SulAmérica Saúde">SulAmérica Saúde</option>
                  <option value="Amil Assistência Médica">Amil Assistência Médica</option>
                  <option value="SUS">SUS - Sistema Único de Saúde</option>
                  <option value="Particular">Particular / Dinheiro</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label style="font-size: 0.8rem; font-weight: 700;">Tipo de Exame / Procedimento:</label>
                <select id="appExamType" class="form-select">
                  <option value="ULTRASSOM DE ABDÔMEN TOTAL">ULTRASSOM DE ABDÔMEN TOTAL</option>
                  <option value="ULTRASSOM OBSTÉTRICO COM DOPPLER">ULTRASSOM OBSTÉTRICO COM DOPPLER</option>
                  <option value="ULTRASSOM PÉLVICO TRANSVAGINAL">ULTRASSOM PÉLVICO TRANSVAGINAL</option>
                  <option value="TC DE TÓRAX COM CONTRASTE">TC DE TÓRAX COM CONTRASTE</option>
                  <option value="RAIO-X DE TÓRAX PA E PERFIL">RAIO-X DE TÓRAX PA E PERFIL</option>
                </select>
              </div>

              <div class="form-group">
                <label style="font-size: 0.8rem; font-weight: 700;">Sala / Equipamento:</label>
                <select id="appRoom" class="form-select">
                  <option value="Sala 1 - Ultrassonografia 4D">Sala 1 - Ultrassonografia 4D</option>
                  <option value="Sala 2 - Tomografia Computadorizada">Sala 2 - Tomografia Computadorizada</option>
                  <option value="Sala 3 - Raio-X Digital">Sala 3 - Raio-X Digital</option>
                  <option value="Sala 4 - Ressonância Magnética 1.5T">Sala 4 - Ressonância Magnética 1.5T</option>
                </select>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
            <button class="btn-secondary" id="btnCancelAppModal">Cancelar</button>
            <button class="btn-primary" id="btnSaveAppointment" style="background: var(--status-ready); border-color: var(--status-ready); font-weight: 700;">
              <i data-lucide="check-circle-2" style="width: 16px; height: 16px;"></i>
              <span>Confirmar Agendamento</span>
            </button>
          </div>

        </div>
      </div>
    `;

    const backdrop = container.querySelector('#appointmentModalBackdrop');
    const closeModal = () => backdrop.remove();

    container.querySelector('#btnCloseAppModal').addEventListener('click', closeModal);
    container.querySelector('#btnCancelAppModal').addEventListener('click', closeModal);

    // Database Search Dropdown Listener
    container.querySelector('#appDbPatientSelect')?.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      if (selectedId) {
        const found = (state.customPatients || []).find(p => p.id === selectedId);
        if (found) {
          form.patientName = found.name;
          form.cpf = found.id.replace('CPF: ', '');
          form.phone = found.phone || '(11) 98888-0000';
          form.agreement = found.agreement || 'Bradesco Saúde';
          render();
        }
      }
    });

    container.querySelector('#appCpf')?.addEventListener('input', (e) => {
      form.cpf = formatCPF(e.target.value);
      e.target.value = form.cpf;
    });

    container.querySelector('#btnSaveAppointment').addEventListener('click', () => {
      const name = container.querySelector('#appPatientName').value.trim();
      if (!name) {
        alert("⚠️ Por favor, informe o nome do paciente para agendar.");
        return;
      }

      form.patientName = name.toUpperCase();
      form.cpf = container.querySelector('#appCpf').value;
      form.phone = container.querySelector('#appPhone').value;
      form.date = container.querySelector('#appDate').value;
      form.time = container.querySelector('#appTime').value;
      form.agreement = container.querySelector('#appAgreement').value;
      form.examType = container.querySelector('#appExamType').value;
      form.room = container.querySelector('#appRoom').value;

      const studyId = `EX-${Math.floor(10000 + Math.random() * 90000)}`;

      const newApp = {
        id: `AG-${Math.floor(10000 + Math.random() * 90000)}`,
        studyId: studyId,
        patientName: form.patientName,
        cpf: form.cpf || '000.000.000-00',
        patientId: `CPF: ${form.cpf || '000.000.000-00'}`,
        phone: form.phone || '(11) 98888-0000',
        time: `${form.time}`,
        date: form.date,
        examType: form.examType,
        exam: form.examType,
        modality: "US",
        room: form.room,
        agreement: form.agreement,
        status: "AGENDADO",
        accessionNumber: `ACC-2026-${Math.floor(10000 + Math.random() * 90000)}`
      };

      state.appointmentsList.unshift(newApp);

      // AUTOMATICALLY CREATE STUDY IN WORKLIST RIS (state.studies)
      const newStudy = {
        id: studyId,
        patientName: form.patientName,
        patientId: `CPF: ${form.cpf || '000.000.000-00'}`,
        age: "42a",
        gender: "M",
        modality: "US",
        studyDescription: form.examType,
        date: `${form.date} ${form.time}`,
        modalitiesInStudy: ["US"],
        seriesCount: 1,
        instanceCount: 1,
        status: "pronto",
        urgency: "normal",
        physician: "Dr. Plantonista Radiologia",
        institution: "NEXUSRAD DIAGNÓSTICO POR IMAGEM",
        accessionNumber: newApp.accessionNumber,
        capturedFrames: []
      };

      state.studies.unshift(newStudy);
      if (state.filteredStudies) {
        state.filteredStudies.unshift(newStudy);
      }

      closeModal();
      alert(`✅ Agendamento de ${form.patientName} realizado com sucesso!\n\n1. Entrou na Tabela da Recepção (Menu Agenda).\n2. Criado na Fila Worklist RIS do Médico Radiologista.`);
      
      if (callbacks.onAppointmentSaved) {
        callbacks.onAppointmentSaved(newApp);
      }
    });
  }

  render();
}
