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
    if (!scratchCard) return null;

    // Padrões de vitória (linhas, colunas, diagonais)
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
      [0, 4, 8], [2, 4, 6] // diagonais
    ];

    for (const pattern of winPatterns) {
      const symbols = pattern.map(index => blocks[index]?.symbol);
      const firstSymbol = symbols[0];
      
      if (firstSymbol && symbols.every(symbol => 
        symbol && symbol.id === firstSymbol.id
      )) {
        return {
          pattern,
          winningSymbol: firstSymbol
        };
      }
    }

    return null;
  }, [blocks, scratchCard]);

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