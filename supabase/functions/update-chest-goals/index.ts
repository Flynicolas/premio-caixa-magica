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

    const { chest_type, amount_paid } = await req.json()

    if (!chest_type || !amount_paid) {
      throw new Error('chest_type e amount_paid são obrigatórios')
    }

    // Buscar meta do baú
    const { data: goal, error: goalError } = await supabaseClient
      .from('metas_baus')
      .select('*')
      .eq('nome_bau', chest_type)
      .single()

    if (goalError) {
      console.error('Erro ao buscar meta:', goalError)
      throw goalError
    }

    if (!goal) {
      throw new Error(`Meta não encontrada para o baú: ${chest_type}`)
    }

    // Atualizar valor atual
    const newCurrentValue = goal.valor_atual + amount_paid
    
    const { error: updateError } = await supabaseClient
      .from('metas_baus')
      .update({ valor_atual: newCurrentValue })
      .eq('id', goal.id)

    if (updateError) {
      console.error('Erro ao atualizar meta:', updateError)
      throw updateError
    }

    // Verificar se meta foi atingida e notificação não foi enviada
    if (newCurrentValue >= goal.meta_valor && !goal.notificacao_enviada) {
      // Marcar notificação como enviada
      await supabaseClient
        .from('metas_baus')
        .update({ notificacao_enviada: true })
        .eq('id', goal.id)

      // Aqui você pode adicionar lógica para enviar notificação ao admin
      // Por exemplo, criar um registro em uma tabela de notificações
      console.log(`Meta atingida para o Baú ${chest_type}. Liberação de item raro disponível.`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          goal_reached: true,
          message: `Meta atingida para o Baú ${chest_type}. Liberação de item raro disponível.`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        goal_reached: false,
        current_value: newCurrentValue,
        target_value: goal.meta_valor
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro na função update-chest-goals:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})