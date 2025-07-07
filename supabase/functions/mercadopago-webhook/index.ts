
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('📥 Webhook recebido. Headers:', Object.fromEntries(req.headers));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const body = await req.json();
      console.log('📦 Payload recebido:', body);

      if (body.type === 'payment') {
        const paymentId = body.data?.id;
        console.log('🔍 Tipo "payment" detectado. ID:', paymentId);

        if (!paymentId) {
          console.error('❌ Payment ID não encontrado');
          return new Response('Payment ID missing', { status: 400, headers: corsHeaders });
        }

        const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
        if (!accessToken) {
          console.error('❌ Access token não configurado');
          return new Response('Configuration error', { status: 500, headers: corsHeaders });
        }

        console.log('🌐 Buscando dados no Mercado Pago...');
        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('🔁 Status da resposta do MP:', paymentResponse.status);
        const paymentData = await paymentResponse.json();
        console.log('✅ Dados do pagamento:', paymentData);

        const preferenceId = paymentData.external_reference || paymentData.metadata?.preference_id;
        console.log('🧾 preference_id:', preferenceId);

        if (!preferenceId) {
          console.error('❌ Preference ID não encontrado');
          return new Response('Preference ID missing', { status: 400, headers: corsHeaders });
        }

        console.log('📤 Chamando Supabase RPC process_mercadopago_webhook');
        const { data: result, error } = await supabase.rpc('process_mercadopago_webhook', {
          p_preference_id: preferenceId,
          p_payment_id: paymentId.toString(),
          p_payment_status: paymentData.status,
          p_webhook_data: paymentData
        });

        if (error) {
          console.error('❌ Erro na RPC process_mercadopago_webhook:', error);
          return new Response('Processing error', { status: 500, headers: corsHeaders });
        }

        console.log('✅ Webhook processado com sucesso. Resultado:', result);
        return new Response('OK', { status: 200, headers: corsHeaders });
      } else {
        console.warn('⚠️ Tipo de notificação ignorado:', body.type);
      }
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  } catch (error) {
    console.error('🔥 Erro inesperado no webhook:', error);
    return new Response('Internal error', { status: 500, headers: corsHeaders });
  }
});

