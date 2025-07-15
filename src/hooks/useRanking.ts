import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { calculateUserLevel } from '@/utils/levelSystem';

interface RankingUser {
  id: string;
  full_name: string;
  total_spent: number;
  total_prizes_won: number;
  level: ReturnType<typeof calculateUserLevel>;
  position: number;
}

export const useRanking = () => {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<RankingUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRanking = async () => {
    setLoading(true);

    try {
      const { data: top10, error: topError } = await supabase.rpc('get_ranking_top10');

      if (topError) throw topError;

      const ranked = (top10 || []).map((u, index) => ({
        id: u.id,
        full_name: u.full_name,
        total_spent: u.total_spent || 0,
        total_prizes_won: u.total_prizes_won || 0,
        level: {
          level: u.level,
          title: u.level_title
        },

        position: index + 1
      }));

      setRanking(ranked);

      if (user) {
        const { data: rankedSelf, error: rankError } = await supabase.rpc('get_user_ranking_position', {
          user_id_input: user.id
        });

        if (rankError) throw rankError;

        if (rankedSelf && rankedSelf.length > 0) {
          const self = rankedSelf[0];
          setCurrentUserRank({
            id: self.id,
            full_name: self.full_name,
            total_spent: self.total_spent,
            total_prizes_won: self.total_prizes_won,
            level: calculateUserLevel(self.total_spent, self.total_prizes_won),
            position: self.position
          });
        }
      }

    } catch (err) {
      console.error('Erro ao buscar ranking:', err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRanking();
  }, [user]);

  return { ranking, currentUserRank, loading, refresh: fetchRanking };
};
