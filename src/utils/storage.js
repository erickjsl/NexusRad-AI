// ==========================================================================
// NexusRad AI - LocalStorage Persistence Engine
// Ensures all Patients, Exams, Appointments, Templates & CRUD data are saved permanently
// Includes QuotaExceededError Prevention & Image Frame Sanitization
// ==========================================================================

import { MOCK_WORKLIST, MOCK_TEMPLATES } from '../data/mockData.js';

const STORAGE_KEYS = {
  STUDIES: 'nexusrad_studies',
  PATIENTS: 'nexusrad_patients',
  TEMPLATES: 'nexusrad_templates',
  DOCTORS: 'nexusrad_doctors',
  AGREEMENTS: 'nexusrad_agreements',
  SETTINGS: 'nexusrad_settings'
};

function prepareStudiesForStorage(studies) {
  return studies.map(s => {
    const clone = { ...s };
    // Remove heavy binary objects (pixelData ArrayBuffers) to prevent LocalStorage quota overflow
    delete clone.rawDicomObject;

    if (clone.capturedFrames && clone.capturedFrames.length > 0) {
      // Keep up to 12 frames per study to stay well within 5MB browser storage limits
      clone.capturedFrames = clone.capturedFrames.slice(-12);
    }

    return clone;
  });
}

export function loadPersistentState(state) {
  try {
    // 1. Load Studies (Exams & Appointments)
    const savedStudies = localStorage.getItem(STORAGE_KEYS.STUDIES);
    if (savedStudies) {
      state.studies = JSON.parse(savedStudies);
    } else {
      state.studies = [...MOCK_WORKLIST];
      saveStudiesToStorage(state.studies);
    }

    // 2. Load Patients
    const savedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (savedPatients) {
      state.customPatients = JSON.parse(savedPatients);
    } else {
      state.customPatients = state.studies.map(s => ({
        id: s.patientId,
        name: s.patientName,
        age: s.age,
        gender: s.gender,
        phone: "(11) 99888-7766",
        agreement: s.agreement || "Bradesco Saúde"
      }));
      savePatientsToStorage(state.customPatients);
    }

    // 3. Load Templates
    const savedTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (savedTemplates) {
      state.customTemplatesList = JSON.parse(savedTemplates);
    } else {
      state.customTemplatesList = Object.entries(MOCK_TEMPLATES).map(([key, tpl]) => ({
        key,
        name: tpl.name,
        modality: tpl.modality,
        category: tpl.category,
        findings: tpl.findings,
        impression: tpl.impression
      }));
      saveTemplatesToStorage(state.customTemplatesList);
    }

    // 4. Load Doctors
    const savedDoctors = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    if (savedDoctors) {
      state.customDoctors = JSON.parse(savedDoctors);
    } else {
      state.customDoctors = [
        { id: "MED-01", name: "Dr. Carlos Roberto de Mendonça", crm: "CRM/SP 142.890", specialty: "Radiologia Geral & TC" },
        { id: "MED-02", name: "Dra. Renata Vasconcelos", crm: "CRM/SP 198.441", specialty: "Ultrassonografia & Doppler" },
        { id: "MED-03", name: "Dr. Marcelo Ramos", crm: "CRM/SP 165.220", specialty: "Neurorradiologia & RM" }
      ];
      saveDoctorsToStorage(state.customDoctors);
    }

    // 5. Load Agreements
    const savedAgreements = localStorage.getItem(STORAGE_KEYS.AGREEMENTS);
    if (savedAgreements) {
      state.customAgreements = JSON.parse(savedAgreements);
    } else {
      state.customAgreements = [
        { id: "CONV-01", name: "Bradesco Saúde S/A", codeTuss: "40901122", price: "R$ 280,00", status: "ATIVO" },
        { id: "CONV-02", name: "Unimed Nacional", codeTuss: "40901130", price: "R$ 250,00", status: "ATIVO" },
        { id: "CONV-03", name: "SulAmérica Saúde", codeTuss: "40901149", price: "R$ 310,00", status: "ATIVO" },
        { id: "CONV-04", name: "SUS - Sistema Único de Saúde", codeTuss: "02050200", price: "R$ 86,00", status: "ATIVO" }
      ];
      saveAgreementsToStorage(state.customAgreements);
    }

    // 6. Load Settings Config
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      state.settingsConfig = JSON.parse(savedSettings);
    }

    state.filteredStudies = [...state.studies];
  } catch (err) {
    console.error("Error loading persistent state from localStorage:", err);
  }
}

export function saveStudiesToStorage(studies) {
  try {
    const clean = prepareStudiesForStorage(studies);
    localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(clean));
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      console.warn("Storage quota exceeded. Pruning older captured frames for storage...");
      try {
        const ultraClean = studies.map(s => {
          const clone = { ...s };
          delete clone.rawDicomObject;
          if (clone.capturedFrames) {
            clone.capturedFrames = clone.capturedFrames.slice(-5); // Keep latest 5 frames
          }
          return clone;
        });
        localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(ultraClean));
      } catch (innerErr) {
        console.error("Critical storage quota reached:", innerErr);
      }
    } else {
      console.error("Error saving studies to localStorage:", err);
    }
  }
}

export function savePatientsToStorage(patients) {
  try {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  } catch (err) {
    console.error("Error saving patients to localStorage:", err);
  }
}

export function saveTemplatesToStorage(templates) {
  try {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  } catch (err) {
    console.error("Error saving templates to localStorage:", err);
  }
}

export function saveDoctorsToStorage(doctors) {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
  } catch (err) {
    console.error("Error saving doctors to localStorage:", err);
  }
}

export function saveAgreementsToStorage(agreements) {
  try {
    localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(agreements));
  } catch (err) {
    console.error("Error saving agreements to localStorage:", err);
  }
}

export function saveSettingsToStorage(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error("Error saving settings to localStorage:", err);
  }
}
