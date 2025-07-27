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
    const { amount, description = 'Teste Kirvano' } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error('Amount is required and must be greater than 0');
    }

    console.log('Creating Kirvano test payment for user:', user.id, 'amount:', amount);

    // Create test transaction record
    const testTransactionId = crypto.randomUUID();
    const testPaymentId = `KIRVANO_TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store test payment in database
    const { error: insertError } = await supabase
      .from('test_payments')
      .insert({
        id: testTransactionId,
        user_id: user.id,
        payment_provider: 'kirvano_test',
        payment_id: testPaymentId,
        amount: amount,
        description: description,
        status: 'pending',
        payment_data: {
          test_mode: true,
          provider: 'kirvano',
          created_at: new Date().toISOString()
        }
      });

    if (insertError) {
      console.error('Error inserting test payment:', insertError);
      throw new Error('Failed to create test payment record');
    }

    // Return success response with test payment data
    const response = {
      success: true,
      payment_id: testPaymentId,
      transaction_id: testTransactionId,
      payment_url: `https://demo.kirvano.com/pay/${testPaymentId}`,
      status: 'pending',
      amount: amount,
      test_mode: true,
      return_urls: {
        success: 'https://premio-caixa-magica.lovable.app/teste-sucesso',
        error: 'https://premio-caixa-magica.lovable.app/teste-erro'
      }
    };

    console.log('Kirvano test payment created successfully:', response);

    return new Response(JSON.stringify(response), {
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