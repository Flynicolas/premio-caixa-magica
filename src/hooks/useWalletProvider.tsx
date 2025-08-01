import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useDemoWallet } from './useDemoWallet';
import PaymentModal from '@/components/PaymentModal';

interface WalletData {
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_spent: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'prize' | 'purchase' | 'money_redemption';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  created_at: string;
}

interface WalletContextType {
  walletData: WalletData | null;
  transactions: Transaction[];
  loading: boolean;
  isDemo: boolean;
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
  const { walletData: demoWalletData, loading: demoLoading, purchaseChestDemo } = useDemoWallet();
  
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [requiredAmount, setRequiredAmount] = useState<number | undefined>();

  // Determinar se está em modo demo
  const isDemo = useMemo(() => demoWalletData.is_demo, [demoWalletData.is_demo]);

  // Dados efetivos da carteira (demo ou real)
  const effectiveWalletData = useMemo(() => {
    if (isDemo) {
      return {
        balance: demoWalletData.balance,
        total_deposited: demoWalletData.total_deposited,
        total_withdrawn: demoWalletData.total_withdrawn,
        total_spent: demoWalletData.total_spent
      };
    }
    return walletData;
  }, [isDemo, demoWalletData, walletData]);

  const effectiveLoading = useMemo(() => {
    return isDemo ? demoLoading : loading;
  }, [isDemo, demoLoading, loading]);

  const fetchWalletData = useCallback(async () => {
    if (!user) {
      console.log('🔍 [WalletProvider] Usuário não logado, resetando carteira');
      setWalletData(null);
      setLoading(false);
      return;
    }

    // Se está em modo demo, não buscar dados reais
    if (isDemo) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 [WalletProvider] Carregando carteira para usuário:', user.id);

      // Verificar se é admin para usar saldo de teste
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('simulate_actions')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ [WalletProvider] Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        console.log('🔧 [WalletProvider] Carteira não existe, criando nova...');
        const { data: newWallet, error: createError } = await supabase
          .from('user_wallets')
          .insert({
            user_id: user.id,
            balance: 0.00,
            total_deposited: 0.00,
            total_withdrawn: 0.00,
            total_spent: 0.00
          })
          .select()
          .maybeSingle();

        if (createError) throw createError;

        console.log('✅ [WalletProvider] Nova carteira criada:', newWallet);
        setWalletData({
          balance: 0,
          total_deposited: 0,
          total_withdrawn: 0,
          total_spent: 0
        });
        return;
      }

      // Calcular totais baseado nas transações
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('type, amount, status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (transactionsError) {
        console.error('⚠️ [WalletProvider] Erro ao buscar transações:', transactionsError);
      }

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

      // Se for admin com simulate_actions, usar test_balance
      const isTestUser = profileData?.simulate_actions;
      const effectiveBalance = isTestUser ? Number(data.test_balance || 0) : Number(data.balance);

      console.log('📊 [WalletProvider] Dados calculados - Balance:', effectiveBalance, 'isTestUser:', isTestUser);

      setWalletData({
        balance: effectiveBalance,
        total_deposited: totalDeposited,
        total_withdrawn: totalWithdrawn,
        total_spent: totalSpent
      });

      console.log('✅ [WalletProvider] Carteira carregada com sucesso');
    } catch (error) {
      console.error('❌ [WalletProvider] Erro ao carregar carteira:', error);
      toast({
        title: "Erro ao carregar carteira",
        description: "Não foi possível carregar os dados da carteira.",
        variant: "destructive"
      });
      
      setWalletData({
        balance: 0,
        total_deposited: 0,
        total_withdrawn: 0,
        total_spent: 0
      });
    } finally {
      setLoading(false);
    }
  }, [user, isDemo, toast]);

  const fetchTransactions = useCallback(async () => {
    if (!user || isDemo) return;

    try {
      console.log('📋 [WalletProvider] Carregando transações');
      
      // Buscar transações principais
      const { data: mainTransactions, error: mainError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (mainError) throw mainError;

      // Buscar transações da carteira (wallet_transactions)
      const { data: walletTransactions, error: walletError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (walletError) {
        console.warn('⚠️ [WalletProvider] Erro ao buscar wallet_transactions:', walletError);
      }

      const allowedTypes = ['deposit', 'withdrawal', 'prize', 'purchase', 'money_redemption'] as const;
      const allowedStatuses = ['pending', 'completed', 'failed', 'cancelled'] as const;
      
      // Combinar e formatar transações
      const allTransactions = [
        ...(mainTransactions || []).map(t => ({
          id: t.id,
          type: t.type as Transaction['type'],
          amount: Number(t.amount),
          status: t.status as Transaction['status'],
          description: t.description || '',
          created_at: t.created_at,
        })),
        ...(walletTransactions || []).map(t => ({
          id: t.id,
          type: (t.type || 'money_redemption') as Transaction['type'],
          amount: Number(t.amount),
          status: 'completed' as Transaction['status'],
          description: t.description || '',
          created_at: t.created_at,
        }))
      ].filter(t => 
        allowedTypes.includes(t.type as any) && allowedStatuses.includes(t.status as any)
      ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50); // Limitar a 50 transações

      setTransactions(allTransactions);
      console.log('✅ [WalletProvider] Transações carregadas:', allTransactions.length);
    } catch (error) {
      console.error('❌ [WalletProvider] Erro ao carregar transações:', error);
    }
  }, [user, isDemo]);

  const purchaseChest = useCallback(async (chestType: string, amount: number) => {
    if (!user || !effectiveWalletData) {
      toast({
        title: "Erro",
        description: "Usuário não logado ou carteira não carregada.",
        variant: "destructive"
      });
      return { error: 'Usuário não logado' };
    }

    // Se for modo demo, usar função específica
    if (isDemo) {
      return await purchaseChestDemo(chestType, amount);
    }

    if (effectiveWalletData.balance < amount) {
      const missingAmount = amount - effectiveWalletData.balance;
      setRequiredAmount(missingAmount);
      setShowPaymentModal(true);
      
      toast({
        title: "Saldo insuficiente",
        description: `Você precisa de R$ ${missingAmount.toFixed(2)} a mais para comprar este baú.`,
        variant: "destructive"
      });
      return { error: 'Saldo insuficiente' };
    }

    try {
      // Verificar se é admin com saldo de teste
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
        // Criar transação real
        await supabase.from('transactions').insert({
          user_id: user.id,
          wallet_id: walletInfo.id,
          type: 'purchase',
          amount,
          status: 'completed',
          description: `Compra de baú ${chestType}`,
          metadata: { chest_type: chestType }
        });

        // Atualizar saldo real
        await supabase.from('user_wallets')
          .update({ 
            balance: effectiveWalletData.balance - amount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Para admins, atualizar apenas test_balance
        await supabase.from('user_wallets')
          .update({ 
            test_balance: Math.max(0, (walletInfo.test_balance || 0) - amount),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }

      toast({
        title: "Baú comprado!",
        description: `Você comprou um baú ${chestType} por R$ ${amount.toFixed(2)}`,
        variant: "default"
      });

      // Refresh automático dos dados
      await refreshData();

      return { error: null };
    } catch (error: any) {
      console.error('❌ [WalletProvider] Erro ao comprar baú:', error);
      toast({
        title: "Erro ao comprar baú",
        description: error.message,
        variant: "destructive"
      });
      return { error: error.message };
    }
  }, [user, effectiveWalletData, isDemo, purchaseChestDemo, toast]);

  const showPaymentModalForAmount = useCallback((amount?: number) => {
    setRequiredAmount(amount);
    setShowPaymentModal(true);
  }, []);

  const refreshData = useCallback(async () => {
    console.log('🔄 [WalletProvider] Refresh solicitado');
    await Promise.all([
      fetchWalletData(),
      fetchTransactions()
    ]);
  }, [fetchWalletData, fetchTransactions]);

  const PaymentModalComponent = useCallback(() => (
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
  ), [showPaymentModal, requiredAmount]);

  // Setup initial data loading
  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 [WalletProvider] Iniciando carregamento inicial');
      setLoading(true);
      
      try {
        await fetchWalletData();
        if (user && !isDemo) {
          await fetchTransactions();
        }
      } catch (error) {
        console.error('❌ [WalletProvider] Erro no carregamento inicial:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isDemo, fetchWalletData, fetchTransactions]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user || isDemo) return;

    console.log('🔔 [WalletProvider] Configurando subscriptions para user:', user.id);

    // Subscription para user_wallets
    const walletChannel = supabase
      .channel('wallet-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_wallets',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('💰 [WalletProvider] Wallet atualizada via realtime:', payload);
          fetchWalletData();
        }
      )
      .subscribe();

    // Subscription para transactions
    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📋 [WalletProvider] Transação atualizada via realtime:', payload);
          fetchTransactions();
        }
      )
      .subscribe();

    // Subscription para wallet_transactions
    const walletTransactionsChannel = supabase
      .channel('wallet-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('💸 [WalletProvider] Wallet transaction atualizada via realtime:', payload);
          fetchTransactions();
          fetchWalletData(); // Atualizar saldo também
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 [WalletProvider] Removendo subscriptions');
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(walletTransactionsChannel);
    };
  }, [user, isDemo, fetchWalletData, fetchTransactions]);

  const value = useMemo(() => ({
    walletData: effectiveWalletData,
    transactions,
    loading: effectiveLoading,
    isDemo,
    purchaseChest,
    showPaymentModalForAmount,
    PaymentModalComponent,
    refreshData,
  }), [
    effectiveWalletData,
    transactions,
    effectiveLoading,
    isDemo,
    purchaseChest,
    showPaymentModalForAmount,
    PaymentModalComponent,
    refreshData
  ]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
