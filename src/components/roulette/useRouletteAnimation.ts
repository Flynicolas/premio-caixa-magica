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

    // Iniciar música de fundo
    startBackgroundMusic();

    // Calcular dimensões exatas
    const containerWidth = containerRef.current.offsetWidth;
    const trackWidth = totalSlots * ITEM_WIDTH;
    
    // Posição exata do centro do container
    const centerPosition = containerWidth / 2;
    
    // Posição do item vencedor (centro do item)
    const winnerItemCenter = centerIndex * ITEM_WIDTH + (ITEM_WIDTH / 2);
    
    // Distância necessária para centralizar o item vencedor
    const targetOffset = winnerItemCenter - centerPosition;
    
    // Adicionar voltas extras (3 voltas completas para suavidade)
    const extraSpins = 3;
    const totalDistance = targetOffset + (extraSpins * trackWidth);

    // Configurar trilha inicial
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = `translateX(0px)`;
      trackRef.current.style.width = `${trackWidth * 4}px`; // Simplicado: 4x ao invés de 6x
    }

    // Parâmetros da animação
    const totalDuration = 5000; // 5 segundos
    const startTime = performance.now();
    let currentPosition = 0;
    let lastTickTime = 0;
    let tickSoundActive = false;

    // Função de easing customizada (ease-out-cubic)
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      // Aplicar easing
      const easedProgress = easeOutCubic(progress);
      currentPosition = totalDistance * easedProgress;

      // Atualizar posição visual
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${currentPosition}px)`;
      }

      // Controle do som baseado na velocidade
      const velocity = (currentPosition - (lastTickTime > 0 ? (totalDistance * easeOutCubic((lastTickTime - startTime) / totalDuration)) : 0)) / (timestamp - (lastTickTime || startTime));
      const speed = Math.abs(velocity);
      
      // Som de tick baseado na velocidade
      if (speed > 0.1 && !tickSoundActive) {
        tickSoundActive = true;
        const tickInterval = Math.max(30, 200 - (speed * 150));
        startTickLoop(tickInterval);
        setTimeout(() => {
          stopTickLoop();
          tickSoundActive = false;
        }, tickInterval);
      }

      if (progress < 1) {
        lastTickTime = timestamp;
        requestAnimationFrame(animate);
      } else {
        // Animação finalizada
        stopTickLoop();
        stopBackgroundMusic();
        
        // Garantir posição final exata
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${totalDistance}px)`;
        }
        
        const finalTransform = `translateX(-${totalDistance}px)`;
        onAnimationComplete(finalTransform);

        // Mostrar resultado com delay
        setTimeout(() => {
          onShowWinner();

          // Som especial para itens raros
          if (['rare', 'epic', 'legendary', 'special'].includes(winnerItem.rarity)) {
            playRareItemSound(winnerItem.rarity);
          }

          // Zoom no item e callback
          setTimeout(() => {
            onSpinComplete?.(winnerItem);
          }, 1500); // Mais tempo para apreciar o zoom
        }, 300);
      }
    };

    // Iniciar animação
    requestAnimationFrame(animate);
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