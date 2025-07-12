
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

  // Função para medir posições de forma mais precisa
  const measurePrecisePositions = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return null;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Aguardar um frame para garantir que o DOM está atualizado
    return new Promise<{
      containerCenter: number;
      realItemWidth: number;
      trackWidth: number;
    }>((resolve) => {
      requestAnimationFrame(() => {
        // Centro exato do container (onde a seta aponta)
        const containerCenter = containerRect.width / 2;
        
        // Medir largura real do primeiro item visível
        const firstItem = trackRef.current?.querySelector('[data-item-index="0"]') as HTMLElement;
        let realItemWidth = 140; // fallback
        
        if (firstItem) {
          const itemRect = firstItem.getBoundingClientRect();
          const itemStyle = window.getComputedStyle(firstItem);
          const marginLeft = parseFloat(itemStyle.marginLeft) || 0;
          const marginRight = parseFloat(itemStyle.marginRight) || 0;
          realItemWidth = itemRect.width + marginLeft + marginRight;
        }

        const trackWidth = (rouletteData?.rouletteSlots.length || 25) * realItemWidth;

        console.log('🎯 MEDIÇÕES PRECISAS:', {
          containerCenter,
          realItemWidth,
          trackWidth,
          containerWidth: containerRect.width
        });

        resolve({
          containerCenter,
          realItemWidth,
          trackWidth
        });
      });
    });
  }, [rouletteData]);

  const startSpin = useCallback(async () => {
    if (!rouletteData || !canSpin || !trackRef.current || !containerRef.current) {
      return;
    }

    const { centerIndex, rouletteSlots } = rouletteData;
    
    // Medir posições com mais precisão
    const measurements = await measurePrecisePositions();
    if (!measurements) return;

    const { containerCenter, realItemWidth, trackWidth } = measurements;
    
    // Limpar animação anterior
    clearAnimation();
    resetTrack();
    setState('spinning');

    // Aguardar um frame para garantir reset
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Calcular posição onde o item vencedor deve parar
    // O item vencedor está na posição centerIndex
    const winnerItemCenterPosition = (centerIndex * realItemWidth) + (realItemWidth / 2);
    
    // Para garantir que pare no centro, calculamos a distância total
    const extraRotations = 3; // número de voltas completas
    const baseDistance = extraRotations * trackWidth;
    
    // A distância final deve posicionar o centro do item vencedor
    // exatamente no centro do container
    const finalDistance = baseDistance + winnerItemCenterPosition - containerCenter;
    
    console.log('🚀 CÁLCULO FINAL:', {
      centerIndex,
      winnerItemCenterPosition,
      containerCenter,
      baseDistance,
      finalDistance,
      verificacao: `Item center at: ${winnerItemCenterPosition}px, Container center: ${containerCenter}px`
    });

    // Iniciar sons
    startBackgroundMusic();
    startTickLoop(50);

    // Aplicar animação
    animationRef.current = window.setTimeout(() => {
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 4000ms cubic-bezier(0.25, 0.1, 0.25, 1)';
        trackRef.current.style.transform = `translateX(-${finalDistance}px)`;
        
        console.log('🎰 Animação iniciada:', `translateX(-${finalDistance}px)`);
        
        // Parar animação após 4 segundos
        animationRef.current = window.setTimeout(() => {
          stopTickLoop();
          stopBackgroundMusic();
          setState('stopping');

          // Verificação final de posicionamento
          animationRef.current = window.setTimeout(async () => {
            // Re-medir para verificar posição final
            const finalMeasurements = await measurePrecisePositions();
            if (finalMeasurements && trackRef.current) {
              const currentTransform = trackRef.current.style.transform;
              const currentOffset = parseFloat(currentTransform.replace('translateX(-', '').replace('px)', ''));
              
              // Calcular onde o item realmente está
              const actualItemPosition = winnerItemCenterPosition - currentOffset;
              const centerOffset = finalMeasurements.containerCenter - actualItemPosition;
              
              console.log('🔍 VERIFICAÇÃO FINAL:', {
                currentOffset,
                actualItemPosition,
                targetCenter: finalMeasurements.containerCenter,
                centerOffset
              });
              
              // Se houver desvio maior que 2px, fazer correção
              if (Math.abs(centerOffset) > 2) {
                const correctedDistance = currentOffset + centerOffset;
                trackRef.current.style.transform = `translateX(-${correctedDistance}px)`;
                console.log('🔧 CORREÇÃO APLICADA:', centerOffset + 'px');
              }
            }

            setState('winner');
            
            // Som especial para itens raros
            if (rouletteData.winnerItem && ['rare', 'epic', 'legendary', 'special'].includes(rouletteData.winnerItem.rarity)) {
              playRareItemSound(rouletteData.winnerItem.rarity);
            }

            // Abrir popup após efeito
            animationRef.current = window.setTimeout(() => {
              setState('complete');
              console.log('🎉 Popup do prêmio aberto');
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
    measurePrecisePositions
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
