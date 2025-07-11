import { useCallback, useMemo } from 'react';
import { RouletteData } from './types';
import { ITEM_WIDTH } from './constants';

interface UseRoulettePositioningProps {
  rouletteData: RouletteData | null;
  containerWidth: number;
}

export const useRoulettePositioning = ({ rouletteData, containerWidth }: UseRoulettePositioningProps) => {
  const calculations = useMemo(() => {
    if (!rouletteData || containerWidth === 0) return null;

    const { centerIndex, rouletteSlots } = rouletteData;
    const totalSlots = rouletteSlots.length;
    const itemWidth = ITEM_WIDTH;
    
    // Posição central do container (onde está a seta)
    const centerPosition = containerWidth / 2;
    
    // Posição do centro do item vencedor na trilha
    const winnerItemCenterPosition = (centerIndex * itemWidth) + (itemWidth / 2);
    
    // Distância que precisa mover para centralizar o item vencedor
    const targetOffset = winnerItemCenterPosition - centerPosition;
    
    // Adicionar 5 voltas completas para efeito visual
    const fullRotations = 5;
    const trackWidth = totalSlots * itemWidth;
    const totalDistance = targetOffset + (fullRotations * trackWidth);

    console.log('Cálculos da roleta:', {
      centerIndex,
      totalSlots,
      itemWidth,
      centerPosition,
      winnerItemCenterPosition,
      targetOffset,
      totalDistance,
      trackWidth
    });

    return {
      targetOffset,
      totalDistance,
      trackWidth,
      centerPosition,
      winnerItemCenterPosition
    };
  }, [rouletteData, containerWidth]);

  const getTransform = useCallback((distance: number) => {
    return `translateX(-${distance}px)`;
  }, []);

  return {
    calculations,
    getTransform
  };
};