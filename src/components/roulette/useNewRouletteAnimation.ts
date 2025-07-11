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

    console.log('🎯 INÍCIO DA ANÁLISE DETALHADA DA ROLETA');
    
    // 1. MEDIÇÃO DO CONTAINER
    const containerRect = containerRef.current.getBoundingClientRect();
    console.log('📏 Container:', {
      width: containerRect.width,
      height: containerRect.height,
      left: containerRect.left,
      top: containerRect.top
    });

    // 2. MEDIÇÃO DA SETA
    const arrowElement = document.querySelector('.absolute.-top-8.left-1\\/2') as HTMLElement;
    let arrowCenterX = containerRect.width / 2;
    
    if (arrowElement) {
      const arrowRect = arrowElement.getBoundingClientRect();
      const arrowCenterGlobal = arrowRect.left + arrowRect.width / 2;
      arrowCenterX = arrowCenterGlobal - containerRect.left;
      console.log('🎯 Seta medida:', {
        elemento: arrowElement,
        left: arrowRect.left,
        width: arrowRect.width,
        centerGlobal: arrowCenterGlobal,
        centerRelativo: arrowCenterX
      });
    } else {
      console.log('⚠️ Seta não encontrada, usando centro do container');
    }

    const { centerIndex, rouletteSlots } = rouletteData;
    console.log('🎲 Dados da roleta:', { centerIndex, totalSlots: rouletteSlots.length });

    // 3. MEDIÇÃO DOS ITENS REAIS
    const allItems = trackRef.current.querySelectorAll('[data-item-index]');
    console.log('🔍 Itens encontrados:', allItems.length);
    
    let itemWidth = 124;
    let itemSpacing = 140;
    let marginLeft = 8;
    
    if (allItems.length > 0) {
      const firstItem = allItems[0] as HTMLElement;
      const firstItemRect = firstItem.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(firstItem);
      
      itemWidth = firstItemRect.width;
      marginLeft = parseFloat(computedStyle.marginLeft) || 8;
      const marginRight = parseFloat(computedStyle.marginRight) || 8;
      itemSpacing = itemWidth + marginLeft + marginRight;
      
      console.log('📐 Item medido:', {
        width: itemWidth,
        marginLeft,
        marginRight,
        spacing: itemSpacing,
        computedStyle: {
          marginLeft: computedStyle.marginLeft,
          marginRight: computedStyle.marginRight,
          width: computedStyle.width
        }
      });
    }

    // 4. CÁLCULO DA POSIÇÃO DO ITEM VENCEDOR
    const duplicateIndex = 2; // Terceira repetição
    const winnerAbsoluteIndex = duplicateIndex * rouletteSlots.length + centerIndex;
    const slotLeftEdge = winnerAbsoluteIndex * itemSpacing;
    const itemCenterPosition = slotLeftEdge + marginLeft + (itemWidth / 2);
    
    console.log('🎯 Posicionamento do item vencedor:', {
      duplicateIndex,
      winnerAbsoluteIndex,
      slotLeftEdge,
      itemCenterPosition,
      marginLeft,
      itemWidth
    });

    // 5. CÁLCULO FINAL
    const targetOffset = itemCenterPosition - arrowCenterX;
    const extraRotations = 2;
    const trackWidth = rouletteSlots.length * itemSpacing;
    const totalDistance = targetOffset + (extraRotations * trackWidth);
    
    console.log('⚡ Cálculo final:', {
      targetOffset,
      extraRotations,
      trackWidth,
      totalDistance
    });

    // 6. VERIFICAÇÃO FINAL
    const finalItemPosition = itemCenterPosition - totalDistance;
    const diferenca = Math.abs(arrowCenterX - finalItemPosition);
    
    console.log('✅ Verificação final:', {
      setaEm: arrowCenterX + 'px',
      itemFinalEm: finalItemPosition + 'px',
      diferenca: diferenca + 'px',
      perfeito: diferenca < 1 ? '✅ SIM' : '❌ NÃO'
    });

    // AJUSTE FINO se necessário
    let adjustedDistance = totalDistance;
    if (diferenca > 1) {
      const ajuste = finalItemPosition - arrowCenterX;
      adjustedDistance = totalDistance + ajuste;
      console.log('🔧 Aplicando ajuste fino:', {
        ajusteNecessario: ajuste,
        novaDistancia: adjustedDistance
      });
    }
    
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
        trackRef.current.style.transform = `translateX(-${adjustedDistance}px)`;
        
        console.log('🚀 Animação aplicada:', `translateX(-${adjustedDistance}px)`, diferenca > 1 ? '(com ajuste fino)' : '(sem ajuste)');
        
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