// Utilitários de validação para o sistema de autenticação

export const validateEmail = (email: string): boolean => {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let digit = (sum * 10) % 11;
  if (digit === 10 || digit === 11) digit = 0;
  if (digit !== parseInt(cleanCPF[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  digit = (sum * 10) % 11;
  if (digit === 10 || digit === 11) digit = 0;
  if (digit !== parseInt(cleanCPF[10])) return false;

  return true;
};

export const validateAge = (birthDate: string): boolean => {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
};

export const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const normalizeCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

export const formatCPF = (cpf: string): string => {
  const numbers = cpf.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string): string => {
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length <= 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

export const detectIdentifierType = (identifier: string): 'email' | 'cpf' | 'phone' => {
  if (identifier.includes('@')) {
    return 'email';
  }
  
  const clean = normalizePhone(identifier);
  if (clean.length === 11 && !clean.startsWith('1')) {
    return 'cpf'; // CPF tem 11 dígitos e não começa com 1
  }
  
  return 'phone';
};