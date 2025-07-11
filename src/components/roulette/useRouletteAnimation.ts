import { useCallback, useRef } from 'react';
import { RouletteData } from './types';
import { ITEM_WIDTH } from './constants';
import { useRouletteAudio } from '@/hooks/useRouletteAudio';

interface UseRouletteAnimationProps {
  rouletteData: RouletteData | null;
  isAnimating: boolean;
  onAnimationComplete: (finalTransform: string) => void;
  onShowWinner: () => void;
  onSpinComplete?: (item: RouletteData['winnerItem']) => void;
}

export const useRouletteAnimation = ({
  rouletteData,
  isAnimating,
  onAnimationComplete,
  onShowWinner,
  onSpinComplete
}: UseRouletteAnimationProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    startBackgroundMusic,
    stopBackgroundMusic,
    startTickLoop,
    stopTickLoop,
    playRareItemSound,
  } = useRouletteAudio();

  const startSpin = useCallback(() => {
    if (!rouletteData || isAnimating || !trackRef.current || !containerRef.current) return;

    const { centerIndex, winnerItem, totalSlots } = rouletteData;

    // Limpar qualquer animação anterior
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = 'translateX(0px)';
    }

    // Iniciar música de fundo
    startBackgroundMusic();
    startTickLoop(50);

    // Calcular posição exata do item vencedor
    const containerWidth = containerRef.current.offsetWidth;
    const centerPosition = containerWidth / 2;
    const itemWidth = ITEM_WIDTH;
    const trackWidth = totalSlots * itemWidth;
    
    // Posição do item vencedor (centro do item)
    const winnerItemPosition = centerIndex * itemWidth + (itemWidth / 2);
    
    // Distância para centralizar o item vencedor na seta
    const targetOffset = winnerItemPosition - centerPosition;
    
    // Adicionar voltas extras para efeito visual (3-5 voltas)
    const extraSpins = 4;
    const totalDistance = targetOffset + (extraSpins * trackWidth);

    // Configurar largura da trilha para permitir as voltas extras
    if (trackRef.current) {
      trackRef.current.style.width = `${trackWidth * 6}px`;
    }

    console.log('Iniciando animação:', {
      centerIndex,
      winnerItem: winnerItem.name,
      targetOffset,
      totalDistance,
      trackWidth
    });

    // Aplicar animação com timing personalizado
    setTimeout(() => {
      if (trackRef.current) {
        // Animação de 4 segundos com curva ease-out realista
        trackRef.current.style.transition = 'transform 4000ms cubic-bezier(0.25, 0.1, 0.25, 1)';
        trackRef.current.style.transform = `translateX(-${totalDistance}px)`;
      }
    }, 100);

    // Parar sons e mostrar resultado após 4.2s
    setTimeout(() => {
      stopTickLoop();
      stopBackgroundMusic();
      
      // Garantir posição final exata
      if (trackRef.current) {
        trackRef.current.style.transition = 'none';
        trackRef.current.style.transform = `translateX(-${totalDistance}px)`;
      }

      console.log('Animação finalizada, posição final:', totalDistance);
      
      const finalTransform = `translateX(-${totalDistance}px)`;
      onAnimationComplete(finalTransform);

      // Mostrar efeito de destaque no item após 300ms
      setTimeout(() => {
        console.log('Mostrando item vencedor:', winnerItem.name);
        onShowWinner();

        // Som especial para itens raros
        if (['rare', 'epic', 'legendary', 'special'].includes(winnerItem.rarity)) {
          playRareItemSound(winnerItem.rarity);
        }

        // Abrir popup após efeito de destaque (1.5s)
        setTimeout(() => {
          console.log('Abrindo popup do prêmio');
          onSpinComplete?.(winnerItem);
        }, 1500);
      }, 300);
    }, 4200);
  }, [
    rouletteData,
    isAnimating,
    startBackgroundMusic,
    stopBackgroundMusic,
    startTickLoop,
    stopTickLoop,
    playRareItemSound,
    onAnimationComplete,
    onShowWinner,
    onSpinComplete
  ]);

  return {
    trackRef,
    containerRef,
    startSpin
  };
};