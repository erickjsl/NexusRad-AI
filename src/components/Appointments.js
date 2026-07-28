// ==========================================================================
// NexusRad AI - Appointments, Reception & Text-to-Speech Voice Call
// ==========================================================================

import jsPDF from 'jspdf';
import { renderAppointmentModal } from './AppointmentModal.js';

export function renderAppointments(container, state, callbacks) {
  let appointments = state.appointmentsList || [];

  if (appointments.length === 0) {
    appointments = state.studies.map((s, idx) => ({
      id: `AG-${1000 + idx}`,
      time: `10:${(idx * 15).toString().padStart(2, '0')}`,
      patientName: s.patientName,
      patientId: s.patientId,
      modality: s.modality,
      exam: s.studyDescription,
      physician: s.physician,
      status: s.status === 'concluido' ? 'concluido' : (idx === 0 ? 'em_atendimento' : 'aguardando'),
      accessionNumber: s.accessionNumber,
      studyId: s.id,
      room: idx % 2 === 0 ? 'Sala 1 - Ultrassonografia 4D' : 'Sala 2 - Raio-X / Tomografia'
    }));
  }

  function render() {
    container.innerHTML = `
      <div class="worklist-container">
        <div class="worklist-header-row">
          <div class="worklist-title-group">
            <h1>
              <i data-lucide="calendar" style="color: var(--primary-cyan)"></i>
              Recepção, Agendamento & Painel TV de Convocação
            </h1>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Gestão da fila de espera da recepção, agendamento de consultas/exames e chamada por voz na TV.
            </p>
          </div>

          <button class="btn-primary" id="btnNewAppointment" style="font-size: 0.8rem; background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); border: none;">
            <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
            <span>+ Novo Agendamento</span>
          </button>
        </div>

        <!-- Reception Stats -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
          <div class="glass-card" style="padding: 0.75rem 1rem;">
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Agendados Hoje</div>
            <div style="font-size: 1.2rem; font-weight: 700; color: #FFF;">${appointments.length} Pacientes</div>
          </div>

          <div class="glass-card" style="padding: 0.75rem 1rem;">
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Na Recepção / Espera</div>
            <div style="font-size: 1.2rem; font-weight: 700; color: var(--status-pending);">2 Pacientes</div>
          </div>

          <div class="glass-card" style="padding: 0.75rem 1rem;">
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Em Atendimento</div>
            <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-cyan);">1 Paciente</div>
          </div>

          <div class="glass-card" style="padding: 0.75rem 1rem;">
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Atendimentos Concluídos</div>
            <div style="font-size: 1.2rem; font-weight: 700; color: var(--status-ready);">${appointments.filter(a => a.status === 'concluido').length} Pacientes</div>
          </div>
        </div>

        <!-- Appointments Table -->
        <div class="table-wrapper">
          <table class="worklist-table">
            <thead>
              <tr>
                <th>Horário / Data</th>
                <th>Paciente & Prontuário</th>
                <th>Exame / Procedimento Agendado</th>
                <th>Sala de Destino</th>
                <th>Status Recepção</th>
                <th>Ações da Recepção</th>
              </tr>
            </thead>
            <tbody>
              ${appointments.map(app => `
                <tr>
                  <td><strong style="color: var(--primary-cyan); font-family: monospace;">${app.time}</strong></td>
                  <td>
                    <div class="patient-info">
                      <span class="patient-name">${app.patientName}</span>
                      <span class="patient-sub">${app.cpf || app.patientId}</span>
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 500;">${app.examType || app.exam}</div>
                    <span class="badge-modality US">US</span>
                  </td>
                  <td><span style="font-size: 0.85rem; color: var(--primary-cyan); font-weight: 600;">${app.room}</span></td>
                  <td>
                    <span class="badge-status ${app.status === 'concluido' ? 'concluido' : (app.status === 'em_atendimento' ? 'laudando' : 'pronto')}">
                      ${app.status === 'concluido' ? 'CONCLUÍDO' : (app.status === 'em_atendimento' ? 'EM SALA DE EXAME' : 'AGENDADO')}
                    </span>
                  </td>
                  <td>
                    <div class="action-btn-group">
                      <button class="btn-secondary btn-print-ticket" data-id="${app.studyId || app.id}" title="Imprimir Comprovante de Atendimento">
                        <i data-lucide="printer" style="width: 14px; height: 14px;"></i>
                        <span>Comprovante</span>
                      </button>
                      <button class="btn-primary btn-call-patient" data-id="${app.studyId || app.id}" data-name="${app.patientName}" data-room="${app.room}" title="Chamar Paciente no Painel por Voz Sintetizada">
                        <i data-lucide="radio-receiver" style="width: 14px; height: 14px;"></i>
                        <span>🔊 Chamar no Painel</span>
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

    // Attach button events
    container.querySelectorAll('.btn-print-ticket').forEach(btn => {
      btn.addEventListener('click', () => {
        const study = state.studies.find(s => s.id === btn.dataset.id) || {
          patientName: "PACIENTE AGENDADO",
          studyDescription: "ULTRASSOM AGENDADO",
          accessionNumber: "ACC-2026-90123",
          id: btn.dataset.id
        };
        printProtocolTicket(study);
      });
    });

    container.querySelectorAll('.btn-call-patient').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const room = btn.dataset.room;
        speakPatientCall(name, room);
      });
    });

    container.querySelector('#btnNewAppointment')?.addEventListener('click', () => {
      renderAppointmentModal(document.querySelector('#modalContainer'), state, {
        onAppointmentSaved: () => {
          render();
        }
      });
    });
  }

  render();
}

function speakPatientCall(patientName, roomName) {
  const text = `Atenção paciente ${patientName}, por favor dirigir-se à ${roomName}.`;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  alert(`📢 PAINEL DE TV DA RECEPÇÃO:\n"${text}"`);
}

function printProtocolTicket(study) {
  const doc = new jsPDF({ format: [80, 140], unit: 'mm' });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 150, 200);
  doc.text("NEXUSRAD DIAGNÓSTICO", 40, 10, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50);
  doc.text("COMPROVANTE DE ATENDIMENTO", 40, 15, { align: "center" });
  doc.line(5, 18, 75, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(`PACIENTE:`, 5, 25);
  doc.setFont("helvetica", "normal");
  doc.text(study.patientName, 5, 30);

  doc.setFont("helvetica", "bold");
  doc.text(`EXAME:`, 5, 38);
  doc.setFont("helvetica", "normal");
  doc.text(study.studyDescription, 5, 43);

  doc.setFont("helvetica", "bold");
  doc.text(`CHAVE DE ACESSO ONLINE:`, 5, 52);
  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 150, 200);
  doc.text(study.accessionNumber || "ACC-2026-90123", 5, 58);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.line(5, 64, 75, 64);
  doc.text("Consulte seu laudo e imagens em:", 40, 70, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text("http://127.0.0.1:3000/#/portal/" + (study.id || 'EX-101'), 40, 75, { align: "center" });

  doc.save(`Protocolo_Recepcao_${study.patientName.replace(/\s+/g, '_')}.pdf`);
}
