import { format, parseISO, isValid, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Utilitário centralizado para manipulação de datas
 * Garante consistência de timezone e formato em todo o app
 */

// Formatos padrão para diferentes contextos
export const DATE_FORMATS = {
  ISO: 'yyyy-MM-dd',
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  DATABASE: 'yyyy-MM-dd',
  TIMESTAMP: 'yyyy-MM-dd HH:mm:ss'
} as const;

/**
 * Converte data para formato ISO (YYYY-MM-DD) para banco de dados
 */
export const toISODate = (date: string | Date | null | undefined): string | null => {
  if (!date) return null;
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Se já está no formato ISO, usar diretamente
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        dateObj = new Date(date + 'T00:00:00');
      } else {
        dateObj = parseISO(date);
      }
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      console.warn('Data inválida:', date);
      return null;
    }
    
    return format(startOfDay(dateObj), DATE_FORMATS.ISO);
  } catch (error) {
    console.error('Erro ao converter data para ISO:', error, date);
    return null;
  }
};

/**
 * Converte data para exibição formatada (DD/MM/YYYY)
 */
export const toDisplayDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      return '';
    }
    
    return format(dateObj, DATE_FORMATS.DISPLAY, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data para exibição:', error, date);
    return '';
  }
};

/**
 * Valida se uma data está no formato correto
 */
export const isValidDate = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    return isValid(dateObj);
  } catch {
    return false;
  }
};

/**
 * Converte timestamp para formato de exibição
 */
export const formatTimestamp = (timestamp: string | null | undefined): string => {
  if (!timestamp) return '';
  
  try {
    const date = parseISO(timestamp);
    if (!isValid(date)) return '';
    
    return format(date, DATE_FORMATS.DISPLAY_WITH_TIME, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar timestamp:', error, timestamp);
    return '';
  }
};

/**
 * Cria um timestamp ISO para o momento atual
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Valida se uma data de nascimento é válida (não no futuro, mínimo 1900)
 */
export const validateBirthDate = (birthDate: string | null | undefined): boolean => {
  if (!birthDate) return true; // Opcional
  
  const date = parseISO(birthDate);
  if (!isValid(date)) return false;
  
  const now = new Date();
  const minDate = new Date('1900-01-01');
  
  return date <= now && date >= minDate;
};

/**
 * Calcula idade baseada na data de nascimento
 */
export const calculateAge = (birthDate: string | null | undefined): number | null => {
  if (!birthDate || !isValidDate(birthDate)) return null;
  
  const birth = parseISO(birthDate);
  const now = new Date();
  
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Debugging - log formatado para datas
 */
export const debugDate = (label: string, date: any) => {
  console.log(`🗓️ ${label}:`, {
    original: date,
    type: typeof date,
    iso: toISODate(date),
    display: toDisplayDate(date),
    isValid: isValidDate(date)
  });
};