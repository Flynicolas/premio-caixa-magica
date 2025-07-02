
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface WalletData {
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_spent: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'chest_purchase' | 'prize_win' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  created_at: string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setWalletData(data);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const addBalance = async (amount: number) => {
    if (!user) return { error: 'Usuário não logado' };

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount,
          status: 'completed',
          description: `Depósito de R$ ${amount.toFixed(2)}`
        });

      if (error) throw error;

      toast({
        title: "Saldo adicionado!",
        description: `R$ ${amount.toFixed(2)} foram adicionados à sua conta.`,
        variant: "default"
      });

      await fetchWalletData();
      await fetchTransactions();

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar saldo",
        description: error.message,
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  const purchaseChest = async (chestType: string, amount: number) => {
    if (!user) return { error: 'Usuário não logado' };
    if (!walletData || walletData.balance < amount) {
      return { error: 'Saldo insuficiente' };
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'chest_purchase',
          amount,
          status: 'completed',
          description: `Compra de baú ${chestType}`
        });

      if (error) throw error;

      await fetchWalletData();
      await fetchTransactions();

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  useEffect(() => {
    if (user) {
      fetchWalletData();
      fetchTransactions();
    }
    setLoading(false);
  }, [user]);

  return {
    walletData,
    transactions,
    loading,
    addBalance,
    purchaseChest,
    refreshData: () => {
      fetchWalletData();
      fetchTransactions();
    }
  };
};
