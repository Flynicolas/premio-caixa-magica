import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { payment_id, status, amount, transaction_id } = await req.json();

    console.log('Kirvano test webhook received:', { payment_id, status, amount, transaction_id });

    if (status === 'approved') {
      // Find the test payment
      const { data: testPayment, error: findError } = await supabase
        .from('test_payments')
        .select('*')
        .eq('payment_id', payment_id)
        .single();

      if (findError || !testPayment) {
        throw new Error('Test payment not found');
      }

      // Update test payment status
      await supabase
        .from('test_payments')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', payment_id);

      // Add to test balance
      await supabase
        .from('test_balance')
        .upsert({
          user_id: testPayment.user_id,
          balance: amount,
          total_deposited: amount
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      console.log('Kirvano test payment processed successfully');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in test-webhook-kirvano:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});