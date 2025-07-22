
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const url = new URL(req.url);
      const dataId = url.searchParams.get('data.id') || '';
      const headers = Object.fromEntries(req.headers);
      const signatureHeader = headers['x-signature'] || '';
      const requestId = headers['x-request-id'] || '';
      const secret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET") || '';

      if (!signatureHeader || !requestId || !dataId) {
        console.error("Faltando dados obrigatórios: signature, request-id ou data.id");
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }

      const [tsPart, v1Part] = signatureHeader.split(',');
      const ts = tsPart.split('=')[1]?.trim();
      const receivedSignature = v1Part.split('=')[1]?.trim();

      if (!ts || !receivedSignature) {
        console.error("Assinatura inválida: não foi possível extrair ts ou v1");
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }

      const template = `id:${dataId};request-id:${requestId};ts:${ts};`;

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(template)
      );

      const signatureHex = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (signatureHex !== receivedSignature) {
        console.error("Webhook com assinatura inválida");
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }

      const rawBodyText = await req.text();
      const body = JSON.parse(rawBodyText);
      console.log('Payload recebido:', JSON.stringify(body, null, 2));

      if (body.type === 'payment') {
        const paymentId = body.data?.id;
        if (!paymentId) {
          console.error('Payment ID não encontrado no body.data.id');
          return new Response('Payment ID missing', { status: 400, headers: corsHeaders });
        }

        const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
        if (!accessToken) {
          console.error('Access token do Mercado Pago não configurado');
          return new Response('Configuration error', { status: 500, headers: corsHeaders });
        }

        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!paymentResponse.ok) {
          const errText = await paymentResponse.text();
          console.error('Erro ao buscar pagamento:', errText);
          return new Response('Payment fetch error', { status: 500, headers: corsHeaders });
        }

        const paymentData = await paymentResponse.json();
        const preferenceId = paymentData.external_reference || paymentData.metadata?.preference_id;
        const description = paymentData.description || '';

        if (!preferenceId) {
          console.error('Preference ID não encontrado');
          return new Response('Preference ID missing', { status: 400, headers: corsHeaders });
        }

        if (description.startsWith('Retirada do prêmio #')) {
          const withdrawalId = description.replace('Retirada do prêmio #', '').trim();

          // Atualizar status do pagamento
          const { error: payError } = await supabase
            .from('item_withdrawal_payments')
            .update({ status: paymentData.status === 'approved' ? 'paid' : paymentData.status })
            .eq('withdrawal_id', withdrawalId)
            .eq('transaction_id', paymentId.toString());

          if (payError) {
            console.error('Erro ao atualizar item_withdrawal_payments:', payError);
          }

          // Se pagamento aprovado, processar retirada
          if (paymentData.status === 'approved') {
            // Buscar dados da retirada
            const { data: withdrawal, error: withdrawalFetchError } = await supabase
              .from('item_withdrawals')
              .select('inventory_id')
              .eq('id', withdrawalId)
              .single();

            if (withdrawalFetchError) {
              console.error('Erro ao buscar dados da retirada:', withdrawalFetchError);
            } else {
              // Marcar item como resgatado no inventário APENAS APÓS PAGAMENTO CONFIRMADO
              const { error: inventoryError } = await supabase
                .from('user_inventory')
                .update({ 
                  is_redeemed: true, 
                  redeemed_at: new Date().toISOString() 
                })
                .eq('id', withdrawal.inventory_id);

              if (inventoryError) {
                console.error('Erro ao marcar item como resgatado:', inventoryError);
              }
            }

            // Atualizar status da retirada
            const { error: withdrawalError } = await supabase
              .from('item_withdrawals')
              .update({
                payment_status: 'paid',
                delivery_status: 'aguardando_envio'
              })
              .eq('id', withdrawalId);

            if (withdrawalError) {
              console.error('Erro ao atualizar item_withdrawals:', withdrawalError);
            }
          } else if (paymentData.status === 'cancelled' || paymentData.status === 'rejected') {
            // Se pagamento cancelado/rejeitado, manter item disponível no inventário
            console.log(`Pagamento ${paymentData.status} - item permanece disponível no inventário`);
            
            // Atualizar status da retirada para refletir falha no pagamento
            const { error: withdrawalError } = await supabase
              .from('item_withdrawals')
              .update({
                payment_status: paymentData.status,
                delivery_status: 'pagamento_falhado'
              })
              .eq('id', withdrawalId);

            if (withdrawalError) {
              console.error('Erro ao atualizar status da retirada falhada:', withdrawalError);
            }
          }

          return new Response('Retirada processada com sucesso', { status: 200, headers: corsHeaders });
        }

        // Processar outros tipos de pagamento (wallet, etc.)
        const { data: result, error } = await supabase.rpc('process_mercadopago_webhook', {
          p_preference_id: preferenceId,
          p_payment_id: paymentId.toString(),
          p_payment_status: paymentData.status,
          p_webhook_data: paymentData
        });

        if (error) {
          console.error('Erro ao processar o webhook:', error);
          return new Response('Processing error', { status: 500, headers: corsHeaders });
        }

        return new Response('OK', { status: 200, headers: corsHeaders });
      }

      return new Response('Tipo não tratado', { status: 200, headers: corsHeaders });
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return new Response('Internal error', { status: 500, headers: corsHeaders });
  }
});
