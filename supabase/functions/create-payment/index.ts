/**
 * @fileoverview Função para criar preferências de pagamento no Mercado Pago
 * @author Samuel S. L.
 * @version 2.0.0
 * @since 2025-01-04
 * @copyright © 2025 Samuel S. L. All rights reserved.
 * @commercialUse Commercial use permitted only with prior written permission from Samuel S. L.
 *
 * Correções implementadas:
 * - Criação de preferência no banco ANTES do Mercado Pago
 * - Adição de external_reference para vinculação
 * - Autenticação do usuário
 * - Validação de entrada melhorada
 * - Logs detalhados para debugging
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
    // Extrair token de autorização
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Token de autorização não encontrado')
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('Erro de autenticação:', authError)
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    console.log('Usuário autenticado:', user.id)

    const body = await req.json()
    const { amount, title } = body

    if (!amount || amount <= 0) {
      console.error('Valor inválido:', amount)
      return new Response('Invalid amount', { status: 400, headers: corsHeaders })
    }

    console.log('Criando preferência para:', { user_id: user.id, amount, title })

    // 1. CRIAR PREFERÊNCIA NO BANCO PRIMEIRO
    const { data: dbPreference, error: dbError } = await supabase
      .rpc('create_payment_preference', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: title || 'Adicionar Saldo'
      })

    if (dbError || !dbPreference || dbPreference.length === 0) {
      console.error('Erro ao criar preferência no banco:', dbError)
      return new Response('Database error', { status: 500, headers: corsHeaders })
    }

    const { preference_id, transaction_id } = dbPreference[0]
    console.log('Preferência criada no banco:', { preference_id, transaction_id })

    // 2. CRIAR PREFERÊNCIA NO MERCADO PAGO COM EXTERNAL_REFERENCE
    const preference = {
      items: [{
        title: title || "Adicionar Saldo",
        quantity: 1,
        unit_price: amount,
        currency_id: "BRL"
      }],
      external_reference: preference_id, // CHAVE PARA VINCULAR AO BANCO
      metadata: {
        preference_id: preference_id,
        transaction_id: transaction_id,
        user_id: user.id
      },
      back_urls: {
        success: `https://premio-caixa-magica.lovable.app/sucesso?preference_id=${preference_id}`,
        failure: `https://premio-caixa-magica.lovable.app/erro?preference_id=${preference_id}`,
      },
      auto_return: "approved",
      notification_url: "https://jhbafgzfphiizpuoqksj.supabase.co/functions/v1/mercadopago-webhook"
    }

    console.log('Enviando preferência para Mercado Pago:', preference)

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preference)
    })

    const data = await response.json()
    console.log('Resposta do Mercado Pago:', data)

    if (response.ok && data.init_point) {
      // 3. ATUALIZAR REGISTRO NO BANCO COM ID DO MERCADO PAGO
      await supabase
        .from('mercadopago_payments')
        .update({ 
          payment_id: data.id,
          updated_at: new Date().toISOString()
        })
        .eq('preference_id', preference_id)

      console.log('Preferência atualizada no banco com ID do MP:', data.id)

      return new Response(JSON.stringify({ 
        preference_id: preference_id,
        transaction_id: transaction_id,
        mercadopago_id: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point 
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      console.error("Erro ao criar preferência no MP:", data)
      return new Response(JSON.stringify({ error: "Erro ao criar preferência", details: data }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  } catch (err) {
    console.error("Erro geral:", err)
    return new Response(JSON.stringify({ error: "Erro interno", details: err.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
