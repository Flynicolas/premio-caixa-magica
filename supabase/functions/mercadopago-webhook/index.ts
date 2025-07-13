import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Preflight request (CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('📥 Webhook recebido - Método:', req.method)
    console.log('📨 Headers:', Object.fromEntries(req.headers))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const body = await req.json()
      console.log('📦 Payload recebido:', JSON.stringify(body, null, 2))

      // Verifica tipo da notificação
      if (body.type === 'payment') {
        const paymentId = body.data?.id
        console.log('💳 Tipo de notificação: payment')
        console.log('🔍 Payment ID recebido:', paymentId)

        if (!paymentId) {
          console.error('❌ Payment ID não encontrado no body.data.id')
          return new Response('Payment ID missing', { status: 400, headers: corsHeaders })
        }

        // Recupera token do Mercado Pago
        const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
        if (!accessToken) {
          console.error('❌ Access token do Mercado Pago não configurado')
          return new Response('Configuration error', { status: 500, headers: corsHeaders })
        }

        console.log('🌐 Consultando detalhes do pagamento na API do Mercado Pago...')
        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('🔁 Status da resposta da API do Mercado Pago:', paymentResponse.status)

        if (!paymentResponse.ok) {
          const errText = await paymentResponse.text()
          console.error('❌ Erro ao buscar pagamento:', errText)
          return new Response('Payment fetch error', { status: 500, headers: corsHeaders })
        }

        const paymentData = await paymentResponse.json()
        console.log('✅ Dados detalhados do pagamento recebidos:', JSON.stringify(paymentData, null, 2))

        const preferenceId = paymentData.external_reference || paymentData.metadata?.preference_id
        console.log('🔑 Preference ID extraído:', preferenceId)

        if (!preferenceId) {
          console.error('❌ Preference ID não encontrado em external_reference nem metadata')
          return new Response('Preference ID missing', { status: 400, headers: corsHeaders })
        }

        console.log('🛠️ Chamando RPC process_mercadopago_webhook com os dados...')

        const { data: result, error } = await supabase.rpc('process_mercadopago_webhook', {
          p_preference_id: preferenceId,
          p_payment_id: paymentId.toString(),
          p_payment_status: paymentData.status,
          p_webhook_data: paymentData
        })

        if (error) {
          console.error('❌ Erro ao processar o webhook no Supabase RPC:', error)
          return new Response('Processing error', { status: 500, headers: corsHeaders })
        }

        console.log('✅ Webhook processado com sucesso. Resultado da RPC:', result)
        return new Response('OK', { status: 200, headers: corsHeaders })
      } else {
        console.warn('⚠️ Tipo de notificação não tratado:', body.type)
      }
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  } catch (error) {
    console.error('🔥 Erro inesperado no webhook handler:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})
