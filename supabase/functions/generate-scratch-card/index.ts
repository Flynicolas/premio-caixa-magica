import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { chestType, forcedWin = false } = await req.json();

    console.log('Generating scratch card for chest type:', chestType);

    // Buscar itens e probabilidades
    const { data: probabilities, error } = await supabase
      .from('chest_item_probabilities')
      .select(`
        *,
        item:items(*)
      `)
      .eq('chest_type', chestType)
      .eq('is_active', true)
      .eq('item.is_active', true);

    if (error) {
      console.error('Error fetching probabilities:', error);
      throw error;
    }

    if (!probabilities || probabilities.length === 0) {
      throw new Error(`No items found for chest type: ${chestType}`);
    }

    console.log(`Found ${probabilities.length} items for chest type ${chestType}`);

    // Criar array com pesos
    const weightedItems: any[] = [];
    probabilities.forEach(prob => {
      if (prob.item) {
        for (let i = 0; i < prob.probability_weight; i++) {
          weightedItems.push(prob.item);
        }
      }
    });

    // Determinar se haverá vitória (30% de chance ou forçado)
    const willWin = forcedWin || Math.random() < 0.3;
    
    // Gerar os 9 símbolos
    const symbols: any[] = [];
    let winningItem = null;

    if (willWin) {
      // Selecionar item vencedor
      winningItem = weightedItems[Math.floor(Math.random() * weightedItems.length)];
      
      // Colocar 3 símbolos iguais em posições aleatórias
      const winPositions = [];
      while (winPositions.length < 3) {
        const pos = Math.floor(Math.random() * 9);
        if (!winPositions.includes(pos)) {
          winPositions.push(pos);
        }
      }
      
      // Preencher grid
      for (let i = 0; i < 9; i++) {
        if (winPositions.includes(i)) {
          symbols.push({
            ...winningItem,
            symbolId: `${winningItem.id}-win-${i}`,
            isWinning: true
          });
        } else {
          // Símbolos diferentes para as outras posições
          let randomItem;
          do {
            randomItem = weightedItems[Math.floor(Math.random() * weightedItems.length)];
          } while (randomItem.id === winningItem.id);
          
          symbols.push({
            ...randomItem,
            symbolId: `${randomItem.id}-lose-${i}`,
            isWinning: false
          });
        }
      }
    } else {
      // Sem vitória - garantir que não haja 3 iguais
      const usedItems = new Set();
      
      for (let i = 0; i < 9; i++) {
        let randomItem;
        let attempts = 0;
        
        do {
          randomItem = weightedItems[Math.floor(Math.random() * weightedItems.length)];
          attempts++;
        } while (attempts < 50 && shouldAvoidItem(symbols, randomItem.id, i));
        
        symbols.push({
          ...randomItem,
          symbolId: `${randomItem.id}-${i}`,
          isWinning: false
        });
      }
    }

    console.log('Generated scratch card:', {
      willWin,
      winningItem: winningItem?.name,
      symbolsCount: symbols.length
    });

    return new Response(
      JSON.stringify({
        symbols,
        winningItem,
        hasWin: willWin,
        chestType
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in generate-scratch-card function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate scratch card' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Função auxiliar para evitar 3 iguais quando não deve haver vitória
function shouldAvoidItem(existingSymbols: any[], itemId: string, currentIndex: number): boolean {
  const itemCount = existingSymbols.filter(symbol => symbol.id === itemId).length;
  
  // Se já temos 2 do mesmo item, não adicionar mais
  if (itemCount >= 2) {
    return true;
  }
  
  // Verificar se criaria 3 em linha
  const positions = existingSymbols
    .map((symbol, index) => symbol.id === itemId ? index : -1)
    .filter(index => index !== -1);
  
  if (positions.length >= 2) {
    // Verificar combinações vencedoras
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
      [0, 4, 8], [2, 4, 6] // diagonais
    ];
    
    for (const pattern of winPatterns) {
      const matches = pattern.filter(pos => 
        positions.includes(pos) || pos === currentIndex
      ).length;
      
      if (matches >= 3) {
        return true;
      }
    }
  }
  
  return false;
}