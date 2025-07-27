import { useState } from 'react';
import { useDemo } from './useDemo';
import { useDemoInventory } from './useDemoInventory';

interface DemoRouletteItem {
  id: string;
  name: string;
  image: string;
  rarity: string;
  value: number;
}

export const useDemoRoulette = () => {
  const { isDemo, demoSettings } = useDemo();
  const { addDemoItem } = useDemoInventory();
  const [isSpinning, setIsSpinning] = useState(false);

  const generateDemoItems = (chestType: string): DemoRouletteItem[] => {
    const baseItems = [
      { name: 'Prêmio Demo Bronze', rarity: 'common', value: 10 },
      { name: 'Prêmio Demo Prata', rarity: 'uncommon', value: 25 },
      { name: 'Prêmio Demo Ouro', rarity: 'rare', value: 50 },
      { name: 'Prêmio Demo Diamante', rarity: 'epic', value: 100 },
      { name: 'Prêmio Demo Supremo', rarity: 'legendary', value: 250 }
    ];

    return baseItems.map((item, index) => ({
      id: `demo_${chestType}_${index}`,
      name: item.name,
      image: '/placeholder.svg',
      rarity: item.rarity,
      value: item.value
    }));
  };

  const spinDemoRoulette = async (chestType: string) => {
    if (!isDemo || !demoSettings) {
      return { error: 'Não está em modo demo' };
    }

    setIsSpinning(true);

    try {
      const items = generateDemoItems(chestType);
      const chestConfig = demoSettings.probabilidades_chest[chestType];
      
      // Lógica de probabilidade demo (mais generosa)
      const winRate = chestConfig?.win_rate || 0.8;
      const rareRate = chestConfig?.rare_rate || 0.3;
      
      const willWin = Math.random() < winRate;
      
      if (!willWin) {
        // Não ganhou nada
        return { 
          error: null, 
          winner: null, 
          allItems: items 
        };
      }

      // Determinar raridade do prêmio
      const willGetRare = Math.random() < rareRate;
      const availableItems = willGetRare 
        ? items.filter(item => ['rare', 'epic', 'legendary'].includes(item.rarity))
        : items.filter(item => ['common', 'uncommon'].includes(item.rarity));

      const winner = availableItems[Math.floor(Math.random() * availableItems.length)];

      // Adicionar ao inventário demo
      await addDemoItem({
        item_name: winner.name,
        item_image: winner.image,
        chest_type: chestType,
        rarity: winner.rarity
      });

      return { 
        error: null, 
        winner, 
        allItems: items 
      };
    } catch (error) {
      console.error('Erro no sorteio demo:', error);
      return { error: 'Erro no sorteio' };
    } finally {
      setIsSpinning(false);
    }
  };

  return {
    isDemo,
    isSpinning,
    spinDemoRoulette,
    generateDemoItems
  };
};