import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders
      });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders
      });
    }
    const { amount, title = 'Adicionar Saldo' } = await req.json();
    if (!amount || amount <= 0) {
      return new Response('Invalid amount', {
        status: 400,
        headers: corsHeaders
      });
    }
    const { data: preference, error: preferenceError } = await supabase.rpc('create_payment_preference', {
      p_user_id: user.id,
      p_amount: amount,
      p_description: title
    });
    if (preferenceError || !preference || preference.length === 0) {
      console.error('Erro ao criar preferência:', preferenceError);
      return new Response('Failed to create preference', {
        status: 500,
        headers: corsHeaders
      });
    }
    const { preference_id, transaction_id } = preference[0];
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      return new Response('Configuration error', {
        status: 500,
        headers: corsHeaders
      });
    }
    const mercadoPagoPreference = {
      items: [
        {
          title,
          quantity: 1,
          unit_price: amount,
          currency_id: 'BRL'
        }
      ],
      external_reference: preference_id,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
      back_urls: {
        success: `https://premio-caixa-magica.lovable.app/sucesso`,
        failure: `https://premio-caixa-magica.lovable.app/erro`
      },
      auto_return: 'approved'
    };
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mercadoPagoPreference)
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro na API do Mercado Pago:', response.status, errorData);
      return new Response('MercadoPago API error', {
        status: 500,
        headers: corsHeaders
      });
    }
    const mpPreference = await response.json();
    console.log('Preferência criada:', mpPreference.id);
    return new Response(JSON.stringify({
      preference_id: preference_id,
      transaction_id: transaction_id,
      init_point: mpPreference.init_point,
      sandbox_init_point: mpPreference.sandbox_init_point
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return new Response('Internal error', {
      status: 500,
      headers: corsHeaders
    });
  }
});
