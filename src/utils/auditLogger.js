// ==========================================================================
// NexusRad AI - LGPD & CFM Medical Compliance Audit Trail Engine
// Tracks all patient data access, DICOM imports, report signatures & PDF exports
// ==========================================================================

const AUDIT_STORAGE_KEY = 'nexusrad_audit_logs';

export function logAuditEvent(action, details, user = 'Dr. Operador') {
  try {
    const logs = getAuditLogs();
    const entry = {
      id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action: action, // 'EXAM_VIEWED' | 'REPORT_SIGNED' | 'DICOM_IMPORTED' | 'PATIENT_UPDATED' | 'PDF_PRINTED'
      details: details,
      user: user,
      ip: '127.0.0.1 (Local Workstation)',
      hash: generateSimpleHash(`${Date.now()}-${action}-${details}`)
    };

    logs.unshift(entry);
    // Keep last 200 compliance events
    if (logs.length > 200) logs.pop();

    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
    return entry;
  } catch (err) {
    console.warn("Audit logger warning:", err);
  }
}

export function getAuditLogs() {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : getInitialDefaultLogs();
  } catch (err) {
    return getInitialDefaultLogs();
  }
}

function getInitialDefaultLogs() {
  return [
    {
      id: "AUDIT-20260728-001",
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action: "SYSTEM_INITIALIZED",
      details: "Inicialização do PACS/RIS NexusRad AI com conformidade LGPD & CFM ativada.",
      user: "Sistema NexusRad",
      ip: "127.0.0.1",
      hash: "a9f8c2b7e101"
    }
  ];
}

function generateSimpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(12, '0');
}
