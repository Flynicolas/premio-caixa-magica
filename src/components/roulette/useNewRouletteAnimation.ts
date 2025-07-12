
import { useRef, useCallback } from 'react';
import { RouletteData } from './types';
import { useRouletteAudio } from '@/hooks/useRouletteAudio';
import { useRouletteState } from './useRouletteState';

interface UseNewRouletteAnimationProps {
  rouletteData: RouletteData | null;
  onSpinComplete?: (item: RouletteData['winnerItem']) => void;
}

export const useNewRouletteAnimation = ({
  rouletteData,
  onSpinComplete
}: UseNewRouletteAnimationProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const { state, setState, isAnimating, canSpin, reset } = useRouletteState();

  const {
    startBackgroundMusic,
    stopBackgroundMusic,
    startTickLoop,
    stopTickLoop,
    playRareItemSound,
  } = useRouletteAudio();

  const clearAnimation = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const resetTrack = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = 'translateX(0px)';
    }
  }, []);

  // Função para medir dinamicamente as posições reais dos elementos
  const measureRealPositions = useCallback(() => {
    if (!containerRef.current) return null;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Medir posição da seta
    const arrowElement = document.querySelector('.absolute.-top-8.left-1\\/2.transform.-translate-x-1\\/2') as HTMLElement;
    let arrowCenterX = containerRect.width / 2; // fallback
    
    if (arrowElement) {
      const arrowRect = arrowElement.getBoundingClientRect();
      arrowCenterX = arrowRect.left + arrowRect.width / 2 - containerRect.left;
    }

    // Medir posição do quadrado pontilhado (zona de destaque)
    const targetZoneElement = document.querySelector('.absolute.top-0.left-1\\/2.transform.-translate-x-1\\/2.w-32') as HTMLElement;
    let targetCenterX = containerRect.width / 2; // fallback
    
    if (targetZoneElement) {
      const targetRect = targetZoneElement.getBoundingClientRect();
      targetCenterX = targetRect.left + targetRect.width / 2 - containerRect.left;
    }

    // Medir largura real de um item
    const itemElement = trackRef.current?.querySelector('[data-item-index="0"]') as HTMLElement;
    let realItemWidth = 140; // fallback
    
    if (itemElement) {
      const itemRect = itemElement.getBoundingClientRect();
      realItemWidth = itemRect.width + 16; // incluindo margin
    }

    return {
      containerWidth: containerRect.width,
      arrowCenterX,
      targetCenterX,
      realItemWidth
    };
  }, []);

  const startSpin = useCallback(() => {
    if (!rouletteData || !canSpin || !trackRef.current || !containerRef.current) {
      return;
    }

    const { centerIndex, rouletteSlots } = rouletteData;
    
    // Medir posições reais dinamicamente
    const measurements = measureRealPositions();
    if (!measurements) return;

    const { targetCenterX, realItemWidth } = measurements;
    
    console.log('🎯 MEDIÇÕES DINÂMICAS:', {
      targetCenterX: targetCenterX + 'px',
      realItemWidth: realItemWidth + 'px',
      centerIndex,
      totalSlots: rouletteSlots.length
    });

    // Calcular posicionamento preciso
    const rotations = 3; // número de voltas completas
    const trackTotalWidth = rouletteSlots.length * realItemWidth;
    const distanciaRotacoes = rotations * trackTotalWidth;
    
    // Posição onde o centro do item vencedor estará (considerando que usamos 3 repetições da trilha)
    const targetDuplicateIndex = 2; // terceira repetição onde o item deve parar
    const itemPositionInTrack = (targetDuplicateIndex * trackTotalWidth) + (centerIndex * realItemWidth) + (realItemWidth / 2);
    
    // Distância total para o item ficar exatamente no centro da zona de destaque
    const totalDistance = itemPositionInTrack - targetCenterX;
    
    console.log('🚀 CÁLCULO PRECISO:', {
      rotations,
      trackTotalWidth,
      itemPositionInTrack,
      targetCenterX,
      totalDistance,
      verificacao: `Item ficará em ${itemPositionInTrack - totalDistance}px = Target em ${targetCenterX}px`
    });
    
    // Limpar animação anterior
    clearAnimation();
    resetTrack();

    // Atualizar estado
    setState('spinning');

    // Iniciar sons
    startBackgroundMusic();
    startTickLoop(50);

    // Forçar reflow antes da animação
    trackRef.current.offsetHeight;

    // Aplicar animação após um pequeno delay
    animationRef.current = window.setTimeout(() => {
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 4000ms cubic-bezier(0.25, 0.1, 0.25, 1)';
        trackRef.current.style.transform = `translateX(-${totalDistance}px)`;
        
        console.log('🎰 Animação aplicada com medições dinâmicas:', `translateX(-${totalDistance}px)`);
        
        // Após 4 segundos, parar sons e mostrar winner
        animationRef.current = window.setTimeout(() => {
          stopTickLoop();
          stopBackgroundMusic();
          setState('stopping');

          console.log('🏆 Parando animação, verificando posicionamento final');

          // Verificar posicionamento final e fazer micro-ajuste se necessário
          animationRef.current = window.setTimeout(() => {
            const finalMeasurements = measureRealPositions();
            if (finalMeasurements && trackRef.current) {
              const currentTransform = trackRef.current.style.transform;
              const currentDistance = parseFloat(currentTransform.replace('translateX(-', '').replace('px)', ''));
              
              // Calcular se precisa de micro-ajuste
              const itemFinalPosition = itemPositionInTrack - currentDistance;
              const offset = finalMeasurements.targetCenterX - itemFinalPosition;
              
              if (Math.abs(offset) > 2) { // Se o offset for maior que 2px, fazer micro-ajuste
                const adjustedDistance = currentDistance + offset;
                trackRef.current.style.transform = `translateX(-${adjustedDistance}px)`;
                console.log('🔧 Micro-ajuste aplicado:', offset + 'px');
              }
            }

            setState('winner');
            
            // Som especial para itens raros
            if (rouletteData.winnerItem && ['rare', 'epic', 'legendary', 'special'].includes(rouletteData.winnerItem.rarity)) {
              playRareItemSound(rouletteData.winnerItem.rarity);
            }

            // Abrir popup após efeito de destaque
            animationRef.current = window.setTimeout(() => {
              setState('complete');
              console.log('🎉 Abrindo popup do prêmio');
              onSpinComplete?.(rouletteData.winnerItem);
            }, 1500);
          }, 300);
        }, 4000);
      }
    }, 100);
  }, [
    rouletteData,
    canSpin,
    setState,
    clearAnimation,
    resetTrack,
    startBackgroundMusic,
    startTickLoop,
    stopTickLoop,
    stopBackgroundMusic,
    playRareItemSound,
    onSpinComplete,
    measureRealPositions
  ]);

  const resetRoulette = useCallback(() => {
    clearAnimation();
    stopTickLoop();
    stopBackgroundMusic();
    resetTrack();
    reset();
    console.log('🔄 Roleta resetada');
  }, [clearAnimation, stopTickLoop, stopBackgroundMusic, resetTrack, reset]);

  return {
    trackRef,
    containerRef,
    startSpin,
    resetRoulette,
    state,
    isAnimating,
    canSpin
  };
};
