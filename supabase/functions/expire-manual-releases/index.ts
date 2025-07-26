import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('=== EXPIRANDO LIBERAÇÕES MANUAIS ===');

    // Buscar liberações expiradas
    const { data: expiredReleases, error: selectError } = await supabase
      .from('manual_item_releases')
      .select('*')
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    if (selectError) {
      console.error('Erro ao buscar liberações expiradas:', selectError);
      throw selectError;
    }

    if (!expiredReleases || expiredReleases.length === 0) {
      console.log('Nenhuma liberação expirada encontrada');
      return new Response(JSON.stringify({
        message: 'Nenhuma liberação expirada encontrada',
        expired_count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Encontradas ${expiredReleases.length} liberações expiradas`);

    // Marcar como expiradas
    const { error: updateError } = await supabase
      .from('manual_item_releases')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    if (updateError) {
      console.error('Erro ao atualizar liberações:', updateError);
      throw updateError;
    }

    console.log(`${expiredReleases.length} liberações marcadas como expiradas`);

    // Log das liberações expiradas
    for (const release of expiredReleases) {
      console.log(`- Item: ${release.item_id}, Baú: ${release.chest_type}, Expirou em: ${release.expires_at}`);
    }

    return new Response(JSON.stringify({
      message: 'Liberações expiradas processadas com sucesso',
      expired_count: expiredReleases.length,
      expired_releases: expiredReleases.map(r => ({
        id: r.id,
        item_id: r.item_id,
        chest_type: r.chest_type,
        expired_at: r.expires_at
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});