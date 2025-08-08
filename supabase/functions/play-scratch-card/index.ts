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

interface PlayResponse {
  symbols: ScratchSymbol[];
  winningItem: ScratchSymbol | null;
  hasWin: boolean;
  scratchType: string;
  gameId: string | null;
  walletBalance: number | null;
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

    // Require auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonError("Token de autorização necessário", 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return jsonError("Usuário não autenticado", 401);
    }

    const { scratchType, forcedWin = false } = await req.json();
    if (!scratchType) return jsonError("scratchType é obrigatório", 400);

    // Load today's financial control context
    const today = new Date().toISOString().split('T')[0];
    const { data: financial } = await supabase
      .from('scratch_card_financial_control')
      .select('*')
      .eq('scratch_type', scratchType)
      .eq('date', today)
      .maybeSingle();

    let remainingBudget = financial?.remaining_budget ?? 0;

    // Base probability targeting payout control (capped 8%)
    let winProbability = 0.08; // default cap
    if (remainingBudget < 5) winProbability = 0.01;
    else if (remainingBudget < 20) winProbability = 0.02;
    else if (remainingBudget < 50) winProbability = 0.03;
    else if (remainingBudget < 100) winProbability = 0.05;

    // Load active probabilities and items
    const { data: probs, error: probErr } = await supabase
      .from('scratch_card_probabilities')
      .select('*')
      .eq('scratch_type', scratchType)
      .eq('is_active', true);
    if (probErr || !probs || probs.length === 0) {
      return jsonError(`Nenhum item configurado para raspadinha tipo: ${scratchType}`, 400);
    }

    const itemIds = probs.filter(p => p.probability_weight > 0).map(p => p.item_id);
    const { data: items, error: itemsErr } = await supabase
      .from('items')
      .select('*')
      .in('id', itemIds)
      .eq('is_active', true);
    if (itemsErr || !items || items.length === 0) {
      return jsonError(`Nenhum item encontrado para raspadinha tipo: ${scratchType}`, 400);
    }

    // Decide win/loss
    let hasWin = !!forcedWin || (Math.random() < winProbability);
    let winningItem: ScratchSymbol | null = null;

    if (hasWin) {
      // filter eligible items by remaining budget safety
      let eligible = items.filter(i => {
        const weight = probs.find(p => p.item_id === i.id)?.probability_weight ?? 0;
        if (weight <= 0) return false;
        if (remainingBudget < 5) return i.category === 'dinheiro' && i.base_value <= 3;
        if (remainingBudget < 20) return i.category === 'dinheiro' && i.base_value <= 5;
        if (remainingBudget < 50) return i.category === 'dinheiro' ? i.base_value <= remainingBudget : i.base_value <= 15;
        if (remainingBudget < 100) return i.category === 'dinheiro' ? i.base_value <= remainingBudget : i.base_value <= 30;
        return i.category === 'dinheiro' ? i.base_value <= remainingBudget : i.base_value <= Math.min(50, remainingBudget * 0.8);
      });

      if (eligible.length === 0) {
        hasWin = false; // fallback to safe loss
      } else {
        // weighted pick
        const totalW = eligible.reduce((s, i) => s + (probs.find(p => p.item_id === i.id)?.probability_weight ?? 0), 0);
        let r = Math.random() * totalW;
        let chosen = eligible[0];
        for (const i of eligible) {
          const w = probs.find(p => p.item_id === i.id)?.probability_weight ?? 0;
          r -= w;
          if (r <= 0) { chosen = i; break; }
        }
        winningItem = {
          id: chosen.id,
          symbolId: chosen.id,
          name: chosen.name,
          image_url: chosen.image_url,
          rarity: chosen.rarity,
          base_value: chosen.base_value,
          isWinning: true,
          category: chosen.category
        };
      }
    }

    // Build 3x3 grid symbols from weighted pool
    const symbolPool: ScratchSymbol[] = [];
    probs.forEach(p => {
      if (p.probability_weight > 0) {
        const item = items.find(i => i.id === p.item_id);
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
          for (let i = 0; i < p.probability_weight; i++) symbolPool.push(symbol);
        }
      }
    });

    const symbols: ScratchSymbol[] = [];
    for (let i = 0; i < 9; i++) {
      const rand = symbolPool[Math.floor(Math.random() * symbolPool.length)];
      symbols.push({ ...rand, isWinning: false });
    }

    if (hasWin && winningItem) {
      const positions = [0,1,2,3,4,5,6,7,8];
      for (let i = 0; i < 3; i++) {
        const idx = Math.floor(Math.random() * positions.length);
        const pos = positions.splice(idx, 1)[0];
        symbols[pos] = { ...winningItem };
      }
    }

    // Fetch current price
    const { data: setting } = await supabase
      .from('scratch_card_settings')
      .select('price')
      .eq('scratch_type', scratchType)
      .eq('is_active', true)
      .maybeSingle();
    const gamePrice = Number(setting?.price ?? 0);
    if (!gamePrice || gamePrice <= 0) return jsonError('Preço da raspadinha não configurado', 400);

    // Compute winning money amount if applicable
    const winningAmount = hasWin && winningItem && (winningItem.category === 'dinheiro')
      ? Number(winningItem.base_value || 0)
      : 0;

    // Process the game atomically in DB
    const { data: result, error: rpcError } = await supabase.rpc('process_scratch_card_game', {
      p_user_id: user.id,
      p_scratch_type: scratchType,
      p_game_price: gamePrice,
      p_symbols: symbols,
      p_has_win: hasWin,
      p_winning_item_id: hasWin && winningItem ? winningItem.id : null,
      p_winning_amount: winningAmount
    });

    if (rpcError) {
      console.error('process_scratch_card_game error', rpcError);
      return jsonError(rpcError.message || 'Erro ao processar o jogo', 500);
    }

    const rpcRow = Array.isArray(result) && result.length > 0 ? result[0] : null;
    if (!rpcRow?.success) {
      const msg = rpcRow?.message || 'Falha ao processar jogo';
      return jsonError(msg, 400);
    }

    const response: PlayResponse = {
      symbols,
      winningItem,
      hasWin: hasWin && (!!winningItem || winningAmount > 0),
      scratchType,
      gameId: rpcRow.game_id ?? null,
      walletBalance: rpcRow.wallet_balance ?? null,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ play-scratch-card error', error);
    return jsonError((error as any)?.message || 'Erro interno do servidor', 500);
  }
});

function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
