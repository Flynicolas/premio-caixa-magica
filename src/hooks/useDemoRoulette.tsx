import { useState, useEffect } from 'react';
import { useDemo } from './useDemo';
import { useDemoInventory } from './useDemoInventory';
import { supabase } from '@/integrations/supabase/client';

interface DemoRouletteItem {
  id: string;
  name: string;
  image: string;
  rarity: string;
  value: number;
}

export const useDemoRoulette = () => {
  const { isDemo, demoSettings } = useDemo();
  const { addDemoItem } = useDemoInventory();
  const [isSpinning, setIsSpinning] = useState(false);
  const [realItems, setRealItems] = useState<any[]>([]);

  // Helper function to reproduce array avoiding consecutive duplicates
  const reproduceArray = function<T>(array: T[], length: number): T[] {
    const result: T[] = [];
    let lastItem: T | null = null;
    
    for (let i = 0; i < length; i++) {
      let availableItems = array.filter(item => item !== lastItem);
      if (availableItems.length === 0) availableItems = array;
      
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      result.push(randomItem);
      lastItem = randomItem;
    }
    
    return result;
  };

  const fetchRealItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setRealItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar itens reais:', error);
    }
  };

  useEffect(() => {
    fetchRealItems();
  }, []);

  const generateDemoItems = (chestType: string): DemoRouletteItem[] => {
    // Verificar se há configuração específica para este chest_type
    const chestConfig = demoSettings?.probabilidades_chest?.[chestType];
    
    if (chestConfig?.items && chestConfig.items.length > 0) {
      // Usar itens configurados no painel demo
      return chestConfig.items.map((item: any) => ({
        id: `demo_${item.item_id}`,
        name: item.item_name,
        image: item.item_image || '/placeholder.svg',
        rarity: item.rarity,
        value: item.base_value
      }));
    }

    // Fallback: Filtrar itens reais que pertencem ao chest_type especificado
    const chestItems = realItems.filter(item => 
      item.chest_types && item.chest_types.includes(chestType)
    );

    if (chestItems.length === 0) {
      // Fallback final para itens hardcoded se não houver configuração
      const baseItems = [
        { name: 'Prêmio Demo Bronze', rarity: 'common', value: 10 },
        { name: 'Prêmio Demo Prata', rarity: 'uncommon', value: 25 },
        { name: 'Prêmio Demo Ouro', rarity: 'rare', value: 50 },
        { name: 'Prêmio Demo Diamante', rarity: 'epic', value: 100 },
        { name: 'Prêmio Demo Supremo', rarity: 'legendary', value: 250 }
      ];

      return baseItems.map((item, index) => ({
        id: `demo_${chestType}_${index}`,
        name: item.name,
        image: '/placeholder.svg',
        rarity: item.rarity,
        value: item.value
      }));
    }

    // Usar itens reais como fallback
    return chestItems.map(item => ({
      id: `demo_${item.id}`,
      name: item.name,
      image: item.image_url || '/placeholder.svg',
      rarity: item.rarity,
      value: item.base_value
    }));
  };

  const generateDemoRoulette = (chestType: string, slotsCount: number = 25): {
    rouletteSlots: DemoRouletteItem[];
    winnerItem: DemoRouletteItem;
    centerIndex: number;
    totalSlots: number;
  } => {
    const items = generateDemoItems(chestType);
    const centerIndex = Math.floor(slotsCount / 2);
    
    // Determine winner based on demo probabilities
    const chestConfig = demoSettings?.probabilidades_chest?.[chestType];
    const winRate = chestConfig?.win_rate || 0.8;
    const rareRate = chestConfig?.rare_rate || 0.3;
    
    let winnerItem: DemoRouletteItem;
    
    if (Math.random() < winRate) {
      // Se há itens configurados com probabilidades específicas, usar sistema baseado em peso
      if (chestConfig?.items && chestConfig.items.length > 0) {
        const configuredItems = chestConfig.items;
        const totalWeight = configuredItems.reduce((sum: number, item: any) => sum + (item.probability_weight || 1), 0);
        
        let random = Math.random() * totalWeight;
        for (const configItem of configuredItems) {
          random -= configItem.probability_weight || 1;
          if (random <= 0) {
            winnerItem = {
              id: `demo_${configItem.item_id}`,
              name: configItem.item_name,
              image: configItem.item_image || '/placeholder.svg',
              rarity: configItem.rarity,
              value: configItem.base_value
            };
            break;
          }
        }
      } else {
        // Sistema original baseado em raridade
        const willGetRare = Math.random() < rareRate;
        const availableItems = willGetRare 
          ? items.filter(item => ['rare', 'epic', 'legendary'].includes(item.rarity))
          : items.filter(item => ['common', 'uncommon'].includes(item.rarity));
        
        winnerItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      }
    } else {
      winnerItem = items.find(item => item.rarity === 'common') || items[0];
    }
    
    // Garantir que winnerItem está definido
    if (!winnerItem!) {
      winnerItem = items[0];
    }
    
    // Create roulette slots with winner in center
    const rouletteSlots = reproduceArray(items, slotsCount);
    rouletteSlots[centerIndex] = winnerItem;
    
    return {
      rouletteSlots,
      winnerItem,
      centerIndex,
      totalSlots: slotsCount
    };
  };

  const spinDemoRoulette = async (chestType: string) => {
    if (!isDemo || !demoSettings) {
      return { error: 'Não está em modo demo' };
    }

    setIsSpinning(true);

    try {
      const items = generateDemoItems(chestType);
      const chestConfig = demoSettings.probabilidades_chest[chestType];
      
      // Lógica de probabilidade demo (mais generosa)
      const winRate = chestConfig?.win_rate || 0.8;
      const rareRate = chestConfig?.rare_rate || 0.3;
      
      const willWin = Math.random() < winRate;
      
      if (!willWin) {
        // Não ganhou nada
        return { 
          error: null, 
          winner: null, 
          allItems: items 
        };
      }

      // Determinar raridade do prêmio
      const willGetRare = Math.random() < rareRate;
      const availableItems = willGetRare 
        ? items.filter(item => ['rare', 'epic', 'legendary'].includes(item.rarity))
        : items.filter(item => ['common', 'uncommon'].includes(item.rarity));

      const winner = availableItems[Math.floor(Math.random() * availableItems.length)];

      // Adicionar ao inventário demo
      await addDemoItem({
        item_name: winner.name,
        item_image: winner.image,
        chest_type: chestType,
        rarity: winner.rarity,
        item_id: winner.id.replace('demo_', '') // Se for um item real, remover o prefixo
      });

      return { 
        error: null, 
        winner, 
        allItems: items 
      };
    } catch (error) {
      console.error('Erro no sorteio demo:', error);
      return { error: 'Erro no sorteio' };
    } finally {
      setIsSpinning(false);
    }
  };

  return {
    isDemo,
    isSpinning,
    spinDemoRoulette,
    generateDemoItems,
    generateDemoRoulette
  };
};