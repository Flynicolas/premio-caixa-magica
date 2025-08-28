import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

    const { user_id, ref_code, first_click_id, last_click_id } = await req.json()

    if (!user_id || !ref_code) {
      return new Response(
        JSON.stringify({ error: 'user_id and ref_code are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing attribution for:', { user_id, ref_code })

    // Verificar se já existe atribuição para este usuário
    const { data: existingAttribution } = await supabaseClient
      .from('affiliate_attributions')
      .select('*')
      .eq('referred_user', user_id)
      .maybeSingle()

    if (existingAttribution) {
      console.log('User already has attribution:', existingAttribution)
      return new Response(
        JSON.stringify({ message: 'User already attributed', attribution: existingAttribution }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Buscar dados do afiliado pelo ref_code
    const { data: affiliate, error: affiliateError } = await supabaseClient
      .from('affiliates')
      .select('user_id, upline1, upline2')
      .eq('ref_code', ref_code.toUpperCase())
      .eq('status', 'approved')
      .maybeSingle()

    if (affiliateError || !affiliate) {
      console.log('Affiliate not found or not approved:', { ref_code, error: affiliateError })
      return new Response(
        JSON.stringify({ error: 'Affiliate not found or not approved' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se não é auto-referência
    if (affiliate.user_id === user_id) {
      console.log('Self-referral detected, skipping attribution')
      return new Response(
        JSON.stringify({ error: 'Self-referral not allowed' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Criar atribuição
    const { data: attribution, error: attributionError } = await supabaseClient
      .from('affiliate_attributions')
      .insert({
        referred_user: user_id,
        ref_code: ref_code.toUpperCase(),
        affiliate_id: affiliate.user_id,
        upline2: affiliate.upline1,
        upline3: affiliate.upline2,
        first_click_id,
        last_click_id
      })
      .select()
      .single()

    if (attributionError) {
      console.error('Error creating attribution:', attributionError)
      return new Response(
        JSON.stringify({ error: 'Failed to create attribution', details: attributionError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Attribution created successfully:', attribution)

    return new Response(
      JSON.stringify({ 
        message: 'Attribution processed successfully', 
        attribution 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing attribution:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})