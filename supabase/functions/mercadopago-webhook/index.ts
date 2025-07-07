/**
 * @fileoverview Webhook do Mercado Pago para processar pagamentos
 * @author Samuel S. L.
 * @version 2.0.0
 * @since 2025-01-04
 * @copyright © 2025 Samuel S. L. All rights reserved.
 * @commercialUse Commercial use permitted only with prior written permission from Samuel S. L.
 *
 * Correções implementadas:
 * - Uso correto de external_reference
 * - Logs detalhados para debugging
 * - Melhor tratamento de erros
 * - Validação de dados do webhook
 */

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
      console.log('=== WEBHOOK RECEBIDO ===')
      console.log('Timestamp:', new Date().toISOString())
      console.log('Body completo:', JSON.stringify(body, null, 2))

      // Mercado Pago envia diferentes tipos de notificações
      if (body.type === 'payment') {
        const paymentId = body.data?.id
        
        if (!paymentId) {
          console.error('❌ Payment ID não encontrado no webhook')
          return new Response('Payment ID missing', { status: 400, headers: corsHeaders })
        }

        console.log('💳 Processando pagamento ID:', paymentId)

        // Buscar detalhes do pagamento na API do Mercado Pago
        const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
        if (!accessToken) {
          console.error('❌ Access token do Mercado Pago não configurado')
          return new Response('Configuration error', { status: 500, headers: corsHeaders })
        }

        console.log('🔄 Buscando detalhes do pagamento na API do MP...')
        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (!paymentResponse.ok) {
          console.error('❌ Erro ao buscar pagamento no Mercado Pago:', paymentResponse.status)
          return new Response('Payment fetch error', { status: 500, headers: corsHeaders })
        }

        const paymentData = await paymentResponse.json()
        console.log('=== DADOS DO PAGAMENTO ===')
        console.log('Status:', paymentData.status)
        console.log('Valor:', paymentData.transaction_amount)
        console.log('Método:', paymentData.payment_method_id)
        console.log('External Reference:', paymentData.external_reference)
        console.log('Metadata:', JSON.stringify(paymentData.metadata, null, 2))

        // CORRIGIDO: Usar external_reference primeiro
        const preferenceId = paymentData.external_reference || paymentData.metadata?.preference_id

        if (!preferenceId) {
          console.error('❌ Preference ID não encontrado!')
          console.error('External reference:', paymentData.external_reference)
          console.error('Metadata:', paymentData.metadata)
          console.error('Dados completos:', JSON.stringify(paymentData, null, 2))
          return new Response('Preference ID missing', { status: 400, headers: corsHeaders })
        }

        console.log('🎯 Processando webhook para preference_id:', preferenceId)

        // Processar webhook usando a função do banco
        console.log('🔄 Chamando função process_mercadopago_webhook...')
        const { data: result, error } = await supabase.rpc('process_mercadopago_webhook', {
          p_preference_id: preferenceId,
          p_payment_id: paymentId.toString(),
          p_payment_status: paymentData.status,
          p_webhook_data: paymentData
        })

        if (error) {
          console.error('❌ Erro ao processar webhook:', error)
          return new Response('Processing error', { status: 500, headers: corsHeaders })
        }

        console.log('✅ Webhook processado com sucesso!')
        console.log('Resultado:', result)
        console.log('=== FIM DO PROCESSAMENTO ===')
        
        return new Response('OK', { status: 200, headers: corsHeaders })
      } else {
        console.log('ℹ️ Tipo de notificação não suportado:', body.type)
        return new Response('Notification type not supported', { status: 200, headers: corsHeaders })
      }
    }

    console.log('❌ Método não permitido:', req.method)
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  } catch (error) {
    console.error('💥 Erro crítico no webhook:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})
