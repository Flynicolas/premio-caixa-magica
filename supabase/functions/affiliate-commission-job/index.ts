import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando job de comissões de afiliados');

    // Executar job de cálculo de comissões
    const { data: commissionResult, error: commissionError } = await supabase
      .rpc('run_affiliate_commission_job');

    if (commissionError) {
      console.error('❌ Erro no cálculo de comissões:', commissionError);
      throw commissionError;
    }

    console.log('✅ Comissões calculadas:', commissionResult);

    // Executar job de pagamentos (se necessário)
    const { data: payoutResult, error: payoutError } = await supabase
      .rpc('process_affiliate_payouts');

    if (payoutError) {
      console.error('❌ Erro no processamento de pagamentos:', payoutError);
      // Não interromper por erro de pagamento, apenas logar
    }

    console.log('✅ Pagamentos processados:', payoutResult);

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      commissions: commissionResult,
      payouts: payoutResult || [],
      message: 'Job de comissões executado com sucesso'
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('❌ Erro no job de afiliados:', error);

    // Log do erro no sistema
    await supabase
      .from('admin_error_logs')
      .insert({
        error_type: 'affiliate_job_error',
        error_message: error.message,
        severity: 'high',
        metadata: {
          function: 'affiliate-commission-job',
          timestamp: new Date().toISOString(),
          error_stack: error.stack
        }
      });

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});