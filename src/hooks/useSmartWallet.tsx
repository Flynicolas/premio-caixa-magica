import { useWallet } from './useWalletProvider';

/**
 * Hook inteligente que agora está integrado com o useWallet unificado
 * Mantido para compatibilidade com código existente
 */
export const useSmartWallet = () => {
  const wallet = useWallet();
  
  // O useWallet unificado já gerencia demo/real automaticamente
  return {
    ...wallet,
    // Manter compatibilidade para códigos que esperavam purchaseChestDemo
    purchaseChestDemo: wallet.purchaseChest,
  };
};