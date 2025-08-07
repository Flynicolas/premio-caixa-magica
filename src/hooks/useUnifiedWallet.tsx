import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

/**
 * 🔥 HOOK UNIFICADO DE CARTEIRA - VERSÃO FINAL
 * Este hook substitui TODOS os outros hooks de carteira:
 * - useWalletProvider ❌
 * - useCentralizedWallet ❌ 
 * - useWallet ❌
 * - useDemoWallet ❌
 * - useSmartWallet ❌
 * 
 * ✅ SOLUÇÃO ÚNICA E DEFINITIVA
 */

interface UnifiedWalletData {
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_spent: number;
  is_demo: boolean;
}

interface UnifiedTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'money_redemption' | 'prize';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  created_at: string;
  source: 'real' | 'demo';
}

interface CashFlowData {
  totalInflow: number;      // Entrada real de dinheiro
  totalOutflow: number;     // Saída real de dinheiro  
  netProfit: number;        // Lucro líquido REAL
  systemBalance: number;    // Saldo total do sistema
  emergencyStop: boolean;   // Estado de emergência
  alertLevel: string;       // Nível de alerta
}

export const useUnifiedWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [walletData, setWalletData] = useState<UnifiedWalletData | null>(null);
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditAlerts, setAuditAlerts] = useState<any[]>([]);

  // Estado demo detectado automaticamente
  const isDemo = useMemo(() => walletData?.is_demo || false, [walletData?.is_demo]);

  const fetchWalletData = useCallback(async () => {
    if (!user) {
      console.log('🔍 [UnifiedWallet] Usuário não logado');
      setWalletData(null);
      return;
    }

    try {
      console.log('🔄 [UnifiedWallet] Carregando dados da carteira...');

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_demo, credito_demo, simulate_actions, total_spent')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const isDemoUser = profile?.is_demo || false;

      if (isDemoUser) {
        // 🎮 USUÁRIO DEMO
        console.log('👤 [UnifiedWallet] Usuário demo detectado');
        
        // Reset automático se necessário
        await supabase.rpc('reset_demo_credits');
        
        setWalletData({
          balance: profile?.credito_demo || 1000,
          total_deposited: profile?.credito_demo || 1000,
          total_withdrawn: 0,
          total_spent: profile?.total_spent || 0,
          is_demo: true
        });
      } else {
        // 💰 USUÁRIO REAL
        console.log('💰 [UnifiedWallet] Usuário real detectado');
        
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
            is_demo: false
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
            is_demo: false
          });
        }
      }

      console.log('✅ [UnifiedWallet] Dados carregados com sucesso');
    } catch (error) {
      console.error('❌ [UnifiedWallet] Erro ao carregar carteira:', error);
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
      console.log('📋 [UnifiedWallet] Carregando transações...');

      if (isDemo) {
        // Demo não tem histórico detalhado
        setTransactions([]);
        return;
      }

      // Buscar transações unificadas
      const [mainTransactions, walletTransactions] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(25),
        supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(25)
      ]);

      // Unificar sem duplicação
      const unified: UnifiedTransaction[] = [
        ...(mainTransactions.data || []).map(t => ({
          id: `main_${t.id}`,
          type: t.type as UnifiedTransaction['type'],
          amount: Number(t.amount),
          status: t.status as UnifiedTransaction['status'],
          description: t.description || '',
          created_at: t.created_at,
          source: 'real' as const
        })),
        ...(walletTransactions.data || []).map(t => ({
          id: `wallet_${t.id}`,
          type: (t.type || 'money_redemption') as UnifiedTransaction['type'],
          amount: Number(t.amount),
          status: 'completed' as UnifiedTransaction['status'],
          description: t.description || '',
          created_at: t.created_at,
          source: 'real' as const
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 50);

      setTransactions(unified);
      console.log('✅ [UnifiedWallet] Transações carregadas:', unified.length);
    } catch (error) {
      console.error('❌ [UnifiedWallet] Erro ao carregar transações:', error);
    }
  }, [user, isDemo]);

  const fetchCashFlow = useCallback(async () => {
    if (!user) return;

    try {
      console.log('💹 [UnifiedWallet] Carregando fluxo de caixa...');

      // Buscar dados do sistema de controle de caixa
      const { data: cashControl } = await supabase
        .from('cash_control_system')
        .select('*')
        .maybeSingle();

      if (cashControl) {
        setCashFlow({
          totalInflow: Number(cashControl.total_deposits_real || 0),
          totalOutflow: Number(cashControl.total_withdrawals_real || 0) + Number(cashControl.total_prizes_given || 0),
          netProfit: Number(cashControl.net_profit || 0),
          systemBalance: Number(cashControl.total_system_balance || 0),
          emergencyStop: cashControl.emergency_stop || false,
          alertLevel: cashControl.alert_level || 'normal'
        });
      }

      // Buscar alertas críticos
      const { data: alerts } = await supabase
        .from('critical_financial_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(10);

      setAuditAlerts(alerts || []);

      console.log('✅ [UnifiedWallet] Fluxo de caixa carregado');
    } catch (error) {
      console.error('❌ [UnifiedWallet] Erro ao carregar fluxo de caixa:', error);
    }
  }, [user]);

  const purchaseChest = useCallback(async (chestType: string, amount: number) => {
    if (!user || !walletData) {
      return { error: 'Usuário não logado ou carteira não carregada' };
    }

    if (walletData.balance < amount) {
      return { error: 'Saldo insuficiente' };
    }

    try {
      console.log(`💰 [UnifiedWallet] Comprando baú ${chestType} por R$ ${amount}`);

      if (isDemo) {
        // 🎮 COMPRA DEMO
        const newBalance = walletData.balance - amount;
        
        const { error } = await supabase
          .from('profiles')
          .update({ 
            credito_demo: newBalance,
            total_spent: walletData.total_spent + amount
          })
          .eq('id', user.id);

        if (error) throw error;

        // Atualizar estado local
        setWalletData(prev => prev ? {
          ...prev,
          balance: newBalance,
          total_spent: prev.total_spent + amount
        } : null);

        toast({
          title: "Baú comprado! (Demo)",
          description: `Você comprou um baú ${chestType} por R$ ${amount.toFixed(2)}`,
          variant: "default"
        });
      } else {
        // 💰 COMPRA REAL
        const { data: walletInfo } = await supabase
          .from('user_wallets')
          .select('id, balance, total_spent')
          .eq('user_id', user.id)
          .single();

        if (!walletInfo) throw new Error('Carteira não encontrada');

        // ⚠️ VERIFICAÇÃO CRÍTICA DE SALDO
        if (walletInfo.balance < amount) {
          throw new Error('Saldo insuficiente verificado no banco');
        }

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

        // Atualizar saldo da carteira
        await supabase.from('user_wallets')
          .update({ 
            balance: walletInfo.balance - amount,
            total_spent: (walletInfo.total_spent || 0) + amount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        toast({
          title: "Baú comprado!",
          description: `Você comprou um baú ${chestType} por R$ ${amount.toFixed(2)}`,
          variant: "default"
        });

        // Atualizar dados automaticamente
        await refreshData();
      }

      return { error: null };
    } catch (error: any) {
      console.error('❌ [UnifiedWallet] Erro ao comprar baú:', error);
      
      toast({
        title: "Erro na compra",
        description: error.message,
        variant: "destructive"
      });
      
      return { error: error.message };
    }
  }, [user, walletData, isDemo, toast]);

  const triggerAudit = useCallback(async () => {
    try {
      console.log('🔍 [UnifiedWallet] Executando auditoria...');
      await supabase.rpc('audit_financial_consistency');
      await fetchCashFlow(); // Atualizar alertas
      
      toast({
        title: "Auditoria executada",
        description: "Verificação de consistência financeira realizada.",
        variant: "default"
      });
    } catch (error) {
      console.error('❌ [UnifiedWallet] Erro na auditoria:', error);
    }
  }, [fetchCashFlow, toast]);

  const refreshData = useCallback(async () => {
    console.log('🔄 [UnifiedWallet] Refresh completo...');
    await Promise.all([
      fetchWalletData(),
      fetchTransactions(),
      fetchCashFlow()
    ]);
  }, [fetchWalletData, fetchTransactions, fetchCashFlow]);

  // Carregamento inicial
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };

    loadData();
  }, [user, refreshData]);

  // Real-time subscriptions (apenas para usuários reais)
  useEffect(() => {
    if (!user || isDemo) return;

    console.log('🔔 [UnifiedWallet] Configurando subscriptions...');

    const channels = [
      // Carteira
      supabase
        .channel('unified-wallet-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'user_wallets', 
          filter: `user_id=eq.${user.id}` 
        }, () => fetchWalletData())
        .subscribe(),
      
      // Transações
      supabase
        .channel('unified-transactions-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'transactions', 
          filter: `user_id=eq.${user.id}` 
        }, () => fetchTransactions())
        .subscribe(),
      
      // Controle de caixa (global)
      supabase
        .channel('cash-control-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'cash_control_system' 
        }, () => fetchCashFlow())
        .subscribe(),

      // Alertas críticos
      supabase
        .channel('critical-alerts-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'critical_financial_alerts' 
        }, () => fetchCashFlow())
        .subscribe()
    ];

    return () => {
      console.log('🔕 [UnifiedWallet] Removendo subscriptions');
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, isDemo, fetchWalletData, fetchTransactions, fetchCashFlow]);

  return {
    // Dados principais
    walletData,
    transactions,
    cashFlow,
    loading,
    isDemo,
    auditAlerts,

    // Ações
    purchaseChest,
    triggerAudit,
    refreshData,

    // Para compatibilidade com código existente
    showPaymentModalForAmount: () => {},
    PaymentModalComponent: () => null,
    refetchWallet: refreshData
  };
};