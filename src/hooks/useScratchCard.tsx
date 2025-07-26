import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScratchCard, ScratchBlockState, ScratchCardType } from "@/types/scratchCard";

export const useScratchCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [scratchCard, setScratchCard] = useState<ScratchCard | null>(null);
  const [blocks, setBlocks] = useState<ScratchBlockState[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const { toast } = useToast();

  const generateScratchCard = useCallback(
    async (chestType: ScratchCardType, forcedWin = false) => {
      setIsLoading(true);
      setGameComplete(false);
      
      try {
        const { data, error } = await supabase.functions.invoke(
          "generate-scratch-card",
          {
            body: { chestType, forcedWin },
          },
        );

        if (error) throw error;

        const cardData: ScratchCard = data;
        setScratchCard(cardData);

        // Inicializar blocos
        const initialBlocks: ScratchBlockState[] = Array.from({ length: 9 }, (_, index) => ({
          id: index,
          isScratched: false,
          symbol: cardData.symbols[index] || null,
        }));

        setBlocks(initialBlocks);

        return cardData;
      } catch (error: any) {
        console.error("Erro ao gerar raspadinha:", error);
        toast({
          title: "Erro",
          description: error.message || "Falha ao gerar a raspadinha. Tente novamente.",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  const scratchBlock = useCallback((blockId: number) => {
    setBlocks(prev => {
      const newBlocks = prev.map(block => 
        block.id === blockId 
          ? { ...block, isScratched: true }
          : block
      );

      // Verificar se todos os blocos foram raspados
      const allScratched = newBlocks.every(block => block.isScratched);
      if (allScratched && !gameComplete) {
        setGameComplete(true);
      }

      return newBlocks;
    });
  }, [gameComplete]);

  const checkWinningCombination = useCallback(() => {
    if (!scratchCard || !gameComplete) return null;

    // Sistema de contagem baseado no código HTML - 3 símbolos iguais
    const symbolCount: Record<string, number[]> = {};
    
    blocks.forEach((block, index) => {
      if (block.symbol && block.isScratched) {
        const symbolId = block.symbol.id;
        if (!symbolCount[symbolId]) {
          symbolCount[symbolId] = [];
        }
        symbolCount[symbolId].push(index);
      }
    });

    // Verificar se algum símbolo aparece 3 ou mais vezes
    for (const [symbolId, positions] of Object.entries(symbolCount)) {
      if (positions.length >= 3) {
        const winningSymbol = blocks[positions[0]]?.symbol;
        if (winningSymbol) {
          return {
            pattern: positions.slice(0, 3), // Pegar os primeiros 3
            winningSymbol
          };
        }
      }
    }

    return null;
  }, [blocks, scratchCard, gameComplete]);

  const resetGame = () => {
    setScratchCard(null);
    setBlocks([]);
    setGameComplete(false);
  };

  const scratchAll = useCallback(() => {
    setBlocks(prev => prev.map(block => ({ ...block, isScratched: true })));
    setGameComplete(true);
  }, []);

  return {
    generateScratchCard,
    scratchBlock,
    scratchAll,
    checkWinningCombination,
    resetGame,
    scratchCard,
    blocks,
    isLoading,
    gameComplete,
  };
};