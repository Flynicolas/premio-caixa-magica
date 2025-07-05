
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { chestType } = await req.json()

    // Buscar todos os itens do baú com suas probabilidades
    const { data: probabilities, error: probError } = await supabaseClient
      .from('chest_item_probabilities')
      .select(`
        *,
        item:items(*)
      `)
      .eq('chest_type', chestType)
      .eq('is_active', true)

    if (probError) throw probError

    if (!probabilities || probabilities.length === 0) {
      throw new Error(`Nenhum item encontrado para o baú ${chestType}`)
    }

    // Criar array ponderado baseado nos pesos de probabilidade
    const weightedItems: string[] = []
    
    probabilities.forEach(prob => {
      if (prob.item) {
        // Adicionar o ID do item N vezes baseado no peso
        for (let i = 0; i < prob.probability_weight; i++) {
          weightedItems.push(prob.item.id)
        }
      }
    })

    // Sortear item aleatório do array ponderado
    const randomIndex = Math.floor(Math.random() * weightedItems.length)
    const drawnItemId = weightedItems[randomIndex]

    // Log do sorteio para auditoria
    console.log(`Sorteio realizado: Baú ${chestType}, Item ID: ${drawnItemId}`)

    return new Response(
      JSON.stringify({ itemId: drawnItemId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no sorteio:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
