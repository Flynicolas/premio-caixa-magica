import { useReferralTracking } from '@/hooks/useReferralTracking';

/**
 * Componente invisível que gerencia o tracking de referência
 * Deve ser incluído no App.tsx para funcionar em toda a aplicação
 */
export const ReferralTracker = () => {
  useReferralTracking();
  return null; // Componente invisível
};