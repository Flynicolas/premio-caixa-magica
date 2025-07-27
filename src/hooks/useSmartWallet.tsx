import { useDemo } from './useDemo';
import { useWallet } from './useWallet';
import { useDemoWallet } from './useDemoWallet';

/**
 * Hook inteligente que decide entre carteira real ou demo
 * baseado no status do usuário
 */
export const useSmartWallet = () => {
  const { isDemo } = useDemo();
  const realWallet = useWallet();
  const demoWallet = useDemoWallet();

  if (isDemo) {
    return {
      ...demoWallet,
      isDemo: true,
      purchaseChest: demoWallet.purchaseChestDemo,
      PaymentModalComponent: null, // Demo não precisa de modal de pagamento
    };
  }

  return {
    ...realWallet,
    isDemo: false,
    purchaseChest: realWallet.purchaseChest,
  };
};