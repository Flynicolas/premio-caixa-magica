import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessGameRequest {
  scratchType: string;
  gamePrice: number;
  symbols: any[];
  hasWin: boolean;
  winningItemId?: string;
  winningAmount?: number;
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

    const {
      scratchType,
      gamePrice,
      symbols,
      hasWin,
      winningItemId,
      winningAmount
    }: ProcessGameRequest = await req.json();

    console.log(`🎮 Processando jogo de raspadinha: ${scratchType}, usuário: ${user.id}`);

    // Chamar função do banco para processar o jogo
    const { data: result, error: processError } = await supabase
      .rpc('process_scratch_card_game', {
        p_user_id: user.id,
        p_scratch_type: scratchType,
        p_game_price: gamePrice,
        p_symbols: symbols,
        p_has_win: hasWin,
        p_winning_item_id: winningItemId || null,
        p_winning_amount: winningAmount || 0
      });

    if (processError) {
      console.error('Erro ao processar jogo:', processError);
      throw new Error(processError.message || 'Erro ao processar jogo');
    }

    if (!result || result.length === 0) {
      throw new Error('Nenhum resultado retornado');
    }

    const gameResult = result[0];
    
    if (!gameResult.success) {
      throw new Error(gameResult.message);
    }

    console.log(`✅ Jogo processado com sucesso: ${gameResult.game_id}`);

    return new Response(JSON.stringify({
      success: true,
      gameId: gameResult.game_id,
      walletBalance: gameResult.wallet_balance,
      message: gameResult.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Erro na função:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Erro interno do servidor" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});