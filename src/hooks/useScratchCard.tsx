import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWalletProvider";
import { ScratchCard, ScratchBlockState, ScratchCardType, scratchCardTypes } from "@/types/scratchCard";

export const useScratchCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [scratchCard, setScratchCard] = useState<ScratchCard | null>(null);
  const [blocks, setBlocks] = useState<ScratchBlockState[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const { toast } = useToast();
  const { refetchWallet } = useWallet();

  const generateScratchCard = useCallback(
    async (chestType: ScratchCardType, forcedWin = false) => {
      setIsLoading(true);
      setGameComplete(false);
      
      try {
        const { data, error } = await supabase.functions.invoke(
          "play-scratch-card",
          {
            body: { scratchType: chestType, forcedWin },
          },
        );

        if (error) throw error;

        const cardData: ScratchCard = data;
        setScratchCard(cardData);
        setGameId((data as any)?.gameId || null);

        // Inicializar blocos
        const initialBlocks: ScratchBlockState[] = Array.from({ length: 9 }, (_, index) => ({
          id: index,
          isScratched: false,
          symbol: cardData.symbols[index] || null,
        }));

        setBlocks(initialBlocks);

        // Atualizar saldo da carteira após processamento no backend
        await refetchWallet();

        return cardData;
      } catch (error: any) {
        console.error("Erro ao gerar/registrar raspadinha:", error);
        toast({
          title: "Erro",
          description: error.message || "Falha ao iniciar a raspadinha. Tente novamente.",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, refetchWallet],
  );

  const processGame = useCallback(
    async (_chestType: ScratchCardType, hasWinDetected: boolean, winningItem?: any) => {
      // O processamento já foi feito no backend ao gerar a raspadinha (play-scratch-card)
      try {
        // Apenas feedback visual consistente com o resultado detectado na grade
        await refetchWallet();
        toast({
          title: hasWinDetected ? "Parabéns!" : "Que pena!",
          description: hasWinDetected
            ? "Você ganhou! Seu saldo foi atualizado."
            : "Não foi desta vez, tente novamente!",
        });
        return { success: true, gameId, walletBalance: undefined } as any;
      } catch (error: any) {
        console.error("Erro ao finalizar jogo:", error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao finalizar o jogo.",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast, refetchWallet, gameId],
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
    setGameId(null);
  };

  const scratchAll = useCallback(() => {
    setBlocks(prev => prev.map(block => ({ ...block, isScratched: true })));
    setGameComplete(true);
  }, []);

  return {
    generateScratchCard,
    processGame,
    scratchBlock,
    scratchAll,
    checkWinningCombination,
    resetGame,
    scratchCard,
    blocks,
    isLoading,
    gameComplete,
    gameId,
  };
};