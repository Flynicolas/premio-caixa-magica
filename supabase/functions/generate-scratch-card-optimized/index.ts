import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScratchSymbol {
  id: string;
  symbolId: string;
  name: string;
  image_url: string;
  rarity: string;
  base_value: number;
  isWinning: boolean;
  category?: string;
}

interface ScratchCard {
  symbols: ScratchSymbol[];
  winningItem: ScratchSymbol | null;
  hasWin: boolean;
  scratchType: string;
  gameId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Autenticar usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Token de autorização necessário");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Usuário não autenticado");
    }

    const { scratchType, forcedWin } = await req.json();

    console.log(`🎯 Gerando raspadinha para usuário ${user.id}, tipo: ${scratchType}`);

    // Buscar probabilidades do tipo específico
    const { data: probabilities, error: probError } = await supabase
      .from('scratch_card_probabilities')
      .select('*')
      .eq('scratch_type', scratchType)
      .eq('is_active', true);

    if (probError) {
      console.error('Erro ao buscar probabilidades:', probError);
      throw new Error('Erro ao carregar probabilidades da raspadinha');
    }

    if (!probabilities || probabilities.length === 0) {
      throw new Error(`Nenhum item configurado para raspadinha tipo: ${scratchType}`);
    }

    // Buscar itens relacionados
    const itemIds = probabilities.map(p => p.item_id).filter(Boolean);
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .in('id', itemIds)
      .eq('is_active', true);

    if (itemsError) {
      console.error('Erro ao buscar itens:', itemsError);
      throw new Error('Erro ao carregar itens da raspadinha');
    }

    if (!items || items.length === 0) {
      throw new Error(`Nenhum item encontrado para raspadinha tipo: ${scratchType}`);
    }

    console.log(`📊 Encontradas ${probabilities.length} probabilidades configuradas`);

    // Buscar configurações financeiras do tipo de raspadinha
    const { data: financialControl } = await supabase
      .from('scratch_card_financial_control')
      .select('*')
      .eq('scratch_type', scratchType)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    // Configurações padrão caso não encontre
    let percentagePrizes = 0.10; // 10% para prêmios (sistema 90/10)
    let remainingBudget = 0;
    
    if (financialControl) {
      percentagePrizes = financialControl.percentage_prizes;
      remainingBudget = financialControl.remaining_budget;
    }

    console.log(`💰 Sistema ${Math.round((1 - percentagePrizes) * 100)}/${Math.round(percentagePrizes * 100)} - Orçamento restante: R$ ${remainingBudget}`);

    // Gerar símbolos da raspadinha
    const symbols: ScratchSymbol[] = [];
    let winningItem: ScratchSymbol | null = null;
    let hasWin = false;

    // Criar pool de símbolos baseado nas probabilidades
    const symbolPool: ScratchSymbol[] = [];
    
    probabilities.forEach(prob => {
      const item = items.find(i => i.id === prob.item_id);
      if (item) {
        const symbol: ScratchSymbol = {
          id: item.id,
          symbolId: item.id,
          name: item.name,
          image_url: item.image_url,
          rarity: item.rarity,
          base_value: item.base_value,
          isWinning: false,
          category: item.category
        };

        // Adicionar símbolo X vezes baseado no peso
        for (let i = 0; i < prob.probability_weight; i++) {
          symbolPool.push(symbol);
        }
      }
    });

    if (symbolPool.length === 0) {
      throw new Error('Pool de símbolos vazio');
    }

    // Buscar liberações manuais pendentes para este tipo de raspadinha
    const { data: manualReleases } = await supabase
      .from('manual_item_releases')
      .select(`
        id,
        item_id,
        probability_id,
        expires_at,
        metadata,
        items (
          id,
          name,
          base_value,
          image_url,
          rarity,
          category
        )
      `)
      .eq('chest_type', scratchType)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .limit(1);

    // Verificar se deve usar liberação manual
    let useManualRelease = false;
    let manualReleaseItem = null;

    if (manualReleases && manualReleases.length > 0) {
      const release = manualReleases[0];
      if (release.items) {
        useManualRelease = true;
        manualReleaseItem = release.items;
        console.log(`🎯 Usando liberação manual: ${manualReleaseItem.name}`);
        
        // Marcar como usado
        await supabase
          .from('manual_item_releases')
          .update({ 
            status: 'drawn',
            drawn_at: new Date().toISOString(),
            winner_user_id: user.id
          })
          .eq('id', release.id);
      }
    }

    // Determinar se deve ter vitória
    let shouldWin = forcedWin;
    
    if (!shouldWin) {
      if (useManualRelease) {
        shouldWin = true; // Sempre ganhar se há liberação manual
      } else {
        // Verificar probabilidade baseada no tipo de raspadinha
        let winProbability = 0.30; // 30% padrão
        
        // Ajustar probabilidade com base no orçamento disponível
        if (remainingBudget <= 0) {
          winProbability = 0.05; // Reduzir para 5% se orçamento esgotado
        } else if (remainingBudget < 10) {
          winProbability = 0.15; // Reduzir para 15% se orçamento baixo
        }
        
        shouldWin = Math.random() < winProbability;
      }
    }
    
    if (shouldWin) {
      if (useManualRelease && manualReleaseItem) {
        // Usar item da liberação manual
        winningItem = {
          id: manualReleaseItem.id,
          symbolId: manualReleaseItem.id,
          name: manualReleaseItem.name,
          image_url: manualReleaseItem.image_url,
          rarity: manualReleaseItem.rarity,
          base_value: manualReleaseItem.base_value,
          isWinning: true,
          category: manualReleaseItem.category
        };
        hasWin = true;
        console.log(`🏆 Item vencedor (liberação manual): ${winningItem.name} - R$ ${winningItem.base_value}`);
      } else {
        // Escolher item vencedor baseado no orçamento e tipo
        let eligibleItems = items;
        
        // Filtrar por orçamento se item de dinheiro
        if (remainingBudget > 0) {
          eligibleItems = items.filter(item => 
            item.category !== 'dinheiro' || item.base_value <= remainingBudget
          );
        } else {
          // Se não há orçamento, só itens físicos
          eligibleItems = items.filter(item => item.category !== 'dinheiro');
        }

        if (eligibleItems.length > 0) {
          // Priorizar itens de menor valor
          eligibleItems.sort((a, b) => a.base_value - b.base_value);
          
          // Escolher item baseado na distribuição de probabilidades
          const totalWeight = eligibleItems.reduce((sum, item) => {
            const prob = probabilities.find(p => p.item_id === item.id);
            return sum + (prob ? prob.probability_weight : 1);
          }, 0);
          
          let randomWeight = Math.random() * totalWeight;
          let selectedItem = eligibleItems[0];
          
          for (const item of eligibleItems) {
            const prob = probabilities.find(p => p.item_id === item.id);
            const weight = prob ? prob.probability_weight : 1;
            randomWeight -= weight;
            if (randomWeight <= 0) {
              selectedItem = item;
              break;
            }
          }

          winningItem = {
            id: selectedItem.id,
            symbolId: selectedItem.id,
            name: selectedItem.name,
            image_url: selectedItem.image_url,
            rarity: selectedItem.rarity,
            base_value: selectedItem.base_value,
            isWinning: true,
            category: selectedItem.category
          };
          hasWin = true;
          console.log(`🏆 Item vencedor selecionado: ${winningItem.name} - R$ ${winningItem.base_value}`);
        }
      }
    }

    // Gerar 9 símbolos para a raspadinha
    for (let i = 0; i < 9; i++) {
      const randomSymbol = symbolPool[Math.floor(Math.random() * symbolPool.length)];
      symbols.push({
        ...randomSymbol,
        isWinning: false
      });
    }

    // Se deve ganhar, garantir 3 símbolos iguais do item vencedor
    if (hasWin && winningItem) {
      const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      // Escolher 3 posições aleatórias
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * positions.length);
        const position = positions.splice(randomIndex, 1)[0];
        symbols[position] = {
          ...winningItem,
          isWinning: true
        };
      }
    }

    const scratchCard: ScratchCard = {
      symbols,
      winningItem,
      hasWin,
      scratchType
    };

    console.log(`✅ Raspadinha gerada: hasWin=${hasWin}, símbolos=${symbols.length}`);

    return new Response(JSON.stringify(scratchCard), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Erro na função:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});