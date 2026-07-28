// ==========================================================================
// NexusRad AI - Brazilian CPF Validation & Formatting Mask Utility
// ==========================================================================

export function formatCPF(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function validateCPF(cpfRaw) {
  const cpf = cpfRaw.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // Reject sequence like 111.111.111-11

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

export function calculateAge(birthDateString) {
  if (!birthDateString) return '';
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return '';

  const today = new Date();
  let ageYears = today.getFullYear() - birthDate.getFullYear();
  let ageMonths = today.getMonth() - birthDate.getMonth();
  
  if (today.getDate() < birthDate.getDate()) {
    ageMonths--;
  }

  if (ageMonths < 0) {
    ageYears--;
    ageMonths += 12;
  }

  if (ageYears === 0) {
    return `${ageMonths} mes${ageMonths !== 1 ? 'es' : ''}`;
  }

  return `${ageYears} ano${ageYears !== 1 ? 's' : ''}`;
}
