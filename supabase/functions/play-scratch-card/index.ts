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

    // Parse request body
    const { scratchType, forcedWin = false, simulate = false, simulate_user_id = null } = await req.json();
    if (!scratchType) return jsonError("scratchType é obrigatório", 400);

    // Authentication (skip for simulation mode)
    let userId = simulate_user_id;
    if (!simulate) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return jsonError("Token de autorização necessário", 401);
      }
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) {
        return jsonError("Usuário não autenticado", 401);
      }
      userId = user.id;
    }

    if (!userId) return jsonError("user_id é obrigatório", 400);

    // Log game start
    await supabase.rpc('event_log_add', {
      p_event_type: 'SCRATCH_GAME_START',
      p_user_id: userId,
      p_admin_id: null,
      p_ref_id: null,
      p_details: { scratch_type: scratchType, simulate, forced_win: forcedWin }
    });

    // =================== 1. LOAD CONFIGURATIONS ===================
    
    // Load scratch card settings with new fields
    const { data: setting } = await supabase
      .from('scratch_card_settings')
      .select(`
        backend_cost, 
        price_display, 
        price,
        win_probability_global,
        win_probability_influencer, 
        win_probability_normal,
        is_active
      `)
      .eq('scratch_type', scratchType)
      .eq('is_active', true)
      .maybeSingle();

    if (!setting) return jsonError('Configuração da raspadinha não encontrada', 400);

    // Use new fields with fallback for compatibility
    const gamePrice = Number(setting.backend_cost || setting.price || 0);
    const displayPrice = Number(setting.price_display || setting.price || 0);
    
    if (!gamePrice || gamePrice <= 0) return jsonError('Preço da raspadinha não configurado', 400);

    // Load user profile to check if influencer
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_demo, simulate_actions')
      .eq('id', userId)
      .maybeSingle();

    const isInfluencer = profile?.simulate_actions || false; // Usar campo simulate_actions como flag de influencer

    // Load financial control for payout validation
    const today = new Date().toISOString().split('T')[0];
    const { data: financial } = await supabase
      .from('scratch_card_financial_control')
      .select(`
        remaining_budget,
        payout_mode,
        pay_upto_percentage,
        min_bank_balance,
        total_sales,
        total_prizes_given
      `)
      .eq('scratch_type', scratchType)
      .eq('date', today)
      .maybeSingle();

    const currentBankBalance = financial?.remaining_budget ?? 0;

    // =================== 2. CALCULATE DYNAMIC PROBABILITY ===================
    
    // Use scratch_effective_probability function for dynamic probabilities
    const { data: probResult } = await supabase.rpc('scratch_effective_probability', {
      p_global: setting.win_probability_global || 0.08,
      p_influencer: setting.win_probability_influencer || null,
      p_normal: setting.win_probability_normal || null,
      p_is_influencer: isInfluencer
    });

    let baseProbability = (probResult || 8) / 100; // Convert percentage to decimal

    // Apply budget-based adjustments as additional layer
    if (currentBankBalance < 5) baseProbability *= 0.1;
    else if (currentBankBalance < 20) baseProbability *= 0.3;
    else if (currentBankBalance < 50) baseProbability *= 0.5;
    else if (currentBankBalance < 100) baseProbability *= 0.7;

    // Log probability calculation
    await supabase.rpc('event_log_add', {
      p_event_type: 'SCRATCH_PROBABILITY_CALC',
      p_user_id: userId,
      p_admin_id: null,
      p_ref_id: null,
      p_details: {
        scratch_type: scratchType,
        is_influencer: isInfluencer,
        base_probability: baseProbability,
        bank_balance: currentBankBalance,
        global_prob: setting.win_probability_global,
        influencer_prob: setting.win_probability_influencer,
        normal_prob: setting.win_probability_normal
      }
    });

    // =================== 3. LOAD ITEMS AND PROBABILITIES ===================
    
    const { data: probs, error: probErr } = await supabase
      .from('scratch_card_probabilities')
      .select('*')
      .eq('scratch_type', scratchType)
      .eq('is_active', true);

    if (probErr || !probs || probs.length === 0) {
      return jsonError(`Nenhum item configurado para raspadinha tipo: ${scratchType}`, 400);
    }

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

    // =================== 4. DECIDE WIN/LOSS ===================
    
    let hasWin = !!forcedWin || (Math.random() < baseProbability);
    let winningItem: ScratchSymbol | null = null;

    if (hasWin) {
      // Filter eligible items
      let eligible = items.filter(i => {
        const weight = probs.find(p => p.item_id === i.id)?.probability_weight ?? 0;
        if (weight <= 0) return false;
        
        const isMoneyItem = i.category === 'dinheiro' || i.category === 'money';
        
        // Apply prize caps
        const maxPrizeValue = gamePrice * 10; // 10x multiplier
        if (isMoneyItem && i.base_value > maxPrizeValue) return false;
        
        return true;
      });

      if (eligible.length > 0) {
        // Select winning item using weighted random
        const totalWeight = eligible.reduce((s, it) => s + (probs.find(p => p.item_id === it.id)?.probability_weight ?? 0), 0);
        let random = Math.random() * totalWeight;
        let chosen = eligible[0];
        
        for (const it of eligible) {
          const weight = probs.find(p => p.item_id === it.id)?.probability_weight ?? 0;
          random -= weight;
          if (random <= 0) { 
            chosen = it; 
            break; 
          }
        }

        const winningAmount = (chosen.category === 'dinheiro' || chosen.category === 'money') ? chosen.base_value : 0;

        // =================== 5. VALIDATE PAYOUT ===================
        
        if (winningAmount > 0) {
          const { data: payoutValid } = await supabase.rpc('scratch_validate_payout', {
            p_requested: winningAmount,
            p_bank_balance: currentBankBalance,
            p_payout_mode: financial?.payout_mode || 'percentage',
            p_pay_upto_percentage: financial?.pay_upto_percentage || 35,
            p_min_bank_balance: financial?.min_bank_balance || 0
          });

          if (!payoutValid) {
            hasWin = false; // Block payout if validation fails
            await supabase.rpc('event_log_add', {
              p_event_type: 'SCRATCH_PAYOUT_BLOCKED',
              p_user_id: userId,
              p_admin_id: null,
              p_ref_id: null,
              p_details: {
                scratch_type: scratchType,
                requested_amount: winningAmount,
                bank_balance: currentBankBalance,
                payout_mode: financial?.payout_mode,
                reason: 'Payout validation failed'
              }
            });
          } else {
            // Log approved payout
            await supabase.rpc('event_log_add', {
              p_event_type: 'SCRATCH_PAYOUT_APPROVED',
              p_user_id: userId,
              p_admin_id: null,
              p_ref_id: null,
              p_details: {
                scratch_type: scratchType,
                approved_amount: winningAmount,
                bank_balance: currentBankBalance
              }
            });
          }
        }

        if (hasWin) {
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
      } else {
        hasWin = false; // No eligible items
      }
    }

    // =================== 6. GENERATE 3x3 GRID ===================
    
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

    const pickWithCap = (counts: Record<string, number>, disallowId?: string, cap = 2): ScratchSymbol => {
      const allowed = fillerCandidates.filter(c => {
        if (disallowId && c.id === disallowId) return false;
        const current = counts[c.id] || 0;
        return current < cap;
      });
      if (allowed.length === 0) {
        const pool = fillerCandidates.filter(c => !disallowId || c.id !== disallowId);
        return pool[Math.floor(Math.random() * pool.length)];
      }
      return allowed[Math.floor(Math.random() * allowed.length)];
    };

    const symbols: ScratchSymbol[] = Array(9).fill(null);
    const counts: Record<string, number> = {};

    if (hasWin && winningItem) {
      // Place exactly 3 winning symbols
      const positions = [0,1,2,3,4,5,6,7,8];
      for (let i = 0; i < 3; i++) {
        const idx = Math.floor(Math.random() * positions.length);
        const pos = positions.splice(idx, 1)[0];
        symbols[pos] = { ...winningItem };
      }
      counts[winningItem.id] = 3;

      // Fill remaining with non-winning items
      for (let pos of positions) {
        const chosen = pickWithCap(counts, winningItem.id, 2);
        symbols[pos] = { ...chosen, isWinning: false };
        counts[chosen.id] = (counts[chosen.id] || 0) + 1;
      }
    } else {
      // Loss: fill all positions ensuring no 3-of-a-kind
      const positions = [0,1,2,3,4,5,6,7,8];
      for (let pos of positions) {
        const chosen = pickWithCap(counts, undefined, 2);
        symbols[pos] = { ...chosen, isWinning: false };
        counts[chosen.id] = (counts[chosen.id] || 0) + 1;
      }
    }

    // =================== 7. PROCESS GAME IN DATABASE ===================
    
    const winningAmount = hasWin && winningItem && (winningItem.category === 'dinheiro' || winningItem.category === 'money')
      ? Number(winningItem.base_value || 0)
      : 0;

    let rpcResult = null;
    
    if (!simulate) {
      const { data: result, error: rpcError } = await supabase.rpc('process_scratch_card_game', {
        p_user_id: userId,
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

      rpcResult = Array.isArray(result) && result.length > 0 ? result[0] : null;
      if (!rpcResult?.success) {
        const msg = rpcResult?.message || 'Falha ao processar jogo';
        return jsonError(msg, 400);
      }
    }

    // =================== 8. LOG FINAL RESULT ===================
    
    await supabase.rpc('event_log_add', {
      p_event_type: 'SCRATCH_GAME_COMPLETE',
      p_user_id: userId,
      p_admin_id: null,
      p_ref_id: rpcResult?.game_id || null,
      p_details: {
        scratch_type: scratchType,
        has_win: hasWin,
        winning_amount: winningAmount,
        winning_item: winningItem?.name || null,
        simulate,
        final_probability: baseProbability,
        game_price: gamePrice,
        wallet_balance: rpcResult?.wallet_balance || null
      }
    });

    // =================== 9. RETURN RESPONSE ===================
    
    const response: PlayResponse = {
      symbols,
      winningItem,
      hasWin: hasWin && (!!winningItem || winningAmount > 0),
      scratchType,
      gameId: rpcResult?.game_id ?? null,
      walletBalance: rpcResult?.wallet_balance ?? null,
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