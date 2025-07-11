
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
    
    console.log(`Sorteando item do baú ${chestType} para usuário ${userId}`)

    // Buscar itens disponíveis no baú com probabilidade > 0 (apenas itens no sorteio)
    const { data: availableItems, error: itemsError } = await supabase
      .from('chest_item_probabilities')
      .select(`
        *,
        item:items(*)
      `)
      .eq('chest_type', chestType)
      .eq('is_active', true)
      .gt('probability_weight', 0) // Apenas itens com probabilidade > 0 participam do sorteio

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

    // Calcular probabilidades e fazer o sorteio
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

    console.log(`Item sorteado: ${selectedItem.item.name}`)

    // Registrar o sorteio
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
