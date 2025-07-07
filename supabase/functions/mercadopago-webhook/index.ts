
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const body = await req.json()
      console.log('Webhook recebido:', body)

      // Mercado Pago envia diferentes tipos de notificações
      if (body.type === 'payment') {
        const paymentId = body.data?.id
        
        if (!paymentId) {
          console.error('Payment ID não encontrado no webhook')
          return new Response('Payment ID missing', { status: 400, headers: corsHeaders })
        }

        // Buscar detalhes do pagamento na API do Mercado Pago
        const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
        if (!accessToken) {
          console.error('Access token do Mercado Pago não configurado')
          return new Response('Configuration error', { status: 500, headers: corsHeaders })
        }

        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (!paymentResponse.ok) {
          console.error('Erro ao buscar pagamento no Mercado Pago:', paymentResponse.status)
          return new Response('Payment fetch error', { status: 500, headers: corsHeaders })
        }

        const paymentData = await paymentResponse.json()
        console.log('Dados do pagamento:', paymentData)

        // Extrair preference_id do external_reference ou metadata
        const preferenceId = paymentData.external_reference || paymentData.metadata?.preference_id

        if (!preferenceId) {
          console.error('Preference ID não encontrado nos dados do pagamento')
          return new Response('Preference ID missing', { status: 400, headers: corsHeaders })
        }

        // Processar webhook usando a função do banco
        const { data: result, error } = await supabase.rpc('process_mercadopago_webhook', {
          p_preference_id: preferenceId,
          p_payment_id: paymentId.toString(),
          p_payment_status: paymentData.status,
          p_webhook_data: paymentData
        })

        if (error) {
          console.error('Erro ao processar webhook:', error)
          return new Response('Processing error', { status: 500, headers: corsHeaders })
        }

        console.log('Webhook processado com sucesso:', result)
        return new Response('OK', { status: 200, headers: corsHeaders })
      }
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})
