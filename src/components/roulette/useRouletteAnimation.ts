
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
  const animationRef = useRef<number | null>(null);

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

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

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
    
    // Adicionar voltas extras (4 voltas completas para suavidade)
    const extraSpins = 4;
    const totalDistance = targetOffset + (extraSpins * trackWidth);

    // Configurar trilha inicial
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = `translateX(0px)`;
      trackRef.current.style.width = `${trackWidth * 4}px`;
    }

    // Parâmetros da animação melhorados
    const totalDuration = 6000; // 6 segundos para mais suavidade
    const startTime = performance.now();
    let isComplete = false;

    // Função de easing customizada mais suave
    const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

    const animate = (timestamp: number) => {
      if (isComplete) return;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      // Aplicar easing
      const easedProgress = easeOutQuart(progress);
      const currentPosition = totalDistance * easedProgress;

      // Atualizar posição visual
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${currentPosition}px)`;
      }

      // Som de tick baseado na velocidade (simplificado)
      const velocity = progress < 0.8 ? 1 - progress : 0;
      if (velocity > 0.3 && Math.random() < 0.1) {
        startTickLoop(100);
        setTimeout(() => stopTickLoop(), 50);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animação finalizada
        isComplete = true;
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

          // Callback final
          setTimeout(() => {
            onSpinComplete?.(winnerItem);
          }, 1000);
        }, 500);
      }
    };

    // Iniciar animação
    animationRef.current = requestAnimationFrame(animate);
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

  // Cleanup na desmontagem
  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    stopTickLoop();
    stopBackgroundMusic();
  }, [stopTickLoop, stopBackgroundMusic]);

  return {
    trackRef,
    containerRef,
    startSpin,
    cleanup
  };
};
