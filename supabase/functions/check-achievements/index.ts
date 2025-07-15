import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders
      });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders
      });
    }

    const { item_rarity } = await req.json();

    const user_id = user.id;
    const unlockedAchievements: string[] = [];
    
    const insertAchievement = async (identifier: string) => {
      const { data: achievement } = await supabase
      .from('achievements')
      .select('id')
      .eq('identifier', identifier)
      .single();
      
      if (!achievement) return;
      
      const { error } = await supabase
      .from('user_achievements')
      .insert({ user_id, achievement_id: achievement.id });
      
      if (!error) unlockedAchievements.push(identifier);
    };
    
    console.log('user_id', user_id);

    const { count: chestCount } = await supabase
    .from('user_inventory')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id);
    
    if (chestCount === 1) await insertAchievement('primeiro_bau');
    if (chestCount === 10) await insertAchievement('10_baus');
    if (chestCount === 100) await insertAchievement('100_baus');
    
    // 2. Todos os tipos de baú
    const { data: chests } = await supabase
    .from('user_inventory')
    .select('item:items(chest_types)')
    .eq('user_id', user_id);
    
    const tiposUnicos = new Set(chests?.flatMap((c: any) => c.item?.chest_types || []));
    if (tiposUnicos.size >= 5) await insertAchievement('todos_os_baus');
    
    // 3. Gastos acumulados
    const { data: transacoes } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', user_id)
    .eq('status', 'completed')
    .eq('type', 'deposit');

    console.log(transacoes.length)
    
    const totalGasto = transacoes?.reduce((acc, t) => acc + (t.amount || 0), 0);

    console.log(totalGasto);

    if (totalGasto >= 10) await insertAchievement('gasto_10');
    if (totalGasto >= 100) await insertAchievement('gasto_100');
    if (totalGasto >= 1000) await insertAchievement('gasto_1000');
    
    // 4. Raridade dos itens
    if (item_rarity === 'epic') await insertAchievement('item_epico');
    
    if (item_rarity === 'legendary') {
      const { count: legendaryCount } = await supabase
      .from('user_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('item->>rarity', 'legendary');
      
      if (legendaryCount >= 5) await insertAchievement('5_lendarios');
    }
    
    // 5. Itens únicos
    const { data: allItems } = await supabase
    .from('user_inventory')
    .select('item_id')
    .eq('user_id', user_id);
    
    const uniqueItems = new Set(allItems?.map(i => i.item_id));
    if (uniqueItems.size >= 20) await insertAchievement('20_diferentes');
    
    // 6. Retiradas
    const { count: withdrawals } = await supabase
    .from('item_withdrawals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id);
    
    if (withdrawals >= 1) await insertAchievement('primeiro_resgate');
    if (withdrawals >= 5) await insertAchievement('5_resgates');
    
    const { count: legendaryWithdrawals } = await supabase
    .from('item_withdrawals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id)
    .eq('item->>rarity', 'legendary');
    
    if (legendaryWithdrawals >= 1) await insertAchievement('resgate_lendario');
    
    return new Response(JSON.stringify({ unlocked: unlockedAchievements }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (err) {
    console.error('Erro geral no check-achievements:', err);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
