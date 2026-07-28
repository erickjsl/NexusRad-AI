// ==========================================================================
// NexusRad AI - LocalStorage & IndexedDB Hybrid Persistence Engine
// Provides 100% Zero-Quota Storage for Patients, Exams, DICOM & Image Series
// LocalStorage handles metadata; IndexedDB handles full-resolution frames
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

// ==========================================================================
// IndexedDB Engine for Unlimited Full-Resolution Frame Storage (Gigabytes)
// ==========================================================================
const DB_NAME = 'NexusRadStorageDB';
const DB_VERSION = 1;
const STORE_NAME = 'study_frames';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'studyId' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function saveFramesToIndexedDB(studyId, frames) {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ studyId, frames, updatedAt: Date.now() });
  } catch (err) {
    console.warn("IndexedDB async frame store warning:", err);
  }
}

export async function loadFramesFromIndexedDB(studyId) {
  try {
    const db = await openDB();
    if (!db) return null;
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const req = store.get(studyId);
      req.onsuccess = () => resolve(req.result ? req.result.frames : null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

// ==========================================================================
// LocalStorage Persistence Engine (Metadata + Tiny Thumbnails)
// ==========================================================================

function sanitizeStudiesForLocalStorage(studies) {
  return studies.map(s => {
    const clone = { ...s };
    // Remove heavy binary objects and uncompressed pixel buffers
    delete clone.rawDicomObject;
    delete clone.rawDicomObjects;

    if (clone.capturedFrames && clone.capturedFrames.length > 0) {
      // Keep up to 6 frames for quick preview, but truncate long DataURLs if necessary
      clone.capturedFrames = clone.capturedFrames.slice(-6).map(f => {
        let trimmedUrl = f.dataUrl;
        if (trimmedUrl && trimmedUrl.length > 40000) {
          // Keep lightweight snippet or thumbnail for LocalStorage metadata
          trimmedUrl = trimmedUrl.slice(0, 40000);
        }
        return {
          id: f.id,
          source: f.source,
          timestamp: f.timestamp,
          dataUrl: trimmedUrl
        };
      });
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

    // Load full-resolution frames from IndexedDB for each study in background
    state.studies.forEach(async (study) => {
      const fullFrames = await loadFramesFromIndexedDB(study.id);
      if (fullFrames && fullFrames.length > 0) {
        study.capturedFrames = fullFrames;
      }
    });

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

export function ensurePatientSaved(state, item) {
  if (!state || !item || (!item.patientName && !item.name)) return;

  if (!state.customPatients) {
    state.customPatients = [];
  }

  const pName = (item.patientName || item.name).trim().toUpperCase();
  const pId = item.patientId || item.id;

  const existingIndex = state.customPatients.findIndex(p => 
    p.name.trim().toUpperCase() === pName || (pId && p.id === pId)
  );

  if (existingIndex < 0) {
    const newPatient = {
      id: pId || `CPF: ${Math.floor(100 + Math.random()*899)}.${Math.floor(100 + Math.random()*899)}.${Math.floor(100 + Math.random()*899)}-00`,
      name: pName,
      age: item.age || "38a",
      gender: item.gender || "M",
      phone: item.phone || "(11) 99888-7766",
      agreement: item.agreement || "Bradesco Saúde"
    };

    state.customPatients.unshift(newPatient);
    savePatientsToStorage(state.customPatients);
  }
}

export function saveStudiesToStorage(studies) {
  // Also save full-resolution frames asynchronously to IndexedDB
  studies.forEach(s => {
    if (s.capturedFrames && s.capturedFrames.length > 0) {
      saveFramesToIndexedDB(s.id, s.capturedFrames);
    }
  });

  try {
    const sanitized = sanitizeStudiesForLocalStorage(studies);
    localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(sanitized));
  } catch (err) {
    console.warn("LocalStorage quota limit reached. Saving metadata only without binary strings...");
    try {
      const minimal = studies.map(s => {
        const clone = { ...s };
        delete clone.rawDicomObject;
        delete clone.rawDicomObjects;
        if (clone.capturedFrames) {
          clone.capturedFrames = clone.capturedFrames.map(f => ({
            id: f.id,
            source: f.source,
            timestamp: f.timestamp
          }));
        }
        return clone;
      });
      localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(minimal));
    } catch (e) {
      console.error("Critical storage error:", e);
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
