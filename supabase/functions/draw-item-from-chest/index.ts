
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { chestType, userId, chestPrice } = await req.json()
    
    console.log(`=== DRAW ITEM FROM CHEST ===`)
    console.log(`Usuário: ${userId}`)
    console.log(`Tipo do baú: ${chestType}`)
    console.log(`Preço: R$ ${chestPrice}`)

    // 1. VERIFICAR SALDO DO USUÁRIO
    const { data: walletData, error: walletError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (walletError) {
      console.error('Erro ao buscar carteira:', walletError)
      throw new Error('Carteira não encontrada')
    }

    // Verificar se é usuário de teste (admin)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('simulate_actions')
      .eq('id', userId)
      .single()

    const isTestUser = profileData?.simulate_actions
    const currentBalance = isTestUser ? (walletData.test_balance || 0) : walletData.balance

    if (currentBalance < chestPrice) {
      console.log(`Saldo insuficiente: ${currentBalance} < ${chestPrice}`)
      return new Response(
        JSON.stringify({ error: 'Saldo insuficiente' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 2. DEDUZIR SALDO
    if (isTestUser) {
      // Para usuários de teste, atualizar test_balance
      const { error: updateError } = await supabase
        .from('user_wallets')
        .update({ 
          test_balance: Math.max(0, currentBalance - chestPrice),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Erro ao atualizar test_balance:', updateError)
        throw updateError
      }
    } else {
      // Para usuários reais, atualizar balance e criar transação
      const { error: updateError } = await supabase
        .from('user_wallets')
        .update({ 
          balance: currentBalance - chestPrice,
          total_spent: (walletData.total_spent || 0) + chestPrice,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Erro ao atualizar carteira:', updateError)
        throw updateError
      }

      // Criar transação
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          wallet_id: walletData.id,
          type: 'purchase',
          amount: chestPrice,
          status: 'completed',
          description: `Compra de baú ${chestType}`,
          metadata: { chest_type: chestType }
        })

      if (transactionError) {
        console.error('Erro ao criar transação:', transactionError)
        // Não falhar por causa da transação, mas logar o erro
      }
    }

    console.log(`Saldo deduzido: R$ ${chestPrice}`)

    // 3. SORTEAR ITEM DO BAÚ
    const { data: availableItems, error: itemsError } = await supabase
      .from('chest_item_probabilities')
      .select(`
        *,
        item:items(*)
      `)
      .eq('chest_type', chestType)
      .eq('is_active', true)
      .gt('probability_weight', 0)

    if (itemsError) {
      console.error('Erro ao buscar itens:', itemsError)
      throw itemsError
    }

    if (!availableItems || availableItems.length === 0) {
      console.log('Nenhum item disponível para sorteio neste baú')
      return new Response(
        JSON.stringify({ error: 'Nenhum item disponível para sorteio neste baú' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calcular probabilidades e fazer sorteio
    const totalWeight = availableItems.reduce((sum, item) => sum + item.probability_weight, 0)
    const random = Math.random() * totalWeight

    let currentWeight = 0
    let selectedItem = null

    for (const item of availableItems) {
      currentWeight += item.probability_weight
      if (random <= currentWeight) {
        selectedItem = item
        break
      }
    }

    if (!selectedItem) {
      selectedItem = availableItems[availableItems.length - 1] // Fallback
    }

    console.log(`Item sorteado: ${selectedItem.item.name} (probabilidade: ${selectedItem.probability_weight}%)`)

    // 4. ADICIONAR ITEM AO INVENTÁRIO
    const { error: inventoryError } = await supabase
      .from('user_inventory')
      .insert({
        user_id: userId,
        item_id: selectedItem.item.id,
        chest_type: chestType,
        rarity: selectedItem.item.rarity,
        won_at: new Date().toISOString()
      })

    if (inventoryError) {
      console.error('Erro ao adicionar item ao inventário:', inventoryError)
      throw inventoryError
    }

    console.log('Item adicionado ao inventário com sucesso')

    // 5. ATUALIZAR ESTATÍSTICAS DO PERFIL
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        chests_opened: supabase.raw('chests_opened + 1'),
        total_prizes_won: supabase.raw('total_prizes_won + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Erro ao atualizar perfil:', profileError)
      // Não falha por causa disso
    }

    // 6. REGISTRAR QUANDO O ITEM FOI SORTEADO
    const { error: updateError } = await supabase
      .from('chest_item_probabilities')
      .update({ 
        sorteado_em: new Date().toISOString()
      })
      .eq('id', selectedItem.id)

    if (updateError) {
      console.error('Erro ao registrar sorteio:', updateError)
      // Não falha por causa disso
    }

    console.log('=== PROCESSO CONCLUÍDO COM SUCESSO ===')

    return new Response(
      JSON.stringify({
        item: selectedItem.item,
        probability: selectedItem.probability_weight,
        totalWeight,
        balanceAfter: currentBalance - chestPrice
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
