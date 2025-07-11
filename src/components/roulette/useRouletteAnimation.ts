import { useCallback, useRef } from 'react';
import { RouletteData } from './types';
import { ITEM_WIDTH } from './constants';
import { useRouletteAudio } from '@/hooks/useRouletteAudio';

interface UseRouletteAnimationProps {
  rouletteData: RouletteData | null;
  isAnimating: boolean;
  onAnimationComplete: (finalTransform: string) => void;
  onShowWinner: () => void;
  onSpinComplete?: (item: RouletteData['winnerItem']) => void;
}

export const useRouletteAnimation = ({
  rouletteData,
  isAnimating,
  onAnimationComplete,
  onShowWinner,
  onSpinComplete
}: UseRouletteAnimationProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    startBackgroundMusic,
    stopBackgroundMusic,
    startTickLoop,
    stopTickLoop,
    playRareItemSound,
  } = useRouletteAudio();

  const startSpin = useCallback(() => {
    if (!rouletteData || isAnimating || !trackRef.current || !containerRef.current) return;

    const { centerIndex, winnerItem, totalSlots } = rouletteData;

    // Iniciar música de fundo
    startBackgroundMusic();

    // @definir total_slots = tamanho de lista_itens
    const lista_itens = rouletteData.rouletteSlots;
    const total_slots = lista_itens.length;
    
    // @definir indice_item = posição de item_sorteado na lista_itens
    const indice_item = centerIndex;
    
    // @definir graus_por_slot = dividir 360 por total_slots
    const graus_por_slot = 360 / total_slots;
    
    // @definir destino_final = somar (multiplicar 360 por 5) com (multiplicar indice_item por graus_por_slot)
    const destino_final = (360 * 5) + (indice_item * graus_por_slot);

    // Configurar trilha inicial - resetar completamente
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = 'translateX(0px)';
      trackRef.current.style.width = `${total_slots * ITEM_WIDTH * 4}px`;
    }

    // Calcular posição final em pixels baseada nos graus
    const containerWidth = containerRef.current.offsetWidth;
    const centerPosition = containerWidth / 2;
    const itemWidth = ITEM_WIDTH;
    
    // Conversão dos graus para posição linear da trilha
    const finalPosition = (destino_final / 360) * (total_slots * itemWidth);
    const winnerItemCenter = indice_item * itemWidth + (itemWidth / 2);
    const adjustedFinalPosition = finalPosition - (centerPosition - winnerItemCenter);

    // @girar elemento roleta para destino_final graus com duração 4s e curva ease-out
    const duracao = 4000; // 4 segundos
    
    // Aplicar animação CSS direta com ease-out
    setTimeout(() => {
      if (trackRef.current) {
        trackRef.current.style.transition = `transform ${duracao}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        trackRef.current.style.transform = `translateX(-${adjustedFinalPosition}px)`;
      }
    }, 50);

    // Controle de som simplificado
    startTickLoop(100);
    
    // @aguardar 4.2s
    setTimeout(() => {
      stopTickLoop();
      stopBackgroundMusic();
      
      // Garantir posição final exata
      if (trackRef.current) {
        trackRef.current.style.transition = 'none';
        trackRef.current.style.transform = `translateX(-${adjustedFinalPosition}px)`;
      }
      
      const finalTransform = `translateX(-${adjustedFinalPosition}px)`;
      onAnimationComplete(finalTransform);

      // @mostrar efeito destaque em item_sorteado
      setTimeout(() => {
        onShowWinner();

        // Som especial para itens raros
        if (['rare', 'epic', 'legendary', 'special'].includes(winnerItem.rarity)) {
          playRareItemSound(winnerItem.rarity);
        }

        // @abrir janela popup_premio com dados de item_sorteado
        setTimeout(() => {
          onSpinComplete?.(winnerItem);
        }, 800); // Tempo para o efeito de destaque
      }, 200);
    }, 4200); // 4.2s exatos
  }, [
    rouletteData,
    isAnimating,
    startBackgroundMusic,
    stopBackgroundMusic,
    startTickLoop,
    stopTickLoop,
    playRareItemSound,
    onAnimationComplete,
    onShowWinner,
    onSpinComplete
  ]);

  return {
    trackRef,
    containerRef,
    startSpin
  };
};