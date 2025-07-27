import { useDemo } from './useDemo';
import { useInventory } from './useInventory';
import { useDemoInventory } from './useDemoInventory';

/**
 * Hook inteligente que decide entre inventário real ou demo
 * baseado no status do usuário
 */
export const useSmartInventory = () => {
  const { isDemo } = useDemo();
  const realInventory = useInventory();
  const demoInventory = useDemoInventory();

  if (isDemo) {
    return {
      ...demoInventory,
      isDemo: true,
      inventory: demoInventory.items,
      redeemItem: demoInventory.redeemDemoItem,
      refreshData: demoInventory.refreshInventory,
    };
  }

  return {
    ...realInventory,
    isDemo: false,
    inventory: realInventory.userItems,
    refreshData: realInventory.refreshItems,
  };
};