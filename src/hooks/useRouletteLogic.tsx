import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RouletteItem {
  id: string;
  name: string;
  image_url?: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'special';
}

interface RouletteResult {
  rouletteSlots: RouletteItem[];
  winnerItem: RouletteItem;
  centerIndex: number;
  totalSlots: number;
}

export const useRouletteLogic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rouletteData, setRouletteData] = useState<RouletteResult | null>(null);
  const { toast } = useToast();

  const generateRoulette = useCallback(async (chestType: string, slotsCount: number = 25) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-roulette', {
        body: { chestType, slotsCount }
      });

      if (error) throw error;

      setRouletteData(data);
      return data;
    } catch (error) {
      console.error('Erro ao gerar roleta:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar a roleta. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const resetRoulette = useCallback(() => {
    setRouletteData(null);
  }, []);

  return {
    generateRoulette,
    resetRoulette,
    rouletteData,
    isLoading
  };
};