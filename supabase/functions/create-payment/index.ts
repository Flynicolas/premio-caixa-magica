
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
        success: "https://seusite.com/sucesso",
        failure: "https://seusite.com/erro",
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
      return new Response(JSON.stringify({ url: data.init_point }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      console.error("Erro ao criar preferência:", data);
      return new Response("Erro ao criar preferência", { 
        status: 500,
        headers: corsHeaders
      });
    }
  } catch (err) {
    console.error("Erro geral:", err);
    return new Response("Erro interno", { 
      status: 500,
      headers: corsHeaders
    });
  }
});
