import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

/**
 * Hook centralizado para gerenciar TODA a estrutura financeira
 * Resolve problemas de duplicação e inconsistências
 */

interface CentralizedWalletData {
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_spent: number;
  is_demo: boolean;
  demo_balance: number;
}

interface UnifiedTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'money_redemption' | 'prize_conversion';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  created_at: string;
  source: 'real' | 'demo';
  metadata?: any;
}

interface CashFlowData {
  totalInflow: number;   // Entradas reais no sistema
  totalOutflow: number;  // Saídas reais do sistema
  netProfit: number;     // Lucro líquido real
  demoTransactions: number; // Volume demo (não afeta caixa real)
}

export const useCentralizedWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [walletData, setWalletData] = useState<CentralizedWalletData | null>(null);
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);

  // Determinar se usuário está em modo demo
  const isDemo = useMemo(() => walletData?.is_demo || false, [walletData?.is_demo]);

  const fetchWalletData = useCallback(async () => {
    if (!user) {
      setWalletData(null);
      return;
    }

    try {
      console.log('🔄 [CentralizedWallet] Carregando dados da carteira...');

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_demo, credito_demo, simulate_actions')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const isDemoUser = profile?.is_demo || false;

      if (isDemoUser) {
        // Usuário DEMO - usar apenas créditos demo
        console.log('👤 [CentralizedWallet] Usuário demo detectado');
        
        // Reset automático de créditos demo se necessário
        await supabase.rpc('reset_demo_credits');
        
        setWalletData({
          balance: profile?.credito_demo || 1000,
          total_deposited: profile?.credito_demo || 1000,
          total_withdrawn: 0,
          total_spent: 0,
          is_demo: true,
          demo_balance: profile?.credito_demo || 1000
        });
      } else {
        // Usuário REAL - buscar dados da carteira real
        console.log('💰 [CentralizedWallet] Usuário real detectado');
        
        const { data: wallet, error: walletError } = await supabase
          .from('user_wallets')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (walletError && walletError.code !== 'PGRST116') throw walletError;

        if (!wallet) {
          // Criar carteira se não existir
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

          setWalletData({
            balance: 0,
            total_deposited: 0,
            total_withdrawn: 0,
            total_spent: 0,
            is_demo: false,
            demo_balance: 0
          });
        } else {
          // Para admins com simulate_actions, usar test_balance
          const isTestUser = profile?.simulate_actions;
          const effectiveBalance = isTestUser ? Number(wallet.test_balance || 0) : Number(wallet.balance);

          setWalletData({
            balance: effectiveBalance,
            total_deposited: Number(wallet.total_deposited || 0),
            total_withdrawn: Number(wallet.total_withdrawn || 0),
            total_spent: Number(wallet.total_spent || 0),
            is_demo: false,
            demo_balance: 0
          });
        }
      }

      console.log('✅ [CentralizedWallet] Dados da carteira carregados');
    } catch (error) {
      console.error('❌ [CentralizedWallet] Erro ao carregar carteira:', error);
      toast({
        title: "Erro ao carregar carteira",
        description: "Não foi possível carregar os dados da carteira.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    try {
      console.log('📋 [CentralizedWallet] Carregando transações...');

      if (isDemo) {
        // Para usuários demo, buscar apenas transações demo
        console.log('👤 [CentralizedWallet] Carregando transações demo');
        // Demo não precisa de histórico detalhado
        setTransactions([]);
        return;
      }

      // Para usuários reais, buscar transações unificadas
      const [mainTransactions, walletTransactions] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      // Unificar transações evitando duplicação
      const unified: UnifiedTransaction[] = [
        ...(mainTransactions.data || []).map(t => ({
          id: `main_${t.id}`,
          type: t.type as UnifiedTransaction['type'],
          amount: Number(t.amount),
          status: t.status as UnifiedTransaction['status'],
          description: t.description || '',
          created_at: t.created_at,
          source: 'real' as const,
          metadata: t.metadata
        })),
        ...(walletTransactions.data || []).map(t => ({
          id: `wallet_${t.id}`,
          type: (t.type || 'money_redemption') as UnifiedTransaction['type'],
          amount: Number(t.amount),
          status: 'completed' as UnifiedTransaction['status'],
          description: t.description || '',
          created_at: t.created_at,
          source: 'real' as const,
          metadata: t.metadata
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 50);

      setTransactions(unified);
      console.log('✅ [CentralizedWallet] Transações carregadas:', unified.length);
    } catch (error) {
      console.error('❌ [CentralizedWallet] Erro ao carregar transações:', error);
    }
  }, [user, isDemo]);

  const calculateCashFlow = useCallback(async () => {
    if (!user || isDemo) {
      setCashFlow({
        totalInflow: 0,
        totalOutflow: 0,
        netProfit: 0,
        demoTransactions: isDemo ? transactions.length : 0
      });
      return;
    }

    try {
      console.log('💹 [CentralizedWallet] Calculando fluxo de caixa...');

      // Buscar entradas reais (depósitos confirmados)
      const { data: deposits } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'deposit')
        .eq('status', 'completed');

      // Buscar saídas reais (resgates de dinheiro processados)
      const { data: redemptions } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('type', 'money_redemption');

      const totalInflow = deposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const totalOutflow = redemptions?.reduce((sum, r) => sum + Math.abs(Number(r.amount)), 0) || 0;

      setCashFlow({
        totalInflow,
        totalOutflow,
        netProfit: totalInflow - totalOutflow,
        demoTransactions: 0
      });

      console.log('✅ [CentralizedWallet] Fluxo de caixa calculado:', { totalInflow, totalOutflow });
    } catch (error) {
      console.error('❌ [CentralizedWallet] Erro ao calcular fluxo de caixa:', error);
    }
  }, [user, isDemo, transactions.length]);

  const purchaseChest = useCallback(async (chestType: string, amount: number) => {
    if (!user || !walletData) {
      return { error: 'Usuário não logado ou carteira não carregada' };
    }

    if (walletData.balance < amount) {
      return { error: 'Saldo insuficiente' };
    }

    try {
      if (isDemo) {
        // Compra DEMO - apenas atualizar crédito demo
        const newBalance = walletData.demo_balance - amount;
        
        const { error } = await supabase
          .from('profiles')
          .update({ 
            credito_demo: newBalance,
            total_spent: (walletData.total_spent || 0) + amount
          })
          .eq('id', user.id);

        if (error) throw error;

        setWalletData(prev => prev ? {
          ...prev,
          balance: newBalance,
          demo_balance: newBalance,
          total_spent: prev.total_spent + amount
        } : null);

        toast({
          title: "Baú comprado! (Demo)",
          description: `Você comprou um baú ${chestType} por R$ ${amount.toFixed(2)}`,
          variant: "default"
        });
      } else {
        // Compra REAL - afetar carteira real e caixa
        const { data: walletInfo } = await supabase
          .from('user_wallets')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!walletInfo) throw new Error('Carteira não encontrada');

        // Criar transação de compra
        await supabase.from('transactions').insert({
          user_id: user.id,
          wallet_id: walletInfo.id,
          type: 'purchase',
          amount: -amount, // Negativo para indicar saída
          status: 'completed',
          description: `Compra de baú ${chestType}`,
          metadata: { chest_type: chestType }
        });

        // Atualizar saldo
        await supabase.from('user_wallets')
          .update({ 
            balance: walletData.balance - amount,
            total_spent: walletData.total_spent + amount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        await refreshData();

        toast({
          title: "Baú comprado!",
          description: `Você comprou um baú ${chestType} por R$ ${amount.toFixed(2)}`,
          variant: "default"
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('❌ [CentralizedWallet] Erro ao comprar baú:', error);
      return { error: error.message };
    }
  }, [user, walletData, isDemo, toast]);

  const refreshData = useCallback(async () => {
    console.log('🔄 [CentralizedWallet] Refresh completo solicitado');
    await Promise.all([
      fetchWalletData(),
      fetchTransactions(),
      calculateCashFlow()
    ]);
  }, [fetchWalletData, fetchTransactions, calculateCashFlow]);

  // Setup inicial
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };

    loadData();
  }, [user, refreshData]);

  // Setup real-time apenas para usuários reais
  useEffect(() => {
    if (!user || isDemo) return;

    console.log('🔔 [CentralizedWallet] Configurando subscriptions...');

    const channels = [
      supabase
        .channel('centralized-wallet-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_wallets', filter: `user_id=eq.${user.id}` },
          () => fetchWalletData())
        .subscribe(),
      
      supabase
        .channel('centralized-transactions-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
          () => { fetchTransactions(); calculateCashFlow(); })
        .subscribe(),
      
      supabase
        .channel('centralized-wallet-transactions-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${user.id}` },
          () => { fetchTransactions(); fetchWalletData(); calculateCashFlow(); })
        .subscribe()
    ];

    return () => {
      console.log('🔕 [CentralizedWallet] Removendo subscriptions');
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, isDemo, fetchWalletData, fetchTransactions, calculateCashFlow]);

  return {
    walletData,
    transactions,
    cashFlow,
    loading,
    isDemo,
    purchaseChest,
    refreshData,
    // Para compatibilidade com código existente
    showPaymentModalForAmount: () => {},
    PaymentModalComponent: () => null
  };
};