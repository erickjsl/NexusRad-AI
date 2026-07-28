// ==========================================================================
// NexusRad AI - Complete Patient Admission & Exam Creation Wizard Modal
// High-Visibility Close Button (✕) & Automatic Lucide Icon Render
// ==========================================================================

import { createIcons, X, User, Calendar, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide';
import { formatCPF, validateCPF, calculateAge } from '../utils/cpfValidator.js';
import { showToast } from '../utils/toast.js';

export function renderNewExamWizardModal(container, state, callbacks) {
  let step = 1;
  let form = {
    patientName: '',
    cpf: '',
    rg: '',
    birthDate: '',
    calculatedAge: '',
    gender: 'M',
    motherName: '',
    phone: '',
    modality: 'US',
    studyDescription: 'ULTRASSOM DE ABDÔMEN TOTAL',
    laterality: 'N/A',
    urgency: 'alta',
    agreement: 'Bradesco Saúde',
    cardId: 'BRAD-8849-2026',
    physician: 'Dr. Carlos Roberto de Mendonça',
    clinicalHistory: 'Dor abdominal difusa a esclarecer.'
  };

  const samplePatients = state.customPatients || [
    { name: "CARLOS ALBERTO RODRIGUES", cpf: "123.456.789-00", age: "58 anos", mother: "HELENA RODRIGUES", phone: "(11) 97777-3344", agreement: "Bradesco Saúde" },
    { name: "MARIA EDUARDA SILVA", cpf: "987.654.321-11", age: "32 anos", mother: "ANA SILVA", phone: "(11) 98888-2211", agreement: "Unimed Nacional" },
    { name: "ERICK LIMA", cpf: "444.555.666-77", age: "38 anos", mother: "SONIA LIMA", phone: "(11) 99888-7766", agreement: "SulAmérica" }
  ];

  function refreshModalIcons() {
    createIcons({
      icons: { X, User, Calendar, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2 }
    });
  }

  function render() {
    container.innerHTML = `
      <div class="modal-backdrop open" id="wizardModalBackdrop">
        <div class="modal-card" style="max-width: 680px; width: 92%; display: flex; flex-direction: column; gap: 1.25rem; background: #0A0F1D; border: 1px solid var(--primary-cyan); box-shadow: 0 0 30px rgba(0, 229, 255, 0.25);">
          
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.5rem;">
                Admissão de Paciente & Recepção de Exame — Passo ${step} de 3
              </h3>
              <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                ${step === 1 ? '1. Buscar do Banco ou Cadastrar Novo Paciente' : step === 2 ? '2. Dados Clínicos & Seleção da Modalidade do Exame' : '3. Convênio, Guia TISS & Confirmação Final'}
              </p>
            </div>

            <!-- Crisp Visible Close Button (✕) -->
            <button class="btn-icon modal-close-btn" id="btnCloseWizard" title="Fechar Janela" style="background: rgba(255, 255, 255, 0.08); border: 1px solid var(--border-light); color: #FFF; font-size: 1.2rem; font-weight: 700; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
              ✕
            </button>
          </div>

          <!-- Wizard Progress Bar -->
          <div style="display: flex; gap: 0.5rem; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
            <div style="flex: 1; background: ${step >= 1 ? 'var(--primary-cyan)' : 'transparent'};"></div>
            <div style="flex: 1; background: ${step >= 2 ? 'var(--primary-cyan)' : 'transparent'};"></div>
            <div style="flex: 1; background: ${step >= 3 ? 'var(--primary-cyan)' : 'transparent'};"></div>
          </div>

          <!-- Step Content -->
          <div id="wizardStepContent" style="display: flex; flex-direction: column; gap: 1rem;">
            ${renderStepContent()}
          </div>

        </div>
      </div>
    `;

    container.querySelector('#btnCloseWizard')?.addEventListener('click', closeModal);
    attachStepEvents();
    refreshModalIcons();
  }

  function renderStepContent() {
    if (step === 1) {
      return `
        <!-- Patient Database Autocomplete Dropdown -->
        <div style="background: rgba(0, 229, 255, 0.05); border: 1px solid var(--primary-cyan); padding: 0.85rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.5rem;">
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--primary-cyan);">
            Buscar Paciente já Cadastrado no Banco de Dados:
          </label>
          <select id="wSelectExistingPatient" class="form-select" style="font-size: 0.85rem;">
            <option value="">-- Selecionar do Banco ou Cadastrar Novo Abaixo --</option>
            ${samplePatients.map((p, idx) => `
              <option value="${idx}">👤 ${p.name} — CPF: ${p.cpf || p.id} (${p.age})</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>NOME COMPLETO DO PACIENTE (OBRIGATÓRIO):</label>
          <input type="text" id="wPatientName" class="form-select" value="${form.patientName}" placeholder="Ex: CARLOS ALBERTO RODRIGUES">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label>CPF DO PACIENTE:</label>
            <input type="text" id="wCpf" class="form-select" value="${form.cpf}" placeholder="000.000.000-00">
            <span id="cpfValidationBadge" style="font-size: 0.72rem; margin-top: 2px;"></span>
          </div>

          <div class="form-group">
            <label>RG / DOCUMENTO:</label>
            <input type="text" id="wRg" class="form-select" value="${form.rg}" placeholder="Ex: 12.345.678-9 SSP/SP">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label>DATA DE NASCIMENTO:</label>
            <input type="date" id="wBirthDate" class="form-select" value="${form.birthDate}">
          </div>

          <div class="form-group">
            <label>IDADE CALCULADA:</label>
            <input type="text" id="wCalculatedAge" class="form-select" value="${form.calculatedAge}" placeholder="Auto (ex: 58 anos)" readonly style="font-weight: 700; color: var(--primary-cyan);">
          </div>

          <div class="form-group">
            <label>SEXO BIOLÓGICO:</label>
            <select id="wGender" class="form-select">
              <option value="M" ${form.gender === 'M' ? 'selected' : ''}>Masculino</option>
              <option value="F" ${form.gender === 'F' ? 'selected' : ''}>Feminino</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label>NOME DA MÃE (PRONTUÁRIO SUS/CONVÊNIO):</label>
            <input type="text" id="wMotherName" class="form-select" value="${form.motherName}" placeholder="Ex: HELENA RODRIGUES">
          </div>

          <div class="form-group">
            <label>CELULAR / WHATSAPP:</label>
            <input type="text" id="wPhone" class="form-select" value="${form.phone}" placeholder="(11) 99999-8888">
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
          <button class="btn-primary" id="btnGoStep2" style="background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); border: none; font-weight: 700; padding: 0.6rem 1.25rem;">
            Avançar para Passo 2 ➔
          </button>
        </div>
      `;
    } else if (step === 2) {
      return `
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.75rem;">
          <div class="form-group">
            <label>MODALIDADE DO EXAME:</label>
            <select id="wModality" class="form-select">
              <option value="US" ${form.modality === 'US' ? 'selected' : ''}>US — Ultrassonografia</option>
              <option value="CT" ${form.modality === 'CT' ? 'selected' : ''}>CT — Tomografia Computadorizada</option>
              <option value="MR" ${form.modality === 'MR' ? 'selected' : ''}>MR — Ressonância Magnética</option>
              <option value="DX" ${form.modality === 'DX' ? 'selected' : ''}>DX — Raio-X Digital</option>
              <option value="MG" ${form.modality === 'MG' ? 'selected' : ''}>MG — Mamografia Digital</option>
            </select>
          </div>

          <div class="form-group">
            <label>DESCRIÇÃO DO EXAME (PROCEDIMENTO TUSS):</label>
            <input type="text" id="wStudyDescription" class="form-select" value="${form.studyDescription}" placeholder="Ex: ULTRASSOM DE ABDÔMEN TOTAL">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label>LATERALIDADE:</label>
            <select id="wLaterality" class="form-select">
              <option value="N/A">N/A — Não Aplicável</option>
              <option value="Direito">Direito (D)</option>
              <option value="Esquerdo">Esquerdo (E)</option>
              <option value="Bilateral">Bilateral (D/E)</option>
            </select>
          </div>

          <div class="form-group">
            <label>NÍVEL DE URGÊNCIA:</label>
            <select id="wUrgency" class="form-select">
              <option value="alta" ${form.urgency === 'alta' ? 'selected' : ''}>🔴 ALTA (Prioridade / UPA)</option>
              <option value="media" ${form.urgency === 'media' ? 'selected' : ''}>🟡 MÉDIA (Atendimento Normal)</option>
              <option value="baixa" ${form.urgency === 'baixa' ? 'selected' : ''}>🟢 BAIXA (Eletivo)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>MÉDICO SOLICITANTE / ASSISTENTE:</label>
          <input type="text" id="wPhysician" class="form-select" value="${form.physician}" placeholder="Ex: Dr. Carlos Roberto de Mendonça">
        </div>

        <div class="form-group">
          <label>INDICAÇÃO CLÍNICA / ANAMNESE:</label>
          <textarea id="wClinicalHistory" class="form-select" style="height: 80px;">${form.clinicalHistory}</textarea>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
          <button class="btn-secondary" id="btnBackStep1">⬅️ Voltar ao Passo 1</button>
          <button class="btn-primary" id="btnGoStep3" style="background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); border: none; font-weight: 700; padding: 0.6rem 1.25rem;">Avançar para Passo 3 ➔</button>
        </div>
      `;
    } else if (step === 3) {
      return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label>CONVÊNIO / PLANO DE SAÚDE:</label>
            <select id="wAgreement" class="form-select">
              <option value="Bradesco Saúde" ${form.agreement === 'Bradesco Saúde' ? 'selected' : ''}>Bradesco Saúde S/A</option>
              <option value="Unimed Nacional" ${form.agreement === 'Unimed Nacional' ? 'selected' : ''}>Unimed Nacional</option>
              <option value="SulAmérica Saúde" ${form.agreement === 'SulAmérica Saúde' ? 'selected' : ''}>SulAmérica Saúde</option>
              <option value="SUS" ${form.agreement === 'SUS' ? 'selected' : ''}>SUS — Sistema Único de Saúde</option>
              <option value="Particular" ${form.agreement === 'Particular' ? 'selected' : ''}>Particular / Avulso</option>
            </select>
          </div>

          <div class="form-group">
            <label>NÚMERO DA CARTEIRINHA / GUIA TISS:</label>
            <input type="text" id="wCardId" class="form-select" value="${form.cardId}" placeholder="Ex: BRAD-8849-2026">
          </div>
        </div>

        <div style="background: rgba(0, 229, 255, 0.05); border: 1px solid var(--primary-cyan); padding: 1rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;">
          <h4 style="font-weight: 700; color: var(--primary-cyan); border-bottom: 1px solid var(--border-light); padding-bottom: 0.25rem;">
            📋 RESUMO FINAL DA ADMISSÃO:
          </h4>
          <div><strong>PACIENTE:</strong> ${form.patientName || 'NÃO INFORMADO'} (${form.calculatedAge || 'Idade N/A'})</div>
          <div><strong>CPF / PRONTUÁRIO:</strong> ${form.cpf ? `CPF: ${form.cpf}` : 'SEM CPF'}</div>
          <div><strong>EXAME SELECIONADO:</strong> ${form.studyDescription} (${form.modality})</div>
          <div><strong>CONVÊNIO:</strong> ${form.agreement} — Carteira: ${form.cardId}</div>
          <div><strong>MÉDICO SOLICITANTE:</strong> ${form.physician}</div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
          <button class="btn-secondary" id="btnBackStep2">⬅️ Voltar ao Passo 2</button>
          <button class="btn-primary" id="btnFinishWizard" style="background: var(--status-ready); border-color: var(--status-ready); font-weight: 700; padding: 0.65rem 1.5rem; font-size: 0.9rem;">
            ✅ Confirmar Admissão & Gerar Exame no RIS
          </button>
        </div>
      `;
    }
  }

  function attachStepEvents() {
    if (step === 1) {
      container.querySelector('#wSelectExistingPatient')?.addEventListener('change', (e) => {
        const idx = e.target.value;
        if (idx !== "") {
          const selected = samplePatients[idx];
          form.patientName = selected.name;
          form.cpf = selected.cpf || selected.id.replace('CPF: ', '');
          form.calculatedAge = selected.age;
          form.motherName = selected.mother || "MARIA DA SILVA";
          form.phone = selected.phone || "(11) 99888-7766";
          form.agreement = selected.agreement || "Bradesco Saúde";
          render();
        }
      });

      const cpfInput = container.querySelector('#wCpf');
      if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
          const formatted = formatCPF(e.target.value);
          e.target.value = formatted;
          form.cpf = formatted;
          const badge = container.querySelector('#cpfValidationBadge');
          if (badge) {
            if (validateCPF(formatted)) {
              badge.textContent = '✅ CPF VÁLIDO';
              badge.style.color = '#10B981';
            } else if (formatted.length >= 14) {
              badge.textContent = '❌ CPF INVÁLIDO';
              badge.style.color = '#EF4444';
            } else {
              badge.textContent = '';
            }
          }
        });
      }

      const birthInput = container.querySelector('#wBirthDate');
      if (birthInput) {
        birthInput.addEventListener('change', (e) => {
          form.birthDate = e.target.value;
          const age = calculateAge(e.target.value);
          form.calculatedAge = age;
          const ageInput = container.querySelector('#wCalculatedAge');
          if (ageInput) ageInput.value = age;
        });
      }

      container.querySelector('#btnGoStep2')?.addEventListener('click', () => {
        form.patientName = container.querySelector('#wPatientName').value.trim();
        form.cpf = container.querySelector('#wCpf').value.trim();
        form.rg = container.querySelector('#wRg').value.trim();
        form.motherName = container.querySelector('#wMotherName').value.trim();
        form.phone = container.querySelector('#wPhone').value.trim();
        form.gender = container.querySelector('#wGender').value;

        if (!form.patientName) {
          showToast("Por favor, informe o nome completo do paciente.", "warning");
          return;
        }

        step = 2;
        render();
      });
    } else if (step === 2) {
      container.querySelector('#btnBackStep1')?.addEventListener('click', () => {
        step = 1;
        render();
      });

      container.querySelector('#btnGoStep3')?.addEventListener('click', () => {
        form.modality = container.querySelector('#wModality').value;
        form.studyDescription = container.querySelector('#wStudyDescription').value.trim();
        form.laterality = container.querySelector('#wLaterality').value;
        form.urgency = container.querySelector('#wUrgency').value;
        form.physician = container.querySelector('#wPhysician').value.trim();
        form.clinicalHistory = container.querySelector('#wClinicalHistory').value.trim();

        step = 3;
        render();
      });
    } else if (step === 3) {
      container.querySelector('#btnBackStep2')?.addEventListener('click', () => {
        step = 2;
        render();
      });

      container.querySelector('#btnFinishWizard')?.addEventListener('click', () => {
        const agreement = container.querySelector('#wAgreement').value;
        const cardId = container.querySelector('#wCardId').value.trim();

        const newStudy = {
          id: `EX-${Math.floor(10000 + Math.random() * 90000)}`,
          patientName: form.patientName.toUpperCase(),
          patientId: form.cpf ? `CPF: ${form.cpf}` : `PRONT-${Math.floor(1000 + Math.random() * 9000)}`,
          age: form.calculatedAge || "40a",
          gender: form.gender,
          modality: form.modality,
          studyDescription: form.studyDescription.toUpperCase(),
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          modalitiesInStudy: [form.modality],
          seriesCount: 1,
          instanceCount: 12,
          status: "pronto",
          urgency: form.urgency,
          physician: form.physician,
          institution: "NEXUSRAD DIAGNÓSTICO POR IMAGEM",
          accessionNumber: `ACC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          agreement: agreement,
          cardId: cardId
        };

        if (state.studies) {
          state.studies.unshift(newStudy);
        }

        if (state.customPatients && !state.customPatients.find(p => p.name === newStudy.patientName)) {
          state.customPatients.unshift({
            id: newStudy.patientId,
            name: newStudy.patientName,
            age: newStudy.age,
            gender: newStudy.gender,
            phone: form.phone || "(11) 99888-7766",
            agreement: agreement
          });
        }

        showToast(`Exame de ${newStudy.patientName} gerado com sucesso!`, "success");
        closeModal();

        if (callbacks.onWizardComplete) callbacks.onWizardComplete(newStudy);
      });
    }
  }

  function closeModal() {
    const backdrop = container.querySelector('#wizardModalBackdrop');
    if (backdrop) backdrop.remove();
  }

  render();
}
