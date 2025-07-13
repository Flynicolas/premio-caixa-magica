import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import PaymentModal from '@/components/PaymentModal';

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

interface WalletContextType {
  walletData: WalletData | null;
  transactions: Transaction[];
  loading: boolean;
  purchaseChest: (chestType: string, amount: number) => Promise<{ error: any }>;
  showPaymentModalForAmount: (amount?: number) => void;
  PaymentModalComponent: () => JSX.Element;
  refreshData: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [requiredAmount, setRequiredAmount] = useState<number | undefined>();

  const fetchWalletData = async () => {
    if (!user) return setWalletData(null);

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('simulate_actions')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select('type, amount, status')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        let totalDeposited = 0;
        let totalWithdrawn = 0;
        let totalSpent = 0;

        transactionsData?.forEach(t => {
          if (t.type === 'deposit') totalDeposited += Number(t.amount);
          if (t.type === 'withdrawal') totalWithdrawn += Number(t.amount);
          if (t.type === 'purchase') totalSpent += Number(t.amount);
        });

        const isTestUser = profileData?.simulate_actions;
        const effectiveBalance = isTestUser ? Number(data.test_balance || 0) : Number(data.balance);

        setWalletData({
          balance: effectiveBalance,
          total_deposited: totalDeposited,
          total_withdrawn: totalWithdrawn,
          total_spent: totalSpent
        });
      } else {
        await supabase.from('user_wallets').insert({ user_id: user.id, balance: 0.00 });
        setWalletData({ balance: 0, total_deposited: 0, total_withdrawn: 0, total_spent: 0 });
      }
    } catch (error) {
      console.error(error);
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
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      const allowedTypes = ['deposit', 'withdrawal', 'prize', 'purchase'] as const;
      
      const typed = (data || []).filter(t => 
        allowedTypes.includes(t.type)
      ).map(t => ({
        id: t.id,
        type: t.type as Transaction['type'],
        amount: Number(t.amount),
        status: t.status,
        description: t.description || '',
        created_at: t.created_at,
      }));

      setTransactions(typed);
    } catch (error) {
      console.error(error);
    }
  };

  const purchaseChest = async (chestType: string, amount: number) => {
    if (!user || !walletData) return { error: 'Usuário não logado' };

    if (walletData.balance < amount) {
      const missing = amount - walletData.balance;
      setRequiredAmount(missing);
      setShowPaymentModal(true);
      toast({
        title: "Saldo insuficiente",
        description: `Você precisa de R$ ${missing.toFixed(2)} a mais.`,
        variant: "destructive"
      });
      return { error: 'Saldo insuficiente' };
    }

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('simulate_actions')
        .eq('id', user.id)
        .single();

      const isTestUser = profileData?.simulate_actions;

      const { data: walletInfo } = await supabase
        .from('user_wallets')
        .select('id, test_balance')
        .eq('user_id', user.id)
        .single();

      if (!walletInfo) throw new Error('Carteira não encontrada');

      if (!isTestUser) {
        await supabase.from('transactions').insert({
          user_id: user.id,
          wallet_id: walletInfo.id,
          type: 'purchase',
          amount,
          status: 'completed',
          description: `Compra de baú ${chestType}`,
          metadata: { chest_type: chestType }
        });

        await supabase.from('user_wallets')
          .update({ balance: walletData.balance - amount, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      } else {
        await supabase.from('user_wallets')
          .update({ test_balance: Math.max(0, walletInfo.test_balance - amount), updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }

      toast({ title: "Baú comprado!", description: `Você comprou um baú ${chestType}`, variant: "default" });

      await fetchWalletData();
      await fetchTransactions();

      return { error: null };
    } catch (error: any) {
      toast({ title: "Erro ao comprar baú", description: error.message, variant: "destructive" });
      return { error: error.message };
    }
  };

  const showPaymentModalForAmount = (amount?: number) => {
    setRequiredAmount(amount);
    setShowPaymentModal(true);
  };

  const PaymentModalComponent = () => (
    <PaymentModal
      isOpen={showPaymentModal}
      onClose={() => {
        setShowPaymentModal(false);
        setRequiredAmount(undefined);
      }}
      requiredAmount={requiredAmount}
      title={requiredAmount ? "Saldo Insuficiente" : "Adicionar Saldo"}
      description={requiredAmount 
        ? `Você precisa de pelo menos R$ ${requiredAmount.toFixed(2)} para continuar.`
        : "Escolha o valor para adicionar à sua carteira"
      }
    />
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchWalletData();
      if (user) await fetchTransactions();
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <WalletContext.Provider
      value={{
        walletData,
        transactions,
        loading,
        purchaseChest,
        showPaymentModalForAmount,
        PaymentModalComponent,
        refreshData: async () => {
          await fetchWalletData();
          if (user) await fetchTransactions();
        },
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
