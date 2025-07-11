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
    const centerPosition = containerWidth / 2;
    
    // USAR AS MESMAS CONSTANTES DO COMPONENTE NewRouletteTrack
    const duplicateSet = 2; // Terceira repetição (índice 2) - onde para a animação
    
    // Análise exata do CSS do NewRouletteTrack:
    // - style={{ width: `${ITEM_WIDTH - 16}px` }} = 124px
    // - className="mx-2" = margin: 0 8px (16px total horizontal)
    // - Total por item = 124px + 16px = 140px
    const itemWidth = 140; // ITEM_WIDTH constante
    const itemRealWidth = 124; // ITEM_WIDTH - 16 (CSS real)
    const marginHorizontal = 16; // mx-2 = 8px cada lado
    
    // Posição do item vencedor na terceira repetição
    const winnerSlotIndex = duplicateSet * rouletteSlots.length + centerIndex;
    
    // Posição do início do slot (borda esquerda incluindo margem)
    const slotStartPosition = winnerSlotIndex * itemWidth;
    
    // Posição do centro do item real (início + margem esquerda + metade do item)
    const itemCenterPosition = slotStartPosition + (marginHorizontal / 2) + (itemRealWidth / 2);
    
    // Cálculo para centralizar o item na seta (centro do container)
    const targetOffset = itemCenterPosition - centerPosition;
    
    const fullRotations = 2;
    const trackWidth = rouletteSlots.length * itemWidth;
    const totalDistance = targetOffset + (fullRotations * trackWidth);

    console.log('=== ANÁLISE CORRIGIDA DA ROLETA ===');
    console.log('1. Dados básicos:', {
      centerIndex,
      containerWidth,
      centerPosition,
      itemWidth,
      itemRealWidth,
      marginHorizontal
    });
    console.log('2. Posicionamento:', {
      duplicateSet,
      winnerSlotIndex,
      slotStartPosition,
      itemCenterPosition,
      targetOffset,
      totalDistance,
      trackWidth
    });
    console.log('3. Verificação da seta:');
    console.log('   - Seta está em:', centerPosition + 'px do início do container');
    console.log('   - Item deve ficar em:', itemCenterPosition - totalDistance + 'px após animação');
    console.log('   - Diferença final:', Math.abs(centerPosition - (itemCenterPosition - totalDistance)) + 'px');
    
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