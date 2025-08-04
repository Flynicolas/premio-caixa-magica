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

    console.log(`🎯 Sistema 90/10 Inteligente - Usuário ${user.id}, tipo: ${scratchType}`);

    // Buscar configurações financeiras do dia
    const { data: financialControl } = await supabase
      .from('scratch_card_financial_control')
      .select('*')
      .eq('scratch_type', scratchType)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    // Configurações padrão do sistema 90/10
    let winProbability = 0.30; // 30% base
    let remainingBudget = 0;
    let percentagePrizes = 0.10; // 10% padrão

    if (financialControl) {
      percentagePrizes = financialControl.percentage_prizes || 0.10;
      remainingBudget = financialControl.remaining_budget || 0;
      
      // Sistema inteligente de ajuste automático
      const currentProfit = financialControl.total_sales - financialControl.total_prizes_given;
      const totalSales = financialControl.total_sales;
      
      if (totalSales > 0) {
        const profitMargin = (currentProfit / totalSales) * 100;
        
        // Ajustar probabilidade baseado na margem de lucro
        if (profitMargin > 95) {
          // Lucro muito alto (>95%), aumentar prêmios
          winProbability = 0.45;
        } else if (profitMargin > 90) {
          // Lucro alto (90-95%), prêmios normais
          winProbability = 0.30;
        } else if (profitMargin > 85) {
          // Lucro médio (85-90%), reduzir prêmios ligeiramente
          winProbability = 0.20;
        } else if (profitMargin > 80) {
          // Lucro baixo (80-85%), reduzir mais
          winProbability = 0.15;
        } else {
          // Lucro crítico (<80%), blackout quase total
          winProbability = 0.05;
        }
      }

      // Aplicar ajustes baseados no orçamento
      if (remainingBudget <= 0) {
        winProbability = 0.02; // Blackout quase total
      } else if (remainingBudget < 10) {
        winProbability = Math.min(winProbability, 0.10); // Limite máximo de 10%
      } else if (remainingBudget < 5) {
        winProbability = Math.min(winProbability, 0.05); // Emergência
      }
    }

    console.log(`💰 Sistema 90/10 - Probabilidade: ${(winProbability * 100).toFixed(1)}%, Orçamento: R$ ${remainingBudget.toFixed(2)}`);

    // Buscar probabilidades e itens
    const { data: probabilities, error: probError } = await supabase
      .from('scratch_card_probabilities')
      .select('*')
      .eq('scratch_type', scratchType)
      .eq('is_active', true);

    if (probError || !probabilities || probabilities.length === 0) {
      throw new Error(`Nenhum item configurado para raspadinha tipo: ${scratchType}`);
    }

    const itemIds = probabilities.map(p => p.item_id).filter(Boolean);
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .in('id', itemIds)
      .eq('is_active', true);

    if (itemsError || !items || items.length === 0) {
      throw new Error(`Nenhum item encontrado para raspadinha tipo: ${scratchType}`);
    }

    // Verificar liberações manuais (prioridade máxima)
    const { data: manualReleases } = await supabase
      .from('manual_item_releases')
      .select(`
        id,
        item_id,
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

    let hasWin = forcedWin || false;
    let winningItem: ScratchSymbol | null = null;

    // Prioridade 1: Liberação manual
    if (manualReleases && manualReleases.length > 0) {
      const release = manualReleases[0];
      if (release.items) {
        hasWin = true;
        winningItem = {
          id: release.items.id,
          symbolId: release.items.id,
          name: release.items.name,
          image_url: release.items.image_url,
          rarity: release.items.rarity,
          base_value: release.items.base_value,
          isWinning: true,
          category: release.items.category
        };

        // Marcar como sorteado
        await supabase
          .from('manual_item_releases')
          .update({ 
            status: 'drawn',
            drawn_at: new Date().toISOString(),
            winner_user_id: user.id
          })
          .eq('id', release.id);

        console.log(`🏆 Liberação manual ativada: ${winningItem.name}`);
      }
    }
    
    // Prioridade 2: Sistema inteligente 90/10
    if (!hasWin) {
      // Verificar se deve ter vitória baseado na probabilidade calculada
      hasWin = Math.random() < winProbability;
      
      if (hasWin) {
        // Filtrar itens baseado no orçamento disponível
        let eligibleItems = items;
        
        if (remainingBudget > 0) {
          // Se há orçamento, filtrar por valor e priorizar itens de menor valor
          eligibleItems = items.filter(item => 
            item.category !== 'dinheiro' || item.base_value <= remainingBudget
          );
        } else {
          // Sem orçamento, apenas itens físicos
          eligibleItems = items.filter(item => item.category !== 'dinheiro');
        }

        if (eligibleItems.length > 0) {
          // Ordenar por valor (menor primeiro) para manter controle
          eligibleItems.sort((a, b) => a.base_value - b.base_value);
          
          // Selecionar item baseado na probabilidade configurada
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

          console.log(`🏆 Item vencedor sistema 90/10: ${winningItem.name} - R$ ${winningItem.base_value}`);
        } else {
          // Sem itens elegíveis, forçar não-vitória
          hasWin = false;
          console.log(`❌ Sem itens elegíveis no orçamento - forçando não-vitória`);
        }
      }
    }

    // Gerar símbolos da raspadinha
    const symbols: ScratchSymbol[] = [];
    const symbolPool: ScratchSymbol[] = [];
    
    // Criar pool baseado nas probabilidades
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

        for (let i = 0; i < prob.probability_weight; i++) {
          symbolPool.push(symbol);
        }
      }
    });

    // Gerar 9 símbolos
    for (let i = 0; i < 9; i++) {
      const randomSymbol = symbolPool[Math.floor(Math.random() * symbolPool.length)];
      symbols.push({
        ...randomSymbol,
        isWinning: false
      });
    }

    // Se há vitória, garantir 3 símbolos iguais do item vencedor
    if (hasWin && winningItem) {
      const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
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

    console.log(`✅ Sistema 90/10 - Raspadinha gerada: hasWin=${hasWin}, prob=${(winProbability * 100).toFixed(1)}%`);

    return new Response(JSON.stringify(scratchCard), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Erro no sistema 90/10:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});