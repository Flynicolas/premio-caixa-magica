import { useMemo } from 'react';
import { useAdminCheck } from '@/hooks/useAdminCheck';

/**
 * Admin Test Mode helper
 * - DESABILITADO: Controle agora é feito via perfil do usuário no painel admin
 * - Mantido para compatibilidade mas sempre retorna false
 * - Use o campo is_demo no perfil do usuário para controlar modo demo
 */
export const useAdminTestMode = () => {
  const { isAdmin } = useAdminCheck();

  // Modo teste agora é controlado exclusivamente via perfil de usuário
  // Admins não têm mais modo teste automático
  return useMemo(() => ({ 
    isEnabled: false, // Sempre false - use is_demo no perfil
    isAdmin 
  }), [isAdmin]);
};
