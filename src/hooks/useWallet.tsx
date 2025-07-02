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

  // Temporary balance for testing - remove when authentication is implemented
  const TEMP_BALANCE = 10000.00;

  const fetchWalletData = async () => {
    if (!user) {
      // Set temporary balance for testing
      setWalletData({
        balance: TEMP_BALANCE,
        total_deposited: TEMP_BALANCE,
        total_withdrawn: 0,
        total_spent: 0
      });
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setWalletData(data);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      // Fallback to temporary balance
      setWalletData({
        balance: TEMP_BALANCE,
        total_deposited: TEMP_BALANCE,
        total_withdrawn: 0,
        total_spent: 0
      });
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
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
    if (!user) {
      // For testing without authentication
      if (walletData) {
        const newBalance = walletData.balance + amount;
        setWalletData({
          ...walletData,
          balance: newBalance,
          total_deposited: walletData.total_deposited + amount
        });
        
        toast({
          title: "Saldo adicionado!",
          description: `R$ ${amount.toFixed(2)} foram adicionados à sua conta.`,
          variant: "default"
        });
        
        return { error: null };
      }
      return { error: 'Erro temporário' };
    }

    try {
      const { error } = await (supabase as any)
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

  // Atualizar função de compra de baú para usar o novo sistema
  const purchaseChest = async (chestType: string, amount: number) => {
    if (!walletData || walletData.balance < amount) {
      toast({
        title: "Saldo insuficiente",
        description: `Você precisa de R$ ${amount.toFixed(2)} para comprar este baú.`,
        variant: "destructive"
      });
      return { error: 'Saldo insuficiente' };
    }

    // Para teste sem autenticação - apenas deduzir do saldo temporário
    if (!user) {
      const newBalance = walletData.balance - amount;
      setWalletData({
        ...walletData,
        balance: newBalance,
        total_spent: walletData.total_spent + amount
      });
      
      // Aqui você poderia chamar useInventory().addChestToInventory()
      // Mas vamos fazer isso no componente que chama esta função
      
      toast({
        title: "Baú comprado!",
        description: `Você comprou um baú ${chestType} por R$ ${amount.toFixed(2)}`,
        variant: "default"
      });
      
      return { error: null };
    }

    try {
      // Criar ordem de compra
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_type: 'chest_purchase',
          amount,
          status: 'completed', // Para teste, marcar como pago imediatamente
          items: { chest_type: chestType, quantity: 1 }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar transação
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'chest_purchase',
          amount,
          status: 'completed',
          description: `Compra de baú ${chestType}`
        });

      if (transactionError) throw transactionError;

      // Adicionar baú ao inventário
      const { error: inventoryError } = await supabase
        .from('user_chest_inventory')
        .insert({
          user_id: user.id,
          chest_type: chestType,
          quantity: 1,
          acquired_from: 'purchase',
          order_id: order.id
        });

      if (inventoryError) throw inventoryError;

      await fetchWalletData();
      await fetchTransactions();

      toast({
        title: "Baú comprado!",
        description: `Você comprou um baú ${chestType} por R$ ${amount.toFixed(2)}`,
        variant: "default"
      });

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
    fetchWalletData();
    if (user) {
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
      if (user) {
        fetchTransactions();
      }
    }
  };
};
