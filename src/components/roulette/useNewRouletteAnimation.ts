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

  const startSpin = useCallback(() => {
    if (!rouletteData || !canSpin || !trackRef.current || !containerRef.current) {
      console.log('Não pode iniciar animação:', { 
        rouletteData: !!rouletteData, 
        canSpin, 
        trackRef: !!trackRef.current,
        containerRef: !!containerRef.current 
      });
      return;
    }

    // Calcular posicionamento no momento da animação
    const containerWidth = containerRef.current.offsetWidth;
    if (containerWidth === 0) {
      console.log('Container width é 0, aguardando...');
      return;
    }

    const { centerIndex, rouletteSlots } = rouletteData;
    const itemWidth = 140; // ITEM_WIDTH
    const centerPosition = containerWidth / 2;
    
    // Corrigir posição: calcular exatamente onde o item deve parar para ficar na seta
    const duplicateSet = 2; // Terceira repetição (índice 2)
    const targetItemIndex = centerIndex; // O item que queremos na seta
    
    // Posição absoluta do item vencedor na trilha (incluindo as repetições)
    const absoluteItemPosition = (duplicateSet * rouletteSlots.length + targetItemIndex) * itemWidth;
    
    // Centro do item (considerando margem de 8px de cada lado = 16px total)
    const itemCenterOffset = (itemWidth - 16) / 2 + 8; // 8px é a margem esquerda
    
    // Posição do centro do item vencedor
    const itemCenterPosition = absoluteItemPosition + itemCenterOffset;
    
    // Distância total necessária para centralizar o item na seta
    const targetOffset = itemCenterPosition - centerPosition;
    
    const fullRotations = 2;
    const trackWidth = rouletteSlots.length * itemWidth;
    const totalDistance = targetOffset + (fullRotations * trackWidth);

    console.log('Iniciando nova animação da roleta');
    console.log('Cálculos da animação:', {
      centerIndex,
      containerWidth,
      centerPosition,
      itemCenterPosition,
      targetOffset,
      totalDistance
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
        
        console.log('Animação aplicada:', `translateX(-${totalDistance}px)`);
        
        // Após 4 segundos, parar sons e mostrar winner
        animationRef.current = window.setTimeout(() => {
          stopTickLoop();
          stopBackgroundMusic();
          setState('stopping');

          console.log('Parando animação, mostrando winner');

          // Mostrar efeito de winner
          animationRef.current = window.setTimeout(() => {
            setState('winner');
            
            // Som especial para itens raros
            if (rouletteData.winnerItem && ['rare', 'epic', 'legendary', 'special'].includes(rouletteData.winnerItem.rarity)) {
              playRareItemSound(rouletteData.winnerItem.rarity);
            }

            // Abrir popup após efeito de destaque
            animationRef.current = window.setTimeout(() => {
              setState('complete');
              console.log('Abrindo popup do prêmio');
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
    onSpinComplete
  ]);

  const resetRoulette = useCallback(() => {
    clearAnimation();
    stopTickLoop();
    stopBackgroundMusic();
    resetTrack();
    reset();
    console.log('Roleta resetada');
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