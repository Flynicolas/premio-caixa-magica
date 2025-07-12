
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

    const { chestType, userId, chestPrice, chestId } = await req.json()
    
    console.log(`Sorteando item do baú ${chestType} para usuário ${userId}`)

    // 1. VERIFICAR SE O USUÁRIO TEM SALDO E O BAÚU É VÁLIDO
    if (chestPrice && chestPrice > 0) {
      // Se o preço foi passado, significa que é uma compra nova
      console.log(`Comprando baú ${chestType} por R$ ${chestPrice}`)
      
      const { data: chestId, error: purchaseError } = await supabase
        .rpc('purchase_chest', {
          p_user_id: userId,
          p_chest_type: chestType,
          p_price: chestPrice
        })

      if (purchaseError) {
        console.error('Erro ao comprar baú:', purchaseError)
        return new Response(
          JSON.stringify({ error: purchaseError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // 2. BUSCAR APENAS ITENS DISPONÍVEIS NO BAÚ COM PROBABILIDADE > 0
    const { data: availableItems, error: itemsError } = await supabase
      .from('chest_item_probabilities')
      .select(`
        *,
        item:items(*)
      `)
      .eq('chest_type', chestType)
      .eq('is_active', true)
      .gt('probability_weight', 0) // APENAS itens com probabilidade > 0 participam do sorteio

    if (itemsError) {
      console.error('Erro ao buscar itens:', itemsError)
      throw itemsError
    }

    if (!availableItems || availableItems.length === 0) {
      console.log('Nenhum item disponível para sorteio neste baú (apenas itens com probabilidade > 0)')
      return new Response(
        JSON.stringify({ error: 'Nenhum item disponível para sorteio neste baú' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 3. CALCULAR PROBABILIDADES E FAZER O SORTEIO
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

    // 4. ABRIR O BAÚ E REGISTRAR O ITEM NO INVENTÁRIO
    if (chestId) {
      const { error: openError } = await supabase
        .rpc('open_chest', {
          p_user_id: userId,
          p_chest_id: chestId,
          p_item_id: selectedItem.item.id
        })

      if (openError) {
        console.error('Erro ao abrir baú:', openError)
        return new Response(
          JSON.stringify({ error: openError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // 5. REGISTRAR QUANDO O ITEM FOI SORTEADO
    const { error: updateError } = await supabase
      .from('chest_item_probabilities')
      .update({ 
        sorteado_em: new Date().toISOString()
      })
      .eq('id', selectedItem.id)

    if (updateError) {
      console.error('Erro ao registrar sorteio:', updateError)
    }

    // Chamar função para atualizar metas dos baús
    try {
      const { error: goalsError } = await supabase.functions.invoke('update-chest-goals', {
        body: { chestType, chestPrice }
      })
      
      if (goalsError) {
        console.error('Erro ao atualizar metas:', goalsError)
      }
    } catch (error) {
      console.error('Erro na função de metas:', error)
    }

    return new Response(
      JSON.stringify({
        item: selectedItem.item,
        probability: selectedItem.probability_weight,
        totalWeight
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
