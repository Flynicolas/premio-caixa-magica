import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookData = await req.json();
    
    console.log('SuitPay Webhook recebido:', {
      method: req.method,
      data: webhookData,
      timestamp: new Date().toISOString()
    });

    // Aqui você pode processar o webhook do SuitPay
    // Por exemplo, atualizar status de pagamento no banco de dados
    
    // Por enquanto, apenas logamos e retornamos sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processado com sucesso",
        received_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro ao processar webhook SuitPay:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Erro ao processar webhook"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});