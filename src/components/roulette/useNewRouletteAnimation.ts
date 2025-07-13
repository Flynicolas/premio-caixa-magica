import { useRef, useCallback } from 'react';
import { RouletteData } from './types';
import { useRouletteAudio } from '@/hooks/useRouletteAudio';
import { useRouletteState } from './useRouletteState';
    const ITEM_WIDTH = 140;

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
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const setaElement = document.querySelector('.absolute.-top-8.left-1\\/2') as HTMLElement;
    
    let setaPosicao = containerRect.width / 2; 
    if (setaElement) {
      const setaRect = setaElement.getBoundingClientRect();
      setaPosicao = setaRect.left + setaRect.width / 2 - containerRect.left;
    }
    
    const quadradoElement = document.querySelector('.absolute.top-0.left-1\\/2.transform.-translate-x-1\\/2.w-32') as HTMLElement;
    let quadradoPosicao = containerRect.width / 2;
    if (quadradoElement) {
      const quadradoRect = quadradoElement.getBoundingClientRect();
      quadradoPosicao = quadradoRect.left + quadradoRect.width / 2 - containerRect.left;
    }
    
    console.log('🎯 POSIÇÕES REAIS:', {
      setaPosicao: setaPosicao + 'px',
      quadradoPosicao: quadradoPosicao + 'px',
      diferenca: Math.abs(setaPosicao - quadradoPosicao) + 'px'
    });
    
    const alvoFinal = quadradoPosicao;
    
    const rotacoes = 3;
    const distanciaRotacoes = rotacoes * (rouletteSlots.length * ITEM_WIDTH);
    
    const posicaoItem = centerIndex * ITEM_WIDTH + ITEM_WIDTH / 2;
    
    const estiloAtual = getComputedStyle(trackRef.current);
    const matriz = new WebKitCSSMatrix(estiloAtual.transform);
    const posicaoAtual = Math.abs(matriz.m41); 

    const distanciaTotal = distanciaRotacoes + posicaoItem - alvoFinal - posicaoAtual;

    
    console.log('🎯 CÁLCULO DIRETO:', {
      centerIndex,
      alvoFinal,
      posicaoItem,
      distanciaTotal,
      verificacao: `Item ficará em ${posicaoItem - distanciaTotal}px = Alvo em ${alvoFinal}px`
    });
    
    clearAnimation();
    resetTrack();

    setState('spinning');

    startBackgroundMusic();
    startTickLoop(50);

    trackRef.current.offsetHeight;

    animationRef.current = window.setTimeout(() => {
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 4000ms cubic-bezier(0.25, 0.1, 0.25, 1)';
        trackRef.current.style.transform = `translateX(-${distanciaTotal}px)`;
        
        console.log('🚀 Animação aplicada medindo posições reais:', `translateX(-${distanciaTotal}px)`);
        
        animationRef.current = window.setTimeout(() => {
          stopTickLoop();
          stopBackgroundMusic();
          setState('stopping');

          console.log('Parando animação, mostrando winner');

          animationRef.current = window.setTimeout(() => {
            setState('winner');
            
            if (rouletteData.winnerItem && ['rare', 'epic', 'legendary', 'special'].includes(rouletteData.winnerItem.rarity)) {
              playRareItemSound(rouletteData.winnerItem.rarity);
            }

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
  reset();

  if (!rouletteData || !trackRef.current || !containerRef.current) {
    return;
  }

  const { centerIndex } = rouletteData;

  const containerWidth = containerRef.current.offsetWidth;
  const initialOffset = centerIndex * ITEM_WIDTH - (containerWidth / 2) + (ITEM_WIDTH / 2);

  trackRef.current.style.transition = 'none';
  trackRef.current.style.transform = `translateX(-${initialOffset}px)`;

  console.log('🎯 Roleta resetada com item centralizado:', {
    containerWidth,
    centerIndex,
    ITEM_WIDTH,
    initialOffset,
    transform: `translateX(-${initialOffset}px)`
  });
}, [clearAnimation, stopTickLoop, stopBackgroundMusic, reset, rouletteData]);

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