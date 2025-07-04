
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
  type: 'deposit' | 'withdrawal' | 'prize' | 'purchase';
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
    if (!user) {
      setWalletData(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Calcular totais baseado nas transações
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select('type, amount, status')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        let totalDeposited = 0;
        let totalWithdrawn = 0;
        let totalSpent = 0;

        transactionsData?.forEach(transaction => {
          if (transaction.type === 'deposit') {
            totalDeposited += Number(transaction.amount);
          } else if (transaction.type === 'withdrawal') {
            totalWithdrawn += Number(transaction.amount);
          } else if (transaction.type === 'purchase') {
            totalSpent += Number(transaction.amount);
          }
        });

        setWalletData({
          balance: Number(data.balance),
          total_deposited: totalDeposited,
          total_withdrawn: totalWithdrawn,
          total_spent: totalSpent
        });
      } else {
        // Criar carteira se não existir
        const { data: newWallet, error: createError } = await supabase
          .from('user_wallets')
          .insert({ user_id: user.id, balance: 0.00 })
          .select()
          .single();

        if (createError) throw createError;

        setWalletData({
          balance: 0,
          total_deposited: 0,
          total_withdrawn: 0,
          total_spent: 0
        });
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast({
        title: "Erro ao carregar carteira",
        description: "Não foi possível carregar os dados da carteira.",
        variant: "destructive"
      });
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
      
      // Cast the data to match our Transaction interface
      const typedTransactions: Transaction[] = (data || []).map(transaction => ({
        id: transaction.id,
        type: transaction.type as 'deposit' | 'withdrawal' | 'prize' | 'purchase',
        amount: Number(transaction.amount),
        status: transaction.status as 'pending' | 'completed' | 'failed' | 'cancelled',
        description: transaction.description || '',
        created_at: transaction.created_at
      }));
      
      setTransactions(typedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const addBalance = async (amount: number) => {
    if (!user || !walletData) {
      toast({
        title: "Erro",
        description: "Usuário não logado ou carteira não carregada.",
        variant: "destructive"
      });
      return { error: 'Usuário não logado' };
    }

    try {
      // Buscar wallet_id
      const { data: walletInfo } = await supabase
        .from('user_wallets')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!walletInfo) throw new Error('Carteira não encontrada');

      // Criar transação
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_id: walletInfo.id,
          type: 'deposit',
          amount,
          status: 'completed',
          description: `Depósito de R$ ${amount.toFixed(2)}`
        });

      if (transactionError) throw transactionError;

      // Atualizar saldo da carteira
      const newBalance = walletData.balance + amount;
      const { error: updateError } = await supabase
        .from('user_wallets')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

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
    if (!user || !walletData) {
      toast({
        title: "Erro",
        description: "Usuário não logado ou carteira não carregada.",
        variant: "destructive"
      });
      return { error: 'Usuário não logado' };
    }

    if (walletData.balance < amount) {
      toast({
        title: "Saldo insuficiente",
        description: `Você precisa de R$ ${amount.toFixed(2)} para comprar este baú.`,
        variant: "destructive"
      });
      return { error: 'Saldo insuficiente' };
    }

    try {
      // Buscar wallet_id
      const { data: walletInfo } = await supabase
        .from('user_wallets')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!walletInfo) throw new Error('Carteira não encontrada');

      // Criar transação de compra
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_id: walletInfo.id,
          type: 'purchase',
          amount,
          status: 'completed',
          description: `Compra de baú ${chestType}`,
          metadata: { chest_type: chestType }
        });

      if (transactionError) throw transactionError;

      // Atualizar saldo da carteira
      const newBalance = walletData.balance - amount;
      const { error: updateError } = await supabase
        .from('user_wallets')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Baú comprado!",
        description: `Você comprou um baú ${chestType} por R$ ${amount.toFixed(2)}`,
        variant: "default"
      });

      await fetchWalletData();
      await fetchTransactions();

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao comprar baú",
        description: error.message,
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchWalletData();
      if (user) {
        await fetchTransactions();
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    walletData,
    transactions,
    loading,
    addBalance,
    purchaseChest,
    refreshData: () => {
      fetchWalletData();
      if (user) {
        fetchTransactions();
      }
    }
  };
};
