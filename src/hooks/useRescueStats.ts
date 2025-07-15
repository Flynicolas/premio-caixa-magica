import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useRescueStats = () => {
  const { user } = useAuth();
  const [totalRescue, setTotalRescue] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const fetchRescues = async () => {
      const { count, error } = await supabase
        .from('item_withdrawals')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('payment_status', 'paid');

      if (!error && typeof count === 'number') {
        setTotalRescue(count);
      }
    };

    fetchRescues();
  }, [user?.id]);

  return { totalRescue };
};
