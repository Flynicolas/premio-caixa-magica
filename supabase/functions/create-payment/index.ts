
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    const { amount, title } = body;

    const preference = {
      items: [
        {
          title: title || "Adicionar Saldo",
          quantity: 1,
          unit_price: amount || 10,
          currency_id: "BRL"
        }
      ],
      back_urls: {
        success: "https://premio-caixa-magica.lovable.app/sucesso",
        failure: "https://premio-caixa-magica.lovable.app/erro",
      },
      auto_return: "approved",
      notification_url: "https://jhbafgzfphiizpuoqksj.supabase.co/functions/v1/mercadopago-webhook"
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (response.ok && data.init_point) {
      return new Response(JSON.stringify({ 
        preference_id: data.id,
        transaction_id: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point 
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      console.error("Erro ao criar preferência:", data);
      return new Response(JSON.stringify({ error: "Erro ao criar preferência", details: data }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    console.error("Erro geral:", err);
    return new Response(JSON.stringify({ error: "Erro interno", details: err.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
