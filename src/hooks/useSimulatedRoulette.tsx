import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PrizeItem {
  id: string;
  image: string;
  text?: string;
}

interface RouletteResult {
  prizes: PrizeItem[];
  prizeIndex: number;
  winnerItem: any;
  centerIndex: number;
}

export const useSimulatedRoulette = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rouletteData, setRouletteData] = useState<RouletteResult | null>(null);
  const { toast } = useToast();

  const reproduceArray = <T,>(array: T[], length: number): T[] => {
    const result: T[] = [];
    const getNextDifferentItem = (previousItem?: T, nextPreviousItem?: T): T => {
      let attempts = 0;
      let item: T;
      do {
        item = array[Math.floor(Math.random() * array.length)];
        attempts++;
      } while (
        attempts < 50 && 
        array.length > 1 && 
        ((previousItem && JSON.stringify(item) === JSON.stringify(previousItem)) ||
         (nextPreviousItem && JSON.stringify(item) === JSON.stringify(nextPreviousItem)))
      );
      return item;
    };

    for (let i = 0; i < length; i++) {
      const previousItem = result[i - 1];
      const nextPreviousItem = result[i - 2];
      result.push(getNextDifferentItem(previousItem, nextPreviousItem));
    }
    
    return result;
  };

  const generateSimulatedRoulette = useCallback(
    async (chestType: string, slotsCount = 25) => {
      setIsLoading(true);
      try {
        // Buscar itens reais do banco de dados
        const { data: itemsData, error } = await supabase
          .from('chest_item_probabilities')
          .select(`
            items (
              id,
              name,
              image_url,
              rarity,
              base_value
            ),
            probability_weight
          `)
          .eq('chest_type', chestType)
          .eq('items.is_active', true);

        if (error) throw error;

        if (!itemsData || itemsData.length === 0) {
          throw new Error('Nenhum item encontrado para este tipo de baú');
        }

        // Transformar dados para o formato esperado
        const availableItems = itemsData
          .filter(item => item.items)
          .map(item => ({
            id: item.items.id,
            name: item.items.name,
            image_url: item.items.image_url,
            rarity: item.items.rarity,
            base_value: item.items.base_value,
            originalWeight: item.probability_weight
          }));

        // Criar array com probabilidades aumentadas para itens caros
        const simulationItems = [];
        
        for (const item of availableItems) {
          let weight = item.originalWeight;
          
          // Aumentar drasticamente a probabilidade de itens raros
          if (item.rarity === 'legendary') {
            weight *= 8; // 8x mais chance
          } else if (item.rarity === 'epic') {
            weight *= 6; // 6x mais chance
          } else if (item.rarity === 'rare') {
            weight *= 4; // 4x mais chance
          } else if (item.rarity === 'common') {
            weight *= 0.5; // Reduz chance de itens comuns
          }
          
          // Adicionar item múltiplas vezes baseado no peso
          for (let i = 0; i < weight; i++) {
            simulationItems.push(item);
          }
        }

        // Selecionar item vencedor aleatório com pesos modificados
        const winnerItem = simulationItems[Math.floor(Math.random() * simulationItems.length)];

        // Criar array de slots da roleta
        const rouletteSlots = [];
        for (let i = 0; i < slotsCount; i++) {
          if (i === Math.floor(slotsCount / 2)) {
            // Posição central recebe o item vencedor
            rouletteSlots.push(winnerItem);
          } else {
            // Outras posições recebem itens aleatórios
            rouletteSlots.push(availableItems[Math.floor(Math.random() * availableItems.length)]);
          }
        }

        const extendedStart = reproduceArray(rouletteSlots, slotsCount);
        const extendedEnd = reproduceArray(rouletteSlots, slotsCount * 2);

        const allSlots = [...extendedStart, ...rouletteSlots, ...extendedEnd];

        const centerStartIndex = extendedStart.length;
        const winnerIndexInOriginal = rouletteSlots.findIndex(
          (item: any) => item.id === winnerItem.id,
        );

        const finalPrizeIndex = centerStartIndex + winnerIndexInOriginal;

        const prizes = allSlots.map((item: any, index: number) => ({
          id: `${item.id}-${index}`,
          image: item.image_url || "",
          text: item.name || "",
        }));

        setRouletteData({
          prizes,
          prizeIndex: finalPrizeIndex,
          winnerItem,
          centerIndex: centerStartIndex,
        });

        return {
          prizes,
          prizeIndex: finalPrizeIndex,
          winnerItem,
          centerIndex: centerStartIndex,
        };
      } catch (error: any) {
        console.error("Erro ao gerar roleta simulada:", error);
        toast({
          title: "Erro na Simulação",
          description: error.message || "Falha ao gerar a demonstração. Tente novamente.",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  const resetRoulette = () => setRouletteData(null);

  return {
    generateSimulatedRoulette,
    resetRoulette,
    rouletteData,
    isLoading,
  };
};