import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWalletProvider";
import { ScratchCard, ScratchBlockState, ScratchCardType, scratchCardTypes } from "@/types/scratchCard";
import { useAdminTestMode } from "@/hooks/useAdminTestMode";
import { useDemo } from "@/hooks/useDemo";
import { useDemoWallet } from "@/hooks/useDemoWallet";
import { useDemoInventory } from "@/hooks/useDemoInventory";

// FSM States para o botão inteligente
export type ScratchGameState = 
  | 'idle' 
  | 'ready' 
  | 'scratching' 
  | 'fastReveal' 
  | 'resolving' 
  | 'success' 
  | 'fail' 
  | 'locked';

export const useScratchCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [scratchCard, setScratchCard] = useState<ScratchCard | null>(null);
  const [blocks, setBlocks] = useState<ScratchBlockState[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<ScratchGameState>('idle');
  const [fastRevealTriggered, setFastRevealTriggered] = useState(false);
  const [winDetected, setWinDetected] = useState(false); // Prevenir múltiplas detecções
  const { toast } = useToast();
  const { refetchWallet } = useWallet();
  const { isEnabled: adminTestMode } = useAdminTestMode();
  const { isDemo, demoSettings } = useDemo();
  const { purchaseChestDemo, depositDemo, refreshData: refreshDemoWallet } = useDemoWallet();
  const { addDemoItem } = useDemoInventory();

  const generateScratchCard = useCallback(
    async (chestType: ScratchCardType, forcedWin = false) => {
      setIsLoading(true);
      setGameComplete(false);
      
      try {
        // Admin Test Mode ou DEMO: gerar localmente sem afetar backend/saldo real
        if (adminTestMode || isDemo) {
          // Carregar probabilidades e itens ativos
          const { data: probs } = await supabase
            .from('scratch_card_probabilities')
            .select('item_id, probability_weight')
            .eq('scratch_type', chestType)
            .eq('is_active', true);

          const ids = (probs || []).map((p: any) => p.item_id);
          const { data: items } = ids.length > 0
            ? await supabase
                .from('items')
                .select('id, name, image_url, rarity, base_value, category')
                .in('id', ids)
                .eq('is_active', true)
            : { data: [] as any[] } as any;

          const rawWeights: Record<string, number> = {};
          (probs || []).forEach((p: any) => { rawWeights[p.item_id] = p.probability_weight || 1; });
          const allItems = (items || []);
          const candidates = allItems.filter((i: any) => (rawWeights[i.id] || 1) > 0);
          const pool = candidates.length > 0 ? candidates : allItems;

          const cfg: any = (demoSettings?.probabilidades_chest as any)?.[chestType] || {};
          const demoWinRate = cfg.win_rate ?? (isDemo ? 0.7 : 0.4);
          const rareMul = cfg.rare_multiplier ?? (isDemo ? 2 : 1);
          const rarityBoost: Record<string, number> = { comum: 1, raro: 2, epico: 3, lendario: 5 };

          const effectiveWeight = (it: any) => {
            const base = Math.max(0, rawWeights[it.id] || 1);
            const boost = rarityBoost[(it.rarity || 'comum').toLowerCase()] || 1;
            return base * Math.max(1, boost * rareMul);
          };

          const pickWeighted = () => {
            const total = pool.reduce((sum: number, it: any) => sum + effectiveWeight(it), 0);
            let r = Math.random() * (total || 1);
            for (const it of pool) {
              r -= effectiveWeight(it);
              if (r <= 0) return it;
            }
            return pool[0];
          };

          const toSymbol = (it: any, isWinning = false) => ({
            id: it.id,
            symbolId: it.id,
            name: it.name,
            image_url: it.image_url || '',
            rarity: it.rarity || 'comum',
            base_value: it.base_value || 0,
            isWinning,
            category: it.category || undefined,
          });

          const hasWin = forcedWin || Math.random() < demoWinRate;
          const symbols: any[] = Array(9).fill(null);
          const counts: Record<string, number> = {};

          if (hasWin && pool.length > 0) {
            const winItem = pickWeighted();
            // escolher 3 posições únicas
            const pos = new Set<number>();
            while (pos.size < 3) pos.add(Math.floor(Math.random() * 9));
            for (const p of Array.from(pos)) {
              symbols[p] = toSymbol(winItem, true);
            }
            counts[winItem.id] = 3;
            // preencher o resto sem formar outra trinca
            for (let i = 0; i < 9; i++) {
              if (symbols[i]) continue;
              let tries = 0;
              let chosen: any = null;
              while (tries < 20) {
                const it = allItems[Math.floor(Math.random() * allItems.length)] || winItem;
                if (it.id === winItem.id) { tries++; continue; }
                const cnt = counts[it.id] || 0;
                if (cnt < 2) { chosen = it; break; }
                tries++;
              }
              chosen = chosen || pool[0] || winItem;
              counts[chosen.id] = (counts[chosen.id] || 0) + 1;
              symbols[i] = toSymbol(chosen, false);
            }
          } else {
            // Sem vitória: garantir que nenhum símbolo apareça 3x
            for (let i = 0; i < 9; i++) {
              let tries = 0;
              let chosen: any = null;
              while (tries < 30) {
                const it = allItems[Math.floor(Math.random() * allItems.length)] || pool[0];
                const cnt = counts[it.id] || 0;
                if (cnt < 2) { chosen = it; break; }
                tries++;
              }
              chosen = chosen || pool[0] || allItems[0];
              counts[chosen.id] = (counts[chosen.id] || 0) + 1;
              symbols[i] = toSymbol(chosen, false);
            }
          }

          const winningItem = hasWin ? symbols.find(s => s && s.isWinning) || null : null;
          const cardData: ScratchCard = {
            symbols: symbols as any,
            winningItem: winningItem as any,
            hasWin,
            scratchType: chestType,
          };

          setScratchCard(cardData);
          setGameId(`admin-test-${Date.now()}`);
          const initialBlocks: ScratchBlockState[] = Array.from({ length: 9 }, (_, index) => ({
            id: index,
            isScratched: false,
            symbol: cardData.symbols[index] || null,
          }));
          setBlocks(initialBlocks);
          return cardData;
        }

        // Modo normal: usar a Edge Function
        let data: any = null; let error: any = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          const res = await supabase.functions.invoke(
            "play-scratch-card",
            { body: { scratchType: chestType, forcedWin } },
          );
          data = res.data; error = res.error;
          if (!error && data) break;
          await new Promise((r) => setTimeout(r, 300));
        }

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
    [toast, refetchWallet, adminTestMode, isDemo, demoSettings],
  );

  const processGame = useCallback(
    async (_chestType: ScratchCardType, hasWinDetected: boolean, winningItem?: any) => {
      try {
        if (adminTestMode || isDemo) {
          // Processamento local DEMO: premia carteira demo ou inventário demo
          if (hasWinDetected && winningItem) {
            if ((winningItem.category || '').toLowerCase() === 'dinheiro' || (winningItem.name || '').toLowerCase().includes('dinheiro') || (winningItem.name || '').toLowerCase().includes('real')) {
              await depositDemo(winningItem.base_value || 0);
            } else {
              await addDemoItem({
                item_name: winningItem.name,
                item_image: winningItem.image_url,
                chest_type: `scratch_${_chestType}`,
                rarity: winningItem.rarity || 'comum',
                item_id: winningItem.id,
              });
            }
            await refreshDemoWallet();
          }

          toast({
            title: hasWinDetected ? 'Parabéns!' : 'Que pena!',
            description: hasWinDetected ? 'Você ganhou! (DEMO)' : 'Não foi desta vez, tente novamente!',
          });
          return { success: true, gameId, walletBalance: undefined } as any;
        }

        // Modo normal: já processado na Edge Function
        await refetchWallet();
        toast({
          title: hasWinDetected ? 'Parabéns!' : 'Que pena!',
          description: hasWinDetected ? 'Você ganhou! Seu saldo foi atualizado.' : 'Não foi desta vez, tente novamente!',
        });
        return { success: true, gameId, walletBalance: undefined } as any;
      } catch (error: any) {
        console.error('Erro ao finalizar jogo:', error);
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao finalizar o jogo.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast, refetchWallet, gameId, adminTestMode, isDemo, depositDemo, addDemoItem, refreshDemoWallet],
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
    if (!scratchCard || !gameComplete || winDetected) return null;

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
          setWinDetected(true); // Marcar como detectado
          return {
            pattern: positions.slice(0, 3), // Pegar os primeiros 3
            winningSymbol
          };
        }
      }
    }

    return null;
  }, [blocks, scratchCard, gameComplete, winDetected]);

  const resetGame = () => {
    setScratchCard(null);
    setBlocks([]);
    setGameComplete(false);
    setGameId(null);
    setGameState('idle');
    setFastRevealTriggered(false);
    setWinDetected(false);
  };

  const scratchAll = useCallback(() => {
    setBlocks(prev => prev.map(block => ({ ...block, isScratched: true })));
    setGameComplete(true);
  }, []);

  const triggerFastReveal = useCallback(() => {
    if (gameState === 'scratching' && !fastRevealTriggered) {
      setFastRevealTriggered(true);
      setGameState('fastReveal');
      scratchAll();
    }
  }, [gameState, fastRevealTriggered, scratchAll]);

  const startGame = useCallback(async (chestType: ScratchCardType) => {
    setGameState('scratching');
    await generateScratchCard(chestType);
  }, [generateScratchCard]);

  const processGameResult = useCallback(async (chestType: ScratchCardType, hasWin: boolean, winningItem?: any) => {
    setGameState('resolving');
    
    try {
      await processGame(chestType, hasWin, winningItem);
      setGameState(hasWin ? 'success' : 'fail');
    } catch (error) {
      setGameState('fail');
    }
  }, [processGame]);


  return {
    generateScratchCard,
    processGame,
    scratchBlock,
    scratchAll,
    checkWinningCombination,
    resetGame,
    triggerFastReveal,
    startGame,
    processGameResult,
    scratchCard,
    blocks,
    isLoading,
    gameComplete,
    gameId,
    gameState,
    setGameState,
    fastRevealTriggered,
  };
};