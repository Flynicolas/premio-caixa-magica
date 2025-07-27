import { useState } from 'react';
import { useDemo } from './useDemo';
import { useRouletteLogic } from './useRouletteLogic';
import { useDemoRoulette } from './useDemoRoulette';

interface RouletteItem {
  id: string;
  image: string;
  text?: string;
}

interface RouletteResult {
  prizes: RouletteItem[];
  prizeIndex: number;
  winnerItem: any;
  centerIndex: number;
}

export const useSmartRoulette = () => {
  const { isDemo } = useDemo();
  const realRoulette = useRouletteLogic();
  const { generateDemoRoulette } = useDemoRoulette();
  const [demoRouletteData, setDemoRouletteData] = useState<RouletteResult | null>(null);

  const generateRoulette = async (chestType: string, slotsCount: number = 25, forcedItemId?: string) => {
    if (isDemo) {
      // Para demo, usar geração local
      const demoResult = generateDemoRoulette(chestType, slotsCount);
      const rouletteData = {
        prizes: demoResult.rouletteSlots.map(item => ({
          id: item.id,
          image: item.image,
          text: item.name
        })),
        prizeIndex: demoResult.centerIndex,
        winnerItem: demoResult.winnerItem,
        centerIndex: demoResult.centerIndex
      };
      
      setDemoRouletteData(rouletteData);
      return rouletteData;
    } else {
      // Para real, usar edge function
      return await realRoulette.generateRoulette(chestType, slotsCount, forcedItemId);
    }
  };

  const resetRoulette = () => {
    if (isDemo) {
      setDemoRouletteData(null);
    } else {
      realRoulette.resetRoulette();
    }
  };

  return {
    generateRoulette,
    resetRoulette,
    rouletteData: isDemo ? demoRouletteData : realRoulette.rouletteData,
    isLoading: isDemo ? false : realRoulette.isLoading
  };
};