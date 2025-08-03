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
      .select('*, items(*)')
      .eq('scratch_type', scratchType)
      .eq('is_active', true);

    if (probError) {
      console.error('Erro ao buscar probabilidades:', probError);
      throw new Error('Erro ao carregar probabilidades da raspadinha');
    }

    if (!probabilities || probabilities.length === 0) {
      throw new Error(`Nenhum item configurado para raspadinha tipo: ${scratchType}`);
    }

    console.log(`📊 Encontradas ${probabilities.length} probabilidades configuradas`);

    // Verificar orçamento diário disponível
    const { data: dailyBudget } = await supabase
      .from('scratch_card_daily_budget')
      .select('*')
      .eq('scratch_type', scratchType)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    let remainingBudget = 0;
    if (dailyBudget) {
      remainingBudget = dailyBudget.remaining_budget;
    }

    console.log(`💰 Orçamento restante para prêmios: R$ ${remainingBudget}`);

    // Gerar símbolos da raspadinha
    const symbols: ScratchSymbol[] = [];
    let winningItem: ScratchSymbol | null = null;
    let hasWin = false;

    // Criar pool de símbolos baseado nas probabilidades
    const symbolPool: ScratchSymbol[] = [];
    
    probabilities.forEach(prob => {
      if (prob.items) {
        const symbol: ScratchSymbol = {
          id: prob.items.id,
          symbolId: prob.items.id,
          name: prob.items.name,
          image_url: prob.items.image_url,
          rarity: prob.items.rarity,
          base_value: prob.items.base_value,
          isWinning: false,
          category: prob.items.category
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

    // Determinar se deve ter vitória (15% de chance base ou forçada)
    const shouldWin = forcedWin || Math.random() < 0.15;
    
    if (shouldWin) {
      // Escolher item vencedor (priorizar itens de menor valor se orçamento limitado)
      const eligibleItems = probabilities
        .filter(p => p.items && (p.items.category !== 'dinheiro' || p.items.base_value <= remainingBudget))
        .sort((a, b) => a.items.base_value - b.items.base_value);

      if (eligibleItems.length > 0) {
        const winnerProb = eligibleItems[Math.floor(Math.random() * eligibleItems.length)];
        winningItem = {
          id: winnerProb.items.id,
          symbolId: winnerProb.items.id,
          name: winnerProb.items.name,
          image_url: winnerProb.items.image_url,
          rarity: winnerProb.items.rarity,
          base_value: winnerProb.items.base_value,
          isWinning: true,
          category: winnerProb.items.category
        };
        hasWin = true;
        console.log(`🏆 Item vencedor selecionado: ${winningItem.name} - R$ ${winningItem.base_value}`);
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