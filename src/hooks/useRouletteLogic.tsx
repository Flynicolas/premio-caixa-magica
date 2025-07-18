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

export const useRouletteLogic = () => {
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
        });

        return {
          prizes,
          prizeIndex: finalPrizeIndex,
          winnerItem,
          centerIndex: centerStartIndex,
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
    resetRoulette,
    rouletteData,
    isLoading,
  };
};
