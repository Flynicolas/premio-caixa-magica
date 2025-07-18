import { useRef, useCallback } from 'react';
import { RouletteData } from './types';
import { useRouletteAudio } from '@/hooks/useRouletteAudio';
import { useRouletteState } from './useRouletteState';

interface UseNewRouletteAnimationProps {
  rouletteData: RouletteData | null;
  onSpinComplete?: () => void;
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
    
    // MEDIR EXATAMENTE ONDE A SETA ESTÁ
    const containerRect = containerRef.current.getBoundingClientRect();
    const setaElement = document.querySelector('.absolute.-top-8.left-1\\/2') as HTMLElement;
    
    let setaPosicao = containerRect.width / 2; // fallback
    if (setaElement) {
      const setaRect = setaElement.getBoundingClientRect();
      setaPosicao = setaRect.left + setaRect.width / 2 - containerRect.left;
    }
    
    // MEDIR EXATAMENTE ONDE O QUADRADO PONTILHADO ESTÁ
    const quadradoElement = document.querySelector('.absolute.top-0.left-1\\/2.transform.-translate-x-1\\/2.w-32') as HTMLElement;
    let quadradoPosicao = containerRect.width / 2; // fallback
    if (quadradoElement) {
      const quadradoRect = quadradoElement.getBoundingClientRect();
      quadradoPosicao = quadradoRect.left + quadradoRect.width / 2 - containerRect.left;
    }
    
    console.log('🎯 POSIÇÕES REAIS:', {
      setaPosicao: setaPosicao + 'px',
      quadradoPosicao: quadradoPosicao + 'px',
      diferenca: Math.abs(setaPosicao - quadradoPosicao) + 'px'
    });
    
    // USAR A POSIÇÃO DO QUADRADO PONTILHADO COMO REFERÊNCIA
    const alvoFinal = quadradoPosicao;
    
    // Calcular onde o centro do item vencedor deve ficar
    const ITEM_WIDTH = 140;
    const rotacoes = 3;
    const distanciaRotacoes = rotacoes * (rouletteSlots.length * ITEM_WIDTH);
    
    // Posição onde o item centerIndex estará depois das rotações
    const posicaoItem = centerIndex * ITEM_WIDTH + 70; // centro do item
    
    // Distância para o item ficar EXATAMENTE no quadrado pontilhado
    const distanciaTotal = distanciaRotacoes + posicaoItem - alvoFinal;
    
    console.log('🎯 CÁLCULO DIRETO:', {
      centerIndex,
      alvoFinal,
      posicaoItem,
      distanciaTotal,
      verificacao: `Item ficará em ${posicaoItem - distanciaTotal}px = Alvo em ${alvoFinal}px`
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
        trackRef.current.style.transform = `translateX(-${distanciaTotal}px)`;
        
        console.log('🚀 Animação aplicada medindo posições reais:', `translateX(-${distanciaTotal}px)`);
        
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

            // // Abrir popup após efeito de destaque
            animationRef.current = window.setTimeout(() => {
              setState('complete');
              console.log('Abrindo popup do prêmio');
              onSpinComplete?.();
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