import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScratchCard, ScratchCardType, ScratchBlockState } from '@/types/scratchCard';
import { toast } from 'sonner';

export const useNewScratchCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [scratchCard, setScratchCard] = useState<ScratchCard | null>(null);
  const [blocks, setBlocks] = useState<ScratchBlockState[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [hasWin, setHasWin] = useState(false);

  const generateScratchCard = async (scratchType: ScratchCardType, forcedWin = false) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-scratch-card', {
        body: { scratchType, forcedWin }
      });

      if (error) throw error;

      const newCard: ScratchCard = {
        symbols: data.symbols,
        winningItem: data.winningItem,
        hasWin: data.hasWin,
        scratchType: data.scratchType
      };

      setScratchCard(newCard);
      setHasWin(data.hasWin);
      setGameComplete(false);

      // Inicializar blocos
      const initialBlocks: ScratchBlockState[] = Array.from({ length: 9 }, (_, index) => ({
        id: index,
        isScratched: false,
        symbol: data.symbols[index] || null
      }));

      setBlocks(initialBlocks);
      
    } catch (error) {
      console.error('Erro ao gerar raspadinha:', error);
      toast.error('Erro ao gerar raspadinha');
    } finally {
      setIsLoading(false);
    }
  };

  const scratchBlock = (blockId: number) => {
    setBlocks(prev => {
      const updated = prev.map(block =>
        block.id === blockId ? { ...block, isScratched: true } : block
      );
      
      // Verificar se o jogo está completo
      const scratchedCount = updated.filter(block => block.isScratched).length;
      if (scratchedCount >= 3) {
        checkWinningCombination(updated);
      }
      
      return updated;
    });
  };

  const checkWinningCombination = (currentBlocks: ScratchBlockState[]) => {
    const scratchedBlocks = currentBlocks.filter(block => block.isScratched);
    
    if (scratchedBlocks.length >= 3) {
      // Verificar se há 3 símbolos iguais
      const symbolCounts: { [key: string]: number } = {};
      
      scratchedBlocks.forEach(block => {
        if (block.symbol) {
          const symbolId = block.symbol.symbolId;
          symbolCounts[symbolId] = (symbolCounts[symbolId] || 0) + 1;
        }
      });

      const hasThreeOfAKind = Object.values(symbolCounts).some(count => count >= 3);
      
      if (hasThreeOfAKind || scratchedBlocks.length === 9) {
        setGameComplete(true);
      }
    }
  };

  const scratchAll = () => {
    setBlocks(prev => prev.map(block => ({ ...block, isScratched: true })));
    setGameComplete(true);
  };

  const resetGame = () => {
    setScratchCard(null);
    setBlocks([]);
    setGameComplete(false);
    setHasWin(false);
  };

  return {
    scratchCard,
    blocks,
    isLoading,
    gameComplete,
    hasWin,
    generateScratchCard,
    scratchBlock,
    scratchAll,
    checkWinningCombination,
    resetGame
  };
};