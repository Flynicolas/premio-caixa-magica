
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

    console.log(`🧠 SISTEMA 90/10 AVANÇADO - Usuário: ${user.id}, Tipo: ${scratchType}`);

    // ✅ ETAPA 1: ANÁLISE COMPORTAMENTAL DO USUÁRIO
    const { data: userAnalysis } = await supabase.rpc('analyze_user_behavior', {
      p_user_id: user.id
    });

    const behaviorData = userAnalysis && userAnalysis.length > 0 ? userAnalysis[0] : {
      behavior_score: 50,
      eligibility_tier: 'normal',
      play_pattern: 'casual',
      engagement_level: 'medium',
      days_since_last_win: 0,
      win_frequency: 0,
      analysis_data: {}
    };

    console.log(`👤 Análise do Usuário - Score: ${behaviorData.behavior_score}, Tier: ${behaviorData.eligibility_tier}, Padrão: ${behaviorData.play_pattern}`);
    console.log(`🕒 Dias sem ganhar: ${behaviorData.days_since_last_win}, Freq. vitórias: ${behaviorData.win_frequency}%`);

    // ✅ ETAPA 2: BUSCAR CONTROLE FINANCEIRO E CALCULAR 90/10
    const { data: financialControl } = await supabase
      .from('scratch_card_financial_control')
      .select('*')
      .eq('scratch_type', scratchType)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    let winProbability = 0.30; // Base 30%
    let remainingBudget = 0;
    let percentagePrizes = 0.10; // 10% padrão
    let profitMargin = 95; // Padrão

    if (financialControl) {
      percentagePrizes = financialControl.percentage_prizes || 0.10;
      remainingBudget = financialControl.remaining_budget || 0;
      
      const currentProfit = financialControl.total_sales - financialControl.total_prizes_given;
      const totalSales = financialControl.total_sales;
      
      if (totalSales > 0) {
        profitMargin = (currentProfit / totalSales) * 100;
      }
    }

    console.log(`💰 Controle Financeiro - Margem: ${profitMargin.toFixed(1)}%, Orçamento: R$ ${remainingBudget.toFixed(2)}`);

    // ✅ ETAPA 3: VERIFICAR FILA DE PRÊMIOS PROGRAMADOS (PRIORIDADE 0)
    const { data: programmedPrize } = await supabase.rpc('get_next_programmed_prize', {
      p_scratch_type: scratchType,
      p_user_id: user.id
    });

    // ✅ ETAPA 4: VERIFICAR LIBERAÇÕES MANUAIS (PRIORIDADE 1)
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

    // ✅ ETAPA 5: CALCULAR PROBABILIDADE INTELIGENTE
    // Base: controle financeiro
    if (profitMargin > 95) {
      winProbability = 0.35; // Lucro alto, dar mais prêmios
    } else if (profitMargin > 90) {
      winProbability = 0.25; // Lucro normal
    } else if (profitMargin > 85) {
      winProbability = 0.15; // Lucro médio, reduzir
    } else if (profitMargin > 80) {
      winProbability = 0.08; // Lucro baixo
    } else {
      winProbability = 0.02; // Emergência
    }

    // Ajuste baseado no comportamento do usuário
    const userMultiplier = Math.max(0.5, Math.min(2.0, behaviorData.behavior_score / 50));
    winProbability *= userMultiplier;

    // Aplicar boost para usuários elegíveis
    if (behaviorData.eligibility_tier === 'vip') {
      winProbability *= 1.5;
      console.log(`🌟 Usuário VIP - Probabilidade aumentada em 50%`);
    } else if (behaviorData.eligibility_tier === 'priority') {
      winProbability *= 1.2;
      console.log(`⭐ Usuário Priority - Probabilidade aumentada em 20%`);
    }

    // Boost para usuários sem ganhar há muito tempo
    if (behaviorData.days_since_last_win >= 15) {
      winProbability *= 2.0;
      console.log(`🎯 Boost por perda longa - ${behaviorData.days_since_last_win} dias sem ganhar`);
    } else if (behaviorData.days_since_last_win >= 7) {
      winProbability *= 1.5;
      console.log(`🎯 Boost moderado - ${behaviorData.days_since_last_win} dias sem ganhar`);
    }

    // Limitações de orçamento
    if (remainingBudget <= 0) {
      winProbability = Math.min(winProbability, 0.03); // Blackout quase total
      console.log(`🚫 BLACKOUT: Orçamento esgotado`);
    } else if (remainingBudget < 10) {
      winProbability = Math.min(winProbability, 0.10);
      console.log(`⚠️ Orçamento baixo: limitando probabilidade`);
    }

    // Limitar entre 1% e 50%
    winProbability = Math.max(0.01, Math.min(0.50, winProbability));

    console.log(`🧮 Probabilidade Calculada: ${(winProbability * 100).toFixed(2)}% (Score usuário: ${behaviorData.behavior_score})`);

    // ✅ ETAPA 6: BUSCAR ITENS DISPONÍVEIS
    const { data: probabilities, error: probError } = await supabase
      .from('scratch_card_probabilities')
      .select('*')
      .eq('scratch_type', scratchType)
      .eq('is_active', true);

    if (probError || !probabilities || probabilities.length === 0) {
      throw new Error(`Nenhum item configurado para raspadinha tipo: ${scratchType}`);
    }

    const itemIds = probabilities
      .filter(p => p.probability_weight > 0)
      .map(p => p.item_id)
      .filter(Boolean);
      
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .in('id', itemIds)
      .eq('is_active', true);

    if (itemsError || !items || items.length === 0) {
      throw new Error(`Nenhum item encontrado para raspadinha tipo: ${scratchType}`);
    }

    let hasWin = forcedWin || false;
    let winningItem: ScratchSymbol | null = null;
    let decisionType = 'loss';
    let decisionReason = 'Sistema inteligente - probabilidade não atingida';

    // ✅ ETAPA 7: SISTEMA DE DECISÃO EM CASCATA

    // PRIORIDADE 0: Prêmios programados
    if (!hasWin && programmedPrize && programmedPrize.length > 0) {
      const prize = programmedPrize[0];
      const prizeItem = items.find(item => item.id === prize.item_id);
      
      if (prizeItem) {
        hasWin = true;
        decisionType = 'programmed_prize';
        decisionReason = `Prêmio programado - prioridade ${prize.priority}`;
        
        winningItem = {
          id: prizeItem.id,
          symbolId: prizeItem.id,
          name: prizeItem.name,
          image_url: prizeItem.image_url,
          rarity: prizeItem.rarity,
          base_value: prizeItem.base_value,
          isWinning: true,
          category: prizeItem.category
        };

        // Marcar prêmio programado como usado
        await supabase
          .from('programmed_prize_queue')
          .update({ 
            status: 'used',
            current_uses: prize.current_uses + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', prize.prize_id);

        console.log(`🎁 PRÊMIO PROGRAMADO: ${winningItem.name} - R$ ${winningItem.base_value}`);
      }
    }

    // PRIORIDADE 1: Liberações manuais
    if (!hasWin && manualReleases && manualReleases.length > 0) {
      const release = manualReleases[0];
      if (release.items) {
        hasWin = true;
        decisionType = 'manual_release';
        decisionReason = 'Liberação manual ativa';
        
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

        console.log(`🔧 LIBERAÇÃO MANUAL: ${winningItem.name} - R$ ${winningItem.base_value}`);
      }
    }
    
    // PRIORIDADE 2: Sistema inteligente 90/10
    if (!hasWin && !forcedWin) {
      const randomRoll = Math.random();
      hasWin = randomRoll < winProbability;
      
      if (hasWin) {
        decisionType = 'intelligent_win';
        decisionReason = `Sistema 90/10 - Roll: ${(randomRoll * 100).toFixed(2)}% vs ${(winProbability * 100).toFixed(2)}%`;
        
        // Filtrar itens elegíveis baseado no orçamento
        let eligibleItems = items.filter(item => {
          const prob = probabilities.find(p => p.item_id === item.id);
          const hasValidProbability = prob && prob.probability_weight > 0;
          
          if (!hasValidProbability) return false;
          
          // Se há orçamento, verificar se item cabe
          if (remainingBudget > 0) {
            return item.category !== 'dinheiro' || item.base_value <= remainingBudget;
          }
          
          // Sem orçamento, apenas itens físicos
          return item.category !== 'dinheiro';
        });

        if (eligibleItems.length > 0) {
          // Ordenar por valor (menores primeiro para preservar orçamento)
          eligibleItems.sort((a, b) => a.base_value - b.base_value);
          
          // Selecionar baseado em peso de probabilidade
          const totalWeight = eligibleItems.reduce((sum, item) => {
            const prob = probabilities.find(p => p.item_id === item.id);
            return sum + (prob ? prob.probability_weight : 0);
          }, 0);
          
          if (totalWeight > 0) {
            let randomWeight = Math.random() * totalWeight;
            let selectedItem = eligibleItems[0];
            
            for (const item of eligibleItems) {
              const prob = probabilities.find(p => p.item_id === item.id);
              const weight = prob ? prob.probability_weight : 0;
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

            console.log(`🧮 VITÓRIA INTELIGENTE: ${winningItem.name} - R$ ${winningItem.base_value}`);
          } else {
            hasWin = false;
            decisionType = 'loss';
            decisionReason = 'Sistema 90/10 - Sem itens com peso válido';
            console.log(`❌ Roll ganhou mas sem itens válidos`);
          }
        } else {
          hasWin = false;
          decisionType = 'budget_block';
          decisionReason = 'Sistema 90/10 - Orçamento insuficiente para itens disponíveis';
          console.log(`❌ Roll ganhou mas orçamento insuficiente`);
        }
      } else {
        decisionType = 'loss';
        decisionReason = `Sistema 90/10 - Roll perdeu: ${(randomRoll * 100).toFixed(2)}% vs ${(winProbability * 100).toFixed(2)}%`;
        console.log(`❌ DERROTA: Roll ${(randomRoll * 100).toFixed(2)}% não atingiu ${(winProbability * 100).toFixed(2)}%`);
      }
    }

    // Forçar vitória se solicitado
    if (forcedWin && !hasWin) {
      hasWin = true;
      decisionType = 'forced_win';
      decisionReason = 'Vitória forçada por administrador';
      
      if (items.length > 0) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        winningItem = {
          id: randomItem.id,
          symbolId: randomItem.id,
          name: randomItem.name,
          image_url: randomItem.image_url,
          rarity: randomItem.rarity,
          base_value: randomItem.base_value,
          isWinning: true,
          category: randomItem.category
        };
        console.log(`⚡ VITÓRIA FORÇADA: ${winningItem.name}`);
      }
    }

    // Gerar símbolos da raspadinha
    const symbols: ScratchSymbol[] = [];
    const symbolPool: ScratchSymbol[] = [];
    
    // CORREÇÃO 1.1: Criar pool apenas com itens que têm probability_weight > 0
    probabilities.forEach(prob => {
      if (prob.probability_weight > 0) { // Só adicionar itens que podem aparecer
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
      }
    });

    // Gerar 9 símbolos
    for (let i = 0; i < 9; i++) {
      if (symbolPool.length > 0) {
        const randomSymbol = symbolPool[Math.floor(Math.random() * symbolPool.length)];
        symbols.push({
          ...randomSymbol,
          isWinning: false
        });
      }
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

    // ✅ ETAPA 8: REGISTRAR DECISÃO DO SISTEMA (BACKGROUND)
    const decisionLog = async () => {
      try {
        const logData = {
          user_id: user.id,
          scratch_type: scratchType,
          decision_type: decisionType,
          decision_reason: decisionReason,
          probability_calculated: winProbability,
          budget_available: remainingBudget,
          user_score: behaviorData.behavior_score,
          financial_context: {
            profit_margin: profitMargin,
            total_sales: financialControl?.total_sales || 0,
            total_prizes: financialControl?.total_prizes_given || 0,
            percentage_prizes: percentagePrizes
          },
          user_context: {
            eligibility_tier: behaviorData.eligibility_tier,
            play_pattern: behaviorData.play_pattern,
            engagement_level: behaviorData.engagement_level,
            days_since_last_win: behaviorData.days_since_last_win,
            win_frequency: behaviorData.win_frequency,
            analysis_data: behaviorData.analysis_data
          },
          result_data: {
            has_win: hasWin,
            winning_item: winningItem ? {
              id: winningItem.id,
              name: winningItem.name,
              value: winningItem.base_value,
              rarity: winningItem.rarity,
              category: winningItem.category
            } : null,
            probability_used: winProbability,
            multipliers_applied: {
              user_multiplier: behaviorData.behavior_score / 50,
              tier_boost: behaviorData.eligibility_tier !== 'normal',
              loss_streak_boost: behaviorData.days_since_last_win >= 7
            }
          }
        };

        await supabase
          .from('scratch_decision_logs')
          .insert(logData);
          
        console.log(`📊 Log de decisão registrado: ${decisionType}`);
      } catch (error) {
        console.error('❌ Erro ao registrar log:', error);
      }
    };

    const scratchCard: ScratchCard = {
      symbols,
      winningItem,
      hasWin,
      scratchType
    };

    console.log(`✅ SISTEMA 90/10 AVANÇADO CONCLUÍDO`);
    console.log(`🎯 Resultado: ${hasWin ? 'VITÓRIA' : 'DERROTA'} - ${decisionType}`);
    console.log(`📈 Probabilidade final: ${(winProbability * 100).toFixed(2)}%`);
    console.log(`💰 Orçamento restante: R$ ${remainingBudget.toFixed(2)}`);
    console.log(`👤 Score do usuário: ${behaviorData.behavior_score} (${behaviorData.eligibility_tier})`);

    // Executar log em background (não bloquear resposta)
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(decisionLog());
    } else {
      // Fallback para desenvolvimento/teste
      setTimeout(decisionLog, 0);
    }

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
