import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Por enquanto, simular resposta do SuitPay
    // Em produção, aqui seria feita a chamada real para a API do SuitPay
    const mockResponse = {
      success: true,
      message: "QR Code request processed successfully",
      data: {
        idTransaction: crypto.randomUUID(),
        paymentCode: `00020126860014br.gov.bcb.pix2564pix.bancoe2.com.br/qr/v3/at/${crypto.randomUUID().substring(0, 8)}5204000053039865802BR5913BAU_PREMIADO6010SANTA_RITA62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        response: "OK",
        paymentCodeBase64: generateMockQRCodeBase64(amount)
      }
    };

    console.log('PIX QR Code gerado:', {
      client_name,
      amount,
      transactionId: mockResponse.data.idTransaction
    });

    return new Response(
      JSON.stringify(mockResponse),
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

function generateMockQRCodeBase64(amount: number): string {
  // Base64 de um QR Code simples para demonstração
  // Em produção, isso viria da API real do SuitPay
  return "iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6AQAAAACgl2eQAAACt0lEQVR4Xu2WwXEjMQwEyUTI/LO4UMhEsO4GVbKsh+seFl7Lk89asl01BQyG267f17/2vvO2buCsGzjrBs76P2C11le/okfzsyYP281CYPPxdO7Vt9zg0M1K4OxfSwiJrY3Rc7MY4J+L89FXG0dwMUCX9soK+X2ezULAz3KTQyjsouif3fwwoD+zSq/r3dXv538MuKgLltE1jdWXh64qgNJQkxgMbeqV+1mozwMQ0yY17Mp/iqRQBEkhQHrsjcb8hsIcHl1cCJgcozmySFSvW4+GVQE7iK3urKyZxjFAOH42qwDIRqmJAdYzqRNwFgKBNFXRMa0SU9HmeSFAiWKc+MYr/J4Yh7+qBEKzeK1Sp+bPtGP72zAFgFO6nFwqpFagyCCpBHpODntZonxMpBBghZUxPeCmyfrI0jIg9CeWQSNFs2TbOS4Frny/olEcSWifpoELgbMzrZMNG3qFnfHazU8DobaeF6sFMtiBXyfr88CyKnoUo7gN54pSYG4hm6Y2U9Qv32FeAGSPYp4MY438gtJCAHfSKR9ROMmOfMjzMsAHXAJGiFillIx9CoE1vM5pmF7RPyhtJz/KgEjT6lffNJqTM2zaU2QBcGy707OGanjMQKuyCsixwSpOLQDn3m7+SSWQPvF1W9NaI3uFl+sAw9xKhVNDdglq32ezCgCHhtudkeXcMPUwLFUdcJqU9WGCmFpv2G0B6wBjaxiePZMk9aXMWiCLM49Y48Q5VmcdYGYMU2PSOE1jrL2YtgBYBGgKM8Jaji3T83qpfR5w2Z3lu5b1Ac9oLwRWS3f4crXpkZpRyAQVAjs/KAsFqnXo3xRfBqQmb7Rhj1R9pqgayIVPsWxom1OnUsA+hdfIpdR5UrUSuAwvdLl/+a7xcE0hoGmpkQy/lvNLoCi4Dvht3cBZN3DWDZz1B8AXNvnGUr1mY/sAAAAASUVORK5CYII=";
}