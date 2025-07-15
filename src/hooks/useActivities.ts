import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: any;
  experience_gained: number;
  created_at: string;
}

export const useActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const results: UserActivity[] = [];

      // 1. Itens ganhos (prêmios)
      const { data: prizes } = await supabase
        .from('user_inventory')
        .select(`id, won_at, item:items(name, rarity)`)
        .eq('user_id', user.id)
        .order('won_at', { ascending: false })
        .limit(10);

      prizes?.forEach((p: any) => {
        results.push({
          id: `prize_${p.id}`,
          user_id: user.id,
          activity_type: 'prize_win',
          description: `Você ganhou o item "${p.item.name}"`,
          metadata: { item: p.item },
          experience_gained: 0,
          created_at: p.won_at
        });
      });

      // 2. Baús abertos
      const { data: openings } = await supabase
        .from('chest_openings')
        .select(`id, created_at, chest_type`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      openings?.forEach((o: any) => {
        results.push({
          id: `chest_${o.id}`,
          user_id: user.id,
          activity_type: 'chest_opened',
          description: `Você abriu um Baú ${o.chest_type}`,
          metadata: { chest_type: o.chest_type },
          experience_gained: 25,
          created_at: o.created_at
        });
      });

      // 3. Depósitos
      const { data: deposits } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'deposit')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      deposits?.forEach((d: any) => {
        results.push({
          id: `deposit_${d.id}`,
          user_id: user.id,
          activity_type: 'deposit',
          description: `Depósito de R$ ${Number(d.amount).toFixed(2)}`,
          metadata: d.metadata,
          experience_gained: 0,
          created_at: d.created_at
        });
      });

      // 4. Retiradas
      const { data: withdrawals } = await supabase
        .from('item_withdrawals')
        .select('id, created_at, item:items(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      withdrawals?.forEach((w: any) => {
        results.push({
          id: `withdraw_${w.id}`,
          user_id: user.id,
          activity_type: 'withdrawal',
          description: `Solicitou retirada do prêmio "${w.item.name}"`,
          metadata: {},
          experience_gained: 0,
          created_at: w.created_at
        });
      });

      // 5. Conquistas desbloqueadas
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('id, unlocked_at, achievement:achievements(name, reward_experience)')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })
        .limit(10);

      achievements?.forEach((a: any) => {
        results.push({
          id: `achievement_${a.id}`,
          user_id: user.id,
          activity_type: 'achievement_unlocked',
          description: `Conquista desbloqueada: ${a.achievement.name}`,
          metadata: {},
          experience_gained: a.achievement.reward_experience || 0,
          created_at: a.unlocked_at
        });
      });

      // 6. Subida de nível
      const { data: levelUps } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_type', 'level_up')
        .order('created_at', { ascending: false })
        .limit(10);

      levelUps?.forEach((l: any) => {
        results.push({
          id: `levelup_${l.id}`,
          user_id: user.id,
          activity_type: 'level_up',
          description: l.description,
          metadata: l.metadata,
          experience_gained: 0,
          created_at: l.created_at
        });
      });

      // Ordenar tudo por data
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setActivities(results);
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  return { activities, loading };
};
