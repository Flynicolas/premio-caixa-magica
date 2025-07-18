import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { chestType, slotsCount = 25, forcedItemId } = await req.json();

    // Buscar itens com probabilidade e dados do item (incluindo itens com probabilidade 0 para visualização)
    const { data: probabilities, error: probError } = await supabaseClient
      .from('chest_item_probabilities')
      .select(`
        *,
        item:items!inner(*)
      `)
      .eq('chest_type', chestType)
      .eq('is_active', true)
      .eq('item.is_active', true)
      .gte('probability_weight', 0);

    if (probError) throw probError;

    if (!probabilities || probabilities.length === 0) {
      throw new Error(`Nenhum item configurado para o baú ${chestType}`);
    }

    // Array ponderado para slots aleatórios (apenas itens com probabilidade > 0)
    const weightedItems: any[] = [];
    probabilities.forEach((prob) => {
      if (prob.probability_weight > 0) {
        for (let i = 0; i < prob.probability_weight; i++) {
          weightedItems.push(prob.item);
        }
      }
    });

    // Array com todos os itens para visualização na roleta (incluindo probabilidade 0)
    const allItems: any[] = probabilities.map(prob => prob.item);

    // Definir item vencedor
    let winnerItem;

    if (forcedItemId) {
      const found = probabilities.find(p => p.item.id === forcedItemId);
      if (!found) {
        throw new Error(`Item com ID ${forcedItemId} não encontrado no baú ${chestType}`);
      }
      winnerItem = found.item;
    } else {
      const winnerIndex = Math.floor(Math.random() * weightedItems.length);
      winnerItem = weightedItems[winnerIndex];
    }

    // Construir slots da roleta com item vencedor no centro e evitar sequências
    const rouletteSlots = [];
    const centerIndex = Math.floor(slotsCount / 2);

    // Função para evitar itens consecutivos iguais (usa todos os itens para visualização)
    const getNextDifferentItem = (previousItem: any, nextPreviousItem: any) => {
      let attempts = 0;
      let item;
      do {
        const randomIndex = Math.floor(Math.random() * allItems.length);
        item = allItems[randomIndex];
        attempts++;
      } while (
        attempts < 50 && 
        (item.id === previousItem?.id || item.id === nextPreviousItem?.id)
      );
      return item;
    };

    for (let i = 0; i < slotsCount; i++) {
      if (i === centerIndex) {
        rouletteSlots.push(winnerItem);
      } else {
        const previousItem = rouletteSlots[i - 1];
        const nextPreviousItem = rouletteSlots[i - 2];
        const selectedItem = getNextDifferentItem(previousItem, nextPreviousItem);
        rouletteSlots.push(selectedItem);
      }
    }

    console.log(`Roleta gerada: Baú ${chestType}, Vencedor: ${winnerItem.name} (${winnerItem.rarity})`);

    return new Response(
      JSON.stringify({
        rouletteSlots,
        winnerItem,
        centerIndex,
        totalSlots: slotsCount
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Erro na geração da roleta:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
