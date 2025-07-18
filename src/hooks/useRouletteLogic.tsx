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
  rouletteSlots: any[];
  totalSlots: number;
}

export const useRouletteLogic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rouletteData, setRouletteData] = useState<RouletteResult | null>(null);
  const { toast } = useToast();

  const reproduceArray = <T,>(array: T[], length: number): T[] => [
    ...Array(length)
      .fill("_")
      .map(() => array[Math.floor(Math.random() * array.length)]),
  ];

  // Nova função para simular roleta apenas visual
  const simulateRoulette = useCallback(
    async (chestType: string, slotsCount = 25) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "simulate-roulette",
          {
            body: { chestType, slotsCount },
          },
        );

        if (error) throw error;

        const { rouletteSlots } = data;

        const extendedStart = reproduceArray(rouletteSlots, slotsCount);
        const extendedEnd = reproduceArray(rouletteSlots, slotsCount * 2);

        const allSlots = [...extendedStart, ...rouletteSlots, ...extendedEnd];
        const centerStartIndex = extendedStart.length;

        const prizes = allSlots.map((item: any, index: number) => ({
          id: `${item.id}-${index}`,
          image: item.image_url || "",
          text: item.name || "",
        }));

        const simulationData = {
          prizes,
          prizeIndex: 0, // Será definido após animação
          winnerItem: null, // Será definido após sorteio real
          centerIndex: centerStartIndex,
          rouletteSlots,
          totalSlots: slotsCount,
        };

        setRouletteData(simulationData);
        return simulationData;
      } catch (error: any) {
        console.error("Erro ao simular roleta:", error);
        toast({
          title: "Erro",
          description:
            error.message || "Falha ao simular a roleta. Tente novamente.",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  // Nova função para sortear item real baseado na posição da animação
  const drawRealItem = useCallback(
    async (chestType: string, chestPrice: number, userId: string, finalPosition?: number) => {
      try {
        const { data: result, error } = await supabase.functions.invoke(
          "draw-item-from-chest",
          {
            body: { chestType, userId, chestPrice, finalPosition },
          },
        );

        if (error || !result?.item) {
          throw error || new Error("Nenhum item foi retornado");
        }

        return result.item;
      } catch (error: any) {
        console.error("Erro ao sortear item:", error);
        toast({
          title: "Erro",
          description:
            error.message || "Falha ao sortear o item. Tente novamente.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast],
  );

  // Função legada para compatibilidade (mantida por enquanto)
  const generateRoulette = useCallback(
    async (chestType: string, slotsCount = 25, forcedItemId?: string) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "generate-roulette",
          {
            body: { chestType, slotsCount, forcedItemId },
          },
        );

        if (error) throw error;

        const { rouletteSlots, winnerItem } = data;

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
          rouletteSlots,
          totalSlots: slotsCount,
        });

        return {
          prizes,
          prizeIndex: finalPrizeIndex,
          winnerItem,
          centerIndex: centerStartIndex,
          rouletteSlots,
          totalSlots: slotsCount,
        };
      } catch (error: any) {
        console.error("Erro ao gerar roleta:", error);
        toast({
          title: "Erro",
          description:
            error.message || "Falha ao gerar a roleta. Tente novamente.",
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
    generateRoulette,
    simulateRoulette,
    drawRealItem,
    resetRoulette,
    rouletteData,
    isLoading,
  };
};
