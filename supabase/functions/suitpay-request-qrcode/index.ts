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
    const { client_name, client_document, amount, webhookUrl } = await req.json();

    // Validar parâmetros
    if (!client_name || !client_document || !amount || !webhookUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Parâmetros obrigatórios: client_name, client_document, amount, webhookUrl"
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fazer requisição real para a API do SuitPay
    const suitpayApiUrl = Deno.env.get('SUITPAY_API_URL') || 'https://ws.suitpay.app/api/v1/gateway/request-qrcode';
    const suitpayClientId = Deno.env.get('SUITPAY_CLIENT_ID');
    const suitpayClientSecret = Deno.env.get('SUITPAY_CLIENT_SECRET');

    if (!suitpayClientId || !suitpayClientSecret) {
      console.error('Credenciais do SuitPay não configuradas');
      return new Response(
        JSON.stringify({
          success: false,
          message: "Erro de configuração do servidor"
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const suitpayPayload = {
      client_name,
      client_document,
      amount,
      webhookUrl
    };

    console.log('Chamando API do SuitPay:', {
      url: suitpayApiUrl,
      payload: { ...suitpayPayload, webhookUrl: '[REDACTED]' }
    });

    const suitpayResponse = await fetch(suitpayApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client_id': suitpayClientId,
        'client_secret': suitpayClientSecret,
      },
      body: JSON.stringify(suitpayPayload)
    });

    if (!suitpayResponse.ok) {
      const errorText = await suitpayResponse.text();
      console.error('Erro na API do SuitPay:', {
        status: suitpayResponse.status,
        statusText: suitpayResponse.statusText,
        body: errorText
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          message: "Erro ao processar pagamento PIX"
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const suitpayData = await suitpayResponse.json();
    
    console.log('Resposta da API do SuitPay:', {
      success: suitpayData.success,
      message: suitpayData.message,
      transactionId: suitpayData.data?.idTransaction
    });

    return new Response(
      JSON.stringify(suitpayData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro ao processar solicitação PIX:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Erro interno do servidor"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});