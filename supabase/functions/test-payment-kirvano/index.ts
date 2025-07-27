import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Parse request body
    const { amount, description } = await req.json();

    console.log('Creating Kirvano test payment for user:', user.id, 'amount:', amount);

    // Generate unique IDs for the test
    const paymentId = `KIRVANO_TEST_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const transactionId = crypto.randomUUID();

    // Call Kirvano API to generate real PIX
    const kirvanoPayload = {
      checkout_id: paymentId,
      customer: {
        name: "Usuário Teste",
        document: "00000000000",
        email: "teste@exemplo.com",
        phone_number: "5511999999999"
      },
      products: [
        {
          id: transactionId,
          name: "Recarga de Saldo",
          description: description || "Recarga de saldo para teste",
          price: `R$ ${amount.toFixed(2).replace('.', ',')}`,
          is_order_bump: false
        }
      ],
      total_price: `R$ ${amount.toFixed(2).replace('.', ',')}`,
      payment_method: "PIX"
    };

    // Simulate Kirvano response for now (replace with real API call when ready)
    const kirvanoResponse = {
      event: "PIX_GENERATED",
      event_description: "PIX gerado",
      checkout_id: paymentId,
      sale_id: transactionId,
      payment_method: "PIX",
      total_price: `R$ ${amount.toFixed(2).replace('.', ',')}`,
      type: "ONE_TIME",
      status: "PENDING",
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      customer: kirvanoPayload.customer,
      payment: {
        method: "PIX",
        qrcode: `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${amount.toFixed(2)}5802BR5925KIRVANO TESTE PAGAMENTO6009SAO PAULO62290525TESTE${paymentId.slice(-8)}6304`,
        qrcode_image: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${amount.toFixed(2)}5802BR5925KIRVANO TESTE PAGAMENTO6009SAO PAULO62290525TESTE${paymentId.slice(-8)}6304`)}`,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
      },
      products: kirvanoPayload.products
    };

    // Insert test payment into database with Kirvano data
    const { data: paymentData, error: insertError } = await supabase
      .from('test_payments')
      .insert({
        user_id: user.id,
        payment_id: paymentId,
        transaction_id: transactionId,
        amount: amount,
        description: description || 'Teste de pagamento Kirvano',
        status: 'pending',
        kirvano_data: kirvanoResponse
      })
      .select()
      .single();

    if (insertError) {
      throw new Error('Failed to create test payment record');
    }

    const responseData = {
      success: true,
      payment_id: paymentId,
      transaction_id: transactionId,
      payment_url: `https://demo.kirvano.com/pay/${paymentId}`,
      status: 'pending',
      amount: amount,
      test_mode: true,
      kirvano_response: kirvanoResponse,
      return_urls: {
        success: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://premio-caixa-magica.lovable.app'}/teste-sucesso`,
        error: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://premio-caixa-magica.lovable.app'}/teste-erro`
      }
    };

    console.log('Kirvano test payment created successfully:', responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in test-payment-kirvano:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        test_mode: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});