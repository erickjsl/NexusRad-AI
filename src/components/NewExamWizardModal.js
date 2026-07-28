// ==========================================================================
// NexusRad AI - Database Integrated Patient Lookup & Auto-Register Wizard
// ==========================================================================

import { formatCPF, validateCPF, calculateAge } from '../utils/cpfValidator.js';

export function renderNewExamWizardModal(container, state, callbacks) {
  let step = 1;
  let selectedExistingPatient = null;

  let examData = {
    patientName: '',
    cpf: '',
    rg: '',
    birthDate: '',
    calculatedAge: '',
    gender: 'M',
    motherName: '',
    phone: '',
    agreement: 'Bradesco Saúde',
    cardId: '',
    modality: 'US',
    examType: 'ULTRASSOM DE ABDÔMEN TOTAL',
    laterality: 'N/A',
    physician: 'Dr. Plantonista Radiologia (CRM/SP 142.890)',
    crm: 'CRM/SP 142.890'
  };

  if (!state.customPatients) {
    state.customPatients = [
      { id: "CPF: 123.456.789-00", name: "MARIA EDUARDA SILVA", age: "34 anos", birthDate: "1992-04-12", gender: "F", motherName: "JOANA SILVA", phone: "(11) 98888-1122", agreement: "Bradesco Saúde", cardId: "9887123" },
      { id: "CPF: 987.654.321-11", name: "CARLOS ALBERTO RODRIGUES", age: "58 anos", birthDate: "1968-09-25", gender: "M", motherName: "HELENA RODRIGUES", phone: "(11) 97777-3344", agreement: "Unimed Nacional", cardId: "761234" }
    ];
  }

  const examOptionsByModality = {
    US: [
      'ULTRASSOM DE ABDÔMEN TOTAL',
      'ULTRASSOM OBSTÉTRICO COM DOPPLER (HADLOCK)',
      'ULTRASSOM PÉLVICO TRANSVAGINAL',
      'ULTRASSOM DE TIREOIDE (TI-RADS)',
      'ULTRASSOM DE MAMAS BILATERAL (BI-RADS)',
      'ULTRASSOM DOPPLER DE CARÓTIDAS',
      'ULTRASSOM ARTICULAR DE OMBRO'
    ],
    CT: [
      'TC DE TÓRAX COM CONTRASTE EV',
      'TC DE CRÂNIO / ENCEFÁLICA',
      'TC DE ABDÔMEN TOTAL E PELVE'
    ],
    DX: [
      'RAIO-X DE TÓRAX PA E PERFIL',
      'RAIO-X DE JOELHO AP E PERFIL'
    ],
    MR: [
      'RM DE ENCEFÁLO / ENCEFÁLICA',
      'RM DE JOELHO COM CONTRASTE'
    ],
    MG: [
      'MAMOGRAFIA DIGITAL BILATERAL'
    ]
  };

  function render() {
    container.innerHTML = `
      <div class="modal-backdrop open" id="wizardModalBackdrop">
        <div class="modal-card" style="max-width: 680px; width: 92%; display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
            <div>
              <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="file-plus"></i>
                Admissão de Paciente & Recepção de Exame — Passo ${step} de 3
              </h2>
              <span style="font-size: 0.75rem; color: var(--text-muted);">
                ${step === 1 ? '1. Buscar do Banco ou Cadastrar Novo Paciente' : (step === 2 ? '2. Modalidade, Exame & Lateralidade' : '3. Convênio, Médico Solicitante & Confirmação')}
              </span>
            </div>
            <button class="btn-icon" id="btnCloseWizardModal" style="width: 28px; height: 28px;">
              <i data-lucide="x" style="width: 16px; height: 16px;"></i>
            </button>
          </div>

          <!-- Step Progress Bar -->
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="flex: 1; height: 6px; border-radius: 3px; background: ${step >= 1 ? 'var(--primary-cyan)' : 'var(--border-light)'}"></div>
            <div style="flex: 1; height: 6px; border-radius: 3px; background: ${step >= 2 ? 'var(--primary-cyan)' : 'var(--border-light)'}"></div>
            <div style="flex: 1; height: 6px; border-radius: 3px; background: ${step >= 3 ? 'var(--primary-cyan)' : 'var(--border-light)'}"></div>
          </div>

          <!-- Step Body -->
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${renderStepBody()}
          </div>

          <!-- Step Footer -->
          <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
            ${step > 1 ? `
              <button class="btn-secondary" id="btnPrevStep" style="font-size: 0.8rem;">
                <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                <span>Voltar Passo</span>
              </button>
            ` : '<div></div>'}

            ${step < 3 ? `
              <button class="btn-primary" id="btnNextStep" style="font-size: 0.8rem;">
                <span>Avançar para Passo ${step + 1}</span>
                <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
              </button>
            ` : `
              <button class="btn-primary" id="btnFinishWizard" style="font-size: 0.85rem; background: var(--status-ready); border-color: var(--status-ready); font-weight: 700;">
                <i data-lucide="play" style="width: 16px; height: 16px;"></i>
                <span>Confirmar & Iniciar Exame no Viewer</span>
              </button>
            `}
          </div>

        </div>
      </div>
    `;

    const backdrop = container.querySelector('#wizardModalBackdrop');
    const closeModal = () => backdrop.remove();

    container.querySelector('#btnCloseWizardModal').addEventListener('click', closeModal);

    container.querySelector('#btnPrevStep')?.addEventListener('click', () => {
      saveCurrentStepData();
      step--;
      render();
    });

    container.querySelector('#btnNextStep')?.addEventListener('click', () => {
      if (saveCurrentStepData()) {
        step++;
        render();
      }
    });

    container.querySelector('#btnFinishWizard')?.addEventListener('click', () => {
      // Check if patient exists in database state.customPatients, if not, auto-register!
      let patientRecord = state.customPatients.find(p => p.id.includes(examData.cpf) || p.name === examData.patientName.toUpperCase());
      if (!patientRecord) {
        patientRecord = {
          id: `CPF: ${examData.cpf}`,
          name: examData.patientName.toUpperCase(),
          age: examData.calculatedAge || '42a',
          birthDate: examData.birthDate,
          gender: examData.gender,
          motherName: examData.motherName.toUpperCase(),
          phone: examData.phone,
          agreement: examData.agreement,
          cardId: examData.cardId
        };
        state.customPatients.unshift(patientRecord);
      }

      const newStudy = {
        id: `EX-${Math.floor(10000 + Math.random() * 90000)}`,
        patientName: examData.patientName.toUpperCase(),
        patientId: `CPF: ${examData.cpf}`,
        cpfRaw: examData.cpf,
        rg: examData.rg,
        birthDate: examData.birthDate,
        age: examData.calculatedAge || '42a',
        gender: examData.gender,
        motherName: examData.motherName.toUpperCase(),
        phone: examData.phone,
        agreement: examData.agreement,
        cardId: examData.cardId,
        modality: examData.modality,
        studyDescription: `${examData.examType}${examData.laterality !== 'N/A' ? ` (${examData.laterality})` : ''}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        modalitiesInStudy: [examData.modality],
        seriesCount: 1,
        instanceCount: 1,
        status: "pronto",
        urgency: "normal",
        physician: examData.physician,
        institution: "NEXUSRAD DIAGNÓSTICO POR IMAGEM S/A",
        accessionNumber: `ACC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        kvp: "120 kV",
        ma: "240 mA",
        sliceThickness: "1.0 mm",
        capturedFrames: [],
        aiFinding: {
          type: "Exame Pronto no Viewer",
          confidence: "99.9%",
          box: { x: 25, y: 25, width: 40, height: 40 },
          description: "Prontuário vinculado ao banco de dados do sistema. Imagens prontas para laudo."
        }
      };

      state.studies.unshift(newStudy);
      state.selectedStudyId = newStudy.id;
      closeModal();
      if (callbacks.onWizardComplete) {
        callbacks.onWizardComplete(newStudy);
      }
    });

    attachStepInputEvents();
  }

  function renderStepBody() {
    if (step === 1) {
      const isCpfValid = examData.cpf ? validateCPF(examData.cpf) : false;

      return `
        <!-- Database Search & Autocomplete Dropdown -->
        <div style="background: rgba(0,229,255,0.05); border: 1px solid var(--primary-cyan); padding: 0.75rem 1rem; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 0.5rem;">
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.35rem;">
            <i data-lucide="search" style="width: 14px; height: 14px;"></i>
            Buscar Paciente já Cadastrado no Banco de Dados:
          </label>
          <select id="selectDbPatient" class="form-select" style="font-weight: 600;">
            <option value="">-- Selecionar do Banco ou Cadastrar Novo Abaixo --</option>
            ${state.customPatients.map(p => `
              <option value="${p.id}">${p.name} (${p.id} • ${p.age || 'N/I'})</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label style="font-size: 0.8rem; font-weight: 700;">Nome Completo do Paciente (Obrigatório):</label>
          <input type="text" id="wizPatientName" class="form-select" placeholder="Ex: MARCOS ANTONIO SILVA" value="${examData.patientName}" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <label style="font-size: 0.8rem; font-weight: 700;">CPF do Paciente:</label>
              ${examData.cpf ? (isCpfValid ? `<span style="font-size: 0.65rem; color: var(--status-ready); font-weight: 700;">✅ CPF VÁLIDO</span>` : `<span style="font-size: 0.65rem; color: #EF4444; font-weight: 700;">❌ CPF INVÁLIDO</span>`) : ''}
            </div>
            <input type="text" id="wizCpf" class="form-select" placeholder="000.000.000-00" value="${examData.cpf}" maxlength="14" style="border-color: ${examData.cpf ? (isCpfValid ? 'var(--status-ready)' : '#EF4444') : 'var(--border-light)'}">
          </div>

          <div class="form-group">
            <label style="font-size: 0.8rem;">RG / Documento:</label>
            <input type="text" id="wizRg" class="form-select" placeholder="Ex: 12.345.678-9 SSP/SP" value="${examData.rg}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label style="font-size: 0.8rem; font-weight: 700;">Data de Nascimento:</label>
            <input type="date" id="wizBirthDate" class="form-select" value="${examData.birthDate}">
          </div>

          <div class="form-group">
            <label style="font-size: 0.8rem; font-weight: 700;">Idade Calculada:</label>
            <input type="text" id="wizAgeCalculated" class="form-select" readonly value="${examData.calculatedAge || 'Selecione a data'}" style="background: rgba(0,229,255,0.05); color: var(--primary-cyan); font-weight: 700;">
          </div>

          <div class="form-group">
            <label style="font-size: 0.8rem; font-weight: 700;">Sexo Biológico:</label>
            <select id="wizGender" class="form-select">
              <option value="M" ${examData.gender === 'M' ? 'selected' : ''}>Masculino</option>
              <option value="F" ${examData.gender === 'F' ? 'selected' : ''}>Feminino</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label style="font-size: 0.8rem;">Nome da Mãe (Prontuário SUS/Convênio):</label>
            <input type="text" id="wizMotherName" class="form-select" placeholder="Ex: MARIA DAS DORES SILVA" value="${examData.motherName}">
          </div>

          <div class="form-group">
            <label style="font-size: 0.8rem;">Celular / WhatsApp:</label>
            <input type="text" id="wizPhone" class="form-select" placeholder="(11) 98888-7766" value="${examData.phone}">
          </div>
        </div>
      `;
    } else if (step === 2) {
      return `
        <div class="form-group">
          <label style="font-size: 0.8rem; font-weight: 700;">Modalidade de Exame:</label>
          <select id="wizModality" class="form-select" style="font-weight: 700; color: var(--primary-cyan);">
            <option value="US" ${examData.modality === 'US' ? 'selected' : ''}>Ultrassonografia (US)</option>
            <option value="CT" ${examData.modality === 'CT' ? 'selected' : ''}>Tomografia Computadorizada (TC)</option>
            <option value="MR" ${examData.modality === 'MR' ? 'selected' : ''}>Ressonância Magnética (RM)</option>
            <option value="DX" ${examData.modality === 'DX' ? 'selected' : ''}>Radiografia Digital (RX)</option>
            <option value="MG" ${examData.modality === 'MG' ? 'selected' : ''}>Mamografia Digital (MG)</option>
          </select>
        </div>

        <div class="form-group">
          <label style="font-size: 0.8rem; font-weight: 700;">Tipo Específico de Exame:</label>
          <select id="wizExamType" class="form-select">
            ${(examOptionsByModality[examData.modality] || []).map(opt => `
              <option value="${opt}" ${opt === examData.examType ? 'selected' : ''}>${opt}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label style="font-size: 0.8rem; font-weight: 700;">Lateralidade / Região Focada:</label>
          <select id="wizLaterality" class="form-select">
            <option value="N/A" ${examData.laterality === 'N/A' ? 'selected' : ''}>Não Aplicável / Exame Único</option>
            <option value="DIREITA" ${examData.laterality === 'DIREITA' ? 'selected' : ''}>Direita (D)</option>
            <option value="ESQUERDA" ${examData.laterality === 'ESQUERDA' ? 'selected' : ''}>Esquerda (E)</option>
            <option value="BILATERAL" ${examData.laterality === 'BILATERAL' ? 'selected' : ''}>Bilateral (Ambos os lados)</option>
          </select>
        </div>
      `;
    } else if (step === 3) {
      return `
        <div class="glass-card" style="padding: 1rem; display: flex; flex-direction: column; gap: 0.4rem; background: rgba(0,229,255,0.05); border-color: var(--primary-cyan);">
          <div style="font-size: 0.75rem; color: var(--text-muted);">Confirmação da Admissão do Paciente:</div>
          <div style="font-size: 1.15rem; font-weight: 700; color: #FFF;">${examData.patientName || 'PACIENTE NÃO INFORMADO'}</div>
          <div style="font-size: 0.9rem; color: var(--primary-cyan); font-weight: 700;">${examData.examType} ${examData.laterality !== 'N/A' ? `(${examData.laterality})` : ''}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            CPF: <strong>${examData.cpf || 'Não informado'}</strong> • Nascimento: <strong>${examData.birthDate || 'N/I'} (${examData.calculatedAge})</strong> • Sexo: <strong>${examData.gender}</strong>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Mãe: ${examData.motherName || 'Não informada'}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label style="font-size: 0.8rem; font-weight: 700;">Convênio Médico / Plano:</label>
            <select id="wizAgreement" class="form-select">
              <option value="Bradesco Saúde" ${examData.agreement === 'Bradesco Saúde' ? 'selected' : ''}>Bradesco Saúde</option>
              <option value="Unimed Nacional" ${examData.agreement === 'Unimed Nacional' ? 'selected' : ''}>Unimed Nacional</option>
              <option value="SulAmérica Saúde" ${examData.agreement === 'SulAmérica Saúde' ? 'selected' : ''}>SulAmérica Saúde</option>
              <option value="Amil Assistência Médica" ${examData.agreement === 'Amil Assistência Médica' ? 'selected' : ''}>Amil Assistência Médica</option>
              <option value="Porto Seguro Saúde" ${examData.agreement === 'Porto Seguro Saúde' ? 'selected' : ''}>Porto Seguro Saúde</option>
              <option value="SUS - Sistema Único de Saúde" ${examData.agreement === 'SUS - Sistema Único de Saúde' ? 'selected' : ''}>SUS - Sistema Único de Saúde</option>
              <option value="Particular / Dinheiro" ${examData.agreement === 'Particular / Dinheiro' ? 'selected' : ''}>Particular / Dinheiro</option>
            </select>
          </div>

          <div class="form-group">
            <label style="font-size: 0.8rem;">Número da Carteirinha:</label>
            <input type="text" id="wizCardId" class="form-select" placeholder="Ex: 884.000.111-90" value="${examData.cardId}">
          </div>
        </div>

        <div class="form-group">
          <label style="font-size: 0.8rem; font-weight: 700;">Médico Solicitante / CRM:</label>
          <input type="text" id="wizPhysician" class="form-select" value="${examData.physician}">
        </div>
      `;
    }
  }

  function saveCurrentStepData() {
    if (step === 1) {
      const name = container.querySelector('#wizPatientName').value.trim();
      if (!name) {
        alert("⚠️ Por favor, informe o nome completo do paciente.");
        return false;
      }
      examData.patientName = name;
      examData.cpf = container.querySelector('#wizCpf').value.trim();
      examData.rg = container.querySelector('#wizRg').value.trim();
      examData.birthDate = container.querySelector('#wizBirthDate').value;
      examData.gender = container.querySelector('#wizGender').value;
      examData.motherName = container.querySelector('#wizMotherName').value.trim();
      examData.phone = container.querySelector('#wizPhone').value.trim();

      if (examData.cpf && !validateCPF(examData.cpf)) {
        if (!confirm("⚠️ O CPF digitado não passou na validação dos dígitos verificadores. Deseja continuar assim mesmo para teste?")) {
          return false;
        }
      }
    } else if (step === 2) {
      examData.modality = container.querySelector('#wizModality').value;
      examData.examType = container.querySelector('#wizExamType').value;
      examData.laterality = container.querySelector('#wizLaterality').value;
    } else if (step === 3) {
      examData.agreement = container.querySelector('#wizAgreement').value;
      examData.cardId = container.querySelector('#wizCardId').value.trim();
      examData.physician = container.querySelector('#wizPhysician').value.trim();
    }
    return true;
  }

  function attachStepInputEvents() {
    if (step === 1) {
      const dbSelect = container.querySelector('#selectDbPatient');
      if (dbSelect) {
        dbSelect.addEventListener('change', (e) => {
          const selectedId = e.target.value;
          if (selectedId) {
            const found = state.customPatients.find(p => p.id === selectedId);
            if (found) {
              selectedExistingPatient = found;
              examData.patientName = found.name;
              examData.cpf = found.id.replace('CPF: ', '');
              examData.birthDate = found.birthDate || '1990-05-15';
              examData.calculatedAge = found.age || calculateAge(examData.birthDate);
              examData.gender = found.gender || 'F';
              examData.motherName = found.motherName || 'MÃE CADASTRADA';
              examData.phone = found.phone || '(11) 98888-0000';
              examData.agreement = found.agreement || 'Bradesco Saúde';
              examData.cardId = found.cardId || '123456';
              render();
            }
          }
        });
      }

      const cpfInput = container.querySelector('#wizCpf');
      if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
          examData.cpf = formatCPF(e.target.value);
          e.target.value = examData.cpf;
          render();
        });
      }

      const birthInput = container.querySelector('#wizBirthDate');
      if (birthInput) {
        birthInput.addEventListener('change', (e) => {
          examData.birthDate = e.target.value;
          examData.calculatedAge = calculateAge(e.target.value);
          const ageCalculatedInput = container.querySelector('#wizAgeCalculated');
          if (ageCalculatedInput) {
            ageCalculatedInput.value = examData.calculatedAge;
          }
        });
      }
    } else if (step === 2) {
      const modalitySelect = container.querySelector('#wizModality');
      if (modalitySelect) {
        modalitySelect.addEventListener('change', (e) => {
          examData.modality = e.target.value;
          examData.examType = examOptionsByModality[examData.modality][0];
          render();
        });
      }
    }
  }

  render();
}
