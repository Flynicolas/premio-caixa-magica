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
          "generate-scratch-card-optimized",
          {
            body: { scratchType: chestType, forcedWin },
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

  const processGame = useCallback(
    async (chestType: ScratchCardType, hasWin: boolean, winningItem?: any) => {
      if (!scratchCard) return null;

      try {
        const gamePrice = scratchCardTypes[chestType].price;
        const winningAmount = hasWin && winningItem ? winningItem.base_value : 0;

        const { data, error } = await supabase.rpc('process_scratch_card_game', {
          p_user_id: (await supabase.auth.getUser()).data.user?.id,
          p_scratch_type: chestType,
          p_game_price: gamePrice,
          p_symbols: JSON.stringify(scratchCard.symbols),
          p_has_win: hasWin,
          p_winning_item_id: hasWin && winningItem ? winningItem.id : null,
          p_winning_amount: winningAmount
        });

        if (error) throw error;

        if (!data || data.length === 0) {
          throw new Error('Erro ao processar jogo');
        }

        const result = data[0];
        if (!result.success) {
          throw new Error(result.message || 'Erro ao processar jogo');
        }

        setGameId(result.game_id);
        
        // Atualizar saldo da carteira
        await refetchWallet();

        toast({
          title: hasWin ? "Parabéns!" : "Que pena!",
          description: hasWin 
            ? `Você ganhou! Saldo atualizado: R$ ${result.wallet_balance.toFixed(2)}`
            : "Não foi desta vez, tente novamente!",
          variant: hasWin ? "default" : "destructive",
        });

        return { success: true, gameId: result.game_id, walletBalance: result.wallet_balance };
      } catch (error: any) {
        console.error("Erro ao processar jogo:", error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao processar o jogo. Tente novamente.",
          variant: "destructive",
        });
        return null;
      }
    },
    [scratchCard, toast, refetchWallet],
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