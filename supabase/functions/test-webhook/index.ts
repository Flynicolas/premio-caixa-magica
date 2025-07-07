/**
 * @fileoverview Função de teste para validar o sistema de webhooks - CORRIGIDA
 * @author Samuel S. L.
 * @version 2.0.0
 * @since 2025-01-22
 * @copyright © 2025 Samuel S. L. All rights reserved.
 * @commercialUse Commercial use permitted only with prior written permission from Samuel S. L.
 *
 * CORREÇÃO IMPLEMENTADA:
 * - Busca correta na tabela mercadopago_payments
 * - Tratamento do preference_id do MercadoPago vs internal preference_id
 * - Melhor logging para debugging
 * - Validação de dados mais robusta
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRecord {
  id: string;
  user_id: string;
  transaction_id: string;
  preference_id: string;
  payment_id?: string;
  amount: number;
  payment_status?: string;
  created_at?: string;
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
        example: { preference_id: 'PREF_123 ou MP_ID', payment_status: 'approved', amount: 50.00 }
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('🧪 Iniciando teste de webhook para:', { preference_id, payment_status, amount })

    // 1. BUSCA CORRIGIDA: Tentar encontrar pelo preference_id OU pelo payment_id (que é salvo como MP ID)
    let existingPayment: PaymentRecord | null = null;
    let searchMethod = '';

    // Primeiro: tentar buscar pelo preference_id (internal)
    const { data: paymentByPref, error: prefError } = await supabase
      .from('mercadopago_payments')
      .select('*')
      .eq('preference_id', preference_id)
      .maybeSingle() // Use maybeSingle ao invés de single para evitar erro com múltiplas linhas

    if (paymentByPref) {
      existingPayment = paymentByPref as PaymentRecord;
      searchMethod = 'preference_id (internal)';
    } else {
      // Segundo: tentar buscar pelo payment_id (MercadoPago ID)
      const { data: paymentByMpId, error: mpError } = await supabase
        .from('mercadopago_payments')
        .select('*')
        .eq('payment_id', preference_id)
        .maybeSingle()

      if (paymentByMpId) {
        existingPayment = paymentByMpId as PaymentRecord;
        searchMethod = 'payment_id (MercadoPago ID)';
      }
    }

    // Se ainda não encontrou, tentar buscar por LIKE no preference_id
    if (!existingPayment) {
      const { data: paymentsByLike, error: likeError } = await supabase
        .from('mercadopago_payments')
        .select('*')
        .or(`preference_id.ilike.%${preference_id}%,payment_id.ilike.%${preference_id}%`)

      if (paymentsByLike && paymentsByLike.length > 0) {
        existingPayment = paymentsByLike[0] as PaymentRecord; // Pegar o primeiro
        searchMethod = 'LIKE search';
        console.log(`📝 Encontrados ${paymentsByLike.length} pagamentos similares, usando o primeiro`);
      }
    }

    if (!existingPayment) {
      // DEBUG: Listar todos os pagamentos para ajudar no debugging
      const { data: allPayments } = await supabase
        .from('mercadopago_payments')
        .select('preference_id, payment_id, user_id, amount, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      console.error('❌ Preferência não encontrada. Pagamentos recentes:', allPayments)

      return new Response(JSON.stringify({ 
        error: 'Preferência não encontrada',
        preference_id,
        debug_info: {
          searched_for: preference_id,
          recent_payments: allPayments,
          suggestion: 'Use um dos preference_id ou payment_id listados acima'
        }
      }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`✅ Preferência encontrada via ${searchMethod}:`, existingPayment)

    // 2. Simular dados do webhook do Mercado Pago
    const mockPaymentId = Math.floor(Math.random() * 1000000)
    const mockWebhookData = {
      id: mockPaymentId,
      status: payment_status,
      external_reference: existingPayment.preference_id, // Usar o preference_id interno
      metadata: { 
        preference_id: existingPayment.preference_id,
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

    // 3. Testar a função process_mercadopago_webhook com o preference_id CORRETO
    const { data: result, error: processError } = await supabase.rpc('process_mercadopago_webhook', {
      p_preference_id: existingPayment.preference_id, // Usar o preference_id interno, não o do MP
      p_payment_id: mockPaymentId.toString(),
      p_payment_status: payment_status,
      p_webhook_data: mockWebhookData
    })

    if (processError) {
      console.error('❌ Erro ao processar webhook de teste:', processError)
      return new Response(JSON.stringify({ 
        error: 'Erro no processamento',
        details: processError.message,
        webhook_data: mockWebhookData,
        used_preference_id: existingPayment.preference_id
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
        searched_preference_id: preference_id,
        found_via: searchMethod,
        internal_preference_id: existingPayment.preference_id,
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