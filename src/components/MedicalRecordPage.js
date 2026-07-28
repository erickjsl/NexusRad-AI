// ==========================================================================
// NexusRad AI - Complete Patient Medical Record & Referring Physician Hub
// Prontuário Médico Eletrônico, Histórico Clínico & Central do Médico
// ==========================================================================

export function renderMedicalRecordPage(container, study, studiesList, callbacks) {
  const patientName = study ? study.patientName : "ERICK LIMA";
  const patientCpf = study ? study.patientId : "CPF: 123.456.789-00";
  const patientAge = study ? study.age : "38 anos";
  const patientGender = study ? study.gender : "M";

  // Filter all studies belonging to this patient
  const patientExams = studiesList.filter(s => 
    s.patientName.toLowerCase().includes(patientName.toLowerCase().split(' ')[0]) ||
    s.patientId === patientCpf
  );

  if (patientExams.length === 0 && study) {
    patientExams.push(study);
  }

  container.innerHTML = `
    <div style="flex: 1; display: flex; flex-direction: column; padding: 1.5rem; overflow-y: auto; gap: 1.25rem; background: var(--bg-dark);">
      
      <!-- Top Action Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button class="btn-secondary" id="btnBackFromMedicalRecord" style="font-size: 0.8rem;">
          <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
          <span>Voltar para a Worklist</span>
        </button>

        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-secondary" id="btnPrintRecord" style="font-size: 0.8rem;">
            <i data-lucide="printer" style="width: 16px; height: 16px;"></i>
            <span>Imprimir Prontuário Completo</span>
          </button>
          <button class="btn-primary" id="btnDoctorPortalShare" style="font-size: 0.8rem;">
            <i data-lucide="share-2" style="width: 16px; height: 16px;"></i>
            <span>Enviar Acesso ao Médico Solicitante</span>
          </button>
        </div>
      </div>

      <!-- Patient Header Banner -->
      <div class="glass-card" style="padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(0, 229, 255, 0.08)); border-color: var(--primary-cyan);">
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary-cyan-soft); border: 2px solid var(--primary-cyan); display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
            👨‍🦱
          </div>
          <div>
            <div style="font-size: 1.35rem; font-weight: 700; color: #FFF;">${patientName}</div>
            <div style="font-size: 0.85rem; color: var(--primary-cyan); font-weight: 600;">
              ${patientCpf} • Sexo: ${patientGender} • Idade: ${patientAge}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
              Prontuário Digital Geral ID: <strong>PRON-2026-${Math.floor(1000 + Math.random() * 9000)}</strong>
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;">
          <span class="badge-status concluido">PRONTUÁRIO ATIVO</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Histórico Clínico Unificado</span>
        </div>
      </div>

      <!-- Grid Layout: Medical History & Exams Timeline -->
      <div style="display: grid; grid-template-columns: 1.8fr 1fr; gap: 1.25rem;">
        
        <!-- Left: Exams Timeline & Medical Files -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          
          <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.4rem;">
              <i data-lucide="history" style="width: 18px; height: 18px;"></i>
              Linha do Tempo de Exames do Paciente (${patientExams.length})
            </h3>

            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${patientExams.map((ex, idx) => `
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem; display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${ex.date} • Acc#: <span style="color: var(--primary-cyan);">${ex.accessionNumber}</span></div>
                    <div style="font-size: 1rem; font-weight: 700; color: #FFF; margin-top: 2px;">${ex.studyDescription}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Médico Solicitante: ${ex.physician}</div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="badge-modality ${ex.modality}">${ex.modality}</span>
                    <button class="btn-primary btn-open-exam-viewer" data-id="${ex.id}" style="font-size: 0.75rem; padding: 0.35rem 0.75rem;">
                      <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
                      <span>Abrir Imagens</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Medical Evolution Notes -->
          <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.4rem;">
              <i data-lucide="file-text" style="width: 18px; height: 18px;"></i>
              Evolução Clínica & Anamnese Registrada
            </h3>

            <div style="font-size: 0.85rem; color: var(--text-main); background: rgba(0,0,0,0.3); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light); line-height: 1.6;">
              <strong>ANAMNESE E MOTIVO DO EXAME:</strong><br>
              Paciente refere dor em hipocôndrio direito com irradiação epigástrica iniciada há 3 dias. Negou febre ou icterícia prévia. Exames de imagem anteriores sem alterações significativas.<br><br>
              <strong>ANTECEDENTES PESSOAIS:</strong> Hipertensão arterial sistêmica controlada. Sem alergias conhecidas a contraste iodado.
            </div>
          </div>

        </div>

        <!-- Right: Referring Doctor Info & Quick Portal Access -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Referring Doctor Card -->
          <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.4rem;">
              <i data-lucide="user-check" style="width: 16px; height: 16px;"></i>
              Central do Médico Solicitante
            </h3>

            <div style="font-size: 0.85rem; color: var(--text-main);">
              <div><strong>Médico Assistente:</strong> Dr. Fernando Ramos</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">CRM/SP 142.990 • Clínica Geral</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">WhatsApp: (11) 99888-0000</div>
            </div>

            <button class="btn-primary" id="btnSendDoctorWhatsapp" style="font-size: 0.75rem; width: 100%; margin-top: 0.5rem; background: #10B981; border-color: #10B981;">
              <i data-lucide="send" style="width: 14px; height: 14px;"></i>
              <span>Enviar Link do Laudo no WhatsApp do Médico</span>
            </button>
          </div>

          <!-- Patient Credentials & Access Key -->
          <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.4rem;">
              <i data-lucide="key" style="width: 16px; height: 16px;"></i>
              Chave de Acesso Online do Paciente
            </h3>

            <div style="background: #000; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-active); text-align: center;">
              <div style="font-size: 0.65rem; color: var(--text-muted);">CÓDIGO DE ACESSO WEB:</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary-cyan); font-family: monospace;">${study ? study.accessionNumber : 'ACC-2026-90416'}</div>
            </div>

            <button class="btn-secondary" id="btnGoPatientPortalView" style="font-size: 0.75rem; width: 100%;">
              <i data-lucide="globe" style="width: 14px; height: 14px;"></i>
              <span>Abrir Portal Web do Paciente</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  `;

  // Attach event listeners
  container.querySelector('#btnBackFromMedicalRecord')?.addEventListener('click', () => {
    if (callbacks.onBack) callbacks.onBack();
  });

  container.querySelectorAll('.btn-open-exam-viewer').forEach(btn => {
    btn.addEventListener('click', () => {
      const examId = btn.dataset.id;
      if (callbacks.onOpenViewer) callbacks.onOpenViewer(examId);
    });
  });

  container.querySelector('#btnGoPatientPortalView')?.addEventListener('click', () => {
    if (callbacks.onOpenPortal) callbacks.onOpenPortal(study ? study.id : null);
  });

  container.querySelector('#btnSendDoctorWhatsapp')?.addEventListener('click', () => {
    const text = encodeURIComponent(`Olá Dr., o laudo e as imagens DICOM do seu paciente ${patientName} já estão disponíveis no portal NexusRad AI: http://127.0.0.1:3000/#/portal/${study ? study.id : ''}`);
    window.open(`https://wa.me/5511998880000?text=${text}`, '_blank');
  });

  container.querySelector('#btnPrintRecord')?.addEventListener('click', () => {
    window.print();
  });
}
