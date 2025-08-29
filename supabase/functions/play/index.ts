import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlayRequest {
  user_id: string;
  game_type: string;
  bet: number;
  client_tx_id?: string;
}

interface PlayResponse {
  status: 'ok' | 'duplicate' | 'error';
  prize?: number;
  rtp_after?: number;
  wallet_balance?: number;
  message?: string;
  client_tx_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    console.log('Play endpoint called:', req.method, req.url);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const body: PlayRequest = await req.json();
    console.log('Play request body:', body);

    // Validate required fields
    if (!body.user_id || !body.game_type || !body.bet) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: 'Missing required fields: user_id, game_type, bet' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate bet amount
    if (body.bet <= 0) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: 'Bet amount must be greater than 0' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate client_tx_id if not provided
    const clientTxId = body.client_tx_id || `${body.user_id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('Calling scratch_play_tx with:', {
      p_user_id: body.user_id,
      p_game_type: body.game_type,
      p_bet: body.bet,
      p_client_tx_id: clientTxId
    });

    // Call the RTP transaction function
    const { data: rtpResult, error: rtpError } = await supabase.rpc('scratch_play_tx', {
      p_user_id: body.user_id,
      p_game_type: body.game_type,
      p_bet: body.bet,
      p_client_tx_id: clientTxId
    });

    if (rtpError) {
      console.error('RTP function error:', rtpError);
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: rtpError.message || 'Internal server error' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('RTP function result:', rtpResult);

    // Handle duplicate transaction
    if (rtpResult?.status === 'duplicate') {
      return new Response(
        JSON.stringify({ 
          status: 'duplicate',
          message: 'Transaction already processed',
          client_tx_id: clientTxId
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get updated wallet balance
    const { data: walletData, error: walletError } = await supabase
      .from('user_wallets')
      .select('balance')
      .eq('user_id', body.user_id)
      .single();

    if (walletError) {
      console.error('Wallet query error:', walletError);
    }

    const response: PlayResponse = {
      status: 'ok',
      prize: rtpResult?.prize || 0,
      rtp_after: rtpResult?.rtp_after || 0,
      wallet_balance: walletData?.balance || 0,
      client_tx_id: clientTxId,
      message: 'Game played successfully'
    };

    console.log('Play response:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Play endpoint error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});