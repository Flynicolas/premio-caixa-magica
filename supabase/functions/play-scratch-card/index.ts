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

    // Fetch current price FIRST for prize cap calculations
    const { data: setting } = await supabase
      .from('scratch_card_settings')
      .select('price')
      .eq('scratch_type', scratchType)
      .eq('is_active', true)
      .maybeSingle();
    const gamePrice = Number(setting?.price ?? 0);
    if (!gamePrice || gamePrice <= 0) return jsonError('Preço da raspadinha não configurado', 400);

    // Define prize multipliers by scratch type to cap winnings
    const prizeMultipliers: Record<string, number> = {
      pix: 5,       // PIX max 5x (R$0.50 -> max R$2.50)
      dupla: 10,    // Dupla max 10x
      premium: 20,  // Premium max 20x
      deluxe: 25,   // Deluxe max 25x
    };
    const maxPrizeValue = gamePrice * (prizeMultipliers[scratchType] || 10);

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

    // Build item pools (winners only from >0 weight; fillers can include 0-weight)
    const positiveIds = probs.filter(p => p.probability_weight > 0).map(p => p.item_id);
    const zeroWeightIds = probs.filter(p => p.probability_weight <= 0).map(p => p.item_id);
    const allIds = Array.from(new Set([...positiveIds, ...zeroWeightIds]));

    const { data: items, error: itemsErr } = await supabase
      .from('items')
      .select('*')
      .in('id', allIds)
      .eq('is_active', true);
    if (itemsErr || !items || items.length === 0) {
      return jsonError(`Nenhum item encontrado para raspadinha tipo: ${scratchType}`, 400);
    }

    // Decide win/loss
    let hasWin = !!forcedWin || (Math.random() < winProbability);
    let winningItem: ScratchSymbol | null = null;

    if (hasWin) {
      // filter eligible items by remaining budget safety AND prize cap (only >0 weight)
      let eligible = items.filter(i => {
        const weight = probs.find(p => p.item_id === i.id)?.probability_weight ?? 0;
        if (weight <= 0) return false; // never pick 0-weight as prize
        
        // Check if item is money category (both 'dinheiro' and 'money')
        const isMoneyItem = i.category === 'dinheiro' || i.category === 'money';
        
        // Apply prize cap - money items can't exceed maxPrizeValue
        if (isMoneyItem && i.base_value > maxPrizeValue) return false;
        
        // Apply budget safety checks
        if (remainingBudget < 5) return isMoneyItem && i.base_value <= 3;
        if (remainingBudget < 20) return isMoneyItem && i.base_value <= 5;
        if (remainingBudget < 50) return isMoneyItem ? i.base_value <= remainingBudget : i.base_value <= 15;
        if (remainingBudget < 100) return isMoneyItem ? i.base_value <= remainingBudget : i.base_value <= 30;
        return isMoneyItem ? i.base_value <= remainingBudget : i.base_value <= Math.min(50, remainingBudget * 0.8);
      });

      if (eligible.length === 0) {
        hasWin = false; // fallback to safe loss
      } else {
        // weighted pick among >0 weight only
        const totalW = eligible.reduce((s, it) => s + (probs.find(p => p.item_id === it.id)?.probability_weight ?? 0), 0);
        let r = Math.random() * totalW;
        let chosen = eligible[0];
        for (const it of eligible) {
          const w = probs.find(p => p.item_id === it.id)?.probability_weight ?? 0;
          r -= w;
          if (r <= 0) { chosen = it; break; }
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

    // Prepare unique filler candidates (including zero-probability items)
    const candidateMap = new Map<string, ScratchSymbol>();
    for (const it of items) {
      candidateMap.set(it.id, {
        id: it.id,
        symbolId: it.id,
        name: it.name,
        image_url: it.image_url,
        rarity: it.rarity,
        base_value: it.base_value,
        isWinning: false,
        category: it.category
      });
    }
    const fillerCandidates = Array.from(candidateMap.values());

    // Helper to pick a random candidate that respects a per-id cap
    const pickWithCap = (counts: Record<string, number>, disallowId?: string, cap = 2): ScratchSymbol => {
      // Build list of allowed candidates
      const allowed = fillerCandidates.filter(c => {
        if (disallowId && c.id === disallowId) return false;
        const current = counts[c.id] || 0;
        return current < cap; // cap occurrences
      });
      if (allowed.length === 0) {
        // If impossible due to low variety, fallback to any candidate different from disallowId
        const pool = fillerCandidates.filter(c => !disallowId || c.id !== disallowId);
        return pool[Math.floor(Math.random() * pool.length)];
      }
      return allowed[Math.floor(Math.random() * allowed.length)];
    };

    // Build 3x3 grid ensuring no accidental 3-of-a-kind when it's a loss
    const symbols: ScratchSymbol[] = Array(9).fill(null);
    const counts: Record<string, number> = {};

    if (hasWin && winningItem) {
      // Place exactly 3 winning symbols in random positions
      const positions = [0,1,2,3,4,5,6,7,8];
      for (let i = 0; i < 3; i++) {
        const idx = Math.floor(Math.random() * positions.length);
        const pos = positions.splice(idx, 1)[0];
        symbols[pos] = { ...winningItem };
      }
      counts[winningItem.id] = 3;

      // Fill remaining cells with capped non-winning candidates
      for (let pos of positions) {
        const chosen = pickWithCap(counts, winningItem.id, 2);
        symbols[pos] = { ...chosen, isWinning: false };
        counts[chosen.id] = (counts[chosen.id] || 0) + 1;
      }
    } else {
      // Loss: fill all positions using cap so that no id appears >= 3
      const positions = [0,1,2,3,4,5,6,7,8];
      for (let pos of positions) {
        const chosen = pickWithCap(counts, undefined, 2);
        symbols[pos] = { ...chosen, isWinning: false };
        counts[chosen.id] = (counts[chosen.id] || 0) + 1;
      }
    }


    // Compute winning money amount if applicable (check both 'dinheiro' and 'money' categories)
    const winningAmount = hasWin && winningItem && (winningItem.category === 'dinheiro' || winningItem.category === 'money')
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
