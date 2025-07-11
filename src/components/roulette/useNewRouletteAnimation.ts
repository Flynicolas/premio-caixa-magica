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
      return;
    }

    // MEDIÇÃO REAL DOS ELEMENTOS NO DOM
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    
    // Encontrar a seta real no DOM para medir sua posição exata
    const arrow = containerRef.current.parentElement?.querySelector('.absolute.-top-8') as HTMLElement;
    let arrowCenterX = containerWidth / 2; // Fallback
    
    if (arrow) {
      const arrowRect = arrow.getBoundingClientRect();
      arrowCenterX = arrowRect.left + arrowRect.width / 2 - containerRect.left;
      console.log('Posição real da seta medida:', arrowCenterX, 'px do início do container');
    }

    const { centerIndex, rouletteSlots } = rouletteData;
    
    // Medição real dos itens no DOM
    const firstItem = trackRef.current.querySelector('[data-item-index="0"]') as HTMLElement;
    let itemSpacing = 140; // Fallback
    let itemWidth = 124; // Fallback
    let marginLeft = 8; // Fallback
    
    if (firstItem) {
      const itemRect = firstItem.getBoundingClientRect();
      itemWidth = itemRect.width;
      const computedStyle = window.getComputedStyle(firstItem);
      marginLeft = parseFloat(computedStyle.marginLeft);
      itemSpacing = itemWidth + marginLeft + parseFloat(computedStyle.marginRight);
      console.log('Medições reais do item:', { itemWidth, marginLeft, itemSpacing });
    }
    
    // O item vencedor está na terceira repetição
    const duplicateIndex = 2;
    const winnerAbsoluteIndex = duplicateIndex * rouletteSlots.length + centerIndex;
    
    // Calcular posição exata baseada nas medições reais
    const slotLeftEdge = winnerAbsoluteIndex * itemSpacing;
    const itemCenterPosition = slotLeftEdge + marginLeft + (itemWidth / 2);
    
    // Distância para alinhar com a posição real da seta
    const targetOffset = itemCenterPosition - arrowCenterX;
    
    // Rotações extras
    const extraRotations = 2;
    const trackWidth = rouletteSlots.length * itemSpacing;
    const totalDistance = targetOffset + (extraRotations * trackWidth);

    console.log('=== MEDIÇÃO REAL DO DOM ===');
    console.log('Container width:', containerWidth);
    console.log('Posição real da seta:', arrowCenterX);
    console.log('Item spacing medido:', itemSpacing);
    console.log('Item width medido:', itemWidth);
    console.log('Margin left medido:', marginLeft);
    console.log('Winner index:', centerIndex, 'na posição absoluta:', winnerAbsoluteIndex);
    console.log('Slot left edge:', slotLeftEdge);
    console.log('Item center position:', itemCenterPosition);
    console.log('Target offset:', targetOffset);
    console.log('Total distance:', totalDistance);
    console.log('Verificação: item final em', (itemCenterPosition - totalDistance), 'vs seta em', arrowCenterX);
    
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