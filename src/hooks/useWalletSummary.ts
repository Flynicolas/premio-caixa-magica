import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useWalletSummary = () => {
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalChestsOpened, setTotalChestsOpened] = useState(0);

  const fetchWalletSummary = async () => {
    setLoading(true);
    try {
      const { data: walletAgg, error: walletError } = await supabase
        .from('user_wallets')
        .select('balance, total_spent');

      if (walletError) throw walletError;

      const balanceSum = walletAgg?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0;
      const spentSum = walletAgg?.reduce((acc, curr) => acc + (curr.total_spent || 0), 0) || 0;

      setTotalBalance(balanceSum);
      setTotalSpent(spentSum);

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('chests_opened');

      if (profileError) throw profileError;

      const chestSum = profiles?.reduce((acc, curr) => acc + (curr.chests_opened || 0), 0) || 0;
      setTotalChestsOpened(chestSum);
    } catch (err) {
      console.error('Erro ao buscar resumo da carteira:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletSummary();
  }, []);

  return {
    loading,
    totalBalance,
    totalSpent,
    totalChestsOpened,
  };
};
