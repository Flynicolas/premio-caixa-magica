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

    // MEDIÇÃO EXATA DOS ELEMENTOS RENDERIZADOS
    const containerWidth = containerRef.current.offsetWidth;
    const centerPosition = containerWidth / 2; // Posição da seta

    const { centerIndex, rouletteSlots } = rouletteData;
    
    // ANÁLISE REAL DO CSS DO NewRouletteTrack:
    // Cada item tem: mx-2 (8px cada lado) + width real (124px) = 140px total
    const SLOT_WIDTH = 140; // Total spacing per item (matches ITEM_WIDTH)
    
    // O item vencedor está na terceira repetição (index 2)
    const duplicateIndex = 2;
    const winnerAbsoluteIndex = duplicateIndex * rouletteSlots.length + centerIndex;
    
    // Posição onde o slot começa
    const slotLeftEdge = winnerAbsoluteIndex * SLOT_WIDTH;
    
    // EXATO conforme o CSS: mx-2 = 8px margem esquerda + 124px item + 8px margem direita
    const marginLeft = 8;
    const itemRealWidth = 124; // ITEM_WIDTH - 16 do CSS
    const itemCenterInSlot = marginLeft + (itemRealWidth / 2); // 8 + 62 = 70px
    
    // Posição absoluta do centro do item
    const itemCenterPosition = slotLeftEdge + itemCenterInSlot;
    
    // Distância para mover o item para a posição da seta
    const targetOffset = itemCenterPosition - centerPosition;
    
    // Rotações extras para efeito visual
    const extraRotations = 2;
    const trackWidth = rouletteSlots.length * SLOT_WIDTH;
    const totalDistance = targetOffset + (extraRotations * trackWidth);

    console.log('=== CÁLCULO EXATO DO ALINHAMENTO ===');
    console.log('1. Dados básicos:', {
      centerIndex,
      containerWidth,
      centerPosition,
      SLOT_WIDTH,
      itemRealWidth,
      marginLeft
    });
    console.log('2. Posicionamento:', {
      duplicateIndex,
      winnerAbsoluteIndex,
      slotLeftEdge,
      itemCenterInSlot,
      itemCenterPosition,
      targetOffset,
      totalDistance
    });
    console.log('3. Verificação final:');
    console.log('   - Seta posição:', centerPosition + 'px');
    console.log('   - Item final:', (itemCenterPosition - totalDistance) + 'px');
    console.log('   - Alinhamento perfeito?', Math.abs(centerPosition - (itemCenterPosition - totalDistance)) < 1 ? 'SIM' : 'NÃO');
    
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