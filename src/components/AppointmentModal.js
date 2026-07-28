// ==========================================================================
// NexusRad AI - Interactive Patient Appointment & TV Queue Modal
// High-Visibility Close Button (✕) & Automatic Icon Render
// ==========================================================================

import { showToast } from '../utils/toast.js';
import { createIcons, X } from 'lucide';

export function renderAppointmentModal(container, state, callbacks) {
  let form = {
    patientName: '',
    cpf: '',
    birthDate: '',
    modality: 'US',
    studyDescription: 'ULTRASSOM DE ABDÔMEN TOTAL',
    date: new Date().toISOString().slice(0, 10),
    time: '09:30',
    agreement: 'Bradesco Saúde',
    physician: 'Dr. Carlos Roberto de Mendonça'
  };

  const samplePatients = state.customPatients || [
    { name: "CARLOS ALBERTO RODRIGUES", cpf: "123.456.789-00", agreement: "Bradesco Saúde" },
    { name: "MARIA EDUARDA SILVA", cpf: "987.654.321-11", agreement: "Unimed Nacional" },
    { name: "ERICK LIMA", cpf: "444.555.666-77", agreement: "SulAmérica" }
  ];

  function refreshModalIcons() {
    createIcons({
      icons: { X }
    });
  }

  function render() {
    container.innerHTML = `
      <div class="modal-backdrop open" id="appointmentModalBackdrop">
        <div class="modal-card" style="max-width: 580px; width: 92%; display: flex; flex-direction: column; gap: 1.25rem; background: #0A0F1D; border: 1px solid var(--primary-cyan); box-shadow: 0 0 30px rgba(0, 229, 255, 0.25);">
          
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary-cyan);">
                📅 Novo Agendamento de Exame
              </h3>
              <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                Agendar atendimento de paciente com emissão de senha para o Painel TV da Recepção.
              </p>
            </div>

            <!-- Crisp Visible Close Button (✕) -->
            <button class="btn-icon modal-close-btn" id="btnCloseApptModal" title="Fechar Janela" style="background: rgba(255, 255, 255, 0.08); border: 1px solid var(--border-light); color: #FFF; font-size: 1.2rem; font-weight: 700; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: rgba(0, 229, 255, 0.05); border: 1px solid var(--primary-cyan); padding: 0.75rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.4rem;">
              <label style="font-size: 0.75rem; font-weight: 700; color: var(--primary-cyan);">
                Buscar Paciente do Banco de Dados:
              </label>
              <select id="appSelectPatient" class="form-select">
                <option value="">-- Selecionar Paciente ou Digitar Abaixo --</option>
                ${samplePatients.map((p, i) => `
                  <option value="${i}">👤 ${p.name} (${p.cpf || 'Sem CPF'})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>NOME COMPLETO DO PACIENTE:</label>
              <input type="text" id="appPatientName" class="form-select" value="${form.patientName}" placeholder="Ex: ERICK LIMA">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label>MODALIDADE:</label>
                <select id="appModality" class="form-select">
                  <option value="US">US — Ultrassonografia</option>
                  <option value="CT">CT — Tomografia</option>
                  <option value="MR">MR — Ressonância</option>
                  <option value="DX">DX — Raio-X</option>
                  <option value="MG">MG — Mamografia</option>
                </select>
              </div>

              <div class="form-group">
                <label>CONVÊNIO:</label>
                <select id="appAgreement" class="form-select">
                  <option value="Bradesco Saúde">Bradesco Saúde</option>
                  <option value="Unimed Nacional">Unimed Nacional</option>
                  <option value="SulAmérica Saúde">SulAmérica Saúde</option>
                  <option value="SUS">SUS</option>
                  <option value="Particular">Particular</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>PROCEDIMENTO / EXAME:</label>
              <input type="text" id="appStudyDescription" class="form-select" value="${form.studyDescription}">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label>DATA DO AGENDAMENTO:</label>
                <input type="date" id="appDate" class="form-select" value="${form.date}">
              </div>

              <div class="form-group">
                <label>HORÁRIO PREVISTO:</label>
                <input type="time" id="appTime" class="form-select" value="${form.time}">
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
            <button class="btn-secondary" id="btnCancelAppt">Cancelar</button>
            <button class="btn-primary" id="btnSaveAppt" style="background: var(--status-ready); border-color: var(--status-ready); font-weight: 700;">
              Confirmar Agendamento & Emitir Senha
            </button>
          </div>

        </div>
      </div>
    `;

    container.querySelector('#btnCloseApptModal')?.addEventListener('click', closeModal);
    container.querySelector('#btnCancelAppt')?.addEventListener('click', closeModal);

    container.querySelector('#appSelectPatient')?.addEventListener('change', (e) => {
      const idx = e.target.value;
      if (idx !== "") {
        const p = samplePatients[idx];
        container.querySelector('#appPatientName').value = p.name;
        if (p.agreement) container.querySelector('#appAgreement').value = p.agreement;
      }
    });

    container.querySelector('#btnSaveAppt')?.addEventListener('click', () => {
      const name = container.querySelector('#appPatientName').value.trim();
      if (!name) {
        showToast("Por favor, informe o nome do paciente.", "warning");
        return;
      }

      const mod = container.querySelector('#appModality').value;
      const desc = container.querySelector('#appStudyDescription').value.trim();
      const dt = container.querySelector('#appDate').value;
      const tm = container.querySelector('#appTime').value;
      const ag = container.querySelector('#appAgreement').value;

      const newStudy = {
        id: `EX-${Math.floor(10000 + Math.random() * 90000)}`,
        patientName: name.toUpperCase(),
        patientId: `CPF: ${Math.floor(100 + Math.random()*899)}.${Math.floor(100 + Math.random()*899)}.${Math.floor(100 + Math.random()*899)}-00`,
        age: "42a",
        gender: "M",
        modality: mod,
        studyDescription: desc.toUpperCase(),
        date: `${dt} ${tm}`,
        modalitiesInStudy: [mod],
        seriesCount: 1,
        instanceCount: 1,
        status: "agendado",
        urgency: "media",
        physician: "Dr. Carlos Roberto de Mendonça",
        institution: "NEXUSRAD DIAGNÓSTICO POR IMAGEM",
        accessionNumber: `ACC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        agreement: ag
      };

      if (state.studies) {
        state.studies.unshift(newStudy);
      }

      showToast(`Agendamento de ${name.toUpperCase()} realizado com sucesso!`, "success");
      closeModal();

      if (callbacks.onAppointmentSaved) callbacks.onAppointmentSaved(newStudy);
    });

    refreshModalIcons();
  }

  function closeModal() {
    const backdrop = container.querySelector('#appointmentModalBackdrop');
    if (backdrop) backdrop.remove();
  }

  render();
}
