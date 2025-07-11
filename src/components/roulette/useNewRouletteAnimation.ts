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

    const { centerIndex, rouletteSlots } = rouletteData;
    
    // SOLUÇÃO EMPÍRICA DIRETA
    const containerWidth = containerRef.current.offsetWidth;
    const centerPosition = containerWidth / 2;
    
    // Usar medições fixas baseadas no CSS conhecido
    const ITEM_SPACING = 140; // ITEM_WIDTH
    
    // Calcular quantas rotações completas + posição final
    const baseRotations = 3; // Rotações base para efeito visual
    const baseDistance = baseRotations * (rouletteSlots.length * ITEM_SPACING);
    
    // Posição final onde queremos que o item centerIndex pare
    // Vamos colocar o item vencedor no centro exato da tela
    const targetItemPosition = centerIndex * ITEM_SPACING;
    
    // O centro do item está a 70px do início do slot (8px margin + 62px metade)
    const itemCenterOffset = 70;
    const targetItemCenter = targetItemPosition + itemCenterOffset;
    
    // Distância total = rotações base + ajuste para centralizar
    const totalDistance = baseDistance + targetItemCenter - centerPosition;
    
    // CORREÇÃO EMPÍRICA: Se está caindo "próximo", vamos ajustar
    // Baseado na observação de que está ligeiramente desalinhado
    const CORRECTION_OFFSET = -35; // Ajuste empírico em pixels
    const finalDistance = totalDistance + CORRECTION_OFFSET;
    
    console.log('CORREÇÃO EMPÍRICA:', {
      centerIndex,
      containerWidth,
      centerPosition,
      targetItemPosition,
      targetItemCenter,
      baseDistance,
      totalDistance,
      correcao: CORRECTION_OFFSET,
      finalDistance
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
        trackRef.current.style.transform = `translateX(-${finalDistance}px)`;
        
        console.log('🚀 Animação aplicada com correção:', `translateX(-${finalDistance}px)`);
        
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