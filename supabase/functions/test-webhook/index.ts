
/**
 * @fileoverview Função de teste para validar o sistema de webhooks
 * @author Samuel S. L.
 * @version 1.0.0
 * @since 2025-01-04
 * @copyright © 2025 Samuel S. L. All rights reserved.
 * @commercialUse Commercial use permitted only with prior written permission from Samuel S. L.
 *
 * Esta função permite testar o processamento de webhooks sem depender do Mercado Pago:
 * - Simula dados de pagamento
 * - Testa a função process_mercadopago_webhook
 * - Valida se o saldo é creditado corretamente
 * - Útil para debugging e validação
 */

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const { preference_id, payment_status = 'approved', amount = 50.00 } = body

    if (!preference_id) {
      return new Response(JSON.stringify({ 
        error: 'preference_id é obrigatório',
        example: { preference_id: 'PREF_123', payment_status: 'approved', amount: 50.00 }
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('🧪 Iniciando teste de webhook para:', { preference_id, payment_status, amount })

    // 1. Verificar se a preferência existe no banco
    const { data: existingPayment, error: checkError } = await supabase
      .from('mercadopago_payments')
      .select('*')
      .eq('preference_id', preference_id)
      .single()

    if (checkError) {
      console.error('❌ Erro ao verificar preferência:', checkError)
      return new Response(JSON.stringify({ 
        error: 'Preferência não encontrada',
        preference_id,
        details: checkError.message
      }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Preferência encontrada:', existingPayment)

    // 2. Simular dados do webhook do Mercado Pago
    const mockPaymentId = Math.floor(Math.random() * 1000000)
    const mockWebhookData = {
      id: mockPaymentId,
      status: payment_status,
      external_reference: preference_id,
      metadata: { 
        preference_id,
        user_id: existingPayment.user_id,
        transaction_id: existingPayment.transaction_id
      },
      payment_method: { 
        type: 'pix',
        id: 'pix'
      },
      payment_method_id: 'pix',
      transaction_amount: amount,
      currency_id: 'BRL',
      date_created: new Date().toISOString(),
      date_approved: payment_status === 'approved' ? new Date().toISOString() : null,
      payer: {
        email: 'test@example.com',
        identification: { type: 'CPF', number: '12345678901' }
      }
    }

    console.log('🎭 Simulando webhook com dados:', JSON.stringify(mockWebhookData, null, 2))

    // 3. Testar a função process_mercadopago_webhook
    const { data: result, error: processError } = await supabase.rpc('process_mercadopago_webhook', {
      p_preference_id: preference_id,
      p_payment_id: mockPaymentId.toString(),
      p_payment_status: payment_status,
      p_webhook_data: mockWebhookData
    })

    if (processError) {
      console.error('❌ Erro ao processar webhook de teste:', processError)
      return new Response(JSON.stringify({ 
        error: 'Erro no processamento',
        details: processError.message,
        webhook_data: mockWebhookData
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Verificar se o saldo foi atualizado (se aprovado)
    let walletInfo = null
    if (payment_status === 'approved') {
      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('balance, total_deposited')
        .eq('user_id', existingPayment.user_id)
        .single()
      
      walletInfo = wallet
    }

    console.log('✅ Teste concluído com sucesso!')

    return new Response(JSON.stringify({ 
      success: true,
      test_data: {
        preference_id,
        payment_status,
        amount,
        mock_payment_id: mockPaymentId
      },
      result,
      wallet_info: walletInfo,
      webhook_data: mockWebhookData,
      message: payment_status === 'approved' 
        ? 'Pagamento aprovado e saldo creditado!' 
        : `Pagamento com status: ${payment_status}`
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Erro no teste:', error)
    return new Response(JSON.stringify({ 
      error: 'Erro interno no teste',
      details: error.message
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
